import axios from 'axios';

export const BACKEND_HOST_NAME = 'http://localhost:8000/';

// Define the base URL for the API, using an environment variable or defaulting to localhost
const API_URL = process.env.REACT_APP_API_URL || BACKEND_HOST_NAME;

// Create an axios instance with the base URL
const axiosInstance = axios.create({
  baseURL: API_URL + 'api/', // Set the base URL for all requests
});


axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request Config:', config);
    const token = localStorage.getItem('token');
    
    // Add token only for authenticated routes (exclude signup and login)
    if (token &&  !config.url.includes('/signup') && !config.url.includes('/login')) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Define API endpoint paths for driver-related operations

export const endpoints = {
  login: '/customers/login/',
  signup: '/customers/signup/',
  profile: '/customers/profile/',
  updateProfile: '/customers/update_profile/',
  DRIVER_SIGNUP: '/drivers/signup/',       // Endpoint for driver signup
  DRIVER_LOGIN: '/drivers/login/',         // Endpoint for driver login
  DRIVER_PROFILE: (driverId) => `/drivers/${driverId}/profile/`, // Endpoint for fetching driver profile by driver ID
  DRIVER_UPDATE: '/drivers/update_profile/',  // Endpoint for updating driver profile
  DRIVER_LOCATION_UPDATE: '/drivers/update_location/', // New endpoint for updating driver location
  DRIVER_RIDES: '/driver-rides/',         // New endpoint for fetching rides for the driver
  DRIVER_COMPLETED_RIDES: 'driver/completed-history', // Endpoint for completed rides
  DRIVER_RATE: (driverId) => `/drivers/${driverId}/rate/`,
  ADMIN_SIGNUP: '/admins/signup/',
  ADMIN_LOGIN: '/admins/login/',
  ADMIN_PROFILE: '/admins/profile/',
  ADMIN_UPDATE_PROFILE: '/admins/update_profile/',
  MANAGE_USERS: '/admins/manage-users/',
  MANAGE_BILLS: '/bills/',                 // Endpoint for managing bills Admin
  SPECIFIC_BILL: (billId) => `/bills/${billId}/`, // Endpoint for a specific bill Admin


  // MANAGE_DRIVERS: '/admins/manage-drivers/',
  // MANAGE_BILLS: '/admins/manage-bills/',

  // Managing users in admin panel
  ADMIN_LIST_CUSTOMERS: '/admins/list_customers/', // Fetch all users
  ADMIN_ADD_CUSTOMER: '/admins/add_customer/',    // Add a new user
  ADMIN_UPDATE_CUSTOMER: (customerId) => `/admins/update_customer/${customerId}/`, // Update a user
  ADMIN_DELETE_CUSTOMER: (customerId) => `/admins/delete_customer/${customerId}/`, // Delete a user

  // Driver management in admin panel
  ADMIN_LIST_DRIVERS: '/admins/list_drivers/', // Fetch all drivers
  ADMIN_ADD_DRIVER: '/admins/add_driver/',    // Add a new driver
  ADMIN_UPDATE_DRIVER: (driverId) => `/admins/update_driver/${driverId}/`, // Update a driver
  ADMIN_DELETE_DRIVER: (driverId) => `/admins/delete_driver/${driverId}/`, // Delete a driver
  
  //Ride management in admin panel
  ADMIN_LIST_RIDES: '/admins/list_rides/', // Fetch all rides
  // ADMIN_REVIEW_RIDE: (rideId) => `/admins/review_ride/${rideId}/`, // View details of a specific ride
  ADMIN_UPDATE_RIDE: (rideId) => `/admins/update_ride/${rideId}/`, // Update a ride
  ADMIN_DELETE_RIDE: (rideId) => `/admins/delete_ride/${rideId}/`,
  ADMIN_BILLING_LIST_RIDES: '/list_rides/', // Fetch all rides

};

// // Function to fetch driver-specific rides
export const fetchDriverRides = async () => {
  try {
    console.log('Sending request to fetch driver rides...');
    const response = await axiosInstance.get(endpoints.DRIVER_RIDES);
    console.log('Driver rides response:', response);
    return response.data; // Return the fetched rides data
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    throw error; // Propagate the error for handling in the caller
  }
};

// Export the configured axios instance for use in other parts of the application
export default axiosInstance;

