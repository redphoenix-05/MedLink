import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// RESERVATION API
// ==========================================
export const reservationAPI = {
  // Create a new reservation
  create: (data) => API.post('/reservations', data),
  
  // Get customer reservations
  getCustomerReservations: (customerId) => API.get(`/reservations/customer/${customerId}`),
  
  // Get pharmacy reservations
  getPharmacyReservations: (pharmacyId) => API.get(`/reservations/pharmacy/${pharmacyId}`),
  
  // Update reservation status
  updateStatus: (reservationId, status) => API.put(`/reservations/${reservationId}/status`, { status }),
  
  // Cancel reservation
  cancel: (reservationId) => API.delete(`/reservations/${reservationId}`)
};

// ==========================================
// DELIVERY API
// ==========================================
export const deliveryAPI = {
  // Create delivery
  create: (data) => API.post('/deliveries', data),
  
  // Get pharmacy deliveries
  getPharmacyDeliveries: (pharmacyId) => API.get(`/deliveries/pharmacy/${pharmacyId}`),
  
  // Get delivery details
  getDetails: (deliveryId) => API.get(`/deliveries/${deliveryId}`),
  
  // Update delivery status
  updateStatus: (deliveryId, data) => API.put(`/deliveries/${deliveryId}/status`, data)
};

export default API;