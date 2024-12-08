import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './AdminDashboard.css';

const AdminDashboard = () => {
  console.log('Rendering Admin Dashboard component');
  
  return (
    <div className="admin-dashboard container mt-5">
      <h2>Admin Dashboard</h2>
      <div className="general-info mb-4">
        <p>Choose an action to manage</p>
      </div>
      <div className="dashboard-buttons">
        <Button as={Link} to="/admin/manage-users" variant="success" className="mx-2">Manage Users</Button>
        <Button as={Link} to="/admin/manage-drivers" variant="success" className="mx-2">Manage Drivers</Button>
        <Button as={Link} to="/admin/manage-rides" variant="success" className="mx-2">Manage Rides</Button>
        <Button as={Link} to="/admin/manage-bills" variant="success" className="mx-2">Manage Bills</Button>
        <Button as={Link} to="/admin/stats" variant="primary" className="mx-2">View Stats</Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
