import axiosInstance from './api';

/**
 * Submits a rating for a customer by a driver.
 * 
 * @param {string} driverId - The ID of the driver submitting the rating.
 * @param {Object} payload - The payload containing the rating data.
 * @param {string} payload.ride_id - The ID of the ride being rated.
 * @param {number} payload.rating - The rating value (1-5).
 * @param {string} payload.comment - The comment or review for the customer.
 * @returns {Promise<Object>} - The response data from the API.
 */
export const submitDriverRating = async (driverId, payload) => {
  try {
    console.log(`Submitting rating for driver ${driverId}:`, payload);

    // Make a POST request to the driver's rate endpoint
    const response = await axiosInstance.post(`/drivers/${driverId}/rate/`, payload);

    console.log('Rating submitted successfully:', response.data);

    // Return the response data to the caller
    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error.response?.data || error.message);

    // Propagate the error to be handled by the caller
    throw error;
  }
};
