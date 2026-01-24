"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";
import VendorWallet from "@/components/VendorWallet";
import dynamic from 'next/dynamic';
import { FiDollarSign, FiActivity, FiDownload, FiAward, FiMaximize, FiGift } from "react-icons/fi";

const RedeemCouponModal = dynamic(() => import("@/components/RedeemCouponModal"), {
  ssr: false,
  loading: () => null
});

export default function PartnerDashboard() {
  const router = useRouter();
  const { dashboardData, isLoading, user } = useDashboardData();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Partners use the same vendorStats structure from backend
  const stats = dashboardData.roleData?.vendorStats || {};
  const recentRedemptions = dashboardData.roleData?.recentRedemptions || [];

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
              Manage coupon redemptions and track settlements
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Earnings</p>
                    <p className="text-3xl font-black mt-1">₹{stats.totalEarnings?.toLocaleString() || 0}</p>
                  </div>
                  <FiDollarSign className="text-5xl text-emerald-200 opacity-60" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Coupons Redeemed</p>
                    <p className="text-3xl font-black mt-1">{stats.redeemedCount || 0}</p>
                  </div>
                  <FiActivity className="text-5xl text-blue-200 opacity-60" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl shadow-lg p-6 text-white hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
                    <p className="text-3xl font-black mt-1">₹{stats.pendingSettlement?.toLocaleString() || 0}</p>
                  </div>
                  <FiDownload className="text-5xl text-purple-200 opacity-60" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg p-6 text-white hover:scale-[1.02] transition-transform cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">Wallet Status</p>
                    <p className="text-2xl font-black mt-2 capitalize">{stats.walletStatus || 'Inactive'}</p>
                  </div>
                  <FiAward className="text-5xl text-orange-200 opacity-60" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-7 flex flex-wrap items-center justify-between gap-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-2xl">
                  <FiMaximize className="text-3xl text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Partner Terminal</h2>
                  <p className="text-gray-500 text-sm font-medium">Scan and redeem customer coupons to receive settlements</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowRedeemModal(true)}
                  className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-3 active:scale-95 text-lg"
                >
                  <FiMaximize size={24} />
                  Redeem Coupon
                </button>
                <button
                  onClick={() => router.push("/withdrawals")}
                  className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-lg"
                >
                  View Settlements
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <FiActivity className="text-green-600" />
                  Recent Redemptions
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 10 transactions</span>
              </div>

              <div className="p-6">
                {recentRedemptions.length > 0 ? (
                  <div className="space-y-4">
                    {recentRedemptions.map((redemption, index) => (
                      <div key={index} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:bg-green-50/30 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <FiGift className="text-2xl" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-green-600 transition-all">{redemption.couponTitle}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">#{redemption.couponCode} • {redemption.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-600">+₹{(redemption.amount || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {new Date(redemption.redeemedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiMaximize className="text-5xl text-gray-200" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Redemptions Yet</h4>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                      Start redeeming coupons from beneficiaries to see your earnings and settlements here.
                    </p>
                    <button
                      onClick={() => setShowRedeemModal(true)}
                      className="text-green-600 font-bold hover:underline"
                    >
                      Redeem your first coupon now →
                    </button>
                  </div>
                )}
              </div>
            </div>

            <VendorWallet key={refreshTrigger} />
          </div>
        </div>
      </div>

      {showRedeemModal && (
        <RedeemCouponModal
          onRedeemSuccess={() => setRefreshTrigger(prev => prev + 1)}
          onCancel={() => setShowRedeemModal(false)}
        />
      )}
    </div>
  );
}
