import api from './axios';

// =========================
// Categories
// =========================

export const listCategories = (params = {}) =>
  api.get('/categories', { params });

export const createCategory = (payload) =>
  api.post('/categories', payload);

export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);

// =========================
// Menu
// =========================

export const listMenuItems = (params = {}) =>
  api.get('/menu', { params });

export const createMenuItem = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateMenuItem = (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteMenuItem = (id) =>
  api.delete(`/menu/${id}`);

// =========================
// Staff / Admin Users
// =========================

export const listStaff = (params = {}) =>
  api.get('/admin/users', { params });

export const getStaff = (id) =>
  api.get(`/admin/users/${id}`);

export const createStaff = (payload) =>
  api.post('/admin/users', payload);

export const updateStaff = (id, payload) =>
  api.put(`/admin/users/${id}`, payload);

export const deleteStaff = (id) =>
  api.delete(`/admin/users/${id}`);

// =========================
// Reports
// =========================

export const getDailyReport = (date) =>
  api.get('/admin/reports/daily', {
    params: { date },
  });

export const getMonthlyReport = (year, month) =>
  api.get('/admin/reports/monthly', {
    params: { year, month },
  });

export const getYearlyReport = (year) =>
  api.get('/admin/reports/yearly', {
    params: { year },
  });

export const getRangeReport = (from, to) =>
  api.get('/admin/reports', {
    params: { from, to },
  });

// =========================
// Report Downloads
// =========================

export const getMonthlyPdf = (year, month) =>
  api.get('/admin/reports/monthly/pdf', {
    params: { year, month },
  });

export const getMonthlyExcel = (year, month) =>
  api.get('/admin/reports/monthly/excel', {
    params: { year, month },
  });

// =========================
// Charts
// =========================

export const getChartRevenue = (year) =>
  api.get('/admin/charts/revenue', {
    params: { year },
  });

export const getChartTopItems = (year) =>
  api.get('/admin/charts/top-items', {
    params: { year },
  });

export const getChartTopCategories = (year) =>
  api.get('/admin/charts/top-categories', {
    params: { year },
  });

export const getChartOrderStatus = (year) =>
  api.get('/admin/charts/order-status', {
    params: { year },
  });

export const getChartRatings = (year) =>
  api.get('/admin/charts/ratings', {
    params: { year },
  });

// =========================
// Feedback
// =========================

export const listFeedback = (params = {}) =>
  api.get('/feedback', { params });