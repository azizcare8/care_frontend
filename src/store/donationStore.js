import { create } from 'zustand';
import { donationService } from '../services/donationService';

const useDonationStore = create((set, get) => ({
  // State
  donations: [],
  userDonations: [],
  currentDonation: null,
  donationStats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },

  // Actions
  getDonations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.getDonations(params);
      set({
        donations: response.data || response.donations || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch donations'
      });
      throw error;
    }
  },

  getDonation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.getDonation(id);
      set({
        currentDonation: response.data || response.donation,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch donation'
      });
      throw error;
    }
  },

  createDonation: async (donationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.createDonation(donationData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh user donations
      get().getUserDonations();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create donation'
      });
      throw error;
    }
  },

  getUserDonations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.getUserDonations(params);
      set({
        userDonations: response.data || response.donations || [],
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch user donations'
      });
      throw error;
    }
  },

  getDonationReceipt: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.getDonationReceipt(id);
      set({
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch receipt'
      });
      throw error;
    }
  },

  requestRefund: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.requestRefund(id, reason);
      set({
        isLoading: false,
        error: null
      });
      // Refresh user donations
      get().getUserDonations();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to request refund'
      });
      throw error;
    }
  },

  getDonationStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await donationService.getDonationStats();
      set({
        donationStats: response.data || response.stats,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch donation statistics'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentDonation: () => set({ currentDonation: null }),

  setPagination: (pagination) => set({ pagination })
}));

export default useDonationStore;
