import api from '../utils/api';

export const consultationService = {
  // Create consultation request
  createConsultation: async (data) => {
    try {
      const response = await api.post('/consultations', data);
      return response.data;
    } catch (error) {
      console.error('Create consultation error:', error);
      throw error;
    }
  },

  // Get user's consultations
  getMyConsultations: async () => {
    try {
      const response = await api.get('/consultations');
      return response.data;
    } catch (error) {
      console.error('Get consultations error:', error);
      throw error;
    }
  },

  // Get single consultation
  getConsultation: async (id) => {
    try {
      const response = await api.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get consultation error:', error);
      throw error;
    }
  },

  // Update consultation payment
  updatePayment: async (id, paymentData) => {
    try {
      const response = await api.patch(`/consultations/${id}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Update payment error:', error);
      throw error;
    }
  }
};

export default consultationService;

