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
  ADMIN_SIGNUP: '/admins/signup/',
  ADMIN_LOGIN: '/admins/login/',
  ADMIN_PROFILE: '/admins/profile/',
  ADMIN_UPDATE_PROFILE: '/admins/update_profile/',
  MANAGE_USERS: '/admins/manage-users/',
  // MANAGE_DRIVERS: '/admins/manage-drivers/',
  // MANAGE_BILLS: '/admins/manage-bills/',
};

// // Function to fetch driver-specific rides
// export const fetchDriverRides = async () => {
//   try {
//     console.log('Sending request to fetch driver rides...');
//     const response = await axiosInstance.get(endpoints.DRIVER_RIDES);
//     console.log('Driver rides response:', response);
//     return response.data; // Return the fetched rides data
//   } catch (error) {
//     console.error('Error fetching driver rides:', error);
//     throw error; // Propagate the error for handling in the caller
//   }
// };

// Export the configured axios instance for use in other parts of the application
export default axiosInstance;

