
// import React, { useState, useEffect } from 'react';
// import { fetchDriverRides, updateRideStatus } from '../../services/api';  // Assuming you have this API service
// import './RideManagement.css';

// const RideManagement = () => {
//   const [rides, setRides] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const token = sessionStorage.getItem('authToken'); // Replace 'authToken' with the key where the token is stored


//   useEffect(() => {
//     const loadRides = async () => {
//       setLoading(true);
//       console.log('Fetching driver rides...');

//       try {
//         const data = await fetchDriverRides(); // Fetch driver-specific rides
//         console.log('Driver rides fetched successfully:', data);
//         setRides(data); // Update state with fetched rides
//       } catch (error) {
//         console.error('Failed to fetch driver rides:', error);
//         alert('Failed to load ride requests. Please try again.');
//       } finally {
//         setLoading(false);
//         console.log('Fetching driver rides complete.');
//       }
//     };

//     loadRides();
//   }, []);


//   const handleStatusChange = async (rideId, newStatus) => {
//     setLoading(true);
//     try {
//       console.log(`Attempting to update status for ride ID: ${rideId} to '${newStatus}'`);
      
//       const response = await fetch(`http://localhost:8000/api/${rideId}/status/`, {  // Correct URL
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`, // Include token
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to update status');
//       }
  
//       const data = await response.json();
//       console.log('Ride status updated:', data);
  
//       // Update local state with the new status
//       setRides((prevRides) =>
//         prevRides.map((ride) =>
//           ride.ride_id === rideId ? { ...ride, status: newStatus } : ride
//         )
//       );
//       alert('Ride status updated successfully.');
//     } catch (error) {
//       console.error('Failed to update ride status:', error);
//       alert('Failed to update ride status. Please try again.');
//     } finally {
//       setLoading(false);
//       console.log(`Finished attempting to update status for ride ID: ${rideId}`);
//     }
//   };
  
//   return (
//     <div className="ride-management-container">
//       <h1 className="ride-management-title">Ride Management</h1>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <table className="ride-management-table">
//           <thead>
//             <tr>
//               <th>Ride ID</th>
//               <th>Customer</th>
//               <th>Pickup Location</th>
//               <th>Dropoff Location</th>
//               <th>Fare</th>
//               <th>Passengers</th>
//               <th>Pickup Time</th>
//               <th>Status</th>
//               <th>Update Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rides.map((ride) => (
//               <tr key={ride.ride_id}>
//                 <td>{ride.ride_id}</td> {/* Displaying the ride ID */}
//                 <td>{ride.customer_name}</td>
//                 <td>{ride.pickup_location}</td>
//                 <td>{ride.dropoff_location}</td>
//                 <td>${ride.fare.toFixed(2)}</td>
//                 <td>{ride.passenger_count}</td>
//                 <td>{new Date(ride.pickup_datetime).toLocaleString()}</td>
//                 <td className={`status-${ride.status.toLowerCase().replace(' ', '-')}`}>
//                   {ride.status}
//                 </td>
//                 <td>
//                   <select
//                     value={ride.status}
//                     onChange={(e) => handleStatusChange(ride.ride_id, e.target.value)}
//                   >
//                     <option value="requested">Requested</option>
//                     <option value="ongoing">Ongoing</option>
//                     <option value="completed">Completed</option>
//                     <option value="canceled">Canceled</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default RideManagement;


import React, { useState, useEffect } from 'react';
import { fetchDriverRides } from '../../services/api';  // Assuming you have this API service
import './RideManagement.css';

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRides = async () => {
      setLoading(true);
      console.log('Fetching driver rides...');
      
      try {
        const data = await fetchDriverRides(); // Fetch driver-specific rides
        console.log('Driver rides fetched successfully:', data);
        setRides(data); // Update state with fetched rides
      } catch (error) {
        console.error('Failed to fetch driver rides:', error);
        alert('Failed to load ride requests. Please try again.');
      } finally {
        setLoading(false);
        console.log('Fetching driver rides complete.');
      }
    };

    loadRides();
  }, []);

  const handleStatusChange = async (rideId, newStatus) => {
    setLoading(true);
    console.log(`Attempting to update status for ride ID: ${rideId} to '${newStatus}'`);

    // Check if the token is valid and exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token is missing or invalid!');
      alert('You need to log in first.');
      setLoading(false);
      return;
    }

    try {
      console.log('Token:', token); // Log token for debugging

      const response = await fetch(`http://localhost:8000/api/${rideId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus, driverId : localStorage.getItem('driver_id') }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from backend:', errorData);
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Ride status updated:', data);

      // Update local state with the new status
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride.ride_id === rideId ? { ...ride, status: newStatus } : ride
        )
      );
      alert('Ride status updated successfully.');
    } catch (error) {
      console.error('Failed to update ride status:', error);
      alert('Failed to update ride status. Please try again.');
    } finally {
      setLoading(false);
      console.log(`Finished attempting to update status for ride ID: ${rideId}`);
    }
  };

  return (
    <div className="ride-management-container">
      <h1 className="ride-management-title">Ride Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="ride-management-table">
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Customer</th>
              <th>Pickup Location</th>
              <th>Dropoff Location</th>
              <th>Fare</th>
              <th>Passengers</th>
              <th>Pickup Time</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {rides && rides.map((ride) => (
              <tr key={ride.ride_id}>
                <td>{ride.ride_id}</td> {/* Displaying the ride ID */}
                <td>{ride.customer_name}</td>
                <td>{ride.pickup_location}</td>
                <td>{ride.dropoff_location}</td>
                <td>${ride.fare.toFixed(2)}</td>
                <td>{ride.passenger_count}</td>
                <td>{new Date(ride.pickup_datetime).toLocaleString()}</td>
                <td className={`status-${ride.status.toLowerCase().replace(' ', '-')}`}>
                  {ride.status}
                </td>
                <td>
                  {ride.status !== "completed" ? (
                    <select
                      value={ride.status}
                      onChange={(e) => handleStatusChange(ride.ride_id, e.target.value)}
                    >
                      <option value="requested">Requested</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RideManagement;

