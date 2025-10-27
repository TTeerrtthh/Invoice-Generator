import axios from 'axios';

const api = axios.create({
  // Default to backend dev server. In production set VITE_API_URL to your API URL.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// helper to set or remove authorization header
export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export const getInvoices = () => api.get('/invoices').then(r => r.data);
export const getInvoice = (id) => api.get(`/invoices/${id}`).then(r => r.data);
export const createInvoice = (payload) => api.post('/invoices', payload).then(r => r.data);
export const updateInvoice = (id, payload) => api.put(`/invoices/${id}`, payload).then(r => r.data);
export const sendInvoiceEmail = (id) => api.post(`/invoices/${id}/email`).then(r => r.data);

export default api;
