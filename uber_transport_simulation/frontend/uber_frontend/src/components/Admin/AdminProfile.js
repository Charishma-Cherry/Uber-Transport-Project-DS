import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api, { endpoints } from '../../services/api';
import { Button, Form } from 'react-bootstrap';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(endpoints.ADMIN_PROFILE);
        setProfile(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError('Unauthorized access. Please log in again.');
        } else {
          setError('Failed to fetch admin profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && user.admin_id) {  // Checking for admin_id instead of user_type
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('first_name', profile.user_first_name || '');
      formData.append('last_name', profile.user_last_name || '');
      formData.append('phone_number', profile.phone_number || '');
      formData.append('address', profile.address || '');
      formData.append('city', profile.city || '');
      formData.append('state', profile.state || '');
      formData.append('zip_code', profile.zip_code || '');
      formData.append('admin_id', profile.admin_id || '');

      const response = await api.patch(endpoints.ADMIN_UPDATE_PROFILE, formData);
      setProfile(response.data);
      alert('Admin profile updated successfully');
    } catch (error) {
      console.error('Error updating admin profile:', error.response ? error.response.data : error);
      setError('Failed to update admin profile: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your admin profile?");
    if (confirmDelete) {
      try {
        await api.delete('/admins/delete_profile/');
        alert('Admin profile deleted successfully');
        logout();
        window.location.href = "/";
      } catch (error) {
        console.error('Error deleting admin profile:', error);
        setError('Failed to delete admin profile');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user || !user.admin_id) return <div>Please log in as an admin to view this profile.</div>; // Adjusted check for admin_id

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>

      <Form onSubmit={handleUpdate}>
        <Form.Group controlId="formAdminId">
          <Form.Label>Admin ID</Form.Label>
          <Form.Control
            type="text"
            value={profile.admin_id || ''}
            readOnly
            disabled
            style={{ backgroundColor: '#f1f1f1' }}
          />
        </Form.Group>

        <Form.Group controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={profile.user_first_name || ''}
            readOnly
            disabled
            style={{ backgroundColor: '#f1f1f1' }}
          />
        </Form.Group>

        <Form.Group controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={profile.user_last_name || ''}
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

        <Button variant="primary" type="submit">Update Admin Profile</Button>
        <Button variant="danger" onClick={handleDeleteProfile} className="mt-3">
          Delete Admin Profile
        </Button>
      </Form>
    </div>
  );
};

export default AdminProfile;
