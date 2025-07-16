import axios from 'axios';

// Create an Axios instance with custom configuration
const api = axios.create({
        baseURL: 'https://todoapp-rmqk.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // You can add more default configurations here
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      // You could redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
