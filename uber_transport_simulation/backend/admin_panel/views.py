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
from billing.models import Billing
from billing.serializers import BillingSerializer
from django.db.models import Sum, Count


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

class AdminBillingViewSet(viewsets.ViewSet):

    def list(self, request):
        """
        Fetch all bills irrespective of their status.
        """
        queryset = Billing.objects.all()  # Fetch all bills
        serializer = BillingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    """
    ViewSet for admin-specific billing operations.
    """
    @action(detail=False, methods=['post'], url_path='search')
    def search_bills(self, request):
        """
        Search bills based on customer_name, driver_name, and date range.
        Admin can view all bills irrespective of their status.
        """
        customer_name = request.data.get('customer_name')
        driver_name = request.data.get('driver_name')
        from_date = request.data.get('from_date')
        to_date = request.data.get('to_date')

        # Retrieve all bills
        queryset = Billing.objects.all()

        # Apply filters if provided
        if customer_name:
            queryset = queryset.filter(customer_name__icontains=customer_name)
        if driver_name:
            queryset = queryset.filter(driver_name__icontains=driver_name)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        # Check if results exist
        if not queryset.exists():
            return Response({"message": "No bills found."}, status=status.HTTP_200_OK)

        serializer = BillingSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='details')
    def bill_details(self, request, pk=None):
        """
        Admin view detailed information about a specific bill.
        """
        print(f"Admin request for bill details: {pk}")
        try:
            bill = Billing.objects.get(pk=pk)
            serializer = BillingSerializer(bill)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Billing.DoesNotExist:
            print(f"Bill with ID {pk} does not exist.")
            return Response({"error": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_bill(self, request, pk=None):
        """
        Admin delete a specific bill by ID.
        """
        print(f"Admin delete request for bill ID: {pk}")
        try:
            bill = Billing.objects.get(pk=pk)
            bill.delete()
            print(f"Bill with ID {pk} deleted successfully.")
            return Response({"message": "Bill deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Billing.DoesNotExist:
            print(f"Bill with ID {pk} does not exist.")
            return Response({"error": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['get'], url_path='statistics/revenue-day')
    def statistics_revenue_per_day(self, request):
        """
        Fetch statistics: total revenue per day.
        """
        try:
            statistics = Billing.objects.values('date').annotate(
                total_revenue=Sum('total_amount')
            ).order_by('date')

            return Response(statistics, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='statistics/total-rides-area')
    def statistics_total_rides_area(self, request):
        """
        Fetch statistics: total rides per area.
        """
        try:
            statistics = Billing.objects.values('source_location').annotate(
                total_rides=Count('billing_id')
            ).order_by('source_location')

            return Response(statistics, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='statistics/rides-per-driver')
    def rides_per_driver(self, request):
        """
        Returns the number of rides per driver.
        """
        try:
            rides_stats = Billing.objects.values('driver_name').annotate(total_rides=Count('driver_name')).order_by('-total_rides')
            return Response(rides_stats, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='statistics/rides-per-customer')
    def rides_per_customer(self, request):
        """
        Returns the number of rides per customer.
        """
        try:
            rides_stats = Billing.objects.values('customer_name').annotate(total_rides=Count('customer_name')).order_by('-total_rides')
            return Response(rides_stats, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    

