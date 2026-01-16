import { useEffect, useState } from 'react';
import useAdminStore from '@/store/adminStore';

// Custom hook for admin data management
export const useAdminData = () => {
  const {
    dashboardStats,
    campaigns,
    donations,
    users,
    coupons,
    consultations,
    analytics,
    isLoading,
    error,
    getDashboardStats,
    getAllCampaigns,
    getAllDonations,
    getAllUsers,
    getAllCoupons,
    getAllConsultations,
    getAnalytics,
    clearError
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          getDashboardStats(),
          getAllCampaigns({ page: 1, limit: 5 }),
          getAllDonations({ page: 1, limit: 5 }),
          getAllUsers({ page: 1, limit: 5 }),
          getAllCoupons({ page: 1, limit: 5 }),
          getAllConsultations({ page: 1, limit: 5 })
        ]);
      } catch (error) {
        console.error('Failed to load initial admin data:', error);
      }
    };

    loadInitialData();
  }, [getDashboardStats, getAllCampaigns, getAllDonations, getAllUsers, getAllCoupons, getAllConsultations]);

  // Load analytics when needed
  const loadAnalytics = async (params = {}) => {
    try {
      await getAnalytics(params);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    try {
      await Promise.all([
        getDashboardStats(),
        getAllCampaigns({ page: 1, limit: 5 }),
        getAllDonations({ page: 1, limit: 5 }),
        getAllUsers({ page: 1, limit: 5 }),
        getAllCoupons({ page: 1, limit: 5 }),
        getAllConsultations({ page: 1, limit: 5 })
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Load more data for specific tabs
  const loadMoreData = async (type, params = {}) => {
    try {
      switch (type) {
        case 'campaigns':
          await getAllCampaigns(params);
          break;
        case 'donations':
          await getAllDonations(params);
          break;
        case 'users':
          await getAllUsers(params);
          break;
        case 'coupons':
          await getAllCoupons(params);
          break;
        case 'consultations':
          await getAllConsultations(params);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to load more ${type}:`, error);
    }
  };

  return {
    // Data
    dashboardStats,
    campaigns,
    donations,
    users,
    coupons,
    consultations,
    analytics,
    
    // State
    isLoading,
    error,
    activeTab,
    
    // Actions
    setActiveTab,
    clearError,
    loadAnalytics,
    refreshData,
    loadMoreData,
    
    // Direct store actions
    getDashboardStats,
    getAllCampaigns,
    getAllDonations,
    getAllUsers,
    getAllCoupons,
    getAllConsultations,
    getAnalytics
  };
};









