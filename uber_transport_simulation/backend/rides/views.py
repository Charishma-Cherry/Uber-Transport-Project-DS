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
import logging
from rest_framework.permissions import IsAuthenticated
from drivers.models import Driver  # Import the Driver model
from drivers.serializers import DriverSerializer 
from .producer import send_message

#from django.core.cache import cache


# Get an instance of a logger
logger = logging.getLogger(__name__)

class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]


    def create(self, request, *args, **kwargs):
        print("Incoming Data:", request.data)
        if 'driver' not in request.data or not request.data['driver']:
            request.data['driver'] = None  
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("Validation errors:", serializer.errors)  # Log validation errors
            raise e       
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

#--Vaishnavi Updating status---#
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        try:
            # Log incoming request and ride details
            logger.info(f"Attempting to update status for ride ID: {pk}")
            
            ride = self.get_object()
            new_status = request.data.get('status')
            driver_id = request.data.get('driverId')
            # Check if the status is valid
            if new_status not in dict(Ride.RIDE_STATUS_CHOICES):
                logger.error(f"Invalid status '{new_status}' provided for ride ID: {pk}")
                return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Log status change attempt
            logger.info(f"Changing status of ride ID {pk} to '{new_status}'")
            # Fetch the Driver instance using driver_id from the request
            if driver_id:
                try:
                    driver = Driver.objects.get(driver_id=driver_id)  # Fetch driver by driver_id
                    ride.driver = driver  # Assign the driver to the ride
                    logger.info(f"Assigned driver {driver.first_name} {driver.last_name} to ride ID: {pk}")
                except Driver.DoesNotExist:
                    logger.error(f"Driver with ID {driver_id} does not exist.")
                    return Response({"error": "Driver not found."}, status=status.HTTP_404_NOT_FOUND)
            ride.status = new_status
            if(new_status == 'completed') :
                # print("available")
                # print(ride.driver)
                ride.driver.available_status = 'available'
            else :
                # print("unavailable")
                # print(ride.driver)
                ride.driver.available_status = 'unavailable'
            ride.save()
            driver.save()

            # Kafka code Begin of insert by Charishma 
            message = {
                 "ride_id": pk,
                 "ride_status":new_status,
            }
            send_message("rides", message)
            #End of insert by Charishma

            # If the ride is completed, generate billing
            if new_status == 'completed':
                try:
                    logger.info(f"Generating billing for completed ride ID: {pk}")
                    self.generate_billing(ride)
                    logger.info(f"Billing successfully generated for ride ID: {pk}")
                except Exception as e:
                    logger.error(f"Error generating billing for ride ID {pk}: {e}")
                    return Response(
                        {"message": "Ride status updated, but billing generation failed.", "status": ride.status},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            logger.info(f"Ride status for ride ID {pk} updated to '{new_status}' successfully.")
            return Response({"message": "Ride status updated successfully", "status": ride.status})

        except Exception as e:
            # Log any unexpected errors
            logger.exception(f"Error updating status for ride ID {pk}: {e}")
            return Response({"error": "Failed to update ride status."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   
    @action(detail=False, methods=['get'], url_path='user-history')
    def ride_user_history(self, request):
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

    #---- Ride history using cache----# Cache the response of the ride_history method for each user:

    # @action(detail=False, methods=['get'], url_path='history')
    # def ride_history(self, request):
    #     try:
    #         print(f"Fetching ride history for user {request.user.id}")
    #         cache_key = f"ride_history_{request.user.id}"
    #         cached_data = cache.get(cache_key)

    #         if cached_data:
    #             print(f"Cache hit for {cache_key}")
    #             return Response(cached_data, status=status.HTTP_200_OK)

    #         print(f"Cache miss for {cache_key}. Querying database.")
    #         rides = Ride.objects.filter(customer=request.user).values(
    #             'ride_id', 'pickup_location', 'dropoff_location', 'pickup_datetime', 'distance', 'fare', 'status'
    #         )
    #         cache.set(cache_key, list(rides), timeout=300)
    #         print(f"Cache set for {cache_key}")
    #         return Response(rides, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         logger.error(f"Error in ride_history: {e}")
    #         return Response(
    #             {"error": "Failed to fetch ride history"},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         )
    

    # def perform_create(self, serializer):
    #     serializer.save(customer=self.request.user)

    # def perform_create(self, serializer):
    #     ride = serializer.save(customer=self.request.user)
    #     logger.debug(f"Created ride {ride.ride_id} for user {self.request.user.id}")
    #     # Invalidate relevant caches
    #     cache.delete(f"ride_history_{self.request.user.id}")


    def perform_update(self, serializer):
        serializer.save()


########### billing generation view - sushma

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


    #to update status at the driver and user end--vaishnavi----

    @action(detail=False, methods=['get'], url_path='driver-rides')
    def driver_rides(self, request):
        try:
            # Log incoming request for debugging
            print("Driver Rides Request:", request.data)
            
            # Fetch the logged-in driver
            driver = request.user.driver  # Ensure the user has a driver
            if not driver:
                return Response({"error": "Driver profile not found for this user."}, status=status.HTTP_404_NOT_FOUND)
            
            # Log driver's city for debugging
            print(f"Driver found: {driver}")
            
            # Check if the driver has a location set
            if not driver.location_city:
                logger.info("No rides available for location: " + driver.location_city )
                return Response({"error": "Driver does not have a location city set."}, status=status.HTTP_204_NO_CONTENT)

            # Filter rides based on driver's location and 'requested' status
            rides = Ride.objects.filter(
                pickup_location__icontains=driver.location_city,  # Check if pickup_location contains driver's location
                # status='requested'  # Ensure status is 'requested'
            )

            # If no rides are found, return an appropriate message
            if not rides.exists():
                return Response({"message": "No rides found matching the driver's location."}, status=status.HTTP_204_NO_CONTENT)

            # Serialize the ride data
            serializer = self.get_serializer(rides, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error in driver_rides: {str(e)}")  # Log error for debugging
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='driver/completed-history')
    def driver_completed_history(self, request):
        try:
            print("Driver Completed Rides API hit")
            print(f"Driver requesting completed rides: {request.user}")
            # Check if the user has an associated driver profile
            if not hasattr(request.user, 'driver'):
                print(f"User {request.user} is not a driver.")
                return Response(
                    {"error": "Only drivers can access this endpoint."},
                    status=status.HTTP_403_FORBIDDEN
                )

            print(f"Fetching completed rides for driver: {request.user.driver}")
            
            # Fetch completed rides
            completed_rides = Ride.objects.filter(
                driver=request.user.driver, status='completed'
            ).values(
                'ride_id', 'pickup_location', 'dropoff_location',
                'pickup_datetime', 'distance', 'fare', 'status'
            )
            
            print(f"Completed rides fetched: {list(completed_rides)}")
            
            return Response(completed_rides, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in driver_completed_history: {e}")
            return Response(
                {"error": "Failed to fetch driver completed ride history."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



#---- Driver and rides using cache----# 


    # @action(detail=False, methods=['get'], url_path='driver-rides')
    # def driver_rides(self, request):
    #     try:
    #         logger.debug(f"Fetching rides for driver {request.user.id}")
    #         driver = request.user.driver
    #         cache_key = f"driver_rides_{driver.id}"
    #         cached_rides = cache.get(cache_key)

    #         if cached_rides:
    #             print(f"Cache hit for {cache_key}")
    #             return Response(cached_rides, status=status.HTTP_200_OK)

    #         print(f"Cache miss for {cache_key}. Querying database.")
    #         rides = Ride.objects.filter(
    #             pickup_location__icontains=driver.location_city,
    #         )
    #         if not rides.exists():
    #             logger.info(f"No rides found for driver {driver.id}")
    #             return Response({"message": "No rides found."}, status=status.HTTP_204_NO_CONTENT)

    #         serializer = self.get_serializer(rides, many=True)
    #         cache.set(cache_key, serializer.data, timeout=300)
    #         logger.debug(f"Cache set for {cache_key}")
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         logger.error(f"Error in driver_rides: {e}")
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Driver Completed Rides: Fetch only completed rides for the driver
    # @action(detail=False, methods=['get'], url_path='driver-completed-history')
    # def driver_completed_history(self, request):
    #     try:
    #         if not hasattr(request.user, 'driver'):
    #             return Response({"error": "Only drivers can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)

    #         completed_rides = Ride.objects.filter(driver=request.user.driver, status='completed').values(
    #             'ride_id', 'pickup_location', 'dropoff_location', 'pickup_datetime',
    #             'distance', 'fare', 'status'
    #         )
    #         print("Driver Completed Ride History:", list(completed_rides))  # Debugging
    #         return Response(completed_rides, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         print(f"Error in driver_completed_history: {e}")
    #         return Response(
    #             {"error": "Failed to fetch driver completed ride history."},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         )





    
