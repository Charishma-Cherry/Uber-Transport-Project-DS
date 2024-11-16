import React, { createContext, useState, useEffect } from 'react';
import api, { endpoints } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // added by sushma
  const [customerId, setCustomerId] = useState(null);  // New state for customer ID
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      // added by sushma
      const parsedUser = JSON.parse(storedUser);  // Parse storedUser
      setUser(parsedUser);
      setCustomerId(parsedUser.id);  // Set customerId from parsedUser


      // setUser(JSON.parse(storedUser));
      // // added by sushma
      // setCustomerId(parsedUser.id);  // Set customerId from stored user
      setLoading(false);
    } else if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get(endpoints.profile);
      setUser(response.data);
      //  added by sushma
      setCustomerId(response.data.customer_id);  // Set customerId from profile response
      console.log('User fetched successfully:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access, clearing token');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } else {
        console.error('Error fetching user:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await api.post(endpoints.signup, signupData);
      
      if (response.status === 201) {
        // Optionally, log the user in immediately after signup
        await login(signupData.username, signupData.password);
        console.log('User signed up and logged in');
        return true;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };
  
  
  const login = async (usernameParam, password) => {
    try {
      const response = await api.post(endpoints.login, { username: usernameParam, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setUser(user);
      // added by sushma
      setCustomerId(user.id);  // Set customerId after login
      console.log('Login successful, user set:', user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    // added by sushma
    setCustomerId(null);  // Clear customerId on logout
    console.log('User logged out');
  };

// added customer id by sushma
  return (
    <AuthContext.Provider value={{ user, customerId, loading, login, logout, fetchUser , signup}}> 
      {children}
    </AuthContext.Provider>
  );
};