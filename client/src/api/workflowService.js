import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class WorkflowService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/workflows`,
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

  async createWorkflow(workflowData) {
    const response = await this.api.post('/', workflowData);
    return response.data;
  }

  async getWorkflows(params = {}) {
    const response = await this.api.get('/', { params });
    return response.data;
  }

  async getWorkflowDetails(workflowId) {
    const response = await this.api.get(`/${workflowId}`);
    return response.data;
  }

  async updateWorkflow(workflowId, updates) {
    const response = await this.api.put(`/${workflowId}`, updates);
    return response.data;
  }

  async deleteWorkflow(workflowId) {
    const response = await this.api.delete(`/${workflowId}`);
    return response.data;
  }

  async toggleWorkflowStatus(workflowId) {
    const response = await this.api.patch(`/${workflowId}/toggle`);
    return response.data;
  }

  async testWorkflow(workflowId, sampleExpense) {
    const response = await this.api.post(`/${workflowId}/test`, { sampleExpense });
    return response.data;
  }

  async getEligibleApprovers() {
    const response = await this.api.get('/approvers');
    return response.data;
  }

  // Helper methods
  getWorkflowTypeLabel(type) {
    const labels = {
      percentage: 'Percentage-based',
      specific_approver: 'Specific Approver',
      hybrid: 'Hybrid'
    };
    return labels[type] || type;
  }

  getWorkflowTypeDescription(type) {
    const descriptions = {
      percentage: 'Requires a certain percentage of eligible approvers to approve',
      specific_approver: 'Requires approval from a specific person',
      hybrid: 'Combines percentage and specific approver rules'
    };
    return descriptions[type] || '';
  }

  getComplexityColor(complexity) {
    const colors = {
      simple: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      complex: 'bg-red-100 text-red-800'
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  }

  validateWorkflowData(data) {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = 'Workflow name is required';
    }

    if (!data.type) {
      errors.type = 'Workflow type is required';
    }

    if (data.type === 'percentage') {
      if (!data.rules?.percentage?.required || data.rules.percentage.required < 1 || data.rules.percentage.required > 100) {
        errors.percentage = 'Percentage must be between 1 and 100';
      }
      if (!data.rules?.percentage?.eligibleApprovers?.length) {
        errors.eligibleApprovers = 'At least one eligible approver is required';
      }
    }

    if (data.type === 'specific_approver') {
      if (!data.rules?.specificApprover?.approver) {
        errors.specificApprover = 'Specific approver is required';
      }
    }

    if (data.type === 'hybrid') {
      if (!data.rules?.hybrid?.primaryRule) {
        errors.primaryRule = 'Primary rule is required for hybrid workflow';
      }
      if (!data.rules?.hybrid?.fallbackRule) {
        errors.fallbackRule = 'Fallback rule is required for hybrid workflow';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new WorkflowService();
