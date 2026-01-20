"use client";
import { useState, useEffect } from "react";
import ClientLayout from "../ClientLayout";
import api from "@/utils/api";
import { FiTrendingUp, FiDollarSign, FiUsers, FiCheckCircle } from "react-icons/fi";

export default function TransparencyPage() {
  const [transparencyData, setTransparencyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  const fetchTransparencyData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/transparency/public");
      setTransparencyData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch transparency data:", error);
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

  if (!transparencyData) return null;

  const { overall, recentDonations, topBeneficiaries } = transparencyData;

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 pt-28 lg:pt-32 pb-12 px-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Donation Transparency</h1>
          <p className="text-xl text-gray-600">
            Complete transparency in how your donations are utilized
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiDollarSign className="text-4xl text-green-200" />
              <div className="text-right">
                <p className="text-green-100 text-sm">Total Donated</p>
                <p className="text-3xl font-bold">{overall.totalAmount?.toLocaleString() || "0"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiCheckCircle className="text-4xl text-blue-200" />
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total Assigned</p>
                <p className="text-3xl font-bold">{overall.totalAssigned?.toLocaleString() || "0"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiTrendingUp className="text-4xl text-purple-200" />
              <div className="text-right">
                <p className="text-purple-100 text-sm">Assignment Rate</p>
                <p className="text-3xl font-bold">{overall.assignmentRate || "0"}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="text-4xl text-orange-200" />
              <div className="text-right">
                <p className="text-orange-100 text-sm">Total Donations</p>
                <p className="text-3xl font-bold">{overall.totalDonations || "0"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Donations</h2>
            {recentDonations?.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-3 hover:bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {donation.campaign?.title || donation.donor?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Beneficiary: {donation.beneficiary?.name || "Multiple"}
                        </p>
                        {donation.transparency?.utilizationDetails && (
                          <p className="text-sm text-gray-500 mt-2">
                            {donation.transparency.utilizationDetails}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{donation.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent donations</p>
            )}
          </div>

          {/* Top Beneficiaries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Beneficiaries</h2>
            {topBeneficiaries?.length > 0 ? (
              <div className="space-y-4">
                {topBeneficiaries.map((beneficiary, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{beneficiary.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{beneficiary.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {beneficiary.assignedAmount?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Received: {beneficiary.receivedAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No beneficiaries yet</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
}

