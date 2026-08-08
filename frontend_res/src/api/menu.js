import api from './axios';

// List available menu items
export const listMenuItems = (params = {}) =>
  api.get('/menu', { params });

// Search available menu items
export const searchMenuItems = (query) =>
  api.get('/menu/search', {
    params: { query },
  });

// Get menu items by category
export const getMenuByCategory = (categoryId) =>
  api.get(`/menu/category/${categoryId}`);

// Get a single menu item
export const getMenuItem = (id) =>
  api.get(`/menu/${id}`);