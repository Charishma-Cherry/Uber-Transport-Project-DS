

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/api';
import { endpoints } from '../../services/api';
import './DriverRideHistory.css';

const DriverRideHistory = () => {
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

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

        // Calculate total earnings
        const earnings = rides.reduce((total, ride) => total + (ride.fare || 0), 0);
        setTotalEarnings(earnings);
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
      
      {/* Display Total Earnings */}
      <div className="total-earnings">
        <h3>Total Earnings: ${totalEarnings.toFixed(2)}</h3>
      </div>

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
