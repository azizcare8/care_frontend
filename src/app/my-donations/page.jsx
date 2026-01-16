"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import useDonationStore from "@/store/donationStore";
import api from "@/utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { FaDownload, FaEye, FaHeart, FaReceipt, FaSearch } from "react-icons/fa";

export default function MyDonationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { getUserDonations, userDonations, isLoading } = useDonationStore();
  
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to view your donations");
      router.push("/login?redirect=/my-donations");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getUserDonations();
    }
  }, [isAuthenticated, user, getUserDonations]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter donations
  const filteredDonations = userDonations.filter(donation => {
    const matchesStatus = filters.status === 'all' || donation.status === filters.status;
    const matchesSearch = !filters.search || 
      donation.campaign?.title?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalDonated = userDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = userDonations.filter(d => d.status === 'completed').length;
  const impactedCampaigns = new Set(userDonations.map(d => d.campaign?._id)).size;

  const handleDownloadReceipt = async (donationId) => {
    try {
      // Open receipt PDF in new tab
      const token = localStorage.getItem('token') || Cookies.get('token');
      // Use api instance baseURL to ensure consistency
      const apiBaseURL = api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${apiBaseURL}/donations/${donationId}/receipt?format=pdf&token=${token}`;
      window.open(url, '_blank');
      toast.success("Receipt download started!");
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const handleViewCampaign = (campaignId) => {
    router.push(`/campaigns/${campaignId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Donations</h1>
          <p className="text-green-100 text-lg">
            Track your impact and download receipts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Donated</p>
                <p className="text-3xl font-bold">₹{totalDonated.toLocaleString()}</p>
              </div>
              <div className="text-4xl opacity-20">💰</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Donations</p>
                <p className="text-3xl font-bold">{completedDonations}</p>
              </div>
              <div className="text-4xl opacity-20">🎯</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Campaigns Supported</p>
                <p className="text-3xl font-bold">{impactedCampaigns}</p>
              </div>
              <div className="text-4xl opacity-20">❤️</div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by campaign name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your donations...</p>
            </div>
          ) : filteredDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Beneficiary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <motion.tr
                      key={donation._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FaHeart className="text-red-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {donation.campaign?.title || 'Campaign'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {donation.isAnonymous ? 'Anonymous Donation' : 'Public Donation'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-green-600">
                          ₹{donation.amount?.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(donation.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-600">
                          {donation.paymentDetails?.transactionId || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {donation.beneficiary?.name || donation.purpose || 'General Support'}
                        </p>
                        {donation.beneficiary?.category && (
                          <p className="text-xs text-gray-500 capitalize">
                            {donation.beneficiary.category}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCampaign(donation.campaign?._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Campaign"
                          >
                            <FaEye />
                          </button>
                          {donation.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadReceipt(donation._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download Receipt"
                            >
                              <FaDownload />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Donations Yet</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all' 
                  ? 'No donations match your filters'
                  : 'Start making a difference by donating to a campaign'
                }
              </p>
              {!filters.search && filters.status === 'all' && (
                <button
                  onClick={() => router.push("/campaigns")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Browse Campaigns
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



