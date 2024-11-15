import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CombinedNavbar from './CombinedNavbar';
import LandingPage from './LandingPage';
import Login from './components/User/Login';
import Signup from './components/User/Signup';
import Profile from './components/User/Profile';
import Dashboard from './components/User/Dashboard';
import PrivateRoute from './components/User/PrivateRoute';
import DriverSignup from './components/Driver/DriverSignup';
import DriverProfile from './components/Driver/DriverProfile';
import DriverLogin from './components/Driver/DriverLogin';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (<AuthProvider>
    <Router>
      <CombinedNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/driver/signup" element={<DriverSignup />} />
        <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/user/profile" element={
          <PrivateRoute>
            {console.log('Rendering Profile route')}
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);
}

export default App;
