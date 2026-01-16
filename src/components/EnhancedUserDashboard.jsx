"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import VendorWallet from "./VendorWallet";
import NavBar from "./NavBar";
import api from "@/utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { FiTrendingUp, FiDollarSign, FiUsers, FiGift, FiActivity, FiAward, FiDownload, FiPlus, FiMaximize } from "react-icons/fi";
import { FaReceipt, FaHandHoldingHeart, FaHeart } from "react-icons/fa";
// HMR Sync: v5 - Completely removed problematic FaWallet reference
import FundraiserCouponForm from "./FundraiserCouponForm";
import dynamic from 'next/dynamic';

// Dynamically import the Redeem Modal with SSR disabled to fix Turbopack module evaluation issues
const RedeemCouponModal = dynamic(() => import("./RedeemCouponModal"), {
  ssr: false,
  loading: () => null // Prevent flash of content during load
});
import { couponService } from "@/services/couponService";

export default function EnhancedUserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check authentication status - wait for hydration
    if (!isAuthenticated || !user) {
      // Give a delay to allow auth store to initialize
      const timer = setTimeout(() => {
        if (!isAuthenticated || !user) {
          router.push("/login?redirect=/dashboard");
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // Verify token exists before fetching
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in cookies, redirecting to login');
      const timer = setTimeout(() => {
        router.push("/login?redirect=/dashboard");
      }, 200);
      return () => clearTimeout(timer);
    }

    // Wait a bit to ensure token is set in cookies and state is synced
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 500); // Increased delay to ensure token is available

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Verify token exists before making request
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, redirecting to login');
        router.push('/login?redirect=/dashboard');
        return;
      }

      const response = await api.get("/users/dashboard");
      console.log("Dashboard API Response:", response.data);
      setDashboardData(response.data.data || response.data);
    } catch (error) {
      // Handle 401 errors - token expired or invalid
      if (error?.response?.status === 401) {
        console.warn('Authentication failed, redirecting to login');
        Cookies.remove('token');
        router.push('/login?redirect=/dashboard');
        return;
      }

      // Only log and show toast for other errors
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        console.error("Failed to load dashboard:", error);
        console.error("Error details:", error.response?.data || error.message);
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  // Show loading only if we don't have user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard even if data is still loading (use empty/default data)
  const displayData = dashboardData || {
    campaigns: { totalCampaigns: 0, activeCampaigns: 0, totalRaised: 0 },
    donations: { totalDonated: 0, donationCount: 0 },
    coupons: { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 },
    recentActivity: []
  };

  // Role-based dashboard content
  const renderDashboardContent = () => {
    switch (user.role) {
      case "vendor":
        return <VendorDashboard data={displayData} />;
      case "beneficiary":
        return <BeneficiaryDashboard data={displayData} />;
      case "donor":
        return <DonorDashboard data={displayData} />;
      case "volunteer":
        return <VolunteerDashboard data={displayData} />;
      case "fundraiser":
        return <FundraiserDashboardView data={displayData} />;
      default:
        return <DefaultDashboard data={displayData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavBar />

      <div className="pt-20 lg:pt-32 pb-8 px-2">
        <div className="max-w-full mx-auto">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-green-100">
              {user.role === "vendor" && "Manage your wallet and redeemed coupons"}
              {user.role === "beneficiary" && "Track your received donations and benefits"}
              {user.role === "donor" && "View your donation history and impact"}
              {user.role === "volunteer" && "Check your volunteer activities and certificates"}
              {user.role === "fundraiser" && "Monitor your campaigns and fundraising progress"}
              {!["vendor", "beneficiary", "donor", "volunteer", "fundraiser"].includes(user.role) && "Your personal dashboard"}
            </p>
          </div>

          {/* Role-specific content with key to force remount on role change */}
          <div key={user.role}>
            {renderDashboardContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vendor Dashboard
function VendorDashboard({ data }) {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  // Extract from roleData
  const stats = data.roleData?.vendorStats || {};
  const recentRedemptions = data.roleData?.recentRedemptions || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats Header */}
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
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Coupons Scanned</p>
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

      {/* Quick Action Bar */}
      <div className="bg-white rounded-2xl shadow-md p-7 flex flex-wrap items-center justify-between gap-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl">
            <FiMaximize className="text-3xl text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Vendor Terminal</h2>
            <p className="text-gray-500 text-sm font-medium">Scan customer coupons to receive instant credits</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRedeemModal(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-3 active:scale-95 text-lg"
          >
            <FiMaximize size={24} />
            Scan Coupon
          </button>
          <button
            onClick={() => router.push("/withdrawals")}
            className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-lg"
          >
            Claim Payout
          </button>
        </div>
      </div>

      {/* Main Content Section - Fundraiser Style List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FiActivity className="text-indigo-600" />
            Recent Redemptions
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 10 transactions</span>
        </div>

        <div className="p-6">
          {recentRedemptions.length > 0 ? (
            <div className="space-y-4">
              {recentRedemptions.map((redemption, index) => (
                <div key={index} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FiGift className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-all">{redemption.couponTitle}</p>
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
                Connect with beneficiaries and scan their coupons to start seeing your earnings here.
              </p>
              <button
                onClick={() => setShowRedeemModal(true)}
                className="text-indigo-600 font-bold hover:underline"
              >
                Scan your first coupon now →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Details Section */}
      <VendorWallet key={refreshTrigger} />

      {/* Redeem Coupon Modal */}
      {showRedeemModal && (
        <RedeemCouponModal
          onRedeemSuccess={() => setRefreshTrigger(prev => prev + 1)}
          onCancel={() => setShowRedeemModal(false)}
        />
      )}
    </div>
  );
}

// Beneficiary Dashboard
function BeneficiaryDashboard({ data }) {
  const stats = data.roleData?.beneficiaryStats || {};
  const myCoupons = data.roleData?.myCoupons || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-7 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Assistance</p>
              <p className="text-3xl font-black">₹{stats.totalAssistance?.toLocaleString() || "0"}</p>
            </div>
            <FaReceipt className="text-5xl text-blue-200 opacity-60" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-7 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Active Coupons</p>
              <p className="text-3xl font-black">{stats.activeCoupons || 0}</p>
            </div>
            <FiGift className="text-5xl text-emerald-200 opacity-60" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg p-7 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-bold uppercase tracking-widest mb-1">Platform Status</p>
              <p className="text-xl font-black mt-2">{data.user?.isVerified ? "✅ Verified" : "⏳ Pending"}</p>
            </div>
            <FiAward className="text-5xl text-purple-200 opacity-60" />
          </div>
        </div>
      </div>

      {/* Support Center Bar */}
      <div className="bg-white rounded-2xl shadow-md p-7 flex flex-wrap items-center justify-between gap-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-2xl">
            <FiUsers className="text-3xl text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">My Benefits</h2>
            <p className="text-gray-500 text-sm font-medium">Use your coupons at any authorized local partner store</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = "/support"}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-extrabold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center gap-2 active:scale-95"
          >
            Get Help
          </button>
        </div>
      </div>

      {/* Main Content - Coupons List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FiGift className="text-purple-600" />
            My Active Coupons
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available to use</span>
        </div>
        <div className="p-6">
          {myCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCoupons.map((coupon, index) => (
                <div key={index} className="flex items-center justify-between p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-purple-300 hover:bg-purple-50/20 transition-all group cursor-pointer" onClick={() => window.location.href = `/coupons/${coupon.code}`}>
                  <div className="flex items-center gap-5">
                    <div className="bg-white shadow-md p-4 rounded-xl border border-gray-100 group-hover:scale-110 transition-transform">
                      <FiMaximize className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 leading-tight">{coupon.title}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-tighter">{coupon.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-purple-600 text-lg">{coupon.value?.percentage ? `${coupon.value.percentage}%` : `₹${coupon.value?.amount}`}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">{coupon.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎫</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No Coupons Yet</h4>
              <p className="text-gray-500">Your assigned coupons will appear here once they are issued by a fundraiser.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Donor Dashboard
function DonorDashboard({ data }) {
  const router = useRouter();
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Extract from roleData
  const recentDonations = data.roleData?.recentDonations || [];
  const donationStats = data.donations || {};
  const couponStats = data.coupons || {};

  useEffect(() => {
    const fetchMyCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const response = await couponService.getMyCoupons({ limit: 10 });
        setCoupons(response.data || []);
      } catch (error) {
        console.error('Failed to load coupons:', error);
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchMyCoupons();
  }, [showCouponForm]);

  const handleCouponSuccess = () => {
    setShowCouponForm(false);
    toast.success('Coupon issued successfully!');
  };

  const handleDownloadReport = async (format = 'excel') => {
    try {
      if (format === 'excel') {
        const response = await api.get('/users/donations/report', {
          params: { format: 'excel' },
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        });
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tax-report-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("Excel report downloaded!");
      } else {
        toast.info("PDF format starting soon...");
      }
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">Total Donated</p>
              <p className="text-3xl font-black mt-1">₹{donationStats.totalDonated?.toLocaleString() || 0}</p>
            </div>
            <FaHeart className="text-5xl text-rose-200 opacity-60" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Donation Count</p>
              <p className="text-3xl font-black mt-1">{donationStats.donationCount || 0}</p>
            </div>
            <FiActivity className="text-5xl text-blue-200 opacity-60" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Coupons Issued</p>
              <p className="text-3xl font-black mt-1">{couponStats.totalCoupons || 0}</p>
            </div>
            <FiGift className="text-5xl text-purple-200 opacity-60" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">People Helped</p>
              <p className="text-3xl font-black mt-1">{couponStats.totalRedemptions || 0}</p>
            </div>
            <FiTrendingUp className="text-5xl text-emerald-200 opacity-60" />
          </div>
        </div>
      </div>

      {/* Impact Actions */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Impact Actions</h3>
            <p className="text-gray-500 font-medium">Choose how you want to make a difference today</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/campaigns")}
            className="group relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white p-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-rose-100 transition-all transform hover:-translate-y-1"
          >
            <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
              <FaHeart className="text-4xl" />
            </div>
            <span className="text-xl font-black">Donate Now</span>
          </button>

          <button
            onClick={() => setShowCouponForm(true)}
            className="group relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-indigo-100 transition-all transform hover:-translate-y-1"
          >
            <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
              <FiGift className="text-4xl" />
            </div>
            <span className="text-xl font-black">Issue Coupon</span>
          </button>

          <button
            onClick={() => handleDownloadReport('excel')}
            className="group relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-emerald-100 transition-all transform hover:-translate-y-1"
          >
            <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
              <FiDownload className="text-4xl" />
            </div>
            <span className="text-xl font-black">Tax Report</span>
          </button>
        </div>
      </div>

      {/* Main Content - History List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FaReceipt className="text-rose-500" />
              Recent Donations
            </h3>
            <button onClick={() => router.push('/my-donations')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="p-6">
            {recentDonations.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-rose-50/20 transition-all group">
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1 group-hover:text-rose-600 transition-colors">
                        {donation.campaign?.title || "General Fund"}
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">₹{donation.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-green-600 font-bold">SUCCESS</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-gray-400 font-medium italic">No donations found.</p>
            )}
          </div>
        </div>

        {/* Gifted Coupons */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FiGift className="text-indigo-600" />
              Gifted Coupons
            </h3>
            <button onClick={() => setShowCouponForm(true)} className="text-xs font-bold text-indigo-600 hover:underline">+ New</button>
          </div>
          <div className="p-6">
            {coupons.length > 0 ? (
              <div className="space-y-4">
                {coupons.map((coupon, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/20 transition-all group">
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{coupon.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono tracking-tighter">#{coupon.code}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {coupon.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-gray-400 font-medium italic">No coupons issued yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <FundraiserCouponForm
          onSuccess={handleCouponSuccess}
          onCancel={() => setShowCouponForm(false)}
        />
      )}
    </div>
  );
}

// Volunteer Dashboard
function VolunteerDashboard({ data }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Hours Volunteered</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FiActivity className="text-4xl text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Events Attended</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FiUsers className="text-4xl text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Certificates</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FiAward className="text-4xl text-blue-200" />
          </div>
        </div>
      </div>

      {/* Volunteer ID Card Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Volunteer ID Card</h3>
            <p className="text-gray-600">View and download your volunteer identification card</p>
          </div>
          <button
            onClick={() => router.push("/my-volunteer-card")}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 font-semibold shadow-lg"
          >
            <FiDownload size={20} />
            View ID Card
          </button>
        </div>
      </div>
    </div>
  );
}

// Fundraiser Dashboard View - Renamed to force HMR refresh
function FundraiserDashboardView({ data }) {
  const router = useRouter();
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const [totalRedeemedValue, setTotalRedeemedValue] = useState(0);

  // State to trigger manual refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      // 1. Fetch total redeemed value
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

      // 2. Fetch recent coupons
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Raised</p>
              <p className="text-3xl font-bold">₹{data.campaigns?.totalRaised?.toLocaleString() || "0"}</p>
            </div>
            <FiDollarSign className="text-4xl text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Campaigns</p>
              <p className="text-3xl font-bold">{data.campaigns?.activeCampaigns || 0}</p>
            </div>
            <FiTrendingUp className="text-4xl text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Campaigns</p>
              <p className="text-3xl font-bold">{data.campaigns?.totalCampaigns || 0}</p>
            </div>
            <FiUsers className="text-4xl text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">{data.campaigns?.pendingCampaigns || 0}</p>
            </div>
            <FiActivity className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Issue Coupon Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiGift className="text-green-600" />
            Issue Coupons to Beneficiaries
          </h2>
          <div className="flex items-center gap-3">
            {/* Redeemed Value Display (Badge Style) */}
            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="bg-green-100 p-2 rounded-lg">
                <FiDollarSign className="text-green-600 text-lg" />
              </div>
              <div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Total Redeemed</p>
                <p className="font-extrabold text-green-700 leading-none">₹{totalRedeemedValue.toLocaleString()}</p>
              </div>
            </div>

            {/* Account / Claim Payment Button */}
            <button
              onClick={() => {
                toast.success("Opening withdrawal portal...");
                router.push("/withdrawals");
              }}
              className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-green-600 hover:border-green-200 shadow-sm transition-all active:scale-95"
            >
              Claim Payment
            </button>

            {/* Redeem Coupon Button */}
            <button
              onClick={() => setShowRedeemModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-800 flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-bold"
            >
              <FiMaximize size={20} />
              Redeem Coupon
            </button>

            {/* Issue Coupon Button */}
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

        {/* My Coupons List */}
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
                      {coupon.value?.percentage ? `${coupon.value.percentage}% OFF` : `₹${coupon.value?.amount || '0'}`}
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

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <FundraiserCouponForm
          onSuccess={handleCouponSuccess}
          onCancel={() => setShowCouponForm(false)}
        />
      )}

      {/* Redeem Coupon Modal */}
      {showRedeemModal && (
        <RedeemCouponModal
          onRedeemSuccess={() => setRefreshTrigger(prev => prev + 1)}
          onCancel={() => setShowRedeemModal(false)}
        />
      )}
    </div>
  );
}

// Default Dashboard
function DefaultDashboard({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Donated</p>
          <p className="text-2xl font-bold text-gray-900">₹{data.donations?.totalDonated?.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Donations</p>
          <p className="text-2xl font-bold text-gray-900">{data.donations?.donationCount || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Coupons</p>
          <p className="text-2xl font-bold text-gray-900">{data.coupons?.totalCoupons || 0}</p>
        </div>
      </div>
    </div>
  );
}
