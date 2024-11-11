import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button, Form } from 'react-bootstrap';
import './Signup.css'; // Import custom CSS for the Signup page
import { endpoints } from '../../services/api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone_number, setPhoneNumber] = useState(''); // New field for phone number
  const [address, setAddress] = useState(''); // New field for address
  const [city, setCity] = useState(''); // New field for city
  const [state, setState] = useState(''); // New field for state
  const [zip_code, setZipCode] = useState(''); // New field for zip code
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  // List of US states for dropdown
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

    // Validation checks
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

    try {
      const response = await api.post(endpoints.signup, {
        username,
        email,
        password,
        phone_number,
        address,
        city,
        state,
        zip_code,
      });
      
      // Check if signup was successful
      if (response.status === 201) {
        setMessage('Signup successful! Redirecting to login...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error);
    if (error.response && error.response.status === 400) {
        // Assuming the backend returns a specific message for existing usernames
        if (error.response.data.username) {
          setError('Username already exists.');
        } else {
          setError('Signup failed. Please try again.');
        }
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}
      <Form onSubmit={handleSubmit}>
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

        {/* Additional fields */}
        <Form.Group controlId="formPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your phone number"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
            as="select" // Use a dropdown for states
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
          />
        </Form.Group>

        {/* Submit Button */}
        <Button variant="primary" type="submit" className="mt-3">Sign Up</Button>
      </Form>
    </div>
  );
};

export default Signup;



