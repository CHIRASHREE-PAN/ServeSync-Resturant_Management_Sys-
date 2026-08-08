import api from './axios';

// List kitchen orders
export const listKitchenOrders = () =>
  api.get('/kitchen/orders');

// Mark order as preparing
export const markOrderPreparing = (orderId) =>
  api.put(`/kitchen/orders/${orderId}/preparing`);

// Mark order as ready to serve
export const markOrderReady = (orderId) =>
  api.put(`/kitchen/orders/${orderId}/ready`);