import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import LandingPage from './components/Driver/LandingPage';
import DriverSignup from './components/Driver/DriverSignup';
import DriverProfile from './components/Driver/DriverProfile';
import DriverNavbar from './components/Driver/DriverNavbar';
import DriverLogin from './components/Driver/DriverLogin';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './components/User/HomePage';
import Login from './components/User/Login';
import Signup from './components/User/Signup';
import Profile from './components/User/Profile';
import Dashboard from './components/User/Dashboard';
import PrivateRoute from './components/User/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {

  return (
    <>
    <AuthProvider>
      {/* {getHeader()} */}
      <DriverNavbar />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Default route for Landing Page */}
          <Route path="/driver/signup" element={<DriverSignup />} />
          <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/signup" element={<Signup />} />
          <Route path="/user/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/user/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </Container>
      </AuthProvider>
    </>
  );
}

export default App;

