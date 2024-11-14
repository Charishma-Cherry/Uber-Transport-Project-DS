
// import React, { useContext } from 'react';
// import { Navbar, Nav, Container, Button } from 'react-bootstrap';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import './DriverNavbar.css';

// function DriverNavbar() { 
//   const { logout } = useContext(AuthContext); // Access user and logout from AuthContext
//   const navigate = useNavigate(); // Initialize the navigate function for routing


//   const userType = localStorage.getItem('userType');
//     const loggedIn = localStorage.getItem('token');
//     const isDriverRoute = window.location.pathname.startsWith('/driver');


//   // Function to handle user logout
//   const handleLogout = () => {
//     logout(); // Log out the user
//     navigate('/'); // Redirect to the home page after logout
//   };
//   const user = localStorage.getItem('user') !== '' ? JSON.parse(localStorage.getItem('user')): null;
//   return (
//     <Navbar className="custom-navbar" expand="lg"> {/* Custom Navbar component with expandable options */}
//       <Container>
//         <Navbar.Brand as={Link} to="/" className="navbar-brand">Uber Transport</Navbar.Brand> {/* Brand logo linking to home */}
//         <Navbar.Toggle aria-controls="basic-navbar-nav" /> {/* Button to toggle navigation on smaller screens */}
//         <Navbar.Collapse id="basic-navbar-nav"> {/* Collapse the navigation links */}
//           <Nav className="ml-auto"> {/* Navigation items aligned to the right */}
//             {loggedIn && userType === 'driver' && isDriverRoute ? ( // If user is logged in
//               <>
//                 <span className="nav-link">Welcome, {user.first_name}!</span> {/* Display user's first name */}
//                 <Button variant="outline-light" onClick={handleLogout} className="logout-button">
//                   Logout
//                 </Button> {/* Logout button */}
//               </>
//             ) : 
//             ( // If user is not logged in
//               <>
//                 <Nav.Link as={Link} to="/driver/login" className="nav-link">Login</Nav.Link> {/* Link to Login page */}
//                 <Nav.Link as={Link} to="/driver/signup" className="nav-link">Sign Up</Nav.Link> {/* Link to Sign Up page */}
//               </>
//             )
//             }
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }

// export default DriverNavbar;

import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
