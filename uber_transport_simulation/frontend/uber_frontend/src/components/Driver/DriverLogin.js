// src/components/Driver/DriverLogin.js

import React, { useState  , useContext} from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './DriverLogin.css';
import { AuthContext } from '../../context/AuthContext';


function DriverLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginDriver } = useContext(AuthContext);
  // const [username, setUsername] = useState(''); // State to hold the username input
  // const [password, setPassword] = useState(''); // State to hold the password input

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
    const response = await loginDriver(formData.email, formData.password)

    // Extract token, user_id, and driver_id from the response
    // const { token, user_id, driver_id } = response.data;

    // // Store necessary details in localStorage
    // localStorage.setItem('token', token);
    // localStorage.setItem('user', JSON.stringify({ id: user_id }));
    // localStorage.setItem('driver_id', driver_id);
    // localStorage.setItem('userType', "driver");

    navigate(`/driver/${response.data.driver_id}/profile`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <h2>Driver Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email" name="email"
            value={formData.email} onChange={handleChange} required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password" name="password"
            value={formData.password} onChange={handleChange} required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </div>
  );
}

export default DriverLogin;
