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
import DriverLocationSelection from './components/Driver/DriverLocationSelection';
import RateUser from './components/Driver/RateUser';
import DriverRatings from './components/Driver/DriverRatings';
import DriverRideHistory from './components/Driver/DriverRideHistory';
import RideBookingForm from './components/Rides/RideBookingForm';
import RideManagement from './components/Driver/RideManagement'; // New Page
import AdminSignup from './components/Admin/AdminSignup';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProfile from './components/Admin/AdminProfile';
import AdminPrivateRoute from './components/Admin/AdminPrivateRoute';
import ManageUsers from './components/Admin/ManageUsers';
import 'bootstrap/dist/css/bootstrap.min.css';
import RideHistory from './components/Rides/RideHistory';







function App() {
  return (<AuthProvider>
    <Router>
      <CombinedNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/driver/signup" element={<DriverSignup />} />
        <Route path="/driver/:driverId/profile" element={<DriverProfile />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/:driverId/select-location" element={<DriverLocationSelection />}/>
        <Route path="/driver/ride-management" element={<RideManagement />} /> {/* New Route */}
        <Route path="/driver/completed-rides" element={<DriverRideHistory />} />
        <Route path="/driver/:driverId/ratings" element={<DriverRatings />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/rate-user/:rideId" element={<RateUser />} />
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


        <Route path="/user/book-ride" element={
          <PrivateRoute>
            <RideBookingForm />
          </PrivateRoute>
          } />



      {/* Admin routes */}
      <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminPrivateRoute>
              <AdminDashboard />
            </AdminPrivateRoute>
          } />
          <Route path="/admin/profile" element={
            <AdminPrivateRoute>
              <AdminProfile />
            </AdminPrivateRoute>
          } />
          <Route path="/admin/manage-users" element={
            <AdminPrivateRoute>
              <ManageUsers />  
            </AdminPrivateRoute>
          } />
          <Route
            path="/user/ride-history"
            element={
              <PrivateRoute>
                <RideHistory />
              </PrivateRoute>
            }
          />

      </Routes>
    </Router>
  </AuthProvider>
);
}


export default App;
