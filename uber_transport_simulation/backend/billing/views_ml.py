import joblib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


import os
from django.conf import settings


# the model path
model_path = os.path.join(settings.BASE_DIR, 'ml_model', 'fare_prediction_model.pkl')
model = joblib.load(model_path)


# # Load the pre-trained model
# model = joblib.load('backend/ml_model/fare_prediction_model.pkl')


class FarePredictionView(APIView):
   def post(self, request):
       data = request.data
       try:
           # Extract features from the request
           distance_miles = data.get('distance_miles')
           pickup_hour = data.get('pickup_hour')
           pickup_day = data.get('pickup_day')
           pickup_month = data.get('pickup_month')
           pickup_dayofweek = data.get('pickup_dayofweek')
           passenger_count = data.get('passenger_count')


           # Create feature array
           features = [[distance_miles, pickup_hour, pickup_day, pickup_month, pickup_dayofweek, passenger_count]]
          
           # Predict the fare
           predicted_fare = model.predict(features)[0]


           return Response({'predicted_fare': predicted_fare}, status=status.HTTP_200_OK)
      
       except Exception as e:
           return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)