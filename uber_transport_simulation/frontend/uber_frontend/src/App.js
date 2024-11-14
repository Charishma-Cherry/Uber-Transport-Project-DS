import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './components/LandingPage';
import DriverSignup from './components/Driver/DriverSignup';
import DriverProfile from './components/Driver/DriverProfile';
import DriverNavBar from './components/DriverNavbar';
import DriverLogin from './components/Driver/DriverLogin';

function AppContent() {

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

