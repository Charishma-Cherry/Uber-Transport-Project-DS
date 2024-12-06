// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../services/api';
// import { endpoints } from '../../services/api';
// import './DriverRideHistory.css';



// const DriverRideHistory = () => {
//   const [completedRides, setCompletedRides] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Define fetchDriverCompletedRides inside the component
//   const fetchDriverCompletedRides = async () => {
//     try {
//       console.log('Fetching driver completed rides...');
//       const response = await axiosInstance.get(endpoints.DRIVER_COMPLETED_RIDES);
//       console.log('Driver completed rides response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching driver completed rides:', error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     const loadCompletedRides = async () => {
//       setLoading(true);
//       try {
//         const rides = await fetchDriverCompletedRides(); // Use the local function
//         setCompletedRides(rides);
//       } catch (err) {
//         setError('Failed to fetch completed rides.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCompletedRides();
//   }, []);

//   if (loading) return <p>Loading completed rides...</p>;
//   if (error) return <p>{error}</p>;
//   if (completedRides.length === 0) return <p>No completed rides found.</p>;

//   return (
//     <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '10px' }}>
//       <h2>Driver Completed Rides</h2>
//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr>
//             <th>Ride ID</th>
//             <th>Pickup Location</th>
//             <th>Dropoff Location</th>
//             <th>Pickup Time</th>
//             <th>Distance</th>
//             <th>Fare</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {completedRides.map((ride) => (
//             <tr key={ride.ride_id}>
//               <td>{ride.ride_id}</td>
//               <td>{ride.pickup_location}</td>
//               <td>{ride.dropoff_location}</td>
//               <td>{new Date(ride.pickup_datetime).toLocaleString()}</td>
//               <td>{ride.distance ? ride.distance.toFixed(2) : 'N/A'}</td>
//               <td>${ride.fare.toFixed(2)}</td>
//               <td>{ride.status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default DriverRideHistory;

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/api';
import { endpoints } from '../../services/api';
import './DriverRideHistory.css';

const DriverRideHistory = () => {
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDriverCompletedRides = async () => {
    try {
      console.log('Fetching driver completed rides...');
      const response = await axiosInstance.get(endpoints.DRIVER_COMPLETED_RIDES);
      console.log('Driver completed rides response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver completed rides:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadCompletedRides = async () => {
      setLoading(true);
      try {
        const rides = await fetchDriverCompletedRides();
        setCompletedRides(rides);
      } catch (err) {
        setError('Failed to fetch completed rides.');
      } finally {
        setLoading(false);
      }
    };

    loadCompletedRides();
  }, []);

  if (loading) return <p>Loading completed rides...</p>;
  if (error) return <p>{error}</p>;
  if (completedRides.length === 0) return <p>No completed rides found.</p>;

  return (
    <div className="completed-rides-container">
      <h2 className="completed-rides-title">Driver Completed Rides</h2>
      <table className="completed-rides-table">
        <thead>
          <tr>
            <th>Ride ID</th>
            <th>Pickup Location</th>
            <th>Dropoff Location</th>
            <th>Pickup Time</th>
            <th>Distance</th>
            <th>Fare</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {completedRides.map((ride) => (
            <tr key={ride.ride_id}>
              <td>{ride.ride_id}</td>
              <td>{ride.pickup_location}</td>
              <td>{ride.dropoff_location}</td>
              <td>{new Date(ride.pickup_datetime).toLocaleString()}</td>
              <td>{ride.distance ? ride.distance.toFixed(2) : 'N/A'}</td>
              <td>${ride.fare.toFixed(2)}</td>
              <td className={`status-${ride.status}`}>{ride.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverRideHistory;
