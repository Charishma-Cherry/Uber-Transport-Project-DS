
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';

function RideBookingForm() {
  const apiKey = "AIzaSyBbEUnx2RFMLJoK65hW-Fy3imgWLAsypM0"; // Replace with your actual API key
  const [ride, setRide] = useState({
    pickup_location: '',
    dropoff_location: '',
    pickup_datetime: '',
    distance: '', // Field for display only
    duration: '', // Field for display only
    estimated_price: '', // Field for display only
    passenger_count: 1,
  });

  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimateFare = async () => {
    console.log(ride)
    if (!ride.distance || !ride.pickup_datetime) {
      
      alert('Please fill in all the required fields to estimate the fare.');
      return;
    }

    setLoading(true);

    try {

      function splitPickupDatetime(pickup_datetime) {
        // Create a JavaScript Date object
        const pickupDate = new Date(pickup_datetime);
    
        // Extract the components
        const pickup_hour = pickupDate.getHours(); // Hour (0-23)
        const pickup_day = pickupDate.getDate(); // Day of the month (1-31)
        const pickup_month = pickupDate.getMonth() + 1; // Month (1-12)
        const pickup_dayofweek = pickupDate.getDay(); // Day of the week (0-6, 0 is Sunday)
    
        // Return the components as an object
        return {
            pickup_hour,
            pickup_day,
            pickup_month,
            pickup_dayofweek,
        };
    }
     
    const requiredtimefields = splitPickupDatetime(ride.pickup_datetime)

     // Function to determine surge multiplier based on pickup hour
     const getSurgeMultiplier = (pickupHour) => {
      if (pickupHour >= 6 && pickupHour < 9) {
        return 1.5; // Morning rush hour
      } else if (pickupHour >= 17 && pickupHour < 20) {
        return 2.0; // Evening rush hour
      } else if (pickupHour >= 22 || pickupHour < 5) {
        return 1.8; // Late-night hours
      }
      return 1.0; // No surge
    };

    const surgeMultiplier = getSurgeMultiplier(requiredtimefields.pickup_hour);

    // Make API call to get the base fare
    const response = await axios.post('http://localhost:8000/api/predict_fare/', {
      ...requiredtimefields,
      distance_miles: parseFloat(ride.distance.split(' ')[0]),
      passenger_count: ride.passenger_count,
    });

    const { predicted_fare } = response.data;

    /// Calculate surge fare and final fare
    const surgeFare = (predicted_fare * (surgeMultiplier - 1)).toFixed(2);
    const finalFare = (predicted_fare * surgeMultiplier).toFixed(2);

    // Update ride with estimated fare and route info
    setRide((prevRide) => ({
      ...prevRide,
      estimated_price: finalFare,
      base_fare: predicted_fare.toFixed(2), // Store base fare
      surge: surgeFare, // Store surge amount
    }));

    setRouteInfo({
      distance: ride.distance,
      duration: ride.duration,
      estimated_price: finalFare,
    });
  } catch (error) {
    console.error('Error estimating fare:', error);
    alert('Failed to estimate the fare. Please try again.');
  } finally {
    setLoading(false);
  }
};
      // Replace with your fare estimation API endpoint
  //     const response = await axios.post('http://localhost:8000/api/predict_fare/', {
  //       ...requiredtimefeilds,
  //       distance_miles: parseFloat(ride.distance.split(' ')[0]),
  //       passenger_count: ride.passenger_count, 
  //     });

  //     const { predicted_fare } = response.data;

  //     setRide((prevRide) => ({
  //       ...prevRide,
  //       estimated_price: predicted_fare,
  //     }));

  //     setRouteInfo({
  //       distance:ride.distance,
  //       duration:ride.duration,
  //       estimated_price: parseFloat(predicted_fare).toFixed(2),
  //     });
  //   } catch (error) {
  //     console.error('Error estimating fare:', error);
  //     alert('Failed to estimate the fare. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleBookRide = async (e) => {
    e.preventDefault();


    if (!ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime) {
      alert('Please fill in all the required fields to book the ride.');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');

    const rideData = {
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location,
      pickup_datetime: ride.pickup_datetime,
      distance: parseFloat(ride.distance.replace(' mi', '')), // Convert distance to a number
      duration: ride.duration, // Include duration from frontend
      fare: parseFloat(ride.estimated_price.replace('$', '')), // Include fare from frontend
      passenger_count: ride.passenger_count,
    };

    console.log('Payload:', rideData);
    try {
      const response = await axios.post('http://localhost:8000/api/rides/', rideData, {
        headers: { 'Authorization': `Token ${token}` },
      });

      alert('Ride booked successfully!');
      // Reset form
      setRide({
        pickup_location: '',
        dropoff_location: '',
        pickup_datetime: '',
        distance: '',
        duration: '',
        estimated_price: '',
        passenger_count: '',
      });
      setMarkers([]);
      setDirections(null);
      setRouteInfo(null);
    } catch (error) {
      console.error('Error booking the ride:', error);
      alert('Failed to book the ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Book a Ride</h2>

      <MapComponent
        apiKey={apiKey}
        markers={markers}
        setMarkers={setMarkers}
        directions={directions}
        setDirections={setDirections}
        setRouteInfo={setRouteInfo}
        setRide={setRide}
      />

      <form style={{ marginTop: '1.5rem' }}>


<div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <input
            type="text"
            value={ride.pickup_location}
            placeholder="Pickup Location"
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <input
            type="text"
            value={ride.dropoff_location}
            placeholder="Dropoff Location"
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        {/* Passenger Count Dropdown */}
        <select
          value={ride.passenger_count}
          onChange={(e) =>
            setRide({ ...ride, passenger_count: parseInt(e.target.value, 10) })
          }
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          <option value="" disabled>Select Passenger Count</option>
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select> 

        <input
          type="datetime-local"
          value={ride.pickup_datetime}
          onChange={(e) => setRide({
            ...ride,
            pickup_datetime: e.target.value,
          })}
          required
          min={new Date().toISOString().slice(0, 16)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        />

        {routeInfo?.estimated_price && (
          <div style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: '#f9f9f9', // Light background for better contrast
          }}>
        
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              textAlign: 'center',
            }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Distance</p>
                <p style={{ fontWeight: '500' }}>{routeInfo.distance}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Duration</p>
                <p style={{ fontWeight: '500' }}>{routeInfo.duration}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Estimated Fare</p>
                <p style={{ fontWeight: '500' }}>
                  ${ride.base_fare} + ${ride.surge} = ${routeInfo.estimated_price}
                </p>
              </div>
            </div>
        
            <div style={{
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9', // Light background for better contrast
  }}>
    <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#4F46E5' }}>Fare Breakdown</h4>
    
    <div style={{
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.5',
    }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 'bold', color: '#000' }}>Base Fare: </span>
        ${ride.base_fare}
      </p>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 'bold', color: '#000' }}>Surge Pricing: </span>
        ${ride.surge}
      </p>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 'bold', color: '#4F46E5', fontSize: '1rem' }}>Total Estimated Fare: </span>
        ${routeInfo.estimated_price}
      </p>
    </div>
  </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleEstimateFare}
          disabled={!ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime || loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (!ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime || loading) ? '0.5' : '1',
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Calculating...' : 'Estimate Fare'}
        </button>

        <button
          type="submit"
          onClick={handleBookRide}
          disabled={!ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime || loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (!ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime || loading) ? '0.5' : '1',
          }}
        >
          {loading ? 'Booking...' : 'Book Ride'}
        </button>
      </form>
    </div>
  );
}

export default RideBookingForm;
