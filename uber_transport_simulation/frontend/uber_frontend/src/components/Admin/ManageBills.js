import React, { useState, useEffect } from 'react';
import { adminSearchBills, adminDeleteBill } from '../../services/billingService';

const ManageBills = () => {
  const [bills, setBills] = useState([]);
  const [searchParams, setSearchParams] = useState({
    customer_name: '',
    driver_name: '',
    from_date: '',
    to_date: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all bills on component mount
  const loadAllBills = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await adminSearchBills({});
      setBills(data);
    } catch (err) {
      setError('An error occurred while loading bills.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Bills based on search criteria
  const filteredBills = bills.filter((bill) => {
    const matchesCustomer =
      !searchParams.customer_name ||
      bill.customer_name.toLowerCase().includes(searchParams.customer_name.toLowerCase());
    const matchesDriver =
      !searchParams.driver_name ||
      bill.driver_name.toLowerCase().includes(searchParams.driver_name.toLowerCase());
    const matchesFromDate =
      !searchParams.from_date || new Date(bill.date) >= new Date(searchParams.from_date);
    const matchesToDate =
      !searchParams.to_date || new Date(bill.date) <= new Date(searchParams.to_date);

    return matchesCustomer && matchesDriver && matchesFromDate && matchesToDate;
  });

  // Handle deleting a bill
  const handleDelete = async (billId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this bill?');
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminDeleteBill(billId);
      setSuccess('Bill deleted successfully.');
      loadAllBills(); // Reload all bills after deletion
    } catch (err) {
      setError('An error occurred while deleting the bill.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBills();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage Bills</h1>

      {/* Search Section */}
      <div className="card p-4 mb-4">
        <h3>Search Bills</h3>
        <div className="form-group mb-3">
          <label>Customer Name</label>
          <input
            type="text"
            value={searchParams.customer_name}
            onChange={(e) => setSearchParams({ ...searchParams, customer_name: e.target.value })}
            className="form-control"
            placeholder="Enter customer name"
          />
        </div>
        <div className="form-group mb-3">
          <label>Driver Name</label>
          <input
            type="text"
            value={searchParams.driver_name}
            onChange={(e) => setSearchParams({ ...searchParams, driver_name: e.target.value })}
            className="form-control"
            placeholder="Enter driver name"
          />
        </div>
        <div className="form-group mb-3">
          <label>From Date</label>
          <input
            type="date"
            value={searchParams.from_date}
            onChange={(e) => setSearchParams({ ...searchParams, from_date: e.target.value })}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>To Date</label>
          <input
            type="date"
            value={searchParams.to_date}
            onChange={(e) => setSearchParams({ ...searchParams, to_date: e.target.value })}
            className="form-control"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setSearchParams({ ...searchParams })} // Trigger re-render
          disabled={loading}
        >
          {loading ? 'Filtering...' : 'Filter'}
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Bills List */}
      <div className="card p-4">
        <h3>All Bills</h3>
        {loading ? (
          <p>Loading bills...</p>
        ) : filteredBills.length > 0 ? (
          <ul className="list-group">
            {filteredBills.map((bill) => (
              <li key={bill.billing_id} className="list-group-item mb-3">
                <p>
                  <strong>Ride:</strong> {bill.source_location} → {bill.destination_location}
                </p>
                <p>
                  <strong>Total Amount:</strong> ${bill.total_amount}
                </p>
                <p>
                  <strong>Driver:</strong> {bill.driver_name}
                </p>
                <p>
                  <strong>Customer:</strong> {bill.customer_name}
                </p>
                <p>
                  <strong>Date:</strong> {bill.date}
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(bill.billing_id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bills to display.</p>
        )}
      </div>
    </div>
  );
};

export default ManageBills;
