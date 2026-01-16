import api from '../utils/api';

// Upload Service
export const uploadService = {
  // Upload single image or video
  uploadSingle: async (formData) => {
    try {
      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload multiple images
  uploadMultiple: async (formData) => {
    try {
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload campaign image
  uploadCampaignImage: async (formData) => {
    try {
      const response = await api.post('/upload/campaign-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (formData) => {
    try {
      const response = await api.post('/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload KYC document
  uploadKYCDocument: async (formData) => {
    try {
      const response = await api.post('/upload/kyc-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload base64 image
  uploadBase64: async (base64Data) => {
    try {
      const response = await api.post('/upload/base64', { image: base64Data });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete image
  deleteImage: async (publicId) => {
    try {
      const response = await api.delete(`/upload/${publicId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};







