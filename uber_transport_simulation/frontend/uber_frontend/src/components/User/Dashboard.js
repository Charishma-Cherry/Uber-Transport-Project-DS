import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './Dashboard.css';

const Dashboard = () => {
  console.log('Rendering Dashboard component');
  
  
  return (
    <div className="user-dashboard container mt-5">
      <h2>Your Dashboard</h2>
      <div className="general-info mb-4">
        <p>Choose an action</p>
      </div>
      <div className="dashboard-buttons">
        <Button as={Link} to="/user/billing-history" variant="success" className="mx-2">Book a Ride</Button>
        <Button as={Link} to="/user/billing-history" variant="secondary" className="mx-2">Billing History</Button>
        <Button as={Link} to="/user/ride-history" variant="success" className="mx-2">Ride History</Button>
        
      </div>
    </div>
  );
};

export default Dashboard;