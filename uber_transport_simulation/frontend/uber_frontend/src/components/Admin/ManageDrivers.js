import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axiosInstance, { endpoints } from '../../services/api'; // Import API instance and endpoints

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([]); // State to store driver data
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [editingDriver, setEditingDriver] = useState(null); // Driver being edited
  const [searchQuery, setSearchQuery] = useState(''); // State to track the search query
  const [formData, setFormData] = useState({
    driver_id: '',
    username: '', // Add username here
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
    car_number: '', // License number will map here
    car_name: '', // Car name (not vehicle details)
  });

  // Update the search query when user types
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
  // Fetch drivers on component load
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axiosInstance.get(endpoints.ADMIN_LIST_DRIVERS , { params: { search: searchQuery },}); // Adjusted endpoint
        console.log("Fetched Drivers:", response.data);
        setDrivers(response.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    fetchDrivers();
  }, [searchQuery]);

  // Handle modal open/close
  const handleModal = (driver = null) => {
    setEditingDriver(driver);
    if (driver) {
      setFormData({
        driver_id: driver.driver_id, // Use driver_id for editing
        username: driver.user?.username || '', // Fetch username from user object
        first_name: driver.first_name,
        last_name: driver.last_name,
        email: driver.email,
        address: driver.address,
        city: driver.city,
        state: driver.state,
        zip_code: driver.zip_code,
        phone_number: driver.phone_number,
        car_number: driver.car_number, // Map car_number to license number
        car_name: driver.car_name, // Car name for vehicle details
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        driver_id: '',
        username: '',
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
    }
    setShowModal(!showModal);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async () => {

    if (!editingDriver){
        if (!formData.phone_number || !formData.car_number || !formData.car_name) {
            alert("Phone Number, License Number, and Car Name are required.");
            return;
          }
      
          if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
          }
    }
    
    try {
      const dataToSubmit = { ...formData };

       delete dataToSubmit.confirmPassword; // Remove confirmPassword field for backend request
       

       dataToSubmit.name = `${formData.first_name} ${formData.last_name}`; // Combine first and last name (for backend use if necessary)
    
       if (!editingDriver){
            // Add the `user` object containing email and username
        const user = {
            email: formData.email,
            username: formData.email, // Username is set to email
       };
       // Include `user` in the data being sent to the backend
       dataToSubmit.user = user;
       }
      
    //    delete dataToSubmit.username;
      dataToSubmit.username = formData.email;
      // Log the data being sent to the backend
        console.log("Data to Submit:", dataToSubmit);
        
      if (editingDriver) {
        dataToSubmit.id = editingDriver.id;
        console.log(dataToSubmit.id)
        const { password, confirmPassword, ...updateData } = dataToSubmit; // Omit password on update
        await axiosInstance.put(endpoints.ADMIN_UPDATE_DRIVER(editingDriver.id), updateData);
        alert('Driver updated successfully');
      } else {
        await axiosInstance.post(endpoints.ADMIN_ADD_DRIVER, dataToSubmit);
        alert('Driver added successfully');
      }
      setShowModal(false);
      window.location.reload(); // Reload to refresh data
    } catch (error) {
      console.error('Error submitting driver form:', error);
      if (error.response) {
        console.error('Error details:', error.response.data); // Log the response error details

        // Check if there's an error message and display it as an alert
      if (error.response.data.email) {
        // If the email error is in the response
        alert(`Error: ${error.response.data.email[0]}`);
      } else if (error.response.data.phone_number) {
        // If the phone number error is in the response
        alert(`Error: ${error.response.data.phone_number[0]}`);
      } else if (error.response.data.zip_code) {
        // If the zip code error is in the response
        alert(`Error: ${error.response.data.zip_code[0]}`);
      } else if (error.response.data.driver_id) {
        // If the driver_id error is in the response
        alert(`Error: ${error.response.data.driver_id[0]}`);
      } else {
        // If there are other errors, display a generic error message
        alert("An error occurred. Please check your input and try again.");
      }
        
      }else{
        alert('An error occurred while saving driver data.');
      }
    }
  };

  // Handle delete driver
  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axiosInstance.delete(endpoints.ADMIN_DELETE_DRIVER(driverId));
        alert('Driver deleted successfully');
        setDrivers(drivers.filter((driver) => driver.id !== driverId));
        // Refresh the page after deletion
        window.location.reload();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('An error occurred while deleting the driver.');
      }
    }
  };

  return (
    <div className="manage-drivers container mt-5">
      <h2>Manage Drivers</h2>
      <Button onClick={() => handleModal()} variant="primary" className="mb-3">
        Add Driver
      </Button>
        <div className="mb-3">
        <Form.Control
            type="text"
            placeholder="Search drivers by name, email, etc."
            value={searchQuery}
            onChange={handleSearchChange}
        />
        </div>
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
          {drivers.map((driver) => (
            <tr key={driver.id}>
              <td>{driver.driver_id}</td>
              <td>{driver.user?.username || 'N/A'}</td>
              <td>{driver.email}</td>
              <td>{`${driver.first_name} ${driver.last_name}`}</td>
              <td>
                <Button variant="warning" onClick={() => handleModal(driver)} className="mx-1">
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(driver.driver_id)} className="mx-1">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit Driver */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingDriver ? 'Edit Driver' : 'Add Driver'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            
            {editingDriver && (
                    <Form.Group controlId="formUsername" className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      disabled={!!editingDriver}
                    />
                  </Form.Group>
            )}
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
            {!editingDriver && (
                <>
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
              <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                  />
                </Form.Group>
                </>
            )}
            <Form.Group controlId="formDriverId" className="mb-3">
                <Form.Label>Driver ID</Form.Label>
                <Form.Control
                    type="text"
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    placeholder='Enter Driver ID'
                />
            </Form.Group>

            <Form.Group controlId="formFirstName" className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </Form.Group>
            <Form.Group controlId="formLastName" className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
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
            <Form.Group controlId="formCarNumber" className="mb-3">
              <Form.Label>Car Number</Form.Label>
              <Form.Control
                type="text"
                name="car_number"
                value={formData.car_number}
                onChange={handleChange}
                placeholder="Enter car number"
              />
            </Form.Group>
            <Form.Group controlId="formCarName" className="mb-3">
              <Form.Label>Car Name</Form.Label>
              <Form.Control
                type="text"
                name="car_name"
                value={formData.car_name}
                onChange={handleChange}
                placeholder="Enter car name"
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
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingDriver ? 'Update Driver' : 'Add Driver'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageDrivers;
