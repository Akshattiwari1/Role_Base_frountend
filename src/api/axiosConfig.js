import axios from 'axios';

// IMPORTANT: Ensure this variable correctly picks up from .env.local
// In development, it will be 'http://localhost:3000' for the frontend.
// The REACT_APP_API_URL should point to your backend.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token in all outgoing requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;