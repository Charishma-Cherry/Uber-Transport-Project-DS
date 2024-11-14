import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/User/Header';
import HomePage from './components/User/HomePage';
import Login from './components/User/Login';
import Signup from './components/User/Signup';
import Profile from './components/User/Profile';
import Dashboard from './components/User/Dashboard';
import PrivateRoute from './components/User/PrivateRoute';
import BillingHistory from './components/Billing/BillingHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
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
          <Route path="/user/billing-history" element={
            <PrivateRoute>
              <BillingHistory />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;