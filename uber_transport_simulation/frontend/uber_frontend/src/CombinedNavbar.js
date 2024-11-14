import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './CombinedNavbar.css';

const CombinedNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userType = localStorage.getItem('userType');
  const loggedIn = localStorage.getItem('token');
  const isUserRoute = window.location.pathname.startsWith('/user');
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
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {loggedIn && user && (
              <>
                <span className="nav-link">Welcome, {user.name}!</span>
                {userType === 'customer' && isUserRoute && (
                  <>
                    <Nav.Link as={Link} to="/user/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/user/profile">Profile</Nav.Link>
                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                  </>
                )}
                {userType === 'driver' && isDriverRoute && (
                  <>
                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                  </>
                )}
              </>
            )
            }
            {/* {!loggedIn && (
              <>
                <Nav.Link as={Link} to="/user/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/user/signup">Signup</Nav.Link>
              </>
            )} */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CombinedNavbar;
