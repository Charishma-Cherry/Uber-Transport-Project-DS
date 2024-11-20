from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import UserProfile, User
from rest_framework.permissions import AllowAny
from .serializers import UserProfileSerializer, UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser

class UserViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        print("Signup data received:", request.data)
        try:
            user = User.objects.create_user(username=request.data['username'], password=request.data['password'], email=request.data['email'])
            user.profile, created  = UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'name' : request.data.get('username'),
                'phone_number': request.data.get('phone_number'),
                'address': request.data.get('address'),
                'city': request.data.get('city'),
                'state': request.data.get('state'),
                'zip_code': request.data.get('zip_code'),
                'user_type': "customer"
            }
            )
            user.profile.full_clean()
            user.profile.save()
            return Response({'user_id': user.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
        
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        print("Incoming user:", user)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            customer_id = user.profile.customer_id if hasattr(user, 'profile') else None    # added by sushma
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'customer_id': customer_id,  #  added by sushma -  Include the customer_id
                }
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        serializer = self.get_serializer(request.user.profile)
        return Response(serializer.data)
  
    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def update_profile(self, request):
        print("Incoming data:", request.data)
        user_profile = request.user.profile  # Get the user's profile
        serializer = self.get_serializer(user_profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_profile(self, request):
        user = request.user
        try:
            # Deleting the user profile and user from the database
            user_profile = user.profile
            user_profile.delete()
            user.delete()
            return Response({'message': 'Profile deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)