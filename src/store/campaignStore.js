import { create } from 'zustand';
import { campaignService } from '../services/campaignService';

const useCampaignStore = create((set, get) => ({
  // State
  campaigns: [],
  featuredCampaigns: [],
  trendingCampaigns: [],
  currentCampaign: null,
  userCampaigns: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },

  // Actions
  getCampaigns: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getCampaigns(params);
      set({
        campaigns: response.data || response.campaigns || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch campaigns'
      });
      throw error;
    }
  },

  getCampaign: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getCampaign(id);
      set({
        currentCampaign: response.data || response.campaign,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch campaign'
      });
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.createCampaign(campaignData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh user campaigns
      get().getUserCampaigns();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create campaign'
      });
      throw error;
    }
  },

  updateCampaign: async (id, campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.updateCampaign(id, campaignData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh campaigns
      get().getUserCampaigns();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update campaign'
      });
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.deleteCampaign(id);
      set({
        isLoading: false,
        error: null
      });
      // Refresh user campaigns
      get().getUserCampaigns();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete campaign'
      });
      throw error;
    }
  },

  getFeaturedCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getFeaturedCampaigns();
      set({
        featuredCampaigns: response.data || response.campaigns || [],
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch featured campaigns'
      });
      throw error;
    }
  },

  getTrendingCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getTrendingCampaigns();
      set({
        trendingCampaigns: response.data || response.campaigns || [],
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch trending campaigns'
      });
      throw error;
    }
  },

  getUserCampaigns: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getCampaigns({ ...params, myCampaigns: true });
      set({
        userCampaigns: response.data || response.campaigns || [],
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch user campaigns'
      });
      throw error;
    }
  },

  searchCampaigns: async (query, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.searchCampaigns(query, filters);
      set({
        campaigns: response.data || response.campaigns || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Search failed'
      });
      throw error;
    }
  },

  addCampaignUpdate: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.addCampaignUpdate(id, updateData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh current campaign
      get().getCampaign(id);
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to add update'
      });
      throw error;
    }
  },

  getCampaignAnalytics: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignService.getCampaignAnalytics(id);
      set({
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch analytics'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentCampaign: () => set({ currentCampaign: null }),

  setPagination: (pagination) => set({ pagination })
}));

export default useCampaignStore;
