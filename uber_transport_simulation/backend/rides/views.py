from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rides.models import Ride
from .serializers import RideSerializer
#added by sushma
from billing.models import Billing   
from users.models import UserProfile 
###
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

class RideViewSet(viewsets.ModelViewSet):
   queryset = Ride.objects.all()
   serializer_class = RideSerializer
   permission_classes = [IsAuthenticated]


   def create(self, request, *args, **kwargs):
       print("Incoming Data:", request.data)
       serializer = self.get_serializer(data=request.data)
       serializer.is_valid(raise_exception=True)
       self.perform_create(serializer)
       response_data = {
           "message": "Ride created successfully",
           "ride": serializer.data  # Include the serialized ride data
       }
       return Response(response_data, status=status.HTTP_201_CREATED)
   
   def get(self, request):
        rides = Ride.objects.filter(user=request.user)
        serializer = RideSerializer(rides, many=True)
        return Response(serializer.data)


   def update(self, request, *args, **kwargs):
       instance = self.get_object()
       serializer = self.get_serializer(instance, data=request.data, partial=True)
       serializer.is_valid(raise_exception=True)
       self.perform_update(serializer)
       response_data = {
           "message": "Ride updated successfully",
           "ride": serializer.data  # Include the serialized ride data
       }
       return Response(response_data)


   def destroy(self, request, *args, **kwargs):
       instance = self.get_object()
       self.perform_destroy(instance)
       return Response({"message": "Ride deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


   @action(detail=False, methods=['get'], url_path='customer/(?P<customer_id>[^/.]+)')
   def list_customer_rides(self, request, customer_id=None):
       rides = Ride.objects.filter(customer__id=customer_id)
       serializer = self.get_serializer(rides, many=True)
       return Response(serializer.data)


   @action(detail=False, methods=['get'], url_path='driver/(?P<driver_id>[^/.]+)')
   def list_driver_rides(self, request, driver_id=None):
       rides = Ride.objects.filter(driver__id=driver_id)
       serializer = self.get_serializer(rides, many=True)
       return Response(serializer.data)


   @action(detail=False, methods=['get'], url_path='statistics/location')
   def ride_statistics(self, request):
       location_stats = Ride.objects.values('pickup_location').annotate(total_rides=Count('id'))
       return Response(location_stats)


   # @action(detail=True, methods=['patch'], url_path='status')
   # def update_status(self, request, pk=None):
   #     ride = get_object_or_404(Ride, pk=pk)
   #     new_status = request.data.get('status')
   #     if new_status not in dict(Ride.RIDE_STATUS_CHOICES):
   #         return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
   #     ride.status = new_status
   #     ride.save()
   #     return Response({"message": "Ride status updated successfully", "status": ride.status})


   # def perform_create(self, serializer):
   #     # Automatically set the customer to the logged-in user and default status to "requested"
   #     serializer.save(customer=self.request.user)


   # def perform_update(self, serializer):
   #     serializer.save()


### above is shobhitas update_status view


########### billing generation view - sushma


   @action(detail=True, methods=['patch'], url_path='status')
   def update_status(self, request, pk=None):
       ride = self.get_object()
       new_status = request.data.get('status')
       if new_status not in dict(Ride.RIDE_STATUS_CHOICES):
         return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
       ride.status = new_status
       ride.save()
       if new_status == 'completed':
         try:
           self.generate_billing(ride)
         except Exception as e:
           print(f"Error generating billing for ride ID {ride.ride_id}: {e}")
           return Response(
               {"message": "Ride status updated, but billing generation failed.", "status": ride.status},
               status=status.HTTP_500_INTERNAL_SERVER_ERROR,
           )
       return Response({"message": "Ride status updated successfully", "status": ride.status})
   
   @action(detail=False, methods=['get'], url_path='history')
   def ride_history(self, request):
        try:
            # Assuming you want to fetch the ride history for the logged-in user
            rides = Ride.objects.filter(customer=request.user).values(
                'ride_id', 'pickup_location', 'dropoff_location', 'pickup_datetime','distance', 'fare', 'status'
            )
            return Response(rides, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in ride_history: {e}")  # Log the error for debugging
            return Response(
                {"error": "Failed to fetch ride history"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
   
    


   def perform_create(self, serializer):
       serializer.save(customer=self.request.user)




   def perform_update(self, serializer):
       serializer.save()




   def generate_billing(self, ride):
       print(f"Generating billing for ride ID: {ride.ride_id}")  # Debugging log


       try:
       # Ensure the customer has a valid profile
          user_profile = ride.customer.profile


       # Create a billing record
          Billing.objects.create(
           #    ride=ride,
              pickup_time=ride.pickup_datetime.time(),
              distance_covered=ride.distance or 0.0,
              total_amount=ride.fare or 0.0,
              source_location=ride.pickup_location,
              destination_location=ride.dropoff_location,
             driver_id=ride.driver,              # Driver reference (ForeignKey)
             driver_name=ride.driver_name,       # Driver's name
             customer_id=user_profile,           # Customer profile (ForeignKey)
             customer_name=ride.customer_name    # Customer's name
           )
          print(f"Billing successfully created for ride ID: {ride.ride_id}")


       except AttributeError as e:
          print(f"Error: Missing profile for customer {ride.customer.id}: {e}")
       except Exception as e:
          print(f"Error generating billing for ride ID {ride.ride_id}: {e}")
