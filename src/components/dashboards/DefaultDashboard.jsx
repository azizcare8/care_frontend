"use client";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";

export default function DefaultDashboard() {
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

  const donations = dashboardData.donations || {};
  const coupons = dashboardData.coupons || {};

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
              Your personal dashboard
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">{donations.totalDonated?.toLocaleString() || "0"}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Donations</p>
                <p className="text-2xl font-bold text-gray-900">{donations.donationCount || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Coupons</p>
                <p className="text-2xl font-bold text-gray-900">{coupons.totalCoupons || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
