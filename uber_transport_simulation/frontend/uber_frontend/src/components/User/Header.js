import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';  

const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userType = localStorage.getItem('userType');
  const loggedIn = localStorage.getItem('token');
  const isUserRoute = window.location.pathname.startsWith('/user'); // Use isUserRoute here

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Navbar.Brand as={Link} to="/">Uber Transport</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {loggedIn && userType === 'customer' && isUserRoute && user ? ( // Use isUserRoute here
            <>
              <Nav.Link as={Link} to="/user/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/user/profile">Profile</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/user/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/user/signup">Signup</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
