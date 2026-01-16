import api from '../utils/api';

// Donation Service
export const donationService = {
  // Get all donations
  getDonations: async (params = {}) => {
    try {
      const response = await api.get('/donations', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single donation
  getDonation: async (id) => {
    try {
      const response = await api.get(`/donations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create donation
  createDonation: async (donationData) => {
    try {
      // Convert campaignId to campaign if needed (backend expects 'campaign' field)
      const data = {
        ...donationData,
        campaign: donationData.campaign || donationData.campaignId
      };
      // Remove campaignId if campaign is set
      if (data.campaign) {
        delete data.campaignId;
      }
      // Remove campaign field if it's undefined/null for general donations
      if (!data.campaign) {
        delete data.campaign;
      }
      
      console.log('Donation service - Sending data to API:', data);
      const response = await api.post('/donations', data);
      console.log('Donation service - API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Donation service - Error caught:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status
      });
      
      // Improve error handling - preserve error structure
      if (error?.message === 'Failed to fetch' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        const networkError = {
          message: 'Unable to connect to server. Please check if the backend server is running.',
          code: 'ERR_NETWORK',
          originalError: error
        };
        console.error('Network error:', networkError);
        throw networkError;
      }
      
      // If error has response data, throw that
      if (error?.response?.data) {
        console.error('Response error data:', error.response.data);
        throw error.response.data;
      }
      
      // Otherwise throw the error as-is
      console.error('Throwing original error:', error);
      throw error;
    }
  },

  // Create test donation (without payment gateway)
  createTestDonation: async (donationData) => {
    try {
      // Convert campaignId to campaign if needed (backend expects 'campaign' field)
      const data = {
        ...donationData,
        campaign: donationData.campaign || donationData.campaignId
      };
      // Remove campaignId if campaign is set
      if (data.campaign) {
        delete data.campaignId;
      }
      const response = await api.post('/donations/test', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get donation receipt
  getDonationReceipt: async (id) => {
    try {
      const response = await api.get(`/donations/${id}/receipt`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Request donation refund
  requestRefund: async (id, reason) => {
    try {
      const response = await api.post(`/donations/${id}/refund`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get donation statistics
  getDonationStats: async () => {
    try {
      const response = await api.get('/donations/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user donations
  getUserDonations: async (params = {}) => {
    try {
      const response = await api.get('/users/donations', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
