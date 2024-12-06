from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import AdminProfile
from .serializers import AdminProfileSerializer
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from users.models import UserProfile, User
from users.serializers import UserSerializer, UserProfileSerializer
from django.core.exceptions import ValidationError
from drivers.models import Driver
from drivers.serializers import DriverSerializer, DriverProfileSerializer,UserSerializer
from django.core.validators import validate_email
from rides.models import Ride
from rides.serializers import RideSerializer
import re
from django.db.models import Q

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

    
######### Manage Users ################################

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def add_customer(self, request):
        try:
            if User.objects.filter(username=request.data['username']).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=request.data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        #     # Validate phone number length (must be 10 digits)
        #     if len(request.data['phone_number']) != 10:
        #     return Response({'error': 'Phone number must be 10 digits'}, status=status.HTTP_400_BAD_REQUEST)

        # # Validate zip code length (must be 5 digits)
        # if len(request.data['zip_code']) != 5:
        #     return Response({'error': 'Zip code must be 5 digits'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(
                username=request.data['username'],
                password=request.data['password'],
                email=request.data['email'],
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', '')
            )

            user_profile = UserProfile.objects.create(
                user=user,
                name=request.data.get('name', ''),
                phone_number=request.data.get('phone_number', ''),
                address=request.data.get('address', ''),
                city=request.data.get('city', ''),
                state=request.data.get('state', ''),
                zip_code=request.data.get('zip_code', ''),
                country=request.data.get('country', ''),
                date_of_birth=request.data.get('date_of_birth', None)
            )

            user_profile.full_clean()
            user_profile.save()

            return Response({'message': 'Customer added successfully', 'customer_id': user_profile.customer_id}, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def list_customers(self, request):
        try:
            search_query = request.GET.get('search', '')  # Get search query
            customers = UserProfile.objects.all()

            if search_query:
                # Check if the fields exist in UserProfile and filter
                filter_conditions = Q()
                
                if hasattr(UserProfile, 'name'):
                    filter_conditions |= Q(name__icontains=search_query)
                
                # Apply the filter
                customers = customers.filter(filter_conditions)

            # Serialize the filtered users
            serializer = UserProfileSerializer(customers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error in list_customers: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def review_customer(self, request, pk=None):
        try:
            customer = UserProfile.objects.get(pk=pk)
            serializer = UserProfileSerializer(customer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_customer(self, request, pk=None):
        try:
            customer = UserProfile.objects.get(pk=pk)
            serializer = UserProfileSerializer(customer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Customer updated successfully'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_customer(self, request, pk=None):
        try:
            customer = UserProfile.objects.get(customer_id=pk)
            print("customer on delete",customer)
            customer.user.delete()
            customer.delete()
            return Response({'message': 'Customer deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

###### Manage Drivers ######################

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def list_drivers(self, request):
        """
        List all drivers with optional search filtering.
        """
        try:
            search_query = request.GET.get('search', '')  # Get search query from request
            drivers = Driver.objects.all()
            # Use Q objects to filter based on search query for multiple fields
            drivers = Driver.objects.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
            
            # Serialize the filtered drivers
            serializer = DriverSerializer(drivers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def review_driver(self, request, pk=None):
        """
        Retrieve a single driver's details.
        """
        try:
            driver = Driver.objects.get(pk=pk)
            serializer = DriverProfileSerializer(driver)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_driver(self, request, pk=None):
        """
        Update driver details.
        """
        try:
            driver = Driver.objects.get(pk=pk)
            serializer = DriverProfileSerializer(driver, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Driver updated successfully'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_driver(self, request, pk=None):
        """
        Delete a driver.
        """
        try:
            driver = Driver.objects.get(driver_id=pk)
            driver.delete()
            return Response({'message': 'Driver deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Driver.DoesNotExist:
            return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def add_driver(self, request):
        try:
            
            # Validate email format
            try:
                validate_email(request.data['email'])
            except ValidationError:
                return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email already exists in the database
            if User.objects.filter(email=request.data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if driver_id already exists in the database
            if Driver.objects.filter(driver_id=request.data['driver_id']).exists():
                return Response({'error': 'Driver ID already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if phone number is 10 digits
            phone_number = request.data.get('phone_number', '')
            if not re.match(r'^\d{10}$', phone_number):
                return Response({'error': 'Phone number must be 10 digits'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if zip code is 5 digits
            zip_code = request.data.get('zip_code', '')
            if not re.match(r'^\d{5}$', zip_code):
                return Response({'error': 'Zip code must be 5 digits'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if driver_id follows SSN format (XXX-XX-XXXX)
            driver_id = request.data.get('driver_id', '')
            if not re.match(r'^\d{3}-\d{2}-\d{4}$', driver_id):
                return Response({'error': 'Driver ID must be in SSN format (XXX-XX-XXXX)'}, status=status.HTTP_400_BAD_REQUEST)

            
            # Create the User first
            user = User.objects.create_user(
                username=request.data['username'],
                password=request.data['password'],
                email=request.data['email'],
                # first_name=request.data.get('first_name', ''),
                # last_name=request.data.get('last_name', '')
            )

            # Now create the Driver and associate it with the User
            driver = Driver.objects.create(
                user=user,
                driver_id=request.data['driver_id'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                address=request.data.get('address', ''),
                city=request.data.get('city', ''),
                state=request.data.get('state', ''),
                zip_code=request.data.get('zip_code', ''),
                phone_number=request.data.get('phone_number', ''),
                email=request.data['email'],
                car_number=request.data['car_number'],
                car_name=request.data['car_name'],
                rating=request.data.get('rating', 0.0),
                reviews=request.data.get('reviews', ''),
                introduction_media=request.data.get('introduction_media', None),
                rides_history=request.data.get('rides_history', ''),
                location_state=request.data.get('location_state', ''),
                location_county=request.data.get('location_county', ''),
                location_city=request.data.get('location_city', ''),
                available_status=request.data.get('available_status', 'unavailable'),
            )

            # Return success response
            return Response({'message': 'Driver added successfully'}, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

#### Manage Rides ##########

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def list_rides(self, request):
        try:

            location_filter = request.GET.get('location', '')
            customer_filter = request.GET.get('customer','')
            driver_filter = request.GET.get('driver', '')
            rides = Ride.objects.all()
            
            if location_filter:
                rides = rides.filter(
                    Q(pickup_location__icontains=location_filter) | 
                    Q(dropoff_location__icontains=location_filter)
                )

            if customer_filter:
                rides = rides.filter(
                    Q(customer_name__icontains=customer_filter) 
                )
            
            if driver_filter:
                rides = rides.filter(
                    Q(driver__first_name__icontains=driver_filter) | 
                    Q(driver__last_name__icontains=driver_filter)
                )
            
            # Serialize and return rides
            serializer = RideSerializer(rides, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def review_ride(self, request, pk=None):
        try:
            ride = Ride.objects.get(pk=pk)
            serializer = RideSerializer(ride)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_ride(self, request, pk=None):
        try:
            ride = Ride.objects.get(pk=pk)
            serializer = RideSerializer(ride, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Ride updated successfully'}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_ride(self, request, pk=None):
        try:
            ride = Ride.objects.get(pk=pk)
            ride.delete()
            return Response({'message': 'Ride deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

    