// // App.js
// import React from 'react';
// import { Route, Routes, useLocation } from 'react-router-dom';
// import { Container } from 'react-bootstrap';
// import { AuthProvider } from './context/AuthContext';

// import LandingPage from './components/LandingPage';
// import DriverSignup from './components/Driver/DriverSignup';
// import DriverProfile from './components/Driver/DriverProfile';
// import DriverNavBar from './components/DriverNavbar';
// import DriverLogin from './components/Driver/DriverLogin';

// function AppContent() {
//   const location = useLocation();

//   // Determine if DriverNavBar should be displayed based on the route and user type
//   const getHeader = () => {
//     const userType = localStorage.getItem('userType');
//     const loggedIn = localStorage.getItem('token');
//     const isDriverRoute = location.pathname.startsWith('/driver');

//     if (loggedIn && isDriverRoute && userType === 'driver') {
//       const driverId = localStorage.getItem('driver_id'); // Get driver ID from localStorage
//       return <DriverNavBar id={driverId} />;
//     }
//     return null;
//   };

//   return (
//     <>
//       {getHeader()}
//       <Container className="mt-4">
//         <Routes>
//           <Route path="/" element={<LandingPage />} /> {/* Default route for Landing Page */}
//           <Route path="/driver/signup" element={<DriverSignup />} />
//           <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
//           <Route path="/driver/login" element={<DriverLogin />} />
//           <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
//         </Routes>
//       </Container>
//     </>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;

// App.js

import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './components/LandingPage';
import DriverSignup from './components/Driver/DriverSignup';
import DriverProfile from './components/Driver/DriverProfile';
import DriverNavBar from './components/DriverNavbar';
import DriverLogin from './components/Driver/DriverLogin';

function AppContent() {
  const location = useLocation();

  // // Conditionally render DriverNavBar if the user is logged in as a driver
  // const getHeader = () => {
  //   const userType = localStorage.getItem('userType');
  //   const loggedIn = localStorage.getItem('token');
  //   const isDriverRoute = location.pathname.startsWith('/driver');

  //   if (loggedIn && userType === 'driver' && isDriverRoute) {
  //     return <DriverNavBar />;
  //   }
  //   return null;
  // };

  return (
    <>
      {/* {getHeader()} */}
      <DriverNavBar />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Default route for Landing Page */}
          <Route path="/driver/signup" element={<DriverSignup />} />
          <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
          <Route path="/driver/login" element={<DriverLogin />} />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

