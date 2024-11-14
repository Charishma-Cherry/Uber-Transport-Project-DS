import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api, { endpoints } from '../../services/api';
import { Button, Form } from 'react-bootstrap';
import './Profile.css'; 

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(endpoints.profile);
        setProfile(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError('Unauthorized access. Please log in again.');
        } else {
          setError('Failed to fetch profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Appending all required profile fields to formData
      formData.append('phone_number', profile.phone_number || '');
      formData.append('address', profile.address || '');
      formData.append('city', profile.city || '');
      formData.append('state', profile.state || '');
      formData.append('zip_code', profile.zip_code || '');
      formData.append('credit_card_details', profile.credit_card_details || '');
      formData.append('rating', profile.rating || 5.0); // Default rating if not provided
      formData.append('country', profile.country || '');
      formData.append('nickname', profile.nickname || '');
      
      // Append the name field
      formData.append('name', profile.name || '');
      formData.append('customer_id', profile.customer_id || '');

      // Append the profile picture if it exists
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

     
      const response = await api.patch(endpoints.updateProfile, formData);
      
      // Update state with new profile data
      setProfile(response.data); 
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error);
      setError('Failed to update profile: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {/* Display Profile Picture */}
      {profile && (
        <div className="profile-picture-container mb-3">
          <img 
            src={profile.profile_picture} 
            alt="Profile" 
            style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
          />
        </div>
      )}

      <Form onSubmit={handleUpdate}>
        <Form.Group controlId="formFile">
          <Form.Label>Change Profile Picture</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </Form.Group>

        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your name"
            value={profile.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="formCustomerId">
          <Form.Label>Customer ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Customer ID"
            value={profile.customer_id || ''}
            readOnly
            disabled
            style={{ backgroundColor: '#f1f1f1' }}
          />
        </Form.Group>

        <Form.Group controlId="formPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your phone number"
            value={profile.phone_number || ''}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="formAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your address"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="formCity">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your city"
            value={profile.city || ''}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="formState">
          <Form.Label>State</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your state"
            value={profile.state || ''}
            onChange={(e) => setProfile({ ...profile, state: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="formZipCode">
          <Form.Label>Zip Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your zip code"
            value={profile.zip_code || ''}
            onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
          />
        </Form.Group>

        {/* Submit Button */}
        <Button variant="primary" type="submit">Update Profile</Button>
      </Form>
    </div>
  );
};

export default Profile;