"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import NavBar from "@/components/NavBar";
import couponSystemService from "@/services/couponSystemService";
import toast from "react-hot-toast";
import { FiPlus, FiX, FiDownload, FiShare2, FiEye } from "react-icons/fi";
import jsPDF from "jspdf";

export default function DonorDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    amount: '',
    beneficiaryName: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCoupons();
  }, [user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponSystemService.getMyCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      toast.error(error.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (couponId) => {
    try {
      const response = await couponSystemService.getCouponById(couponId);
      setSelectedCoupon(response.data);
      setShowCouponModal(true);
    } catch (error) {
      console.error('Failed to fetch coupon details:', error);
      toast.error(error.message || 'Failed to load coupon details');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      if (!createFormData.amount) {
        toast.error('Please enter amount');
        return;
      }
      if (!createFormData.beneficiaryName) {
        toast.error('Please enter beneficiary name');
        return;
      }
      
      // Auto-generate payment ID and set status
      const payload = {
        amount: createFormData.amount,
        beneficiaryName: createFormData.beneficiaryName,
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paymentStatus: 'completed'
      };

      await couponSystemService.createCoupon(payload);
      toast.success('Coupon created successfully!');
      setShowCreateModal(false);
      setCreateFormData({ amount: '', beneficiaryName: '' });
      fetchCoupons();
    } catch (error) {
      console.error('Failed to create coupon:', error);
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleDownloadCoupon = async (coupon) => {
    try {
      let couponData = coupon;
      
      // If QR code is missing (likely from list view), fetch full details
      if (!coupon.qrCode) {
         const response = await couponSystemService.getCouponById(coupon._id || coupon.id);
         couponData = response.data;
      }

      const doc = new jsPDF();
      
      // Set background color (light gray)
      doc.setFillColor(240, 253, 244); // Green-50
      doc.rect(0, 0, 210, 297, 'F');
      
      // Add white card background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 20, 170, 257, 3, 3, 'F');
      
      // Add border to card
      doc.setDrawColor(22, 163, 74); // Green-600
      doc.setLineWidth(1);
      doc.roundedRect(20, 20, 170, 257, 3, 3, 'S');
      
      // Header Section
      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74); // Green-600
      doc.setFont("helvetica", "bold");
      doc.text("Care Foundation", 105, 45, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.setFont("helvetica", "normal");
      doc.text("Donation Coupon", 105, 55, { align: "center" });
      
      // Decorative line
      doc.setDrawColor(22, 163, 74); // Green-600
      doc.setLineWidth(0.5);
      doc.line(40, 65, 170, 65);
      
      let yPos = 85;
      
      // Beneficiary Section
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text("Beneficiary", 105, yPos, { align: "center" });
      yPos += 8;
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.setFont("helvetica", "bold");
      doc.text(couponData.beneficiaryName || 'N/A', 105, yPos, { align: "center" });
      yPos += 18;

      // Amount Section
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Amount", 105, yPos, { align: "center" });
      yPos += 8;
      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74); // Green-600
      doc.setFont("helvetica", "bold");
      doc.text(`Rs. ${parseFloat(couponData.amount).toFixed(2)}`, 105, yPos, { align: "center" });
      yPos += 18;

      // Coupon Code Section
      doc.setFillColor(220, 252, 231); // Green-100
      doc.roundedRect(65, yPos - 5, 80, 18, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setTextColor(21, 128, 61); // Green-700
      doc.setFont("courier", "bold");
      doc.text(couponData.couponCode, 105, yPos + 7, { align: "center" });
      yPos += 22;

      // Status Badge
      const status = couponData.status?.toUpperCase() || 'PENDING';
      let statusColor = [107, 114, 128]; // Gray
      if (status === 'ACTIVE') statusColor = [21, 128, 61]; // Green
      else if (status === 'USED') statusColor = [29, 78, 216]; // Blue
      else if (status === 'EXPIRED') statusColor = [185, 28, 28]; // Red

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(status, 105, yPos, { align: "center" });
      yPos += 10;

      // Expiry
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Expires: ${formatDate(couponData.expiryDate)}`, 105, yPos, { align: "center" });
      yPos += 15;

      // QR Code
      if (couponData.qrCode?.url || couponData.qrCode) {
        const qrUrl = couponData.qrCode?.url || couponData.qrCode;
        if (qrUrl.startsWith('data:image')) {
            doc.addImage(qrUrl, 'PNG', 75, yPos, 60, 60);
        }
      }

      // Footer
      const footerY = 255;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.text("Present this coupon to a partner to redeem.", 105, footerY, { align: "center" });
      doc.text("Care Foundation", 105, footerY + 5, { align: "center" });
      
      doc.save(`coupon-${couponData.couponCode}.pdf`);
      toast.success('Coupon downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download coupon');
    }
  };

  const handleShareCoupon = async (coupon) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Care Foundation Coupon',
          text: `Here is a coupon for ${coupon.beneficiaryName} worth ₹${coupon.amount}. Code: ${coupon.couponCode}`,
          url: window.location.href, // Or a specific redemption URL if available
        });
        toast.success('Shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share error:', error);
            toast.error('Failed to share');
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Coupon for ${coupon.beneficiaryName}: ${coupon.couponCode} - ₹${coupon.amount}`);
      toast.success('Coupon details copied to clipboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    used: coupons.filter(c => c.status === 'used').length,
    expired: coupons.filter(c => c.status === 'expired').length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
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
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email || 'User'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Total Coupons</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Active</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.used}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Used</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.expired}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Expired</div>
            </div>
          </div>

          {/* Create New Coupon Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 font-semibold shadow-lg"
          >
            <FiPlus />
            Create New Coupon
          </button>

          {/* My Coupons Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Coupons</h2>
            {coupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon._id || coupon.id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          coupon.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : coupon.status === 'used'
                            ? 'bg-blue-100 text-blue-700'
                            : coupon.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {coupon.status?.toUpperCase() || 'PENDING'}
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(coupon.amount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                        <div className="text-sm text-gray-500">Beneficiary</div>
                        <div className="text-lg font-semibold text-gray-900">
                            {coupon.beneficiaryName || 'N/A'}
                        </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-base font-mono font-semibold text-gray-900 mb-2">
                        {coupon.couponCode}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">
                        Expires: {formatDate(coupon.expiryDate)}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleShareCoupon(coupon)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Share"
                      >
                        <FiShare2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDownloadCoupon(coupon)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Download"
                      >
                        <FiDownload size={20} />
                      </button>
                      <button
                        onClick={() => handleViewDetails(coupon._id || coupon.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        <FiEye /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No coupons found.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Your First Coupon
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Donation Coupon</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.beneficiaryName}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, beneficiaryName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter beneficiary name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={createFormData.amount}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Details Modal */}
      {showCouponModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Coupon Details</h3>
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  setSelectedCoupon(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Beneficiary:</label>
                <div className="text-base font-semibold text-gray-900 mt-1">
                  {selectedCoupon.beneficiaryName || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Coupon Code:</label>
                <div className="text-base font-mono font-semibold text-gray-900 mt-1">
                  {selectedCoupon.couponCode}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount:</label>
                <div className="text-base font-semibold text-gray-900 mt-1">
                  {formatCurrency(selectedCoupon.amount)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status:</label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      selectedCoupon.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : selectedCoupon.status === 'used'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedCoupon.status === 'expired'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedCoupon.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Expiry Date:</label>
                <div className="text-base text-gray-900 mt-1">
                  {formatDate(selectedCoupon.expiryDate)}
                </div>
              </div>
              {selectedCoupon.qrCode && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-600 block mb-3">
                    QR Code:
                  </label>
                  <div className="flex justify-center mb-3">
                    <img
                      src={selectedCoupon.qrCode.url || selectedCoupon.qrCode}
                      alt="QR Code"
                      className="w-64 h-64 border border-gray-200 rounded-lg p-2"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Show this QR code to the partner to redeem your coupon
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-6">
                 <button
                    onClick={() => handleShareCoupon(selectedCoupon)}
                    className="flex-1 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors flex justify-center items-center gap-2"
                  >
                    <FiShare2 /> Share
                  </button>
                  <button
                    onClick={() => handleDownloadCoupon(selectedCoupon)}
                    className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex justify-center items-center gap-2"
                  >
                    <FiDownload /> Download
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}