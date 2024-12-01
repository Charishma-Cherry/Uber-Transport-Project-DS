from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AdminProfile

class AdminSerializer(serializers.ModelSerializer):
    # Add first_name and last_name to the User serializer
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Hash the password properly during user creation
        return User.objects.create_user(**validated_data)

class AdminProfileSerializer(serializers.ModelSerializer):
    # Include first_name and last_name from the User model
    user_first_name = serializers.CharField(source='user.first_name', required=False)
    user_last_name = serializers.CharField(source='user.last_name', required=False)

    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'admin_id', 'phone_number', 'address', 'city', 'state', 'zip_code', 'user_type', 'user_first_name', 'user_last_name']

    def update(self, instance, validated_data):
        # Handle updates to first_name and last_name
        user_data = validated_data.pop('user', {})

        if 'user_first_name' in validated_data:
            instance.user.first_name = validated_data.pop('user_first_name')
        if 'user_last_name' in validated_data:
            instance.user.last_name = validated_data.pop('user_last_name')

        # Update other profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.user.save()  # Save the updated user
        instance.save()  # Save the profile
        return instance

