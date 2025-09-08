import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://your-api-url.com/api'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      SecureStore.deleteItemAsync('authToken');
      SecureStore.deleteItemAsync('userData');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  verifyPhone: (code: string, phone: string) =>
    api.post('/auth/verify-phone', { code, phone }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  socialLogin: (provider: string, token: string) =>
    api.post('/auth/social-login', { provider, token }),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (address: any) => api.post('/user/addresses', address),
  updateAddress: (id: string, address: any) => api.put(`/user/addresses/${id}`, address),
  deleteAddress: (id: string) => api.delete(`/user/addresses/${id}`),
  getUserStats: (timeframe: string) => api.get(`/user/stats?timeframe=${timeframe}`),

};

export const wasteAPI = {
  getWasteTypes: () => api.get('/waste/types'),
  calculateValue: (typeId: string, quantity: number, unit: string) =>
    api.post('/waste/calculate', { typeId, quantity, unit }),
  requestPickup: (data: any) => api.post('/pickup/request', data),
  getPickupHistory: () => api.get('/pickup/history'),
  getPickupDetails: (id: string) => api.get(`/pickup/${id}`),
  cancelPickup: (id: string) => api.post(`/pickup/${id}/cancel`),
  ratePickup: (id: string, rating: number, feedback?: string) =>
    api.post(`/pickup/${id}/rate`, { rating, feedback }),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  getPaymentMethods: () => api.get('/wallet/payment-methods'),
  addPaymentMethod: (method: any) => api.post('/wallet/payment-methods', method),
  getStats: () => api.get('/wallet/stats'), 
   requestPayout: (amount: number, method: string, details: any) =>
    api.post('/wallet/payout', { amount, method, details }),
};


export const workerAPI = {
  getAvailableRequests: () => api.get('/worker/requests'),
  acceptRequest: (requestId: string) => api.post(`/worker/requests/${requestId}/accept`),
  declineRequest: (requestId: string) => api.post(`/worker/requests/${requestId}/decline`),
  updateStatus: (requestId: string, status: string) =>
    api.post(`/worker/requests/${requestId}/status`, { status }),
  getEarnings: (period: string) => api.get(`/worker/earnings?period=${period}`),
  setAvailability: (available: boolean) => api.post('/worker/availability', { available }),
  getWorkerStats: () => api.get('/worker/stats'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getWorkers: () => api.get('/admin/workers'),
  getPickups: (status?: string) => api.get(`/admin/pickups${status ? `?status=${status}` : ''}`),
    getWastePrices: () => api.get('/admin/waste-prices'),

  updateWastePrices: (prices: any) => api.post('/admin/waste-prices', prices),
  approveWorker: (workerId: string) => api.post(`/admin/workers/${workerId}/approve`),
  rejectWorker: (workerId: string) => api.post(`/admin/workers/${workerId}/reject`),
  blockUser: (userId: string) => api.post(`/admin/users/${userId}/block`),
};

export default api;