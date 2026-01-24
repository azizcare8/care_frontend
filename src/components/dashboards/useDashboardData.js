"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import api from "@/utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export function useDashboardData() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated || !user) {
      const timer = setTimeout(() => {
        if (!isAuthenticated || !user) {
          router.push('/login?redirect=/dashboard');
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      const timer = setTimeout(() => {
        router.push('/login?redirect=/dashboard');
      }, 200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      const response = await api.get("/users/dashboard");
      setDashboardData(response.data.data || response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        Cookies.remove('token');
        router.push('/login?redirect=/dashboard');
        return;
      }

      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData: dashboardData || {
      campaigns: { totalCampaigns: 0, activeCampaigns: 0, totalRaised: 0 },
      donations: { totalDonated: 0, donationCount: 0 },
      coupons: { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 },
      recentActivity: []
    },
    isLoading,
    user
  };
}
