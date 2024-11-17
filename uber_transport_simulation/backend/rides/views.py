from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rides.models import Ride
from .serializers import RideSerializer
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


    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        ride = get_object_or_404(Ride, pk=pk)
        new_status = request.data.get('status')
        if new_status not in dict(Ride.RIDE_STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        ride.status = new_status
        ride.save()
        return Response({"message": "Ride status updated successfully", "status": ride.status})


    def perform_create(self, serializer):
        # Automatically set the customer to the logged-in user and default status to "requested"
        serializer.save(customer=self.request.user)


    def perform_update(self, serializer):
        serializer.save()
