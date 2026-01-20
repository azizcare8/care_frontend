"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import useAuthStore from "@/store/authStore";
import { FiTrendingUp, FiDollarSign, FiUsers, FiGift, FiActivity, FiBarChart2 } from "react-icons/fi";
import { FaDownload, FaEye } from "react-icons/fa";

export default function FundraiserDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardRes, campaignsRes, donationsRes] = await Promise.all([
        api.get("/users/dashboard"),
        api.get("/campaigns", { params: { myCampaigns: true } }),
        api.get("/donations", { params: { campaignOwner: true } })
      ]);

      setDashboardData(dashboardRes.data.data);
      setCampaigns(campaignsRes.data.data || campaignsRes.data.campaigns || []);
      setDonations(donationsRes.data.data || donationsRes.data.donations || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const campaignStats = dashboardData?.campaigns || {};
  const totalRaised = campaignStats.totalRaised || 0;
  const activeCampaigns = campaignStats.activeCampaigns || 0;
  const totalDonors = donations.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Fundraiser Dashboard</h1>
          <p className="text-green-100">Manage your campaigns, track donations, and issue coupons</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Raised</p>
                <p className="text-3xl font-bold">{totalRaised.toLocaleString()}</p>
              </div>
              <FiDollarSign className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold">{activeCampaigns}</p>
              </div>
              <FiActivity className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Donors</p>
                <p className="text-3xl font-bold">{totalDonors}</p>
              </div>
              <FiUsers className="text-4xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Campaigns</p>
                <p className="text-3xl font-bold">{campaignStats.totalCampaigns || 0}</p>
              </div>
              <FiBarChart2 className="text-4xl text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaigns */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Campaigns</h2>
              <button
                onClick={() => router.push("/startfundraiser")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                + New Campaign
              </button>
            </div>
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{campaign.currentAmount?.toLocaleString() || 0} raised</span>
                          <span>Goal: {campaign.goalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/campaigns/${campaign._id}`)}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No campaigns yet</p>
            )}
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
              <button
                onClick={() => router.push("/my-donations")}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                View All
              </button>
            </div>
            {donations.length > 0 ? (
              <div className="space-y-3">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {donation.isAnonymous ? "Anonymous" : donation.donor?.name || "Donor"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {donation.campaign?.title || "Campaign"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{donation.amount?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${donation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {donation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No donations yet</p>
            )}
          </div>
        </div>

        {/* Issue Coupon Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Issue Coupons</h2>
            <button
              onClick={() => router.push("/admin/create-coupon")}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700"
            >
              + Issue New Coupon
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            You can issue coupons to beneficiaries or donors. Coupons can be sent via WhatsApp, Email, or SMS.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/admin/create-coupon?type=beneficiary")}
              className="p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors text-left"
            >
              <FiGift className="text-green-600 text-2xl mb-2" />
              <h3 className="font-semibold text-gray-900">Issue to Beneficiary</h3>
              <p className="text-sm text-gray-600">Create coupon for a beneficiary</p>
            </button>
            <button
              onClick={() => router.push("/admin/create-coupon?type=donor")}
              className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <FiUsers className="text-blue-600 text-2xl mb-2" />
              <h3 className="font-semibold text-gray-900">Issue to Donor</h3>
              <p className="text-sm text-gray-600">Create coupon for a donor</p>
            </button>
            <button
              onClick={() => router.push("/admin/coupons")}
              className="p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors text-left"
            >
              <FiActivity className="text-purple-600 text-2xl mb-2" />
              <h3 className="font-semibold text-gray-900">View All Coupons</h3>
              <p className="text-sm text-gray-600">Manage your issued coupons</p>
            </button>
          </div>
        </div>

        {/* Analytics Link */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.slice(0, 3).map((campaign) => (
              <button
                key={campaign._id}
                onClick={() => router.push(`/campaigns/${campaign._id}/analytics`)}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>View Analytics</span>
                  <FiBarChart2 className="text-green-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

