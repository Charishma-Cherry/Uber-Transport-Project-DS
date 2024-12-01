import joblib
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from django.conf import settings
from django.utils.timezone import now

from rides.models import Ride
from drivers.models import Driver

# Load the pre-trained model and average fare per mile
model_path = os.path.join(settings.BASE_DIR, 'ml_model', 'fare_prediction_model.pkl')
model_info = joblib.load(model_path)
model = model_info['model']
average_fare_per_mile = model_info['average_fare_per_mile']

# Function to compute base fare at 20 miles
def calculate_base_fare_at_20_miles(model):
    base_input = pd.DataFrame({
        'distance_miles': [20],
        'passenger_count': [1],
        'pickup_day': [15],
        'pickup_hour': [10],
        'pickup_weekday': [3],
        'pickup_month': [6]
    })
    base_fare = model.predict(base_input)[0]
    return base_fare

class FarePredictionView(APIView):
    def post(self, request):
        data = request.data
        try:
            # Extract features from the request
            distance_miles = data.get('distance_miles')
            pickup_hour = data.get('pickup_hour')
            pickup_day = data.get('pickup_day')
            pickup_month = data.get('pickup_month')
            pickup_weekday = data.get('pickup_weekday')
            passenger_count = data.get('passenger_count')
            pickup_location = data.get('pickup_location')

            # Validate input data
            if None in [distance_miles, pickup_hour, pickup_day, pickup_month, pickup_weekday, passenger_count, pickup_location]:
                return Response({'error': 'All fields are required and must be valid.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract city from pickup location (assumes city is second from the last comma)
            try:
                location_city = pickup_location.split(",")[-3].strip()
                print(f"DEBUG: Extracted city: {location_city}")  # Debugging statement
            except IndexError:
                return Response({'error': 'Unable to extract city from pickup location.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check demand for rides in the city
            demand = Ride.objects.filter(
                pickup_location__icontains=location_city,
                status__in=['requested', 'ongoing'],
                pickup_datetime__gte=now()  # Include rides now or in the future
            ).count()

            # Check available drivers in the city
            available_drivers = Driver.objects.filter(
                location_city__iexact=location_city,
                available_status='available'
            ).count()

            # Log demand and driver availability
            print(f"DEBUG: Available drivers in {location_city}: {available_drivers}")
            print(f"DEBUG: Ride demand in {location_city}: {demand}")

            # If requested rides exceed available drivers, block the booking
            if demand >= available_drivers:
                return Response({'message': 'No drivers available at the moment.'}, status=status.HTTP_200_OK)

            # Calculate demand-to-driver ratio
            demand_to_driver_ratio = demand / available_drivers
            print(f"DEBUG: Demand-to-driver ratio: {demand_to_driver_ratio}")

            # Determine surge multiplier within ratio ≤ 1
            surge_multiplier = 1.0
            if 0.5 < demand_to_driver_ratio <= 0.8:
                surge_multiplier = 1.5
            elif 0.8 < demand_to_driver_ratio <= 1.0:
                surge_multiplier = 2.0

            print(f"DEBUG: Surge multiplier: {surge_multiplier}")

            # Predict fare based on distance
            if distance_miles <= 20:
                # Predict fare using the model
                features = pd.DataFrame([{
                    'distance_miles': distance_miles,
                    'passenger_count': passenger_count,
                    'pickup_day': pickup_day,
                    'pickup_hour': pickup_hour,
                    'pickup_weekday': pickup_weekday,
                    'pickup_month': pickup_month,
                }])

                print(f"DEBUG: Features for fare prediction: {features}")

                predicted_fare = model.predict(features)[0]
                print(f"DEBUG: Predicted fare (<= 20 miles): {predicted_fare}")
            else:
                # Predict base fare at 20 miles
                base_fare = calculate_base_fare_at_20_miles(model)
                print(f"DEBUG: Base fare for 20 miles: {base_fare}")

                # Compute additional fare for distances > 20 miles
                additional_fare = max(0, (distance_miles - 20) * average_fare_per_mile * 0.7)
                print(f"DEBUG: Additional fare for distance > 20 miles: {additional_fare}")

                # Total fare
                predicted_fare = base_fare + additional_fare
                print(f"DEBUG: Predicted fare (> 20 miles): {predicted_fare}")

            # Apply surge multiplier
            final_fare = round(predicted_fare * surge_multiplier, 2)
            print(f"DEBUG: Final fare after applying surge multiplier: {final_fare}")

            return Response({
                'predicted_fare': final_fare,
                'surge_multiplier': surge_multiplier,
                'base_fare': round(predicted_fare, 2),
                'message': 'Surge pricing applied based on demand-to-driver ratio.'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERROR: {e}")  # Debugging statement
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)







# import joblib
# import pandas as pd
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# import os
# from django.conf import settings
# from django.utils.timezone import now

# from rides.models import Ride
# from drivers.models import Driver

# # Load the pre-trained model and average fare per mile
# model_path = os.path.join(settings.BASE_DIR, 'ml_model', 'fare_prediction_model.pkl')
# model_info = joblib.load(model_path)
# model = model_info['model']
# average_fare_per_mile = model_info['average_fare_per_mile']

# # Function to compute base fare at 20 miles
# def calculate_base_fare_at_20_miles(model):
#     base_input = pd.DataFrame({
#         'distance_miles': [20],
#         'passenger_count': [1],
#         'pickup_day': [15],
#         'pickup_hour': [10],
#         'pickup_weekday': [3],
#         'pickup_month': [6]
#     })
#     base_fare = model.predict(base_input)[0]
#     return base_fare

# class FarePredictionView(APIView):
#     def post(self, request):
#         data = request.data
#         try:
#             # Extract features from the request
#             distance_miles = data.get('distance_miles')
#             pickup_hour = data.get('pickup_hour')
#             pickup_day = data.get('pickup_day')
#             pickup_month = data.get('pickup_month')
#             pickup_weekday = data.get('pickup_weekday')
#             passenger_count = data.get('passenger_count')
#             pickup_location = data.get('pickup_location')

#             # Validate input data
#             if None in [distance_miles, pickup_hour, pickup_day, pickup_month, pickup_weekday, passenger_count]:
#                 return Response({'error': 'All fields are required and must be valid.'}, status=status.HTTP_400_BAD_REQUEST)
            
#              # Extract city from pickup location (assumes city is second from the last comma)
#             try:
#                 location_city = pickup_location.split(",")[-3].strip()
#                 print(f"Extracted city: {location_city}")  # Debugging statement
#             except IndexError:
#                 return Response({'error': 'Unable to extract city from pickup location.'}, status=status.HTTP_400_BAD_REQUEST)
            

#             # Check demand for rides in the city
#             demand = Ride.objects.filter(
#                 pickup_location__icontains=location_city,
#                 status__in=['requested', 'ongoing'],
#                 pickup_datetime__gte=now()
#             ).count()

#             # Check available drivers in the city
#             available_drivers = Driver.objects.filter(
#                 location_city__iexact=location_city,
#                 available_status='available'
#             ).count()

#             print(f"DEBUG: Available drivers in {location_city}: {available_drivers}")
#             print(f"DEBUG: Ride demand in {location_city}: {demand}")

#             # If no drivers are available, return no rides
#             if available_drivers == 0:
#                 return Response({'message': 'No drivers available at the moment.'}, status=status.HTTP_200_OK)

#             # Calculate demand-to-driver ratio
#             demand_to_driver_ratio = demand / available_drivers
#             print(f"DEBUG: Demand-to-driver ratio: {demand_to_driver_ratio}")

#             # Determine surge multiplier within ratio ≤ 1
#             surge_multiplier = 1.0
#             if 0.5 < demand_to_driver_ratio <= 0.8:
#                 surge_multiplier = 1.5
#             elif 0.8 < demand_to_driver_ratio <= 1.0:
#                 surge_multiplier = 2.0

#             print(f"DEBUG: Surge multiplier: {surge_multiplier}")


#             # Check if distance <= 20 miles
#             if distance_miles <= 20:
#                 # Predict fare using the model
#                 features = pd.DataFrame([{
#                     'distance_miles': distance_miles,
#                     'passenger_count': passenger_count,
#                     'pickup_day': pickup_day,
#                     'pickup_hour': pickup_hour,
#                     'pickup_weekday': pickup_weekday,
#                     'pickup_month': pickup_month,
#                 }])

#                 print(f"Features for fare prediction: {features}")  # Debugging statement

#                 predicted_fare = model.predict(features)[0]
#                 print(f"Predicted fare (<= 20 miles): {predicted_fare}")  # Debugging statement

#             else:
#                 # Predict base fare at 20 miles
#                 base_fare = calculate_base_fare_at_20_miles(model)
#                 print(f"Base fare for 20 miles: {base_fare}")  # Debugging statement

#                 # Compute additional fare for distances > 20 miles
#                 additional_fare = max(0, (distance_miles - 20) * average_fare_per_mile * 0.7)
#                 print(f"Additional fare for distance > 20 miles: {additional_fare}")  # Debugging statement

#                 # Total fare
#                 predicted_fare = base_fare + additional_fare
#                 print(f"Predicted fare (> 20 miles): {predicted_fare}")  # Debugging statement


#             # Apply surge multiplier
#             final_fare = round(predicted_fare * surge_multiplier, 2)
#             print(f"Final fare after applying surge multiplier: {final_fare}")  # Debugging statement

#             return Response({
#                 'predicted_fare': final_fare,
#                 'surge_multiplier': surge_multiplier,
#                 'base_fare': round(predicted_fare, 2)
#                 'message': 'Surge pricing applied based on demand-to-driver ratio.'
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


#         #     return Response({'predicted_fare': round(predicted_fare, 2)}, status=status.HTTP_200_OK)

#         # except Exception as e:
#         #     return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
