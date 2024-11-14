import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../../services/api';
import './DriverSignup.css';

function DriverSignup() {
  const [formData, setFormData] = useState({
    driver_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    car_number: '',
    car_name: '',
  });
  const [introductionMedia, setIntroductionMedia] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDriverIdChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 9) value = value.slice(0, 9); 
    value = value.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
    setFormData({ ...formData, driver_id: value });
  };

  const handleCarNumberChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); 
    if (value.length > 7) value = value.slice(0, 7); 
    setFormData({ ...formData, car_number: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 10); 
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setIntroductionMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));
      if (introductionMedia) {
        formDataToSend.append('introduction_media', introductionMedia);
      }

      const response = await api.post(endpoints.DRIVER_SIGNUP, formDataToSend);
    // Extract token, user_id, and driver_id from the response
    const { token, driver_id } = response.data;

    console.log(response.data)
    // Store necessary details in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('driver_id', driver_id);
    localStorage.setItem('userType', "driver");

    const userData = { "id": driver_id, "first_name" : formData.first_name  };
    localStorage.setItem('user', JSON.stringify(userData)); // Store `first_name`
   
      alert("Driver Signup Successful!");

      navigate(`/driver/${response.data.driver_id}/profile`);
    } catch (err) {
      console.log(err)
      // Convert error response to a readable string
      const errorMessage = err.response?.data 
        ? Object.values(err.response.data).join(', ') // Join error messages as a string
        : 'Failed to sign up';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h2 className="text-center mb-4">Driver Sign Up</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Driver ID (SSN Format)</Form.Label>
              <Form.Control
                type="text"
                name="driver_id"
                placeholder="XXX-XX-XXXX"
                value={formData.driver_id}
                onChange={handleDriverIdChange}
                maxLength={11}
                required
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                name="zip_code"
                placeholder="Enter zip code"
                value={formData.zip_code}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Phone Number</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>+1</span>
                <Form.Control
                  type="text"
                  name="phone_number"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  style={{ marginLeft: '5px' }}
                />
              </div>
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>Car Number</Form.Label>
              <Form.Control
                type="text"
                name="car_number"
                placeholder="Enter car number"
                value={formData.car_number}
                onChange={handleCarNumberChange}
                maxLength={7}
                required
              />
            </Form.Group>
          </div>

          <div className="form-row">
            <Form.Group className="form-column mb-3">
              <Form.Label>Car Name</Form.Label>
              <Form.Control
                type="text"
                name="car_name"
                placeholder="Enter car name"
                value={formData.car_name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="form-column mb-3">
              <Form.Label>Introduction Media (Image or Video)</Form.Label>
              <Form.Control
                type="file"
                name="introduction_media"
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
            </Form.Group>
          </div>

          <Button variant="primary" type="submit" disabled={loading} className="w-100 mt-3">
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Form>
      </div>
    </div>
  );

}
export default DriverSignup;
