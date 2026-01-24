"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import NavBar from "@/components/NavBar";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FiCamera, FiEdit2, FiCheckCircle, FiClock, FiDollarSign, FiX } from "react-icons/fi";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function PartnerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRedemptions: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0
  });
  const [redemptionRequests, setRedemptionRequests] = useState([]);
  const [redeemedCoupons, setRedeemedCoupons] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
      }
    };
  }, [showScanner]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [redemptionsData, couponsData] = await Promise.all([
        partnerService.getRedemptions(),
        partnerService.getCoupons()
      ]);

      setRedemptionRequests(redemptionsData.redemptionRequests || []);
      setRedeemedCoupons(couponsData.coupons || []);
      
      // Use stats from backend if available, otherwise calculate
      if (redemptionsData.stats) {
        setStats({
          totalRedemptions: redemptionsData.stats.total || 0,
          pending: redemptionsData.stats.pending || 0,
          approved: redemptionsData.stats.approved || 0,
          paid: redemptionsData.stats.paid || 0,
          totalAmount: redemptionsData.stats.totalAmount || 0,
          pendingAmount: redemptionsData.stats.pendingAmount || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setShowScanner(false);
    }
    await handleRedeem(decodedText);
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    await handleRedeem(manualCode);
    setShowManualInput(false);
    setManualCode("");
  };

  const handleRedeem = async (code) => {
    try {
      const loadingToast = toast.loading("Processing coupon...");
      const response = await partnerService.scanCoupon(code);
      toast.dismiss(loadingToast);
      
      toast.success(response.message || "Coupon redeemed successfully!");
      fetchDashboardData();
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to redeem coupon");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name || 'Partner'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Redemptions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-gray-900">{stats.paid}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Paid</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Amount</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending Amount</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center gap-3 p-6 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all transform hover:-translate-y-1"
            >
              <FiCamera size={24} />
              <span className="text-xl font-semibold">Scan QR Code</span>
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center justify-center gap-3 p-6 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-all transform hover:-translate-y-1"
            >
              <FiEdit2 size={24} />
              <span className="text-xl font-semibold">Enter Coupon Code</span>
            </button>
          </div>

          {/* Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <div id="reader" className="w-full"></div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Position the QR code within the frame to scan
                </p>
              </div>
            </div>
          )}

          {/* Manual Input Modal */}
          {showManualInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Enter Coupon Code</h3>
                  <button
                    onClick={() => setShowManualInput(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <form onSubmit={handleManualSubmit}>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. COUPON-1234-ABCD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Redeem Coupon
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Redemption Requests */}
          <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Redemption Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redemptionRequests.length > 0 ? (
                    redemptionRequests.map((request) => (
                      <tr key={request._id || request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          {request.couponId?.couponCode || request.couponCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(request.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              request.status === 'paid' ? 'bg-blue-100 text-blue-800' : 
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {request.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.processedAt ? formatDate(request.processedAt) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No redemption requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Redeemed Coupons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Redeemed Coupons ({redeemedCoupons.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {redeemedCoupons.map((coupon) => (
                <div key={coupon._id || coupon.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-mono font-bold text-gray-900 break-all">
                      {coupon.couponCode}
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {formatCurrency(coupon.amount)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Donor:</span>
                      <span className="font-medium text-gray-900">{coupon.userId?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Redeemed:</span>
                      <span className="text-gray-900">{formatDate(coupon.redeemedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 uppercase">
                        USED
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {redeemedCoupons.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No redeemed coupons found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
