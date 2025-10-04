import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ExpenseService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/expenses`,
      withCredentials: true,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async submitExpense(expenseData, receiptFile = null) {
    const formData = new FormData();
    
    // Add expense data
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        if (typeof expenseData[key] === 'object') {
          formData.append(key, JSON.stringify(expenseData[key]));
        } else {
          formData.append(key, expenseData[key]);
        }
      }
    });

    // Add receipt file if provided
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    const response = await this.api.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getUserExpenses(params = {}) {
    const response = await this.api.get('/my-expenses', { params });
    return response.data;
  }

  async getPendingExpenses(params = {}) {
    const response = await this.api.get('/pending', { params });
    return response.data;
  }

  async getExpenseDetails(expenseId) {
    const response = await this.api.get(`/${expenseId}`);
    return response.data;
  }

  async updateExpense(expenseId, updates) {
    const response = await this.api.put(`/${expenseId}`, updates);
    return response.data;
  }

  async deleteExpense(expenseId) {
    const response = await this.api.delete(`/${expenseId}`);
    return response.data;
  }

  async processExpense(expenseId, action, comment = '') {
    const response = await this.api.post(`/${expenseId}/process`, {
      action,
      comment
    });
    return response.data;
  }

  async getExpenseStats(params = {}) {
    const response = await this.api.get('/stats', { params });
    return response.data;
  }

  // Helper methods for filtering and formatting
  getStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getExpenseCategories() {
    return [
      'Travel',
      'Meals',
      'Office Supplies',
      'Software',
      'Training',
      'Marketing',
      'Utilities',
      'Other'
    ];
  }
}

export default new ExpenseService();
