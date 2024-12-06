from rest_framework import serializers
from .models import Billing


class BillingSerializer(serializers.ModelSerializer):
    ride_id = serializers.SerializerMethodField()

    class Meta:
        model = Billing
        fields = [
            'billing_id',
            'date',
            'pickup_time',
            'distance_covered',
            'total_amount',
            'source_location',
            'destination_location',
            'driver_id',
            'driver_name',
            'customer_id',
            'customer_name',
            'ride_id',  # Ensure ride_id is included
        ]

    def get_ride_id(self, obj):
        return obj.ride.ride_id if obj.ride else None


