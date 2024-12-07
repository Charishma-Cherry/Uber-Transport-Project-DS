
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RideHistory() {
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({});
  const [ratedRides, setRatedRides] = useState({}); // New state to track rated rides
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRideHistory = async () => {
      setLoading(true);
      const token = localStorage.getItem('token'); // Fetch token for authentication

      try {
        const response = await axios.get('http://localhost:8000/api/user/ride-history/', {
          headers: { Authorization: `Token ${token}` },
        });
        setRideHistory(response.data); // Assuming response data is an array of ride objects
        console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        alert('Failed to fetch ride history. Please try again.');
      } finally {
        setLoading(false);
      }



      
    };
    const storedRatings=localStorage.getItem('ratedRides');
    if (storedRatings) {
      setRatedRides(JSON.parse(storedRatings));
    }
    fetchRideHistory();
  }, []);


  const handleRatingChange = (rideId, value) => {
    setRatings({ ...ratings, [rideId]: value });
  };

  const submitRating = async (rideId) => {
    const token = localStorage.getItem('token');
    console.log("Token is",token)
    const ride = rideHistory.find(r => r.ride_id === rideId);
  
    console.log("Ride is",ride.driver_unique_id)
    if (!ride) {
      console.error('Ride not found for ID:', rideId);
      alert('Ride not found.');
      return;
    }
    console.log("Ride Driver is",ride.driver_unique_id)
    if (!ride.driver_unique_id) {
      console.error('Driver details not found for ride ID:', rideId);
      alert('Driver details not available for this ride.');
      return;
    }
  
    try {
      console.log('Submitting rating for driver ID:', ride.driver_unique_id);
      const response = await axios.patch(`http://localhost:8000/api/rides/${rideId}/rate`, {
        rating: ratings[rideId],
        driverId: ride.driver_unique_id  // Ensure this data is sent if needed by the backend
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log('Rating submitted:', response.data); // Debugging log
      alert('Rating submitted successfully');
      const newRatedRides = {...ratedRides, [rideId]: true};
      setRatedRides(newRatedRides);
      localStorage.setItem('ratedRides', JSON.stringify(newRatedRides));
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };







  // CSS-in-JS styles
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#333',
      textAlign: 'center',
    },
    loadingText: {
      textAlign: 'center',
      fontSize: '1.2rem',
      color: '#888',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1.5rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    tableHeader: {
      backgroundColor: '#4CAF50',
      color: 'white',
      fontWeight: '600',
      padding: '1rem',
    },
    tableRow: {
      borderBottom: '1px solid #ddd',
    },
    tableCell: {
      padding: '1rem',
      textAlign: 'left',
    },
    alternateRow: {
      backgroundColor: '#f9f9f9',
    },
    rowHover: {
      backgroundColor: '#e8f5e9',
    },
    noRecords: {
      textAlign: 'center',
      padding: '1rem',
      color: '#777',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      marginLeft: '1rem',
      borderRadius: '5px',
    },
  };

  const handleViewBillClick = (rideId) => {
    navigate(`/user/ride-bill/${rideId}`); // Navigate to the correct path
  };


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ride History</h2>
      {loading ? (
        <p style={styles.loadingText}>Loading ride history...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Driver ID</th>
              <th style={styles.tableHeader}>Ride ID</th>
              <th style={styles.tableHeader}>Pickup Location</th>
              <th style={styles.tableHeader}>Dropoff Location</th>
              <th style={styles.tableHeader}>Pickup Time</th>
              <th style={styles.tableHeader}>Distance</th>
              <th style={styles.tableHeader}>Fare</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Rating</th>
              <th style={styles.tableHeader}>Action</th> {/* Added this column for action buttons */}
            </tr>
          </thead>
          <tbody>
            {rideHistory.length > 0 ? (
              rideHistory.map((ride, index) => (
                <tr
                  key={ride.ride_id}
                  style={index % 2 === 0 ? styles.alternateRow : {}}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = styles.rowHover.backgroundColor)}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '')}
                >
                  <td style={styles.tableCell}>{ride.driver_unique_id || 'N/A'}</td>
                  <td style={styles.tableCell}>{ride.ride_id}</td>
                  <td style={styles.tableCell}>{ride.pickup_location}</td>
                  <td style={styles.tableCell}>{ride.dropoff_location}</td>
                  <td style={styles.tableCell}>
                    {new Date(ride.pickup_datetime).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>{ride.distance?.toFixed(2)} mi</td>
                  <td style={styles.tableCell}>${ride.fare.toFixed(2)}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        color: ride.status === 'Completed' ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {ride.status}
                    </span>
                  </td>
                  <td>
                    {ride.status === 'completed' && !ratedRides[ride.ride_id] ? (
                      <>
                        <select
                          value={ratings[ride.ride_id] || ''}
                          onChange={(e) => handleRatingChange(ride.ride_id, e.target.value)}
                        >
                          <option value="">Rate</option>
                          {[1, 2, 3, 4, 5].map(score => (
                            <option key={score} value={score}>{score}</option>
                          ))}
                        </select>
                        <button onClick={() => submitRating(ride.ride_id)}>Submit</button>
                      </>
                    ) : (
                      ride.status === 'completed' ? 'Rating Submitted' : 'N/A'
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {ride.status === 'completed' && (
                      <button
                        style={styles.button}
                        onClick={() => handleViewBillClick(ride.ride_id)}
                      >
                        View Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={styles.noRecords}>
                  No ride history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RideHistory;




