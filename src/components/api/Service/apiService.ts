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
  // Update stock (Restock)
  update: (data: any) => api.post('/api/stock/update', data),
  
  // Real-time Report Generation
  getDailyReport: (date: string) => api.get(`/api/stock/reports/daily?date=${date}`),
  getMonthlyReport: (date: string) => api.get(`/api/stock/reports/monthly?date=${date}`),
  getYearlyReport: (date: string) => api.get(`/api/stock/reports/Yearly?date=${date}`),
  
  // --- NEW: Database Records ---
  // Get all historical report entities from the database
  getAllSavedReports: () => api.get('/api/stock/reports/all'),
  
  // Get all stock movement logs (The table you shared)
  getAllLogs: () => api.get('/api/stock/logs/all'),
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