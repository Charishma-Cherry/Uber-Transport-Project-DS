import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { submitDriverRating } from '../../services/driverService';
import './RateUser.css';

const RateUser = () => {
  const { rideId } = useParams(); // Get the ride ID from the URL
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const driverId = localStorage.getItem('driver_id'); // Retrieve driver_id from localStorage
      if (!driverId) {
        throw new Error('Driver ID is missing. Please log in again.');
      }
      await submitDriverRating(driverId, {
        ride_id: rideId,
        rating,
        comment,
      });
      alert('Rating submitted successfully!');
      navigate('/driver/ride-management'); // Redirect back to ride management
    } catch (err) {
      console.error(err);
      setError('Failed to submit rating. Please try again.');
    }
  };

  const handleSkip = () => {
    navigate('/driver/ride-management'); // Redirect without submitting
  };

  return (
    <div className="rate-user-container">
      <h2>Are you happy with the rider? </h2>
      <div>
        <label>
          <strong> Rating(1-5):</strong>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="0">Select</option>
            {[1, 2, 3, 4, 5].map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          <strong>Comment:</strong>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
          />
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit} className="submit-btn">
        Submit Rating
      </button>
      <button onClick={handleSkip} className="skip-btn">
        Skip
      </button>
    </div>
  );
};

export default RateUser;
