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
  BILLING_HISTORY: (customerId) => `/billing/history/customer/${customerId}/`, // Added by suhsma - billing history endpoint
};

// Export the configured axios instance for use in other parts of the application
export default axiosInstance;