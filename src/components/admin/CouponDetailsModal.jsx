"use client";
import { useState, useEffect } from "react";
import { FiX, FiCopy, FiSend, FiEye, FiCalendar, FiTag, FiDollarSign } from "react-icons/fi";
import { BiQr } from "react-icons/bi";
import { couponService } from "@/services/couponService";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function CouponDetailsModal({ coupon, onClose }) {
  const [walletInfo, setWalletInfo] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      fetchCouponDetails();
    }
  }, [coupon]);

  const fetchCouponDetails = async () => {
    if (!coupon) return;
    
    setIsLoading(true);
    try {
      // Fetch wallet info if coupon has partner
      if (coupon.partner?._id || coupon.partner) {
        try {
          const partnerId = coupon.partner._id || coupon.partner;
          const partner = await api.get(`/partners/${partnerId}`);
          if (partner.data?.data?.user) {
            const walletRes = await api.get(`/wallets/${partner.data.data.user}`);
            setWalletInfo(walletRes.data?.data || walletRes.data);
          } else if (partner.data?.user) {
            // If user is directly in partner object
            const walletRes = await api.get(`/wallets/${partner.data.user}`);
            setWalletInfo(walletRes.data?.data || walletRes.data);
          }
        } catch (err) {
          console.log("No wallet found for this coupon:", err);
        }
      }

      // Get redemptions from coupon
      if (coupon.redemptions) {
        setRedemptions(coupon.redemptions || []);
      }
    } catch (error) {
      console.error("Error fetching coupon details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCouponValue = (coupon) => {
    if (!coupon?.value) return "N/A";
    
    if (coupon.value.isPercentage || coupon.value.percentage) {
      return `${coupon.value.percentage}% OFF`;
    } else if (coupon.value.amount) {
      if (typeof coupon.value.amount === 'number') {
        return `₹${coupon.value.amount}`;
      }
      return coupon.value.amount; // For free_item/service
    }
    return "N/A";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!coupon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">Coupon Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Coupon Code</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-lg text-gray-900">{coupon.code}</p>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="text-gray-400 hover:text-green-600"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                coupon.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {coupon.status || 'Active'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Title</p>
              <p className="font-semibold text-gray-900">{coupon.title}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Value</p>
              <p className="font-bold text-green-600 text-lg">{formatCouponValue(coupon)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-semibold text-gray-900 capitalize">
                {coupon.category?.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-semibold text-gray-900 capitalize">{coupon.type}</p>
            </div>
          </div>

          {/* Validity */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCalendar className="text-green-600" />
              Validity Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{formatDate(coupon.validity?.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">{formatDate(coupon.validity?.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiEye className="text-blue-600" />
              Usage Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Used</p>
                <p className="text-2xl font-bold text-blue-600">
                  {coupon.usage?.usedCount || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Max Uses</p>
                <p className="text-2xl font-bold text-green-600">
                  {coupon.usage?.isUnlimited ? '∞' : (coupon.usage?.maxUses || 0)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-purple-600">
                  {coupon.usage?.isUnlimited 
                    ? '∞' 
                    : Math.max(0, (coupon.usage?.maxUses || 0) - (coupon.usage?.usedCount || 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Info (if partner assigned) */}
          {coupon.partner && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiDollarSign className="text-green-600" />
                Vendor Wallet Status
              </h3>
              {isLoading ? (
                <p className="text-gray-500">Loading wallet info...</p>
              ) : walletInfo ? (
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Partner</p>
                      <p className="font-semibold">{coupon.partner?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wallet Balance</p>
                      <p className="font-bold text-green-600 text-lg">
                        ₹{walletInfo.currentBalance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Received</p>
                      <p className="font-semibold">₹{walletInfo.totalReceived?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Redeemed</p>
                      <p className="font-semibold">₹{walletInfo.totalRedeemed?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  {/* Check if this coupon is in wallet */}
                  {walletInfo.coupons?.some(c => c.coupon?._id === coupon._id || c.coupon?.toString() === coupon._id) && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        ✓ This coupon is in vendor's wallet
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No wallet found for this partner</p>
              )}
            </div>
          )}

          {/* Redemption History */}
          {redemptions.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Redemption History</h3>
              <div className="space-y-2">
                {redemptions.map((redemption, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">₹{redemption.amount || '0.00'}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(redemption.redeemedAt)}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Redeemed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code */}
          {coupon.qrCode?.url && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BiQr className="text-blue-600" />
                QR Code
              </h3>
              <div className="flex justify-center">
                <img
                  src={coupon.qrCode.url}
                  alt="Coupon QR Code"
                  className="w-48 h-48 border-4 border-green-500 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

