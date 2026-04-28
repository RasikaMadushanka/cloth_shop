import api from '../axiosConfig';


export const productApi = {
  // Now becomes http://localhost:8080/api/products/all
  getAll: () => api.get('/api/products/all'),

  add: (data: any) => api.post('/api/products/add', data),

  update: (id: number, data: any) => api.put(`/api/products/update/${id}`, data),

  updatePrice: (barcodeId: string, newPrice: number) => 
    api.patch('/api/products/update-price-by-barcode', { barcodeId, newPrice }),

  delete: (id: number) => api.delete(`/api/products/delete/${id}`),
};

// 2. STOCK CONTROLLER (Matches Stock_Controller.java)
export const stockApi = {
  update: (data: any) => api.post('/stock/update', data),
  getDailyReport: (date: string) => api.get(`/stock/reports/daily?date=${date}`),
  getMonthlyReport: (date: string) => api.get(`/stock/reports/monthly?date=${date}`),
  getYearlyReport: (date: string) => api.get(`/stock/reports/Yearly?date=${date}`),
};

// 3. SALES CONTROLLER (Matches SaleController.java)
export const salesApi = {
  placeOrder: (order: any) => api.post('/api/sales/place-order', order),
  getSalesReport: (type: string, date: string) => api.get(`/api/sales/report/${type}/${date}`),
};

// 4. ADMIN CONTROLLER (Matches Admin_Controller.java)
export const adminApi = {
  getAll: () => api.get('/api/admin/all'),
  add: (data: any) => api.post('/api/admin/add', data),
  update: (id: number, data: any) => api.put(`/api/admin/update/${id}`, data),
  delete: (id: number) => api.delete(`/api/admin/delete/${id}`),
};