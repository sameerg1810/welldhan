import api from './client';

export const foodApi = {
  getInventory: () => api.get('/food/inventory').then(r => r.data),
  getPreferences: () => api.get('/food/preferences').then(r => r.data),
  toggleItem: (data: { food_item_id: string; is_selected: boolean; default_quantity?: number }) =>
    api.post('/food/preferences/toggle', data).then(r => r.data),
  updatePreference: (id: string, data: any) => api.patch(`/food/preferences/${id}`, data).then(r => r.data),
  pauseAll: (data: { pause_until: string }) => api.post('/food/preferences/pause', data).then(r => r.data),
  getMyOrders: () => api.get('/food/orders/mine').then(r => r.data),
  getTodayOrders: () => api.get('/food/orders/today').then(r => r.data),
  getLowStock: () => api.get('/food/inventory/low-stock').then(r => r.data),
  updateStock: (id: string, data: any) => api.patch(`/food/inventory/${id}/stock`, data).then(r => r.data),
  createItem: (data: any) => api.post('/food/inventory', data).then(r => r.data),
};
