import api from './axios';

export const requestBill = (payload) =>
  api.post('/billing/request', payload);

export const getBill = (sessionId) =>
  api.get(`/billing/${sessionId}`);

export const createFeedback = (payload) =>
  api.post('/feedback', payload);

export const createWaiterCall = (payload) =>
  api.post('/customer/waiter-call', payload);

export const getWaiterCall = (id) =>
  api.get(`/customer/waiter-call/${id}`);