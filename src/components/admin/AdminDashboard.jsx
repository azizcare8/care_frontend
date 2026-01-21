"use client";

import React, { useEffect } from "react";
import { BiCart, BiRupee, BiTrendingUp, BiCheckCircle } from "react-icons/bi";
import { BsPeople, BsHeart, BsAward } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi";
import useAdminStore from "@/store/adminStore";
import AdminFooter from "./AdminFooter";

export default function AdminDashboard() {
  const {
    dashboardStats,
    isLoading,
    error,
    getDashboardStats
  } = useAdminStore();

  useEffect(() => {
    // Load stats on mount
    const loadStats = async () => {
      try {
        const response = await getDashboardStats();
        console.log('Dashboard Stats Loaded:', response?.data);
        console.log('Food Partners Count:', response?.data?.overview?.foodPartners);
        console.log('Health Partners Count:', response?.data?.overview?.healthPartners);
      } catch (error) {
        // Don't log 401 errors - they're handled by the store
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Failed to load dashboard stats:', error);
        }
      }
    };
    
    // Wait a bit to ensure token is available
    const timer = setTimeout(() => {
      loadStats();
    }, 200);

    // Refresh stats when window gains focus (user returns to tab)
    const handleFocus = () => {
      getDashboardStats().catch(err => {
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.error('Failed to refresh stats:', err);
        }
      });
    };

    // Refresh stats periodically (every 30 seconds)
    const interval = setInterval(() => {
      getDashboardStats().catch(err => {
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          console.error('Failed to refresh stats:', err);
        }
      });
    }, 30000); // 30 seconds

    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [getDashboardStats]);

  // Ensure we have default stats to prevent UI from breaking
  const stats = dashboardStats || {
    overview: {
      totalUsers: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      totalDonations: 0,
      totalCoupons: 0,
      volunteers: 0,
      foodPartners: 0,
      healthPartners: 0
    },
    financial: {
      totalRaised: 0
    }
  };

  const cards = [
    {
      title: "Total Users",
      count: stats?.overview?.totalUsers || 0,
      icon: <FiUsers size={24} />,
      bg: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Campaigns",
      count: stats?.overview?.activeCampaigns || 0,
      icon: <BsHeart size={24} />,
      bg: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Donations",
      count: `₹ ${(stats?.financial?.totalRaised || 0).toLocaleString("en-IN")}`,
      icon: <BiRupee size={24} />,
      bg: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Volunteers",
      count: stats?.overview?.volunteers || 0,
      icon: <BsPeople size={24} />,
      bg: "bg-orange-100 text-orange-600",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Food Partners",
      count: stats?.overview?.foodPartners || 0,
      icon: <BiCart size={24} />,
      bg: "bg-pink-100 text-pink-600",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      title: "Health Partners",
      count: stats?.overview?.healthPartners || 0,
      icon: <BsAward size={24} />,
      bg: "bg-teal-100 text-teal-600",
      gradient: "from-teal-500 to-teal-600",
    },
    {
      title: "Coupons Generated",
      count: stats?.overview?.totalCoupons || 0,
      icon: <HiOutlineTicket size={24} />,
      bg: "bg-indigo-100 text-indigo-600",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Completed Campaigns",
      count: stats?.overview?.completedCampaigns || 0,
      icon: <BiCheckCircle size={24} />,
      bg: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-green-600",
    },
  ];

  if (isLoading && !dashboardStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error only if it's not a 401/403 (auth errors are handled by redirect)
  if (error && !error.includes('401') && !error.includes('403')) {
    return (
      <div className="min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Always show dashboard UI, even if stats are loading or null
  return (
    <>
      <div className="grid grid-cols-1 mt-5 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-2 border-gray-100 hover:border-transparent hover:scale-105 cursor-pointer overflow-hidden relative backdrop-blur-sm"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-300">
                  {card.count}
                </h3>
              </div>
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-lg ${card.bg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md group-hover:shadow-lg`}
              >
                {card.icon}
              </div>
            </div>
            
            {/* Animated bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl`}></div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {/* <AdminFooter /> */}
      </div>
    </>
  );
}


// Beneficiary Form: /forms/beneficiary
// Vendor Form: /forms/vendor