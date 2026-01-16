import api from '../utils/api';

// Campaign Service
export const campaignService = {
  // Get all campaigns
  getCampaigns: async (params = {}) => {
    try {
      const response = await api.get('/campaigns', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single campaign
  getCampaign: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      // Better error handling - preserve error structure
      const errorData = error.response?.data || {};
      const errorToThrow = {
        ...errorData,
        message: errorData.message || error.message || 'Failed to create campaign',
        status: errorData.status || 'error',
        errors: errorData.errors || []
      };
      throw errorToThrow;
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get campaign donations
  getCampaignDonations: async (id, params = {}) => {
    try {
      const response = await api.get(`/campaigns/${id}/donations`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add campaign update
  addCampaignUpdate: async (id, updateData) => {
    try {
      const response = await api.post(`/campaigns/${id}/updates`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get campaign analytics
  getCampaignAnalytics: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get featured campaigns
  getFeaturedCampaigns: async () => {
    try {
      const response = await api.get('/campaigns', { 
        params: { featured: true, limit: 6 } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get trending campaigns
  getTrendingCampaigns: async () => {
    try {
      const response = await api.get('/campaigns', { 
        params: { sortBy: 'popularity', limit: 9, status: 'active' } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search campaigns
  searchCampaigns: async (query, filters = {}) => {
    try {
      const response = await api.get('/campaigns', { 
        params: { q: query, ...filters } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
