# from rest_framework import serializers
# from rides.models import Ride
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from drivers.serializers import DriverSerializer  # Import the DriverSerializer
# from drivers.models import Driver



# User = get_user_model()


#    class RideSerializer(serializers.ModelSerializer):
#     driver = DriverSerializer(read_only=True)  # Add DriverSerializer to include full driver details
#     driver_id = serializers.IntegerField(source='driver.id', read_only=True)  # For specific driver ID
#     driver_name = serializers.CharField(source='driver.name', read_only=True)  # For specific driver name
#    class Meta:
#        model = Ride
#        fields = [
#            'ride_id',
#            'customer',
#            'customer_name',
#            'customer_id',
#            'driver',
#            'driver_name',
#            'driver_id',
#            'pickup_location',
#            'dropoff_location',
#            'pickup_datetime',
#            'dropoff_datetime',
#            'distance',
#            'duration',
#            'fare',
#            'passenger_count',
#            'status',
#        ]
#        read_only_fields = [
#            'ride_id',
#            'customer',
#            'customer_name',
#            'customer_id',
#            'driver_name',
#            'driver_id',
#            'status',
#            'dropoff_datetime',
#        ]  # Ensure auto-managed fields are not editable by the user




#    def validate(self, data):
#        # Custom validation logic
      
#        if data['pickup_datetime'] < timezone.now():
#            raise serializers.ValidationError({"pickup_datetime": "Pickup time must be in the future."})
#        return data
  
#    def create(self, validated_data):
#        # Set default status and the customer from the request context
#        validated_data['customer'] = self.context['request'].user
#        validated_data['status'] = 'requested'  # Assuming 'requested' is the initial status for new rides
#        return super().create(validated_data)


from rest_framework import serializers
from rides.models import Ride
from django.utils import timezone
from django.contrib.auth import get_user_model
from drivers.serializers import DriverSerializer  # Import the DriverSerializer
from drivers.models import Driver

User = get_user_model()

class RideSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)  # Add DriverSerializer to include full driver details
    driver_id = serializers.IntegerField(source='driver.id', read_only=True)  # For specific driver ID
    driver_name = serializers.CharField(source='driver.name', read_only=True)  # For specific driver name

    class Meta:
        model = Ride
        fields = [
            'ride_id',
            'customer',
            'customer_name',
            'customer_id',
            'driver',         # Full driver details
            'driver_name',    # Optional, if you want to show only the driver's name as a separate field
            'driver_id',      # Optional, if you want to show only the driver's ID as a separate field
            'pickup_location',
            'dropoff_location',
            'pickup_datetime',
            'dropoff_datetime',
            'distance',
            'duration',
            'fare',
            'passenger_count',
            'status',
        ]
        read_only_fields = [
            'ride_id',
            'customer',
            'customer_name',
            'customer_id',
            'driver_name',
            'driver_id',
            'status',
            'dropoff_datetime',
        ]  # Ensure auto-managed fields are not editable by the user
        extra_kwargs = {
            'driver_id': {'required': False, 'allow_null': True},  # Make driver optional
            'driver_name': {'required': False, 'allow_null': True}, 
            'driver': {'required': False, 'allow_null': True}, 
        }

    def validate(self, data):
        # Custom validation logic
        if data['pickup_datetime'] < timezone.now():
            raise serializers.ValidationError({"pickup_datetime": "Pickup time must be in the future."})
        return data
  
    def create(self, validated_data):
        # Set default status and the customer from the request context
        validated_data['customer'] = self.context['request'].user
        validated_data['status'] = 'requested'  # Assuming 'requested' is the initial status for new rides

        return super().create(validated_data)
