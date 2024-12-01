import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminPrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Checking admin private route");
  console.log(user);

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  console.log("Private Route successful")

  return children;
};

export default AdminPrivateRoute;