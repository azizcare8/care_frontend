import axios from 'axios';
import Cookies from 'js-cookie';

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache for faster updates

// Create axios instance
// Ensure we always have a valid baseURL with /api prefix
const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    // Detect if we are running on localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:5000/api';
    }

    // Production: use environment variable
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl !== 'undefined') {
      return envUrl.endsWith('/api') ? envUrl : envUrl + '/api';
    }
    // Fallback: use current origin to construct API URL
    return window.location.origin + '/api';
  }
  // Server-side (during build or SSR): prioritize production env
  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'https://carefoundationtrust.org/api';
  return serverUrl.endsWith('/api') ? serverUrl : serverUrl + '/api';
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for API requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and check cache
api.interceptors.request.use(
  (config) => {
    // Always try to get fresh token from cookies
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug log in development only
      if (process.env.NODE_ENV === 'development' && config.url?.includes('/dashboard')) {
        console.log('API Request with token:', {
          url: config.url,
          hasToken: !!token,
          tokenLength: token.length
        });
      }
    } else {
      // Remove Authorization header if no token
      delete config.headers.Authorization;
      // Debug log in development only
      if (process.env.NODE_ENV === 'development' && config.url?.includes('/dashboard')) {
        console.warn('API Request without token:', config.url);
      }
    }

    // Check cache for GET requests
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // Mark as cached to return from response interceptor
        config.__fromCache = true;
        config.__cachedData = cached.data;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Return cached data immediately if available
    if (response.config.__fromCache) {
      return {
        ...response,
        data: response.config.__cachedData,
        __fromCache: true
      };
    }

    // Cache successful GET responses
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      // Clean old cache entries (keep last 50)
      if (cache.size > 50) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    }

    return response;
  },
  (error) => {
    // Handle network errors gracefully
    if (error.code === 'ECONNABORTED' ||
      error.code === 'ECONNREFUSED' ||
      error.message === 'Network Error' ||
      !error.response ||
      error.message?.includes('ERR_CONNECTION_REFUSED') ||
      error.message?.includes('ERR_CONNECTION')) {
      // Network error - backend might be down or unreachable
      // Return a rejected promise with a user-friendly error
      return Promise.reject({
        ...error,
        message: 'Unable to connect to server. Please check your connection.',
        isNetworkError: true,
        silent: true // Flag to indicate this should be handled silently
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear token
      Cookies.remove('token');
      // Return a rejected promise with auth error info
      return Promise.reject({
        ...error,
        isAuthError: true,
        message: error.response?.data?.message || 'Unauthorized. Please login again.'
      });
    }

    // Ensure error has a meaningful message even if response.data is empty
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
  }
);

export default api;
