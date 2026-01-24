"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";
import FundraiserCouponForm from "@/components/FundraiserCouponForm";
import dynamic from 'next/dynamic';
import { couponService } from "@/services/couponService";
import toast from "react-hot-toast";
import { FiTrendingUp, FiDollarSign, FiUsers, FiGift, FiActivity, FiPlus, FiMaximize } from "react-icons/fi";

const RedeemCouponModal = dynamic(() => import("@/components/RedeemCouponModal"), {
  ssr: false,
  loading: () => null
});

export default function FundraiserDashboard() {
  const router = useRouter();
  const { dashboardData, isLoading, user } = useDashboardData();
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [totalRedeemedValue, setTotalRedeemedValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      const fetchRedeemedStats = async () => {
        try {
          const response = await couponService.getMyCoupons({ limit: 100 });
          let allCoupons = [];
          if (Array.isArray(response.data)) allCoupons = response.data;
          else if (response.data?.data) allCoupons = response.data.data;
          else if (response.coupons) allCoupons = response.coupons;

          const total = allCoupons.reduce((sum, c) => {
            if (!c.value || c.value.isPercentage || c.value.percentage || c.type === 'percentage') return sum;
            const usedCount = Number(c.usage?.usedCount) || 0;
            const rawAmount = c.value?.amount;
            let amount = 0;
            if (typeof rawAmount === 'number') amount = rawAmount;
            else if (typeof rawAmount === 'string') amount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;
            const contribution = (usedCount * amount);
            return sum + (isNaN(contribution) ? 0 : contribution);
          }, 0);
          setTotalRedeemedValue(total);
        } catch (error) {
          console.error('Failed to fetch redeemed stats:', error);
        }
      };

      const fetchMyCoupons = async () => {
        try {
          setLoadingCoupons(true);
          const response = await couponService.getMyCoupons({ limit: 5 });
          setCoupons(response.data || []);
        } catch (error) {
          console.error('Failed to load coupons:', error);
        } finally {
          setLoadingCoupons(false);
        }
      };

      await Promise.all([fetchRedeemedStats(), fetchMyCoupons()]);
    };

    loadAllData();
  }, [showCouponForm, showRedeemModal, refreshTrigger]);

  const handleCouponSuccess = () => {
    setShowCouponForm(false);
    toast.success('Coupon created successfully!');
  };

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
              Monitor your campaigns and fundraising progress
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Raised</p>
                    <p className="text-3xl font-bold">{campaigns.totalRaised?.toLocaleString() || "0"}</p>
                  </div>
                  <FiDollarSign className="text-4xl text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Campaigns</p>
                    <p className="text-3xl font-bold">{campaigns.activeCampaigns || 0}</p>
                  </div>
                  <FiTrendingUp className="text-4xl text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Campaigns</p>
                    <p className="text-3xl font-bold">{campaigns.totalCampaigns || 0}</p>
                  </div>
                  <FiUsers className="text-4xl text-purple-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending</p>
                    <p className="text-3xl font-bold">{campaigns.pendingCampaigns || 0}</p>
                  </div>
                  <FiActivity className="text-4xl text-orange-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiGift className="text-green-600" />
                  Issue Coupons to Beneficiaries
                </h2>
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FiDollarSign className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Total Redeemed</p>
                      <p className="font-extrabold text-green-700 leading-none">{totalRedeemedValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toast.success("Opening withdrawal portal...");
                      router.push("/withdrawals");
                    }}
                    className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-green-600 hover:border-green-200 shadow-sm transition-all active:scale-95"
                  >
                    Claim Payment
                  </button>

                  <button
                    onClick={() => setShowRedeemModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-800 flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-bold"
                  >
                    <FiMaximize size={20} />
                    Redeem Coupon
                  </button>

                  <button
                    onClick={() => setShowCouponForm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-800 flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-bold"
                  >
                    <FiPlus size={20} />
                    Issue New Coupon
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Create and issue coupons to beneficiaries. Coupons can be redeemed at partner locations.
              </p>

              {loadingCoupons ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : coupons.length > 0 ? (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div key={coupon._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{coupon.title}</h3>
                          <p className="text-sm text-gray-600">Code: {coupon.code}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {coupon.value?.percentage ? `${coupon.value.percentage}% OFF` : `${coupon.value?.amount || '0'}`}
                            {' • '}
                            {coupon.category?.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                          coupon.status === 'redeemed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {coupon.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No coupons issued yet. Click "Issue New Coupon" to create one.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCouponForm && (
        <FundraiserCouponForm
          onSuccess={handleCouponSuccess}
          onCancel={() => setShowCouponForm(false)}
        />
      )}

      {showRedeemModal && (
        <RedeemCouponModal
          onRedeemSuccess={() => setRefreshTrigger(prev => prev + 1)}
          onCancel={() => setShowRedeemModal(false)}
        />
      )}
    </div>
  );
}
