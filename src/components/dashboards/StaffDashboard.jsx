"use client";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";
import { FiTrendingUp, FiDollarSign, FiUsers, FiActivity } from "react-icons/fi";

export default function StaffDashboard() {
  const { dashboardData, isLoading, user } = useDashboardData();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const campaigns = dashboardData.campaigns || {};
  const donations = dashboardData.donations || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-20 lg:pt-32 pb-8 px-2">
        <div className="max-w-full mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-green-100">
              Staff dashboard for managing operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Campaigns</p>
                  <p className="text-3xl font-black mt-1">{campaigns.totalCampaigns || 0}</p>
                </div>
                <FiTrendingUp className="text-5xl text-blue-200 opacity-60" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Active Campaigns</p>
                  <p className="text-3xl font-black mt-1">{campaigns.activeCampaigns || 0}</p>
                </div>
                <FiActivity className="text-5xl text-emerald-200 opacity-60" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Total Raised</p>
                  <p className="text-3xl font-black mt-1">{campaigns.totalRaised?.toLocaleString() || 0}</p>
                </div>
                <FiDollarSign className="text-5xl text-purple-200 opacity-60" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">Total Donations</p>
                  <p className="text-3xl font-black mt-1">{donations.donationCount || 0}</p>
                </div>
                <FiUsers className="text-5xl text-orange-200 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
