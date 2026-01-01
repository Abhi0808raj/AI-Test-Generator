import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An error occurred';
    return Promise.reject(new Error(message));
  }
);

const apiService = {
  // Test endpoints
  generateTests: async (code, framework = 'jest', language = 'javascript') => {
    return await api.post('/tests/generate', { code, framework, language });
  },

  executeTests: async (code, testCode, framework = 'jest') => {
    return await api.post('/tests/execute', { code, testCode, framework });
  },

  analyzeCode: async (code) => {
    return await api.post('/tests/analyze', { code });
  },

  getFrameworks: async () => {
    return await api.get('/tests/frameworks');
  },

  // Project endpoints
  createProject: async (projectData) => {
    return await api.post('/projects', projectData);
  },

  getProjects: async (params = {}) => {
    return await api.get('/projects', { params });
  },

  getProject: async (id) => {
    return await api.get(`/projects/${id}`);
  },

  updateProject: async (id, projectData) => {
    return await api.put(`/projects/${id}`, projectData);
  },

  deleteProject: async (id) => {
    return await api.delete(`/projects/${id}`);
  },

  addTestResult: async (id, testCode, result) => {
    return await api.post(`/projects/${id}/test-results`, { testCode, result });
  },

  getStatistics: async () => {
    return await api.get('/projects/statistics');
  }
};

export default apiService;
