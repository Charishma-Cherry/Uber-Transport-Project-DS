import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './CombinedNavbar.css';

const CombinedNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const loggedIn = localStorage.getItem('token');
  const isUserRoute = window.location.pathname.startsWith('/user');
  const isDriverRoute = window.location.pathname.startsWith('/driver');
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">Uber Transport</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            
            {/* Driver Logout Button - Always display if logged in and on driver route */}
            {userType === 'driver' && isDriverRoute && loggedIn && (
              <>
              <Nav.Link as={Link} to={`/driver/${localStorage.getItem('driver_id')}/profile`}>Profile</Nav.Link>
              <Nav.Link as={Link} to="/driver/billing-history">Billing History</Nav.Link>
              <Nav.Link as={Link} to="/driver/ride-history">Ride History</Nav.Link>
              <Nav.Link as={Link} to="/driver/ride-management">Ride Management</Nav.Link> {/* New Link */}
              <Nav.Link as={Link} to="/driver/earnings">Earnings</Nav.Link> {/* New Link */}
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </>
            )}

            {loggedIn && user ? (
              <>
                {/* Show Dashboard and Profile for the user */}
                {isUserRoute && (
                  <>
                    <Nav.Link as={Link} to="/user/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/user/profile">Profile</Nav.Link>
                  </>
                )}

                {/* Show Logout for the user route */}
                {isUserRoute && !isDriverRoute && (
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                )}
              </>
            ) : (
              // Show Login and Signup only for user routes when not logged in
              isUserRoute && !loggedIn && (
                <>
                  <Nav.Link as={Link} to="/user/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/user/signup">Signup</Nav.Link>
                </>
              )
            )}
            
            {/* Admin-specific links */}
            {isAdminRoute && loggedIn && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/profile">Profile</Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CombinedNavbar;
