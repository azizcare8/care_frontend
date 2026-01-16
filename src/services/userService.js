import api from '../utils/api';

// User Service
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user status (admin only)
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload KYC document
  uploadKYCDocument: async (kycData) => {
    try {
      const response = await api.post('/users/kyc/upload', kycData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user referrals
  getReferrals: async () => {
    try {
      const response = await api.get('/users/referrals');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate referral link
  generateReferralLink: async () => {
    try {
      const response = await api.post('/users/referrals/generate');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData) => {
    try {
      const response = await api.post('/users/withdrawals/request', withdrawalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user withdrawals
  getWithdrawals: async () => {
    try {
      const response = await api.get('/users/withdrawals');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};






