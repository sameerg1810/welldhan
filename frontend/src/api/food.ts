import { api } from './client';

export const getFoodInventory = () => api.get('/food/inventory');
export const getMyFoodPreferences = () => api.get('/food/preferences');
export const toggleFoodItem = (data: any) => api.post('/food/preferences/toggle', data);
export const updateFoodPreference = (id: string, data: any) => api.patch(`/food/preferences/${id}`, data);
export const pauseAllFood = (data: any) => api.post('/food/preferences/pause', data);
export const getMyFoodOrders = () => api.get('/food/orders/mine');
export const getTodayOrders = () => api.get('/food/orders/today');
export const getLowStockItems = () => api.get('/food/inventory/low-stock');
export const updateStock = (id: string, data: any) => api.patch(`/food/inventory/${id}/stock`, data);

