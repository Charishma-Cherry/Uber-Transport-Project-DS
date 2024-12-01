import axios from 'axios';

export const BACKEND_HOST_NAME = 'http://localhost:8000/';

// Define the base URL for the API, using an environment variable or defaulting to localhost
const API_URL = process.env.REACT_APP_API_URL || BACKEND_HOST_NAME;

// Create an axios instance with the base URL
const axiosInstance = axios.create({
  baseURL: API_URL + 'api/', // Set the base URL for all requests
});

// Add a request interceptor to include the authorization token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    // // Conditionally set content-type only when sending form data
    // if (config.headers['Content-Type'] === 'multipart/form-data') {
    //   // Do not modify for form-data requests
    //   return config;
    // } else {
    //   config.headers['Content-Type'] = 'application/json'; // Default to application/json
    // }

    // Only set Content-Type for JSON requests, let FormData handle it automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'; // Default to application/json
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

};

// Function to fetch driver-specific rides
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