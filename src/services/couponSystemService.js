import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiBaseUrl } from '../utils/api';

const isBrowser = typeof window !== 'undefined';

// Get couponSystem API base URL
// Use the same base URL as main API, or override with env variable
const getCouponSystemBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_COUPON_SYSTEM_API_URL;
  
  if (envUrl && envUrl !== 'undefined') {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Use the same base URL as main API
  return getApiBaseUrl();
};

// Create axios instance for couponSystem
const couponSystemApi = axios.create({
  baseURL: getCouponSystemBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
couponSystemApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || 
      (isBrowser ? window.localStorage.getItem('token') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
couponSystemApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Cookies.remove('token');
      if (isBrowser) {
        window.localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// CouponSystem Service
export const couponSystemService = {
  // Get all coupons for the authenticated user
  getMyCoupons: async () => {
    try {
      const response = await couponSystemApi.get('/coupons');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific coupon by ID (with QR code)
  getCouponById: async (id) => {
    try {
      const response = await couponSystemApi.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new coupon
  createCoupon: async (couponData) => {
    try {
      const response = await couponSystemApi.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (id, paymentStatus) => {
    try {
      const response = await couponSystemApi.patch(`/coupons/${id}/payment-status`, {
        paymentStatus
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default couponSystemService;
