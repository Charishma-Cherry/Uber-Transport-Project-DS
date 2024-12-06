import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import axiosInstance, { endpoints } from '../../services/api';
import './ManageRides.css';

const ManageRides = () => {
  const [rides, setRides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDriver, setFilterDriver] = useState('');  
  const [filterCustomer, setFilterCustomer] = useState('');
  const [rideStatistics, setRideStatistics] = useState({
    total_rides: 0,
    avg_price: 0,
    popular_pickup: 'N/A',
  });
  
  const [formData, setFormData] = useState({
    driver_id: '',
    customer_id: '',
    driver_name : '',
    customer_name: '',
    pickup_location: '',
    dropoff_location: '',
    distance: '',
    price: '',
    status: '',
    pickup_date: '',
    pickup_time:'',
  });

  useEffect(() => {
    fetchRides();
  }, [filterLocation, filterCustomer, filterDriver]);

  const fetchRides = async () => {
    try {
      const response = await axiosInstance.get(endpoints.ADMIN_LIST_RIDES, {
        params: 
        { 
            location: filterLocation,
            customer: filterCustomer,
            driver: filterDriver,
        },
      });

      const ridesData = response.data.map((ride) => ({
        id: ride.ride_id,  
        driver_id: ride.driver?.driver_id || 'N/A',  
        customer_id: ride.customer_profile_id,  
        customer_name:ride.customer_name,
        driver_name: `${ride.driver?.first_name} ${ride.driver?.last_name}` || 'N/A',
        pickup_location: ride.pickup_location,
        dropoff_location: ride.dropoff_location,
        price: ride.fare || 0,  
        status: ride.status,
        distance:ride.distance,
        pickup_datetime: ride.pickup_datetime,
        pickup_date: ride.pickup_datetime ? ride.pickup_datetime.split('T')[0] : '',
        pickup_time : ride.pickup_datetime ? ride.pickup_datetime.split('T')[1]?.split('Z')[0] : '',
      }));

      setRides(ridesData);  

      const totalRides = ridesData.length;

      if (totalRides > 0) {
        const avgPrice = ridesData.reduce((acc, ride) => acc + (ride.price || 0), 0) / totalRides;
  
        const locationCount = ridesData.reduce((acc, ride) => {
          acc[ride.pickup_location] = (acc[ride.pickup_location] || 0) + 1;
          return acc;
        }, {});
  
        const popularPickup = Object.entries(locationCount).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )?.[0] || 'N/A';
  
        setRideStatistics({
          total_rides: totalRides,
          avg_price: avgPrice,
          popular_pickup: popularPickup,
          area_wise_rides: locationCount,
        });
      } else {
        setRideStatistics({
          total_rides: 0,
          avg_price: 0,
          popular_pickup: 'N/A',
          area_wise_rides: {},
        });
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };
  
  const handleModal = (ride = null) => {
    setEditingRide(ride);
    setFormData(ride || {
      driver_id: '',
      customer_id: '',
      customer_name: '',
      driver_name: '',
      pickup_location: '',
      dropoff_location: '',
      distance: '',
      price: '',
      status: '',
      pickup_date: '',
      pickup_time:'',
    });
    setShowModal(!showModal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const combinedPickupDatetime = `${formData.pickup_date}T${formData.pickup_time}:00Z`;
      const updatedFormData = {
        ...formData,
        pickup_datetime: combinedPickupDatetime,
      };
    
      if (editingRide) {
        await axiosInstance.put(endpoints.ADMIN_UPDATE_RIDE(editingRide.id), updatedFormData);
        alert('Ride updated successfully');
      }
      setShowModal(false);
      fetchRides();
    } catch (error) {
      console.error('Error submitting ride form:', error);
      alert('An error occurred while saving the ride.');
    }
  };

  const handleDelete = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      try {
        await axiosInstance.delete(endpoints.ADMIN_DELETE_RIDE(rideId));
        alert('Ride deleted successfully');
        setRides(rides.filter((ride) => ride.id !== rideId));
      } catch (error) {
        console.error('Error deleting ride:', error);
        alert('An error occurred while deleting the ride.');
      }
    }
  };

  return (
    <div className="manage-rides container mt-5">
      <h2>Manage Rides</h2>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Filter by location"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Filter by customer"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}  
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Filter by driver"
            value={filterDriver}
            onChange={(e) => setFilterDriver(e.target.value)}  
          />
        </Col>
      </Row>

      {/* Statistics */}
      <Row className="mb-3">
        <Col md={4}>
          <Card bg="primary" text="white" className="text-center p-3">
            <Card.Title>Total Rides</Card.Title>
            <Card.Text>{rideStatistics.total_rides}</Card.Text>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="success" text="white" className="text-center p-3">
            <Card.Title>Average Price</Card.Title>
            <Card.Text>${rideStatistics.avg_price.toFixed(2)}</Card.Text>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="warning" text="white" className="text-center p-3">
            <Card.Title>Popular Pickup</Card.Title>
            <Card.Text>{rideStatistics.popular_pickup}</Card.Text>
          </Card>
        </Col>
      </Row>

      {/* Area-wise Rides */}
      <div>
        <h4>Rides by Area</h4>
        {Object.entries(rideStatistics.area_wise_rides || {}).map(([location, count]) => (
          <p key={location}><strong>{location}:</strong> {count} rides</p>
        ))}
      </div>

      {/* Rides Table */}
      <Table striped bordered hover responsive>
        <thead style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            <th>ID</th>
            <th>Driver</th>
            <th>Customer</th>
            <th>Pickup Location</th>
            <th>Dropoff Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rides.length > 0 ? (
            rides.map((ride) => (
              <tr key={ride.id}>
                <td>{ride.id}</td>
                <td>{ride.driver_name}</td>
                <td>{ride.customer_name}</td>
                <td>{ride.pickup_location}</td>
                <td>{ride.dropoff_location}</td>
                <td>${ride.price}</td>
                <td>{ride.status}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleModal(ride)}
                    className="mx-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(ride.id)}
                    className="mx-1"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No rides found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Edit Ride Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRide ? 'Edit Ride' : 'Add Ride'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDriverId">
              <Form.Label>Driver</Form.Label>
              <Form.Control
                type="text"
                name="driver_name"
                value={formData.driver_name}
                onChange={handleChange}
                placeholder="Enter driver name"
              />
            </Form.Group>
            <Form.Group controlId="formCustomerId">
              <Form.Label>Customer</Form.Label>
              <Form.Control
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Enter customer name"
              />
            </Form.Group>
            <Form.Group controlId="formPickupLocation">
              <Form.Label>Pickup Location</Form.Label>
              <Form.Control
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="Enter pickup location"
              />
            </Form.Group>
            <Form.Group controlId="formDropoffLocation">
              <Form.Label>Dropoff Location</Form.Label>
              <Form.Control
                type="text"
                name="dropoff_location"
                value={formData.dropoff_location}
                onChange={handleChange}
                placeholder="Enter dropoff location"
              />
            </Form.Group>
            <Form.Group controlId="formDistance">
              <Form.Label>Distance (km)</Form.Label>
              <Form.Control
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                placeholder="Enter distance"
              />
            </Form.Group>
            <Form.Group controlId="formPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
              />
            </Form.Group>
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formPickupDate">
              <Form.Label>Pickup Date</Form.Label>
              <Form.Control
                type="date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formPickupTime">
              <Form.Label>Pickup Time</Form.Label>
              <Form.Control
                type="time"
                name="pickup_time"
                value={formData.pickup_time}
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
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageRides;
