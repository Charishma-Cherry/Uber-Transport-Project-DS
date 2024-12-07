import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BillPage.css';

function BillPage() {
  const { rideId } = useParams();
  const [billDetails, setBillDetails] = useState(null);

  useEffect(() => {
    const fetchBillDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/rides/${rideId}/bill/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setBillDetails(response.data);
      } catch (error) {
        console.error('Error fetching bill:', error);
        alert('Failed to fetch bill details.');
      }
    };
    fetchBillDetails();
  }, [rideId]);

  return (
    <div className="bill-container">
      {billDetails ? (
        <div className="bill-details">
          <h2>Bill for Ride {billDetails.ride_id}</h2>
          <p><strong>Pickup Location:</strong> {billDetails.pickup_location}</p>
          <p><strong>Dropoff Location:</strong> {billDetails.dropoff_location}</p>
          <p><strong>Fare:</strong> ${billDetails.fare}</p>
          <p><strong>Distance:</strong> {billDetails.distance} miles</p>
          <p><strong>Duration:</strong> {billDetails.duration}</p>
          <p><strong>Pickup Time:</strong> {new Date(billDetails.pickup_datetime).toLocaleString()}</p>
          <p><strong>Driver Id:</strong> {billDetails.driver_id}</p>
        </div>
      ) : (
        <p className="loading">Loading bill...</p>
      )}
    </div>
  );
}

export default BillPage;
