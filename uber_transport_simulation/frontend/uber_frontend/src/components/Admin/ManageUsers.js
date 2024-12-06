import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axiosInstance, { endpoints } from '../../services/api'; // Import API instance and endpoints

const ManageUsers = () => {
  const [users, setUsers] = useState([]); // State to store user data
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [editingUser, setEditingUser] = useState(null); // User being edited
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    date_of_birth: '',
    password: '', // Include password for adding users
  });

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update search query state
  };

  // Fetch users on component load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(endpoints.ADMIN_LIST_CUSTOMERS,{
          params: { search: searchQuery },
        });
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [searchQuery]);

  // Handle modal open/close
  const handleModal = (user = null) => {
    setEditingUser(user);
    setFormData(user || {
      username: '',
      email: '',
      name: '',
      phone_number: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      date_of_birth: '',
      password: '',
    });
    setShowModal(!showModal);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


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
  
  const handleSubmit = async () => {

    // Validation checks
    if (!formData.phone_number || !formData.zip_code) {
      alert("Phone Number, and Zip Code are required.");
      return;
    }
  
    // Validate phone number (must be 10 digits)
    if (!/^\d{10}$/.test(formData.phone_number)) {
      alert("Phone number must be 10 digits.");
      return;
    }
  
    // Validate zip code (must be 5 digits)
    if (!/^\d{5}$/.test(formData.zip_code)) {
      alert("Zip code must be 5 digits.");
      return;
    }
  
    // For adding user, password must be provided
    if (!formData.password && !editingUser) {
      alert("Password is required.");
      return;
    }

    // If date_of_birth is not filled, set it as null or omit it
    if (!formData.date_of_birth) {
      formData.date_of_birth = null;
    }
  
    // Hardcode the country field to 'USA'
    formData.country = "USA";
  
    // Handle the submit logic (add or update user)
    try {
      const dataToSubmit = { ...formData };
  
      if (editingUser) {
        dataToSubmit.id = editingUser.id;
        const { password, ...updateData } = dataToSubmit;
        await axiosInstance.put(endpoints.ADMIN_UPDATE_CUSTOMER(updateData.id), updateData);
        alert('User updated successfully');
      } else {
        try {
          const response = await axiosInstance.post(endpoints.ADMIN_ADD_CUSTOMER, dataToSubmit);
          console.log('Response:', response);
          alert('User added successfully');
        } catch (error) {
          console.error('Error submitting user form:', error);
          if (error.response) {
            console.error('Error details:', error.response.data);
            alert(`Error: ${error.response.data.error[0]}`);
          } else {
            alert('An error occurred while saving user data.');
          }
        }        
      }
      setShowModal(false);
      window.location.reload(); // Reload to refresh data
    } catch (error) {
      console.error('Error submitting user form:', error);
      if (error.response && error.response.data.error) {
        const errorMessage = error.response.data.error[0]; // Assuming error message is in the array
        alert(`Error: ${errorMessage}`);
      } else {
        alert('An error occurred while saving user data.');
      }
    }
  };
  
  
  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete the user using the 'customer_id' field
        await axiosInstance.delete(endpoints.ADMIN_DELETE_CUSTOMER(customerId));
        alert('User deleted successfully');
        setUsers(users.filter((user) => user.customer_id !== customerId)); // Use 'customer_id' to filter out the deleted user from local state
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
      }
    }
  };
  
  

  return (
    <div className="manage-users container mt-5">
      <h2>Manage Users</h2>
      {/* Add search bar for filtering users */}
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search users by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Button onClick={() => handleModal()} variant="primary" className="mb-3">
        Add User
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.customer_id}>
              <td>{user.customer_id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>
                <Button variant="warning" onClick={() => handleModal(user)} className="mx-1">
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(user.customer_id)}
                  className="mx-1"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit User */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                disabled={!!editingUser}
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Form.Group>
            {/* Add password field only when adding a new user */}
            {!editingUser && (
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </Form.Group>
            )}
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber" className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </Form.Group>
            <Form.Group controlId="formAddress" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </Form.Group>
            <Form.Group controlId="formCity" className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </Form.Group>
            <Form.Group controlId="formState" className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                as="select"  // Use select dropdown for states
                name="state"
                value={formData.state}
                onChange={handleChange}
              >
              <option value="">Select State</option> {/* Default option */}
                {states.map((state) => (
                <option key={state} value={state}>
                {state}
              </option>
              ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formZipCode" className="mb-3">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Enter zip code"
              />
            </Form.Group>
            <Form.Group controlId="formCountry" className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </Form.Group>
            <Form.Group controlId="formDateOfBirth" className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;
