import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const eventTypesApi = {
  getAll: () => api.get('/event-types'),
  getBySlug: (slug) => api.get(`/event-types/${slug}`),
  getById: (id) => api.get(`/event-types/${id}`),
  create: (data) => api.post('/event-types', data),
  update: (id, data) => api.put(`/event-types/${id}`, data),
  delete: (id) => api.delete(`/event-types/${id}`),
};

export const availabilityApi = {
  get: () => api.get('/availability'),
  update: (data) => api.put('/availability', data),
  getSlots: (date, eventTypeId) =>
    api.get(`/availability/slots?date=${date}&eventTypeId=${eventTypeId}`),
  addOverride: (data) => api.post('/availability/overrides', data),
  deleteOverride: (id) => api.delete(`/availability/overrides/${id}`),
};

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getByToken: (token) => api.get(`/bookings/cancel/${token}`),
  cancelByToken: (token) => api.put(`/bookings/cancel/${token}`),
  getByRescheduleToken: (token) => api.get(`/bookings/reschedule/${token}`),
  rescheduleByToken: (token, data) => api.put(`/bookings/reschedule/${token}`, data),
};

export const meetingsApi = {
  getAll: (filter) => api.get(`/meetings?filter=${filter || 'all'}`),
  cancel: (id) => api.put(`/meetings/${id}/cancel`),
  reschedule: (id, data) => api.put(`/meetings/${id}/reschedule`, data),
};

export default api;

