import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle authentication
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Create new user (Admin only)
  async createUser(userData) {
    const response = await this.api.post('/users/create', userData);
    return response.data;
  }

  // Get all users in company (Admin only)
  async getCompanyUsers() {
    const response = await this.api.get('/users/company');
    return response.data;
  }

  // Get user statistics
  async getUserStats() {
    const response = await this.api.get('/users/stats');
    return response.data;
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await this.api.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Get managers for dropdown
  async getManagers() {
    const response = await this.api.get('/users/managers');
    return response.data;
  }

  // Token management functions
  storeTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Create instance
const userServiceInstance = new UserService();

// Export individual functions for use in AuthContext
export const { storeTokens, clearTokens } = userServiceInstance;

export default userServiceInstance;