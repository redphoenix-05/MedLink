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
// CART API
// ==========================================
export const cartAPI = {
  // Add item to cart
  addToCart: (data) => API.post('/cart/add', data),
  
  // Get cart items
  getCart: () => API.get('/cart'),
  
  // Update cart item quantity
  updateQuantity: (itemId, quantity) => API.put(`/cart/${itemId}`, { quantity }),
  
  // Remove item from cart
  removeItem: (itemId) => API.delete(`/cart/${itemId}`),
  
  // Clear cart
  clearCart: () => API.delete('/cart/clear'),
  
  // Checkout
  checkout: (data) => API.post('/cart/checkout', data)
};

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

// ==========================================
// PAYMENT API
// ==========================================
export const paymentAPI = {
  // Initiate payment
  initiatePayment: (reservationId) => API.post('/payments/initiate', { reservationId }),
  
  // Get payment status
  getPaymentStatus: (reservationId) => API.get(`/payments/${reservationId}/status`)
};

// ==========================================
// ADMIN API
// ==========================================
export const adminAPI = {
  // Dashboard statistics
  getStats: () => API.get('/admin/dashboard-stats'),
  
  // User management
  getAllUsers: (params) => API.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => API.put(`/admin/users/${userId}/status`, { status }),
  
  // Pharmacy management
  getPendingPharmacies: (params) => API.get('/admin/pharmacies/pending', { params }),
  getApprovedPharmacies: (params) => API.get('/admin/pharmacies/approved', { params }),
  approvePharmacy: (pharmacyId) => API.put(`/admin/pharmacies/${pharmacyId}/approve`),
  rejectPharmacy: (pharmacyId, reason) => API.put(`/admin/pharmacies/${pharmacyId}/reject`, { reason }),
  
  // Reservations
  getAllReservations: (params) => API.get('/admin/reservations', { params }),
  
  // Deliveries
  getAllDeliveries: (params) => API.get('/admin/deliveries', { params }),
  
  // Medicines
  getAllMedicines: (params) => API.get('/admin/medicines', { params }),
  
  // Activity logs
  getActivityLogs: () => API.get('/admin/activity-logs')
};

export default API;