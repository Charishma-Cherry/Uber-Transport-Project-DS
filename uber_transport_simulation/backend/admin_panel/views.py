from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import AdminProfile, User 
from .serializers import AdminProfileSerializer
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import UserProfile, User
from users.serializers import UserSerializer, UserProfileSerializer


class AdminViewSet(viewsets.ModelViewSet):
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        print("Admin Signup data received:", request.data)
        try:
            # Ensure username and email uniqueness
            if User.objects.filter(username=request.data['username']).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=request.data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if first_name and last_name are provided
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')

            if not first_name or not last_name:
                  return Response({'error': 'First name and Last name are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user with password hashing
            user = User.objects.create_user(
                username=request.data['username'], 
                password=request.data['password'], 
                email=request.data['email'],
                # first_name=request.data.get('first_name', ''),  # Optional first name
                # last_name=request.data.get('last_name', '')     # Optional last name
                first_name=first_name,  # Use provided first_name
                last_name=last_name     # Use provided last_name
            )
            
            # Print to check the created user
            print("Created User:", user)
            
            # Create or update admin profile
            admin_profile, created = AdminProfile.objects.update_or_create(
                user=user,
                defaults={
                    'phone_number': request.data.get('phone_number'),
                    'address': request.data.get('address'),
                    'city': request.data.get('city'),
                    'state': request.data.get('state'),
                    'zip_code': request.data.get('zip_code'),
                    'user_type': "admin"
                }
            )
            
            # Print to check the created admin profile
            print("Created Admin Profile:", admin_profile)
            
            admin_profile.full_clean()  # Validate model fields
            admin_profile.save()

            return Response({'user_id': user.id, 'admin_id': admin_profile.admin_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        print("Incoming admin:", user)
        
        if user and hasattr(user, 'admin_profile'):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'admin_id': user.admin_profile.admin_id
                }
            })
        return Response({'error': 'Invalid credentials or not an admin'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        if hasattr(request.user, 'admin_profile'):
            serializer = self.get_serializer(request.user.admin_profile)
            return Response(serializer.data)
        return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def update_profile(self, request):
        print("Incoming data of Profile:", request.data)
        if hasattr(request.user, 'admin_profile'):
            admin_profile = request.user.admin_profile
            serializer = self.get_serializer(admin_profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_profile(self, request):
        if hasattr(request.user, 'admin_profile'):
            try:
                admin_profile = request.user.admin_profile
                admin_profile.delete()
                request.user.delete()
                return Response({'message': 'Admin profile deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
    

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def manage_users(self, request):
        """List all users (accessible to admins only)."""
        if not hasattr(request.user, 'admin_profile'):
            print(request.user)
            return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
        
        # Fetch all users
        users = UserProfile.objects.select_related('user').all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_user(self, request):
        """Create a new user."""
        if not hasattr(request.user, 'admin_profile'):
            return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            profile_data = {
                'user': user.id,
                **request.data.get('profile', {})  # Additional fields for UserProfile
            }
            profile_serializer = UserProfileSerializer(data=profile_data)
            if profile_serializer.is_valid():
                profile_serializer.save()
                return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_user(self, request):
        """Update user information."""
        if not hasattr(request.user, 'admin_profile'):
            return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=request.data.get('user_id'))
            user_serializer = UserSerializer(user, data=request.data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
                profile = user.profile
                profile_serializer = UserProfileSerializer(profile, data=request.data.get('profile', {}), partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                    return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_user(self, request):
        """Delete a user."""
        if not hasattr(request.user, 'admin_profile'):
            return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)