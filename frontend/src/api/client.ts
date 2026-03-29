import axios from 'axios';

export const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.detail ?? err.message;
    return Promise.reject(new Error(String(msg)));
  }
);
