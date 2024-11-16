# backend/ml_model/train_model.py
import pandas as pd
import numpy as np
from geopy.distance import distance
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Load dataset
data = pd.read_csv('../data/uber.csv')

# Data cleaning and feature engineering
data = data.drop(columns=['Unnamed: 0', 'key']).dropna().drop_duplicates()
data = data[(data.pickup_latitude < 90) & (data.dropoff_latitude < 90) &
            (data.pickup_longitude < 180) & (data.dropoff_longitude < 180)]

data['pickup_datetime'] = pd.to_datetime(data['pickup_datetime'], errors='coerce')
data['pickup_hour'] = data['pickup_datetime'].dt.hour
data['pickup_day'] = data['pickup_datetime'].dt.day
data['pickup_month'] = data['pickup_datetime'].dt.month
data['pickup_dayofweek'] = data['pickup_datetime'].dt.dayofweek

# Calculate distance
data['distance_miles'] = [
    round(distance((data.pickup_latitude[i], data.pickup_longitude[i]),
                   (data.dropoff_latitude[i], data.dropoff_longitude[i])).miles, 2)
    for i in data.index
]

data = data[(data['fare_amount'] > 0) & (data['fare_amount'] <= 113)]
data = data[(data['distance_miles'] > 0) & (data['distance_miles'] <= 45)]

X = data[['distance_miles', 'pickup_hour', 'pickup_day', 'pickup_month', 'pickup_dayofweek', 'passenger_count']]
y = data['fare_amount']

# Train the model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, 'fare_prediction_model.pkl')
