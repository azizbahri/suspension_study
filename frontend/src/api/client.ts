import axios from 'axios';

export const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const detail = err.response?.data?.detail ?? err.message;
    // FastAPI validation errors come back as an array of {loc, msg, type} objects.
    const msg = Array.isArray(detail)
      ? detail.map((e: { msg?: string }) => e.msg ?? String(e)).join('; ')
      : String(detail);
    return Promise.reject(new Error(msg));
  }
);
