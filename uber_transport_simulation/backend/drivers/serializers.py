from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .models import Driver

class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django's User model to include username and email fields."""

    class Meta:
        model = User
        fields = ['username', 'email']


class DriverSerializer(serializers.ModelSerializer):
    """Main serializer for Driver model to handle all driver-specific fields."""

    user = UserSerializer(read_only=True)
    introduction_media_url = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = [
            'id', 'user', 'driver_id', 'first_name', 'last_name', 'address', 'city', 'state',
            'zip_code', 'phone_number', 'email', 'car_number', 'car_name', 'rating', 'reviews',
            'rides_history', 'location_state', 'location_county', 'location_city','introduction_media_url'
        ]
    
    def get_introduction_media_url(self, obj):
        """Return full URL for the introduction media."""
        request = self.context.get('request')
        if obj.introduction_media and request:
            return request.build_absolute_uri(obj.introduction_media.url)
        return None


class DriverSignupSerializer(serializers.ModelSerializer):
    """Serializer specifically for driver signup with validations for driver_id, phone_number, and car_number."""

    driver_id = serializers.CharField(
        max_length=11,
        validators=[
            RegexValidator(
                regex=r'^\d{3}-\d{2}-\d{4}$',
                message='Driver ID must be in the format XXX-XX-XXXX'
            )
        ]
    )
    
    phone_number = serializers.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='Phone number must be exactly 10 digits'
            )
        ]
    )

    car_number = serializers.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r'^[A-Za-z0-9]{7}$',
                message='Car number must be exactly 7 alphanumeric characters'
            )
        ]
    )

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Driver
        fields = [
            'driver_id', 'first_name', 'last_name', 'email', 'password', 'address', 'city', 'state',
            'zip_code', 'phone_number', 'car_number', 'car_name', 'introduction_media'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        """Create and return a new driver instance, setting up the user and password."""
        # Extract password and email
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        # Check if a User with this email already exists
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        # Create User instance
        user = User.objects.create_user(username=email, email=email, password=password)

        # Create Driver and associate it with the created User
        driver = Driver.objects.create(user=user, email=email, **validated_data)
        
        return driver

class DriverProfileSerializer(serializers.ModelSerializer):
    introduction_media_url = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = '__all__'
        extra_kwargs = {
            'introduction_media': {'required': False}  # Make profile picture optional
        }

    def get_introduction_media_url(self, obj):
        # Get the 'request' from the serializer context
        request = self.context.get('request')
        # Check if the request and introduction_media fields exist
        if obj.introduction_media and request:
            return request.build_absolute_uri(obj.introduction_media.url)
        return None
    
    def update(self, instance, validated_data):
        # Remove introduction_media if not provided in the update request
        if 'introduction_media' not in validated_data:
            validated_data.pop('introduction_media', None)
        return super().update(instance, validated_data)




