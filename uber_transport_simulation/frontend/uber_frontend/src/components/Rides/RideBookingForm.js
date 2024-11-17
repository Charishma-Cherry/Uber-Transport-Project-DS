import React, { useState } from 'react';
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
  });


  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    // Prepare data to match the Ride model in the backend
    const rideData = {
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location,
      pickup_datetime: ride.pickup_datetime,
      distance: parseFloat(ride.distance.replace(' mi', '')), // Convert distance to a number
    };


    const token = localStorage.getItem('token');


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


      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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


        {routeInfo && (
          <div style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '1rem',
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
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Estimated Price</p>
                <p style={{ fontWeight: '500' }}>${routeInfo.estimated_price}</p>
              </div>
            </div>
          </div>
        )}


        <button
          type="submit"
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
