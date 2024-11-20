import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/api';  // Import your configured Axios instance
import { useNavigate } from 'react-router-dom';

function BillingHistory() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  const fetchBillingHistory = async () => {
    try {
      const customerId = localStorage.getItem('customerId'); // Fetch `customerId` from localStorage
      if (!customerId) {
        throw new Error('Customer ID not found in localStorage');
      }
  
      const response = await axiosInstance.get(`billing/history/customer/${customerId}/`);
      setBillingHistory(response.data);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('Failed to load billing history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Billing History</h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : billingHistory.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No billing history found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Billing ID</th>
                <th>Date</th>
                <th>Pickup Time</th>
                <th>Source Location</th>
                <th>Destination Location</th>
                <th>Distance (miles)</th>
                <th>Total Amount ($)</th>
                <th>Driver</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((bill) => (
                <tr key={bill.billing_id}>
                  <td>{bill.billing_id}</td>
                  <td>{bill.date}</td>
                  <td>{bill.pickup_time}</td>
                  <td>{bill.source_location}</td>
                  <td>{bill.destination_location}</td>
                  <td>{bill.distance_covered}</td>
                  <td>${bill.total_amount}</td>
                  <td>{bill.driver_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BillingHistory;
