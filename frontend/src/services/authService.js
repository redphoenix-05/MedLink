import API from './api';

// Auth service functions
export const authService = {
  // Register user
  signup: async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await API.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};