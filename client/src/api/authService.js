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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry login requests or requests that are already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
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

  // Send OTP for login - Step 2: Send OTP based on method
  sendLoginOTP: async (userId, method) => {
    const response = await api.post('/auth/send-login-otp', { userId, method });
    return response.data;
  },

  // Verify OTP for login - Step 3: Verify OTP and complete login
  verifyLoginOTP: async (userId, otp, method) => {
    const response = await api.post('/auth/verify-login-otp', { userId, otp, method });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
