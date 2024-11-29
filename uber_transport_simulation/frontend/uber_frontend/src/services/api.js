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

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'; // Default to application/json
    }


    return config;
  },
  (error) => Promise.reject(error)
);

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     // Only attach token for authenticated routes, not for signup/login
//     if (token && !config.url.includes('/signup') && !config.url.includes('/login')) {
//       config.headers['Authorization'] = `Token ${token}`;
//     }
//     // Ensure Content-Type is set appropriately
//     if (!(config.data instanceof FormData)) {
//       config.headers['Content-Type'] = 'application/json';
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


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
};

// Export the configured axios instance for use in other parts of the application
export default axiosInstance;