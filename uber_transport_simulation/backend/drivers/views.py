# drivers/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import DriverSignupSerializer, DriverProfileSerializer, DriverSerializer
from .models import Driver
from rides.models import Ride  # Assuming the Ride model is in rides app
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from users.models import UserComment
import logging
from rest_framework.decorators import action  # Add this line

#from django.core.cache import cache


logger = logging.getLogger(__name__)

class DriverSignupView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print("Signup Request Data:", request.data)  # Log the incoming request data
        serializer = DriverSignupSerializer(data=request.data)
        if serializer.is_valid():
            try:
                print(request.data)
                driver = serializer.save()
                
                # Create a token for the new driver
                token, created = Token.objects.get_or_create(user=driver.user)
                print("Token Created:", token.key) 
                # Return response with token, driver_id, and driver profile data
                return Response({
                    "message": "Driver registered successfully!",
                    "token": token.key,
                    "driver_id": driver.driver_id,  # Use driver_id from the Driver model
                    "driver_data": DriverProfileSerializer(driver, context={'request': request}).data
                }, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DriverProfileView(APIView):
    def get(self, request, driver_id):
        try:
            driver = Driver.objects.get(driver_id=driver_id)  # Retrieve by driver_id instead of id
            serializer = DriverProfileSerializer(driver, context={'request': request})
            return Response(serializer.data)
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

class DriverLoginView(APIView):
    """
    View for driver login, which returns an authentication token upon successful login.
    """

    def post(self, request):
        # Extract email and password from the request data
        print(request.data)
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate the driver
        driver = authenticate(request, username=email, password=password)
        
        if driver is not None:
            # Ensure the authenticated user is a driver
            try:
                driver_instance = Driver.objects.get(user=driver)
            except Driver.DoesNotExist:
                return Response({'error': 'Invalid credentials or not a driver'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get or create a token for the driver
            token, created = Token.objects.get_or_create(user=driver)
            
            # Serialize the driver's data
            serializer = DriverSerializer(driver_instance, context={'request': request})
            
            return Response({
                'token': token.key,
                'driver_id': driver_instance.driver_id,  # Use driver_id from the Driver model
                'driver_data': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
class DriverUpdateProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        try:
            print(request.data)
            driver = request.user.driver  # Assuming request.user is linked to Driver
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        if 'introduction_media' not in data:
            data.pop('introduction_media', None)  # Ensure it's removed if not provided

        # Pass 'request' in the serializer's context
        serializer = DriverSignupSerializer(driver, data=data, partial=True, context={'request': request})
        print(serializer.is_valid())

        if serializer.is_valid():
            # Save the updated data
            print("Saving driver profile")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DriverDeleteProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, driver_id):
        try:
            driver = Driver.objects.get(driver_id=driver_id, user=request.user)
            driver.user.delete()  # Delete associated user account
            driver.delete()  # Delete the driver profile
            return Response({"message": "Profile deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

class DriverLocationUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def patch(self, request):
        try:
            # Ensure the authenticated user is a driver
            driver = request.user.driver
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update location fields
        data = request.data
        driver.location_state = data.get('location_state', driver.location_state)
        driver.location_county = data.get('location_county', driver.location_county)
        driver.location_city = data.get('location_city', driver.location_city)
        driver.available_status = 'available'
        # # Handle location_areas safely
        # location_areas = data.get('location_areas', [])
        # if location_areas:
        #     driver.location_areas = ', '.join(location_areas)
        # elif driver.location_areas:
        #     driver.location_areas = driver.location_areas  # Keep the existing value
        # else:
        #     driver.location_areas = ''  # Set to an empty string if None

        driver.save()

        return Response({
            "message": "Location updated successfully",
            "location_state": driver.location_state,
            "location_county": driver.location_county,
            "location_city": driver.location_city,
            # "location_areas": driver.location_areas,
        }, status=status.HTTP_200_OK)

class DriverRateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, driver_id):
        try:
            driver = Driver.objects.get(driver_id=driver_id)
            rating = request.data.get('rating')
            comment = request.data.get('comment', '')
            ride_id = request.data.get('ride_id')

            if not (1 <= int(rating) <= 5):
                return Response({"error": "Rating must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

            ride = Ride.objects.filter(driver=driver, ride_id=ride_id, status='completed').first()
            if not ride:
                return Response({"error": "Ride not found or not completed."}, status=status.HTTP_400_BAD_REQUEST)

            user_profile = ride.customer.profile
            user_profile.total_ratings += 1
            user_profile.rating_sum += int(rating)
            user_profile.save()

            UserComment.objects.create(
                user=user_profile,
                driver=driver,
                rating=int(rating),
                comment=comment
            )

            return Response({
                "message": "Rating submitted successfully.",
                "average_rating": user_profile.rating_sum / user_profile.total_ratings,
            }, status=status.HTTP_200_OK)

        except Driver.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Failed to submit rating: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#cache code
# class DriverLocationUpdateView(APIView):
#     def patch(self, request):
#         try:
#             driver = request.user.driver
#             logger.debug(f"Updating location for driver {driver.id}")

#             data = request.data
#             driver.location_state = data.get('location_state', driver.location_state)
#             driver.location_county = data.get('location_county', driver.location_county)
#             driver.location_city = data.get('location_city', driver.location_city)
#             driver.available_status = 'available'
#             driver.save()

#             cache.delete(f"driver_rides_{driver.id}")
#             logger.debug(f"Invalidated cache for driver rides {driver.id}")

#             return Response({
#                 "message": "Location updated successfully",
#                 "location_state": driver.location_state,
#                 "location_county": driver.location_county,
#                 "location_city": driver.location_city,
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error updating location for driver: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

