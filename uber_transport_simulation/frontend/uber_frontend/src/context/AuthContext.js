import React, { createContext, useContext } from 'react';
import api, { endpoints } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const loginDriver = async (email, password) => {
    try {
      const response = await api.post(endpoints.DRIVER_LOGIN, { email, password });
      console.log(response.data)

      const { token, driver_id, driver_data } = response.data; // Ensure `first_name` or similar is included

      if (!token || !driver_id) {
        throw new Error('Invalid login response');
      }

      // Store details in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ "id": driver_id, "first_name" : driver_data.first_name  })); // Store `first_name`
      localStorage.setItem('driver_id', driver_id);
      localStorage.setItem('userType', "driver");

      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Token ${token}`;

     
      return response; // Return the full response object
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear localStorage and remove token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_id');
    localStorage.removeItem('userType');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ loginDriver, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
