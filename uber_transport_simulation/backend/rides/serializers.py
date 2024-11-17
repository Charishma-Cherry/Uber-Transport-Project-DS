from rest_framework import serializers
from .models import Ride
from django.utils.timezone import now


class RideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = [
            'ride_id', 'customer', 'pickup_location', 'dropoff_location',
            'pickup_datetime', 'distance', 'duration', 'estimated_price', 'status'
        ]
        read_only_fields = ['ride_id', 'customer', 'status']


    def validate(self, data):
        if data['pickup_datetime'] < now():
            raise serializers.ValidationError({"pickup_datetime": "Pickup time must be in the future."})
        return data


    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)