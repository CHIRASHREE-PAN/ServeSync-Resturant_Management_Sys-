import api from './axios';

export const listReadyOrders = () =>
  api.get('/waiter/orders');

export const markOrderServed = (orderId) =>
  api.put(`/waiter/orders/${orderId}/served`);

export const listWaiterCalls = () =>
  api.get('/waiter/calls');

export const completeWaiterCall = (callId) =>
  api.put(`/waiter/calls/${callId}/completed`);

export const markBillPaid = (billId) =>
  api.put(`/billing/${billId}/paid`);