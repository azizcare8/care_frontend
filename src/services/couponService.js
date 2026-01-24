import api from '../utils/api';

// Coupon Service
export const couponService = {
  // Get all coupons
  getCoupons: async (params = {}) => {
    try {
      const response = await api.get('/coupons', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single coupon
  getCoupon: async (id) => {
    try {
      const response = await api.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create coupon
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      // Extract proper error message with better handling
      let errorMessage = 'Failed to create coupon';

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else {
          // Try to stringify if it's an object
          try {
            const stringified = JSON.stringify(errorData);
            if (stringified !== '{}') {
              errorMessage = stringified;
            }
          } catch {
            // Keep default message
          }
        }
      }

      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },

  // Update coupon
  updateCoupon: async (id, couponData) => {
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete coupon
  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      // Extract proper error message with better handling
      let errorMessage = 'Failed to delete coupon';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string' && errorData.trim()) {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error.message || errorMessage;
        } else {
          // Only stringify if object has meaningful content
          try {
            const stringified = JSON.stringify(errorData);
            if (stringified && stringified !== '{}' && stringified !== 'null' && stringified.trim()) {
              errorMessage = stringified;
            } else if (error.response?.status) {
              errorMessage = `Failed to delete coupon (Status: ${error.response.status})`;
            }
          } catch {
            // Keep default message or use status
            if (error.response?.status) {
              errorMessage = `Failed to delete coupon (Status: ${error.response.status})`;
            }
          }
        }
      } else if (error?.message && error.message.trim()) {
        errorMessage = error.message;
      } else if (error?.response?.status) {
        errorMessage = `Failed to delete coupon (Status: ${error.response.status})`;
      }

      // Ensure we always have a meaningful error message
      if (!errorMessage || errorMessage === '{}' || errorMessage.trim() === '') {
        errorMessage = 'Failed to delete coupon. Please try again.';
      }

      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      // Preserve response data for better error handling upstream
      if (error.response?.data) {
        enhancedError.responseData = error.response.data;
      }
      throw enhancedError;
    }
  },

  // Redeem coupon
  redeemCoupon: async (id, redemptionData) => {
    try {
      const response = await api.post(`/coupons/${id}/redeem`, redemptionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get coupon by code
  getCouponByCode: async (code) => {
    try {
      const response = await api.get(`/coupons/code/${encodeURIComponent(code)}`);
      return response.data;
    } catch (error) {
      // If backend returned structured error, throw it directly
      if (error.response?.data && error.response.data.status === 'error') {
        throw error.response.data;
      }

      // If it's a network error (no response), create a structured error
      if (error.request && !error.response) {
        throw {
          status: 'error',
          message: 'Network error. Please check your connection and try again.'
        };
      }

      // If there's a response but no structured data, create error from status
      if (error.response) {
        throw {
          status: 'error',
          message: error.response.data?.message || `Request failed with status ${error.response.status}`
        };
      }

      // For any other error, create a structured error
      throw {
        status: 'error',
        message: error.message || 'Failed to validate coupon code'
      };
    }
  },

  // Get user's coupons
  getUserCoupons: async (params = {}) => {
    try {
      const response = await api.get('/coupons/my-coupons', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my coupons (alias for getUserCoupons)
  getMyCoupons: async (params = {}) => {
    try {
      const response = await api.get('/coupons/my-coupons', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get coupon analytics
  getCouponAnalytics: async (id) => {
    try {
      const response = await api.get(`/coupons/${id}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get coupon packages
  getPackages: async () => {
    try {
      const response = await api.get('/coupons/packages');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get coupons by category
  getCouponsByCategory: async (category) => {
    try {
      const response = await api.get('/coupons', {
        params: { category, limit: 12 }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Send coupon via WhatsApp, Email, SMS
  // New format: sendCoupon(id, { recipient, methods, partnerId })
  // Old format (backward compatible): sendCoupon(id, recipient, methods)
  sendCoupon: async (id, sendDataOrRecipient, methods) => {
    try {
      // Check if new format (object with recipient property) or old format (recipient object, methods separately)
      const payload = sendDataOrRecipient.recipient
        ? sendDataOrRecipient // New format: { recipient, methods, partnerId }
        : { recipient: sendDataOrRecipient, methods }; // Old format: (id, recipient, methods)

      const response = await api.post(`/coupons/${id}/send`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add coupon to vendor wallet
  addCouponToWallet: async (id, vendorId) => {
    try {
      const response = await api.post(`/coupons/${id}/add-to-wallet`, {
        vendorId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Assign coupon to beneficiary (donor/admin)
  assignCoupon: async (id, assignmentData) => {
    try {
      const response = await api.post(`/coupons/${id}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Settle coupon after redemption
  settleCoupon: async (id, settlementData) => {
    try {
      const response = await api.post(`/coupons/${id}/settle`, settlementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject or cancel coupon
  rejectCoupon: async (id, reasonData) => {
    try {
      const response = await api.post(`/coupons/${id}/reject`, reasonData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  purchaseCoupons: async (payload) => {
    try {
      const response = await api.post('/coupons/purchase', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Validate coupon
  validateCoupon: async (code) => {
    try {
      const response = await api.post('/coupons/validate', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
