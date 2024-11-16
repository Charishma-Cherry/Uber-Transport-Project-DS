import React, { useEffect, useState, useContext } from 'react'; // Make sure useContext is imported
import { Table, Spinner, Alert } from 'react-bootstrap';
import { getBillingHistoryForCustomer } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const BillingHistory = () => {
  const { customerId } = useContext(AuthContext);  // Use customerId from AuthContext
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        const response = await getBillingHistoryForCustomer(customerId);  // Pass customerId here
        setBillingHistory(response.data);
      } catch (err) {
        setError('Failed to load billing history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {  // Check if customerId is available from context
      fetchBillingHistory();
    } else {
      setError('Customer ID not found');
      setLoading(false);
    }
  }, [customerId]);  // Add customerId as a dependency to refetch if it changes

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="billing-history container mt-5">
      <h2>Billing History</h2>
      {billingHistory.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Pickup Time</th>
              <th>Dropoff Time</th>
              <th>Source Location</th>
              <th>Destination Location</th>
              <th>Distance Covered</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((billing) => (
              <tr key={billing.billing_id}>
                <td>{billing.date}</td>
                <td>{billing.pickup_time}</td>
                <td>{billing.dropoff_time}</td>
                <td>{billing.source_location}</td>
                <td>{billing.destination_location}</td>
                <td>{billing.distance_covered} km</td>
                <td>${billing.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No billing history available.</Alert>
      )}
    </div>
  );
};

export default BillingHistory;
