import { create } from 'zustand';
import { adminService } from '../services/adminService';

const useAdminStore = create((set, get) => ({
  // State
  dashboardStats: null,
  campaigns: [],
  donations: [],
  users: [],
  coupons: [],
  consultations: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  // Actions
  getDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getDashboardStats();
      // Handle response structure: response.data.data or response.data
      const stats = response?.data?.data || response?.data || response?.stats || {};
      set({
        dashboardStats: stats,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      // Handle 401/403 errors - don't set error, let auth handle redirect
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        set({
          isLoading: false,
          error: null // Don't set error for auth issues
        });
        throw error; // Re-throw so components can handle redirect
      }
      
      // Handle network errors gracefully
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.message?.includes('Failed to fetch')) {
        console.warn('Backend server is not running or unreachable');
        set({
          isLoading: false,
          error: null, // Don't set error for network issues
          dashboardStats: {
            overview: {
              totalUsers: 0,
              totalCampaigns: 0,
              activeCampaigns: 0,
              completedCampaigns: 0,
              totalDonations: 0,
              totalCoupons: 0,
              activeCoupons: 0,
              totalPartners: 0,
              foodPartners: 0,
              healthPartners: 0,
              volunteers: 0
            },
            financial: {
              totalRaised: 0,
              avgDonation: 0,
              totalFees: 0,
              netRevenue: 0
            }
          }
        });
        return { data: { stats: {} } };
      }
      
      // For other errors, set error but don't block UI
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch dashboard stats',
        // Set default stats so UI can still render
        dashboardStats: get().dashboardStats || {
          overview: {
            totalUsers: 0,
            totalCampaigns: 0,
            activeCampaigns: 0,
            completedCampaigns: 0,
            totalDonations: 0,
            totalCoupons: 0,
            activeCoupons: 0,
            totalPartners: 0,
            foodPartners: 0,
            healthPartners: 0,
            volunteers: 0
          },
          financial: {
            totalRaised: 0,
            avgDonation: 0,
            totalFees: 0,
            netRevenue: 0
          }
        }
      });
      throw error;
    }
  },

  getAllCampaigns: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllCampaigns(params);
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

  updateCampaignStatus: async (campaignId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updateCampaignStatus(campaignId, status);
      set({
        isLoading: false,
        error: null
      });
      // Refresh campaigns
      get().getAllCampaigns();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update campaign status'
      });
      throw error;
    }
  },

  getAllDonations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllDonations(params);
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

  getAllUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllUsers(params);
      set({
        users: response.data || response.users || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      // Handle network errors gracefully
      if (error?.isNetworkError || error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
        console.warn('Backend server is not running or unreachable');
        set({
          users: [],
          isLoading: false,
          error: null // Don't set error for network issues, let component handle it
        });
        throw error; // Re-throw so component can show appropriate message
      }
      
      // Handle authentication errors
      if (error?.isAuthError || error?.response?.status === 401 || error?.response?.status === 403) {
        set({
          isLoading: false,
          error: null // Don't set error for auth issues, let auth hook handle redirect
        });
        throw error; // Re-throw so auth can handle
      }
      
      // Extract meaningful error message
      const errorMessage = error?.message || error?.error || 'Failed to fetch users';
      
      set({
        isLoading: false,
        error: errorMessage,
        users: [] // Set empty array on error
      });
      
      // Create enhanced error object with message
      const enhancedError = {
        message: errorMessage,
        ...error
      };
      throw enhancedError;
    }
  },

  // Aliases for convenience
  getUsers: async (params = {}) => get().getAllUsers(params),
  getDonations: async (params = {}) => get().getAllDonations(params),
  getCoupons: async (params = {}) => get().getAllCoupons(params),

  getAllCoupons: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllCoupons(params);
      set({
        coupons: response.data || response.coupons || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      // Handle network errors gracefully
      if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Failed to fetch')) {
        console.warn('Backend server is not running or unreachable');
        set({
          coupons: [],
          isLoading: false,
          error: null // Don't set error for network issues
        });
        return { data: [], coupons: [] };
      }
      
      // Handle permission/authorization errors
      if (error?.response?.status === 403 || error?.status === 403 || error?.message?.includes('not authorized') || error?.message?.includes('Access denied')) {
        const errorMessage = error?.response?.data?.message || error?.message || 'You do not have permission to access this resource. Admin access required.';
        set({
          isLoading: false,
          error: errorMessage,
          coupons: []
        });
        
        // Create a proper error object to throw
        const errorToThrow = {
          message: errorMessage,
          response: error?.response,
          status: 403,
          ...error
        };
        throw errorToThrow;
      }
      
      // Extract meaningful error message
      const errorMessage = error?.response?.data?.message || error?.message || error?.status || 'Failed to fetch coupons';
      set({
        isLoading: false,
        error: errorMessage,
        coupons: [] // Set empty array on error
      });
      
      // Create a proper error object to throw
      const errorToThrow = {
        message: errorMessage,
        response: error?.response,
        ...error
      };
      throw errorToThrow;
    }
  },

  createCoupon: async (couponData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.createCoupon(couponData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh coupons
      get().getAllCoupons();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create coupon'
      });
      throw error;
    }
  },

  updateCoupon: async (couponId, couponData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updateCoupon(couponId, couponData);
      set({
        isLoading: false,
        error: null
      });
      // Refresh coupons
      get().getAllCoupons();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update coupon'
      });
      throw error;
    }
  },

  deleteCoupon: async (couponId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.deleteCoupon(couponId);
      set({
        isLoading: false,
        error: null
      });
      // Refresh coupons
      get().getAllCoupons();
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete coupon'
      });
      throw error;
    }
  },

  // Consultation Management
  getAllConsultations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllConsultations(params);
      set({
        consultations: response.data || response.consultations || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Failed to fetch')) {
        console.warn('Backend server is not running or unreachable');
        set({
          consultations: [],
          isLoading: false,
          error: null
        });
        return { data: [], consultations: [] };
      }
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch consultations';
      set({
        isLoading: false,
        error: errorMessage,
        consultations: []
      });
      throw error;
    }
  },

  getAnalytics: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAnalytics(params);
      set({
        analytics: response.data || response.analytics,
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

  // Partners management
  partners: [],
  
  getPartners: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getPartners(params);
      set({
        partners: response.data || response.partners || [],
        pagination: response.pagination || get().pagination,
        isLoading: false,
        error: null
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch partners'
      });
      throw error;
    }
  },

  updatePartner: async (partnerId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updatePartner(partnerId, data);
      
      // Get the updated partner from response
      const updatedPartner = response.data || response.partner || response;
      
      // Update the partner in the local state immediately with deep merge
      set((state) => ({
        partners: state.partners.map(p => {
          if (p._id === partnerId || p._id?.toString() === partnerId?.toString()) {
            // Deep merge to ensure nested objects like metadata are properly updated
            return {
              ...p,
              ...updatedPartner,
              metadata: {
                ...(p.metadata || {}),
                ...(updatedPartner.metadata || {})
              },
              contactPerson: {
                ...(p.contactPerson || {}),
                ...(updatedPartner.contactPerson || {})
              },
              address: {
                ...(p.address || {}),
                ...(updatedPartner.address || {})
              }
            };
          }
          return p;
        }),
        isLoading: false,
        error: null
      }));
      
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update partner'
      });
      throw error;
    }
  },

  deletePartner: async (partnerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.deletePartner(partnerId);
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete partner'
      });
      throw error;
    }
  },

  // User management
  updateUserStatus: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updateUserStatus(userId, data);
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update user status'
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.deleteUser(userId);
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete user'
      });
      throw error;
    }
  },

  // Campaign review
  reviewCampaign: async (campaignId, status) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      const response = await adminService.reviewCampaign(campaignId, endpoint);
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to review campaign'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setPagination: (pagination) => set({ pagination })
}));

export default useAdminStore;



