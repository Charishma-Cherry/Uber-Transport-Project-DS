import axiosInstance from './api';

// Admin-specific billing endpoints
export const adminSearchBills = async (searchParams) => {
  const response = await axiosInstance.post('/billing/search/', searchParams);
  return response.data;
};

export const adminGetBillDetails = async (billId) => {
  const response = await axiosInstance.get(`/billing/${billId}/details/`);
  return response.data;
};

export const adminDeleteBill = async (billId) => {
  const response = await axiosInstance.delete(`/billing/${billId}/delete/`);
  return response.data;
};


// Fetch Revenue Per Day
export const fetchRevenuePerDay = async () => {
  const response = await axiosInstance.get('/billing/statistics/revenue-day/');
  return response.data;
};

// Fetch Total Rides Per Area
export const fetchTotalRidesPerArea = async () => {
  const response = await axiosInstance.get('/billing/statistics/total-rides-area/');
  return response.data;
};

// Fetch Rides Per Driver
export const fetchRidesPerDriver = async () => {
  const response = await axiosInstance.get('/billing/statistics/rides-per-driver/');
  return response.data;
};

// Fetch Rides Per Customer
export const fetchRidesPerCustomer = async () => {
  const response = await axiosInstance.get('/billing/statistics/rides-per-customer/');
  return response.data;
};