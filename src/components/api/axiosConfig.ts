import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // REMOVED /api FROM HERE
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;