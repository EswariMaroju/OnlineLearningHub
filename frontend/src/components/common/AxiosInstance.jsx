import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Make sure this matches your backend port
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosInstance;