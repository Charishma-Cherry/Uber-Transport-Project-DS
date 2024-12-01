import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import api, { endpoints } from '../../services/api';
// import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });
  // const navigate = useNavigate();

  useEffect(() => {
    // Fetch users when the component mounts
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from: /api/manage_users/');
        // const response = await api.get('admins/manage-users/'); // This is correct
        const response = await api.get('manage_users/'); 
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      phone_number: user.phone_number,
      address: user.address,
      city: user.city,
      state: user.state,
      zip_code: user.zip_code,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`${endpoints.MANAGE_USERS}${selectedUser.id}/`, formData);
      setShowModal(false);
      setSelectedUser(null);
      // Refresh the user list after updating
      const response = await api.get(endpoints.MANAGE_USERS);
      setUsers(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`${endpoints.MANAGE_USERS}${userId}/`);
      // Refresh the user list after deletion
      const response = await api.get(endpoints.MANAGE_USERS);
      setUsers(response.data);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.phone_number}</td>
              <td>{user.address}</td>
              <td>
                <Button variant="primary" onClick={() => handleShowModal(user)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;
