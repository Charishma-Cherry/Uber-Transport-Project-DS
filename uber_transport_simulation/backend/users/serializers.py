from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile,UserComment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__' 
        
    
    def update(self, instance, validated_data):
        # Handle profile picture update if provided
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data.pop('profile_picture')
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class UserCommentSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.user.username', read_only=True)

    class Meta:
        model = UserComment
        fields = ['driver_name', 'rating', 'comment', 'created_at']
