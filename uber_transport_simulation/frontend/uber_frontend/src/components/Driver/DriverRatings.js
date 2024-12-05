import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../services/api';
import './DriverRatings.css';

const DriverRatings = () => {
  const { driverId } = useParams();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get(`/drivers/${driverId}/ratings/`);
        setRatings(response.data);
      } catch (err) {
        setError('Failed to fetch ratings');
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [driverId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="ratings-container">
      <h2>My Ratings and Ride Details</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pickup Location</th>
            <th>Dropoff Location</th>
            <th>Fare</th>
            <th>Distance</th>
            <th>Pickup Time</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((rating, index) => (
            <tr key={index}>
              <td>{rating.customer__user__username}</td>
              <td>{rating.pickup_location}</td>
              <td>{rating.dropoff_location}</td>
              <td>${rating.fare.toFixed(2)}</td>
              <td>{rating.distance} km</td>
              <td>{new Date(rating.pickup_datetime).toLocaleString()}</td>
              <td>{rating.usercomment__rating}</td>
              <td>{rating.usercomment__comment || 'No Comment'}</td>
              <td>{new Date(rating.usercomment__created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverRatings;
