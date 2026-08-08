import api from './axios';

// Create a new order
export const createOrder = (payload) =>
  api.post('/orders', payload);

// Get all orders for a customer session
export const getSessionOrders = (sessionId) =>
  api.get(`/orders/session/${sessionId}`);

// Get a single order
export const getOrder = (id) =>
  api.get(`/orders/${id}`);

// Delete an unprocessed order
export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`);