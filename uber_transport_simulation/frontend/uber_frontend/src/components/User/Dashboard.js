// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from 'react-bootstrap';
// import './Dashboard.css';

// const Dashboard = () => {
//   console.log('Rendering Dashboard component');
  
  
//   return (
//     <div className="user-dashboard container mt-5">
//       <h2>Your Dashboard</h2>
//       <div className="general-info mb-4">
//         <p>Choose an action</p>
//       </div>
//       <div className="dashboard-buttons">
//         <Button as={Link} to="/user/book-ride" variant="success" className="mx-2">Book a Ride</Button>
//         <Button as={Link} to="/user/billing-history" variant="secondary" className="mx-2">Billing History</Button>
//         <Button as={Link} to="/user/ride-history" variant="success" className="mx-2">Ride History</Button>
        
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import axiosInstance from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [ratings, setRatings] = useState([]);
    const [showRatings, setShowRatings] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleShowRatings = async () => {
        setShowRatings(!showRatings);
        if (!showRatings) {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/user/ratings/');
                setRatings(response.data);
            } catch (err) {
                setError('Failed to load ratings. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="user-dashboard container mt-5">
            <h2>Your Dashboard</h2>
            <div className="dashboard-buttons mb-5">
                <Button as={Link} to="/user/book-ride" variant="success" className="mx-2">
                    Book a Ride
                </Button>
                <Button as={Link} to="/user/billing-history" variant="secondary" className="mx-2">
                    Billing History
                </Button>
                <Button as={Link} to="/user/ride-history" variant="success" className="mx-2">
                    Ride History
                </Button>
                <Button onClick={handleShowRatings} variant="info" className="mx-2">
                    {showRatings ? 'Hide Ratings' : 'My Ratings'}
                </Button>
            </div>
            {showRatings && (
                <div className="ratings-section">
                    <h3>Your Ratings</h3>
                    {loading ? (
                        <p>Loading ratings...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : ratings.length > 0 ? (
                        ratings.map((rating, index) => (
                            <div key={index} className="rating-item border p-3 mb-3">
                                <p>
                                    <strong>Driver:</strong> {rating.driver_name}
                                </p>
                                <p>
                                    <strong>Rating:</strong> {rating.rating}
                                </p>
                                <p>
                                    <strong>Comment:</strong> {rating.comment || 'No comments provided'}
                                </p>
                                <p>
                                    <strong>Date:</strong> {new Date(rating.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No ratings available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;


