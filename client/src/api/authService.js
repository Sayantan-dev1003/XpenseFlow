import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor - removed token handling since we use HTTP-only cookies
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor - handle 401 errors more intelligently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors silently for auth endpoints (expected behavior)
    // Only log warnings for protected endpoints that require authentication
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/me')) {
        console.warn('API request returned 401 - authentication may be required');
      }
      // Don't redirect immediately - let the calling code handle it
      // The AuthContext will detect this and update the auth state
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user - Step 1: Check credentials
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Verify OTP for login - Step 2: Verify OTP and complete login
  verifyLoginOTP: async (userId, otp, method) => {
    const response = await api.post('/auth/verify-login-otp', { userId, otp, method });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },


  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Google OAuth
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }
};

// User service
export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },


  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  }
};

export default api;
