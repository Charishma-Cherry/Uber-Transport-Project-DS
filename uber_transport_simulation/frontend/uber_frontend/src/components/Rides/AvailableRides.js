import React, { useState, useEffect } from 'react';
import '../../AvailableRides.css'; // Adjust path if needed

const AvailableRides = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');

  useEffect(() => {
    const fetchDriversByCity = async (city) => {
      try {
        console.log(`Fetching all drivers in ${city}...`);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/drivers/?location_city=${encodeURIComponent(city)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch drivers in ${city}`);
        }

        const data = await response.json();
        setDrivers(data);
        setLoading(false);
        console.log(`Fetched drivers in ${city}:`, data);
      } catch (err) {
        console.error(`Error fetching drivers in ${city}:`, err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchPickupLocation = async () => {
      try {
        console.log('Fetching user pickup location...');
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/user/pickup-location/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pickup location');
        }

        const data = await response.json();
        const locationParts = data.pickup_location.split(',').reverse();
        const city = locationParts[2].trim(); // Accessing the third last item after reversing
        setPickupLocation(city); // Store just the city
        console.log('Extracted city:', city);
        fetchDriversByCity(city); // Fetch drivers based on the extracted city
      } catch (err) {
        console.error('Error fetching pickup location:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPickupLocation();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="available-rides-container">
      <h2>All Available Drivers in {pickupLocation}</h2>
      {pickupLocation && <p>User Pickup Location: {pickupLocation}</p>}
      {drivers.length === 0 ? (
        <p>No drivers found in {pickupLocation}.</p>
      ) : (
        <table className="available-rides-table">
          <thead>
            <tr>
              <th>Driver ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Car Name</th>
              <th>Phone Number</th>
              <th>Car Number</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, index) => (
              <tr key={index}>
                <td>{driver.driver_id}</td>
                <td>{driver.first_name}</td>
                <td>{driver.last_name}</td>
                <td>{driver.car_name}</td>
                <td>{driver.phone_number}</td>
                <td>{driver.car_number}</td>
                <td>{driver.location_city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AvailableRides;



// import React, { useState, useEffect } from 'react';
// // import './AvailableRides.css'; // Adjust path if needed

// const AvailableRides = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [pickupLocation, setPickupLocation] = useState('');

//   useEffect(() => {
    






//     const fetchAllDrivers = async () => {
//       try {
//         console.log('Fetching all drivers...');
//         const token = localStorage.getItem('token');
//         const response = await fetch(`http://localhost:8000/api/drivers/`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch drivers');
//         }

//         const data = await response.json();
//         console.log('Fetched drivers:', data);
//         console.log("Printing info",data)
//         setDrivers(data);
//       } catch (err) {
//         console.error('Error fetching drivers:', err.message);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };



//     const fetchPickupLocation = async () => {
//         try {
//           console.log('Fetching user pickup location...');
//           const token = localStorage.getItem('token');
//           console.log("token",token);
//           const response = await fetch(`http://localhost:8000/api/user/pickup-location/`, {
//             method: 'GET',
//             headers: {
//              'Authorization': `Token ${localStorage.getItem('token')}`,
//               'Content-Type': 'application/json',
//             },
//           });
  
//           if (!response.ok) {
//             throw new Error('Failed to fetch pickup location');
//           }
  
//           const data = await response.json();
//           console.log('User pickup location:', data.pickup_location);
//           const locationParts = data.pickup_location.split(',').reverse();
//         const city = locationParts[2].trim(); // Accessing the third last item after reversing
//         setPickupLocation(city); // Store just the city
//         console.log('Extracted city:', city);
//          // setPickupLocation(data.pickup_location); // Store pickup location
//         } catch (err) {
//           console.error('Error fetching pickup location:', err.message);
//           setError(err.message);
//           setLoading(false);
//         }
//       };


    


//     fetchAllDrivers();
//     fetchPickupLocation();
//   }, []);

//   if (loading) return <div>Loading drivers...</div>;
//   if (error) return <div className="error-message">{error}</div>;

//   return (
//     <div className="available-rides-container">
//       <h2>All Available Drivers</h2>
//       {pickupLocation && <p>User Pickup Location: {pickupLocation}</p>} {/* Displaying the pickup location */}

//       {drivers.length === 0 ? (
//         <p>No drivers found.</p>
//       ) : (
//         <table className="available-rides-table">
//           <thead>
//             <tr>
//               <th>First Name</th>
//               <th>Last Name</th>
//               <th>Car Name</th>
//               <th>Phone Number</th>
//               <th>City</th>
//             </tr>
//           </thead>
//           <tbody>
//             {drivers.map((driver, index) => (
//               <tr key={index}>
//                 <td>{driver.first_name}</td>
//                 <td>{driver.last_name}</td>
//                 <td>{driver.car_name}</td>
//                 <td>{driver.phone_number}</td>
//                 <td>{driver.location_city}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AvailableRides;


