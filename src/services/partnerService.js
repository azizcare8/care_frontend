import api from '../utils/api';

// Partner Service
export const partnerService = {
  // Get all partners (public)
  getPartners: async (params = {}) => {
    try {
      const response = await api.get('/partners', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single partner
  getPartner: async (id) => {
    try {
      const response = await api.get(`/partners/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get partners by category
  getPartnersByCategory: async (category, params = {}) => {
    try {
      const response = await api.get('/partners', { 
        params: { category, status: 'approved', ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get food partners
  getFoodPartners: async (params = {}) => {
    try {
      const response = await api.get('/partners', { 
        params: { category: 'food', status: 'approved', isActive: true, ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get medical/health partners
  getHealthPartners: async (params = {}) => {
    try {
      const response = await api.get('/partners', { 
        params: { category: 'medical', status: 'approved', isActive: true, ...params } 
      });
      // Backend returns { success: true, data: [...], pagination: {...} }
      // Return the data array directly for easier use in components
      return {
        data: response.data?.data || response.data || [],
        pagination: response.data?.pagination
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};


