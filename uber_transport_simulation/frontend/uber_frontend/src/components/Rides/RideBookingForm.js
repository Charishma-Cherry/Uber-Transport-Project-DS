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
   base_fare: '', // Added field for base fare
    surge_amount: '', // Added field for surge amount
 });


 const [markers, setMarkers] = useState([]);
 const [directions, setDirections] = useState(null);
 const [routeInfo, setRouteInfo] = useState(null);
 const [loading, setLoading] = useState(false);

 const handleEstimateFare = async () => {
   console.log(ride)
   if (!ride.distance || !ride.pickup_datetime || !ride.pickup_location) {
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
       const pickup_weekday = pickupDate.getDay(); // Day of the week (0-6, 0 is Sunday)
  
       // Return the components as an object
       return {
           pickup_hour,
           pickup_day,
           pickup_month,
           pickup_weekday,
       };
   }
   
   const requiredtimefields = splitPickupDatetime(ride.pickup_datetime)


   // Make API call to get the base fare
   const response = await axios.post('http://localhost:8000/api/predict_fare/', {
     ...requiredtimefields, 
     distance_miles: parseFloat(ride.distance.split(' ')[0]),
     passenger_count: ride.passenger_count,
     pickup_location: ride.pickup_location,
   });


   const { predicted_fare, surge_multiplier, base_fare, message} = response.data;

   // Handle the "No drivers available" case
   if (message === 'No drivers available at the moment.') {
    alert("No nearby drivers available. Can't proceed further. Please try again later.");
    return; // Stop further execution
  }

   const surge_amount = (base_fare * (surge_multiplier - 1)).toFixed(2);
      const total_fare = predicted_fare.toFixed(2);

      setRide((prevRide) => ({
        ...prevRide,
        estimated_price: `$${total_fare}`,
        base_fare: `$${base_fare.toFixed(2)}`,
        surge_amount: `$${surge_amount}`,
        surge_multiplier,
      }));

      setRouteInfo({
        distance: ride.distance,
        duration: ride.duration,
        estimated_price: `$${total_fare}`,
      });
 } catch (error) {
   console.error('Error estimating fare:', error);
   alert('Failed to estimate the fare. Please try again.');
 } finally {
   setLoading(false);
 }
};


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
       base_fare: '',
        surge_amount: '',
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
          <div
            style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginBottom: '1rem',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h4 style={{ marginBottom: '1rem' }}>Fare Breakdown</h4>
            <p style={{ marginBottom: '0.5rem' }}>Base Fare: {ride.base_fare}</p>
            <p style={{ marginBottom: '0.5rem' }}>Surge Amount: {ride.surge_amount}</p>
            <p style={{ fontWeight: 'bold' }}>Total Fare: {routeInfo.estimated_price}</p>
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
            opacity: !ride.pickup_location || !ride.dropoff_location || !ride.pickup_datetime || loading ? '0.5' : '1',
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
