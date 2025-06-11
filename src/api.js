// frontend/src/api.js
import axios from 'axios';

// Determine the backend URL based on environment
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://role-base-backend-ntr0.onrender.com' // Your deployed Render backend URL
  : 'http://localhost:5000'; // Your local backend URL for development

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;