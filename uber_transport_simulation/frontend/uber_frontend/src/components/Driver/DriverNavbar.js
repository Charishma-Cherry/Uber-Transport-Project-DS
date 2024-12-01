import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './DriverNavbar.css';

function DriverNavbar() { 
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userType = localStorage.getItem('userType');
  const loggedIn = localStorage.getItem('token');
  const isDriverRoute = window.location.pathname.startsWith('/driver');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">Uber Transport</Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {loggedIn && userType === 'driver' && isDriverRoute && user && (
              <>
                <span className="nav-link">Welcome, {user.first_name}!</span>
                <Button variant="outline-light" onClick={handleLogout} className="logout-button">
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DriverNavbar;