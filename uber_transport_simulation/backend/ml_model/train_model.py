import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# Load the dataset using a relative path
data = pd.read_csv('../data/cleaned_uber_data.csv')

# Define features and target variable
features = [
    'distance_miles', 'passenger_count', 'pickup_day', 'pickup_hour',
    'pickup_weekday', 'pickup_month'
]
target = 'fare_amount'

# Split the dataset into training and testing sets
X = data[features]
y = data[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize Random Forest Regressor with the best hyperparameters
rf_model = RandomForestRegressor(
    n_estimators=150,
    max_depth=10,
    min_samples_split=10,
    min_samples_leaf=4,
    max_features=0.8,
    random_state=42
)

# Train the model
rf_model.fit(X_train, y_train)


# Calculate the average fare per mile for distances > 20 miles
long_distance_data = data[data['distance_miles'] > 20]
average_fare_per_mile = long_distance_data['fare_amount'].sum() / long_distance_data['distance_miles'].sum()
print(f"Average Fare Per Mile (for distances > 20 miles): {average_fare_per_mile:.2f}")

# Save the model and the average fare per mile
model_info = {
    'model': rf_model,
    'average_fare_per_mile': average_fare_per_mile
}
joblib.dump(model_info, 'fare_prediction_model.pkl')
print("Model and average fare per mile saved successfully!")


