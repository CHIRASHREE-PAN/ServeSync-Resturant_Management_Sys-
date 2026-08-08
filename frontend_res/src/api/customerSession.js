import api from './axios';

export const createCustomerSession = (payload) =>
  api.post('/customer/session', payload);

export const getCustomerSession = (sessionId) =>
  api.get(`/customer/session/${sessionId}`);

export const updateCustomerSession = (sessionId, payload) =>
  api.put(`/customer/session/${sessionId}`, payload);

export const deleteCustomerSession = (sessionId) =>
  api.delete(`/customer/session/${sessionId}`);