import React, { createContext, useState, useEffect } from 'react';
import api, { endpoints } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      setUser(JSON.parse(storedUser));
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
    console.log('User logged out');
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser , signup}}>
      {children}
    </AuthContext.Provider>
  );
};