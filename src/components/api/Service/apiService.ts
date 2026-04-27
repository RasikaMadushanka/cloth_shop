import api from '../axiosConfig';

// 1. PRODUCT CONTROLLER (Matches ProductController.java)
export const productApi = {
  getAll: () => api.get('/products/all'),
  add: (data: any) => api.post('/products/add', data),
  // Note the corrected path to include /products/
  updatePrice: (barcodeId: string, newPrice: number) => 
    api.patch('/products/update-price-by-barcode', { barcodeId, newPrice }),
  delete: (id: number) => api.delete(`/products/delete/${id}`),
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
  placeOrder: (order: any) => api.post('/sales/place-order', order),
  getSalesReport: (type: string, date: string) => api.get(`/sales/report/${type}/${date}`),
};

// 4. ADMIN CONTROLLER (Matches Admin_Controller.java)
export const adminApi = {
  getAll: () => api.get('/admin/all'),
  add: (data: any) => api.post('/admin/add', data),
  update: (id: number, data: any) => api.put(`/admin/update/${id}`, data),
  delete: (id: number) => api.delete(`/admin/delete/${id}`),
};