import api from '../utils/api';

// Admin Service
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Campaign Management
  getAllCampaigns: async (params = {}) => {
    try {
      const response = await api.get('/admin/campaigns', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  approveCampaign: async (campaignId, verificationNotes = '') => {
    try {
      const response = await api.put(`/admin/campaigns/${campaignId}/approve`, {
        verificationNotes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  rejectCampaign: async (campaignId, rejectionReason) => {
    try {
      const response = await api.put(`/admin/campaigns/${campaignId}/reject`, {
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCampaignStatus: async (campaignId, status) => {
    try {
      const response = await api.put(`/admin/campaigns/${campaignId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Review campaign (approve/reject)
  reviewCampaign: async (campaignId, endpoint) => {
    try {
      const response = await api.put(`/admin/campaigns/${campaignId}/${endpoint}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Management
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      // Handle network errors
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        throw {
          message: 'Network error: Unable to connect to server. Please check your connection.',
          status: 'network_error',
          isNetworkError: true
        };
      }
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw {
          message: error.response?.data?.message || 'Authentication required. Please log in again.',
          status: error.response?.status,
          isAuthError: true
        };
      }
      
      // Handle API errors with meaningful messages
      if (error.response?.data) {
        const errorData = error.response.data;
        throw {
          message: errorData.message || errorData.error || 'Failed to fetch users',
          status: error.response.status || 'error',
          data: errorData
        };
      }
      
      // Handle other errors
      throw {
        message: error.message || 'Failed to fetch users. Please try again.',
        status: 'error',
        originalError: error
      };
    }
  },

  updateUserStatus: async (userId, statusData) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  assignRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/assign-role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Partner Management
  getAllPartners: async (params = {}) => {
    try {
      const response = await api.get('/admin/partners', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  approvePartner: async (partnerId, verificationNotes = '') => {
    try {
      const response = await api.put(`/admin/partners/${partnerId}/approve`, {
        verificationNotes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  rejectPartner: async (partnerId, rejectionReason) => {
    try {
      const response = await api.put(`/admin/partners/${partnerId}/reject`, {
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePartner: async (partnerId, data) => {
    try {
      const response = await api.put(`/admin/partners/${partnerId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deletePartner: async (partnerId) => {
    try {
      const response = await api.delete(`/admin/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      // Extract proper error message
      let errorMessage = 'Failed to delete partner';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.success === false && errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.statusCode = error.response?.status;
      throw enhancedError;
    }
  },

  // Alias for convenience
  getPartners: async (params = {}) => {
    return adminService.getAllPartners(params);
  },

  // Beneficiary Management
  getBeneficiaries: async (params = {}) => {
    try {
      const response = await api.get('/admin/beneficiaries', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Donation Management
  getAllDonations: async (params = {}) => {
    try {
      const response = await api.get('/admin/donations', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Coupon Management
  getAllCoupons: async (params = {}) => {
    try {
      const response = await api.get('/admin/coupons', { params });
      return response.data;
    } catch (error) {
      // Ensure we always throw a meaningful error object
      if (error.response?.data) {
        throw error.response.data;
      }
      // For network errors or other issues, create a proper error object
      const errorMessage = error.message || 'Failed to fetch coupons';
      throw {
        message: errorMessage,
        status: error.response?.status || 'error',
        response: error.response,
        ...error
      };
    }
  },

  // Consultation Management
  getAllConsultations: async (params = {}) => {
    try {
      const response = await api.get('/admin/consultations', { params });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      }
      const errorMessage = error.message || 'Failed to fetch consultations';
      throw {
        message: errorMessage,
        status: error.response?.status || 'error',
        response: error.response,
        ...error
      };
    }
  },

  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/admin/coupons', couponData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await api.put(`/admin/coupons/${couponId}`, couponData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteCoupon: async (couponId) => {
    try {
      const response = await api.delete(`/admin/coupons/${couponId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reports
  getFinancialReports: async (params = {}) => {
    try {
      const response = await api.get('/admin/reports/financial', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Contact Queries Management
  getAllContactQueries: async (params = {}) => {
    try {
      const response = await api.get('/contact', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateQueryStatus: async (queryId, statusData) => {
    try {
      const response = await api.put(`/contact/${queryId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  respondToQuery: async (queryId, message) => {
    try {
      const response = await api.post(`/contact/${queryId}/respond`, { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteQuery: async (queryId) => {
    try {
      const response = await api.delete(`/contact/${queryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
