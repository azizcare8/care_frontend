"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useCampaignStore from "@/store/campaignStore";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";
import { FaUniversity, FaCheckCircle, FaClock, FaTimes } from "react-icons/fa";
import { FiDollarSign, FiArrowLeft } from "react-icons/fi";

export default function WithdrawalsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { getUserCampaigns, userCampaigns } = useCampaignStore();

  const [activeTab, setActiveTab] = useState('request');
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [withdrawalForm, setWithdrawalForm] = useState({
    campaignId: '',
    amount: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: 'savings',
    upiId: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/withdrawals");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getUserCampaigns();
      loadWithdrawals();
    }
  }, [isAuthenticated, user]);

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getWithdrawals();
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();

    if (!withdrawalForm.campaignId || !withdrawalForm.amount) {
      toast.error('Please select campaign and enter amount');
      return;
    }

    if (!withdrawalForm.accountHolderName || !withdrawalForm.accountNumber || !withdrawalForm.ifscCode) {
      toast.error('Please fill all account details');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        campaignId: withdrawalForm.campaignId,
        amount: parseFloat(withdrawalForm.amount),
        accountDetails: {
          accountHolderName: withdrawalForm.accountHolderName,
          accountNumber: withdrawalForm.accountNumber,
          ifscCode: withdrawalForm.ifscCode,
          bankName: withdrawalForm.bankName,
          branchName: withdrawalForm.branchName,
          accountType: withdrawalForm.accountType,
          upiId: withdrawalForm.upiId
        }
      };

      await userService.requestWithdrawal(payload);
      toast.success('Withdrawal request submitted successfully!');

      // Reset form
      setWithdrawalForm({
        campaignId: '',
        amount: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'savings',
        upiId: ''
      });

      // Reload withdrawals
      loadWithdrawals();
      setActiveTab('history');

    } catch (error) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCampaign = userCampaigns.find(c => c._id === withdrawalForm.campaignId);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold transition-colors group cursor-pointer"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg shadow-lg p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <FiDollarSign className="text-9xl rotate-12" />
          </div>
          <div className="flex items-center gap-4">
            <FiDollarSign className="text-5xl" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Withdrawals & Payouts</h1>
              <p className="text-green-100">Request and track your campaign fund withdrawals</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('request')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'request'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
                }`}
            >
              Request Withdrawal
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${activeTab === 'history'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
                }`}
            >
              Withdrawal History
            </button>
          </div>
        </div>

        {/* Request Withdrawal Tab */}
        {activeTab === 'request' && (
          <div className="bg-white rounded-lg shadow-md p-6">

            <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
              {/* Campaign Selection */}




              <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Account Details</h3>

              {/* Account Holder Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={withdrawalForm.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="As per bank records"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={withdrawalForm.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={withdrawalForm.ifscCode}
                    onChange={handleInputChange}
                    placeholder="e.g., SBIN0001234"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={withdrawalForm.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., State Bank of India"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Branch Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={withdrawalForm.branchName}
                    onChange={handleInputChange}
                    placeholder="Enter branch name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <select
                    name="accountType"
                    value={withdrawalForm.accountType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                  </select>
                </div>

                {/* UPI ID (Optional) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={withdrawalForm.upiId}
                    onChange={handleInputChange}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Processing Information:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Withdrawal requests are reviewed within 24-48 hours</li>
                  <li>• Funds are transferred within 3-5 business days after approval</li>
                  <li>• Platform fee (2%) and processing charges apply</li>
                  <li>• TDS (1%) will be deducted as per government norms</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !withdrawalForm.campaignId || !withdrawalForm.amount}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Withdrawal Request'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Withdrawal History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdrawal History</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading withdrawals...</p>
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {withdrawal.campaign?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Requested on {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {withdrawal.status === 'completed' && <FaCheckCircle />}
                        {withdrawal.status === 'pending' && <FaClock />}
                        {withdrawal.status === 'rejected' && <FaTimes />}
                        {withdrawal.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Requested Amount</p>
                        <p className="font-bold text-gray-900">₹{withdrawal.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Platform Fee</p>
                        <p className="font-semibold text-gray-900">₹{withdrawal.fees?.platformFee || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Processing Fee</p>
                        <p className="font-semibold text-gray-900">₹{withdrawal.fees?.processingFee || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net Amount</p>
                        <p className="font-bold text-green-600">₹{withdrawal.fees?.netAmount?.toLocaleString() || 0}</p>
                      </div>
                    </div>

                    {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {withdrawal.rejectionReason}
                        </p>
                      </div>
                    )}

                    {withdrawal.status === 'completed' && withdrawal.transactionDetails?.utrNumber && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>UTR Number:</strong> {withdrawal.transactionDetails.utrNumber}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No withdrawal requests yet</p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Request Your First Withdrawal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




