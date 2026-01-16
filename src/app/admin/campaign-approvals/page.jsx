"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';

export default function CampaignApprovalsPage() {
  const { canRender, isLoading: authLoading } = useAdminAuth();
  
  const {
    campaigns,
    isLoading,
    getAllCampaigns,
    approveCampaign,
    rejectCampaign
  } = useAdminStore();

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (canRender) {
      loadCampaigns();
    }
  }, [canRender]);

  const loadCampaigns = async () => {
    try {
      await getAllCampaigns({ status: 'pending' });
    } catch (error) {
      toast.error('Failed to load campaigns');
    }
  };

  if (authLoading || !canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const handleApproveClick = (campaign) => {
    setSelectedCampaign(campaign);
    setModalType('approve');
    setShowModal(true);
  };

  const handleRejectClick = (campaign) => {
    setSelectedCampaign(campaign);
    setModalType('reject');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedCampaign) return;

    if (modalType === 'reject' && !notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      if (modalType === 'approve') {
        await approveCampaign(selectedCampaign._id, notes);
        toast.success('Campaign approved successfully!');
      } else {
        await rejectCampaign(selectedCampaign._id, notes);
        toast.success('Campaign rejected');
      }

      setShowModal(false);
      setNotes('');
      setSelectedCampaign(null);
      await loadCampaigns();
    } catch (error) {
      toast.error(`Failed to ${modalType} campaign`);
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaign Approvals</h1>
        <nav className="text-gray-500 text-sm">
          <ol className="flex space-x-2 items-center">
            <li>
              <a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Campaign Approvals</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Campaigns ({campaigns.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Pending Campaigns
            </h3>
            <p className="text-gray-600">All campaigns have been reviewed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  {/* Campaign Image */}
                  <div className="flex-shrink-0">
                    {campaign.images && campaign.images[0] ? (
                      <img
                        src={campaign.images[0].url}
                        alt={campaign.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {campaign.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            {campaign.category}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">👤</span>
                            {campaign.fundraiser?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveClick(campaign)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(campaign)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {campaign.shortDescription}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Goal Amount</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{campaign.goalAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Beneficiary</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {campaign.beneficiary?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Fundraiser KYC Status */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.fundraiser?.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.fundraiser?.isVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.fundraiser?.kyc?.isCompleted
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.fundraiser?.kyc?.isCompleted ? 'KYC Complete' : 'KYC Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {modalType === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Campaign: <strong>{selectedCampaign?.title}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {modalType === 'approve' ? 'Verification Notes (Optional)' : 'Rejection Reason *'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={modalType === 'approve' ? 'Add any notes...' : 'Reason for rejection...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="4"
                required={modalType === 'reject'}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2 px-4 rounded-lg text-white ${
                  modalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}





