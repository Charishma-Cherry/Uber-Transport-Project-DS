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
      
      localStorage.setItem('customerId', user.customer_id);  // added by sushma
      
      api.defaults.headers.common['Authorization'] = `Token ${token}`;  
      
      setUser(user);
      console.log('Login successful, user set:', user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

    const loginDriver = async (email, password) => {
    try {
      console.log('Sending login request with:', { email, password });
      const response = await api.post(endpoints.DRIVER_LOGIN, { email, password });
      const { token, driver_id, driver_data } = response.data;

      if (!token || !driver_id) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: driver_id, 
        first_name: driver_data.first_name,
        user_type: 'driver' // Store user_type as 'driver'
      }));
      localStorage.setItem('driver_id', driver_id);
      localStorage.setItem('userType', 'driver'); // Store userType for drivers

      api.defaults.headers.common['Authorization'] = `Token ${token}`;

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_id');
    localStorage.removeItem('userType');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('User logged out');
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser , signup , loginDriver}}>
      {children}
    </AuthContext.Provider>
  );
};