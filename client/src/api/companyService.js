import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class CompanyService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/company`,
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

  async createCompany(companyData) {
    const response = await this.api.post('/', companyData);
    return response.data;
  }

  async getCompany() {
    const response = await this.api.get('/');
    return response.data;
  }

  async updateCompany(updates) {
    const response = await this.api.put('/', updates);
    return response.data;
  }

  async getCompanyStats() {
    const response = await this.api.get('/stats');
    return response.data;
  }

  async getCountriesWithCurrencies() {
    const response = await this.api.get('/countries');
    return response.data;
  }

  async getSupportedCurrencies() {
    const response = await this.api.get('/currencies');
    return response.data;
  }

  async getExchangeRates() {
    const response = await this.api.get('/exchange-rates');
    return response.data;
  }

  async updateExpenseCategories(categories) {
    const response = await this.api.put('/categories', { categories });
    return response.data;
  }

  async updateCompanySettings(settings) {
    const response = await this.api.put('/settings', { settings });
    return response.data;
  }
}

export default new CompanyService();
