

from rest_framework import serializers
from .models import Billing

class BillingSerializer(serializers.ModelSerializer):
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
            'driver_name',  # Include driver's name
            'customer_id',
            'customer_name'  # Include customer's name
            'ride_id'
        ]
