import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import api, { endpoints } from '../../services/api';
import './AdminSignup.css';


const AdminSignup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip_code, setZipCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
    "Colorado", "Connecticut", "Delaware", "Florida", 
    "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", 
    "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", 
    "Maryland", "Massachusetts", "Michigan", "Minnesota", 
    "Mississippi", "Missouri", "Montana", "Nebraska", 
    "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", 
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic validation
    if (username.length < 3) {
      return setError('Username must be at least 3 characters long.');
    }

    if (!/^\d{10}$/.test(phone_number)) {
      return setError('Phone number must be exactly 10 digits.');
    }

    if (!/^\d{5}$/.test(zip_code)) {
      return setError('Zip code must be exactly 5 digits.');
    }

    if (state.length > 100) {
      return setError('State name cannot exceed 100 characters.');
    }

    console.log('Form Data:', { username, email, password, first_name: firstName, last_name: lastName, phone_number, address, city, state, zip_code });


    try {
      // Temporarily remove Authorization header for this request
      delete api.defaults.headers.common['Authorization'];

      // API call to sign up admin without the token
      const response = await api.post(endpoints.ADMIN_SIGNUP, {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number,
        address,
        city,
        state,
        zip_code,
      });

      if (response.status === 201) {
        setMessage('Admin signup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Admin signup error:', error.response ? error.response.data : error);
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.username) {
          setError('Username already exists.');
        } else {
          setError('Signup failed. Please check your input and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="admin-signup-container">
      <h2>Admin Sign Up</h2>
      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}
      <Form onSubmit={handleSubmit}>
        {/* Form Fields (username, email, etc.) */}
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your phone number"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            maxLength="10"
          />
        </Form.Group>

        <Form.Group controlId="formAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formCity">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group controlId="formState">
          <Form.Label>State</Form.Label>
          <Form.Control
            as="select"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Select your state</option>
            {states.map((stateName) => (
              <option key={stateName} value={stateName}>{stateName}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formZipCode">
          <Form.Label>Zip Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your zip code"
            value={zip_code}
            onChange={(e) => setZipCode(e.target.value)}
            maxLength="5"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">Sign Up as Admin</Button>
      </Form>
    </div>
  );
};

export default AdminSignup;
