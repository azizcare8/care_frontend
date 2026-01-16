"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiPlus, BiWallet, BiUpArrow, BiDownArrowAlt } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function WalletManagement() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [vendorType, setVendorType] = useState("other");
  const [createMode, setCreateMode] = useState("user"); // "user" or "partner"

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (showCreateWalletModal) {
      if (createMode === 'user') {
        fetchAvailableVendors();
      } else {
        fetchAvailablePartners();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateWalletModal, createMode]);

  const fetchAvailableVendors = async () => {
    try {
      setLoadingVendors(true);
      console.log('Fetching available vendors...');
      
      // Fetch users with partner or vendor role who don't have wallets
      const [partnerResponse, vendorResponse] = await Promise.all([
        api.get('/admin/users', { params: { role: 'partner', limit: 100 } }),
        api.get('/admin/users', { params: { role: 'vendor', limit: 100 } })
      ]);
      
      console.log('Partner users response:', partnerResponse.data);
      console.log('Vendor users response:', vendorResponse.data);
      
      // Handle different response formats
      const partnerUsers = partnerResponse.data?.data || partnerResponse.data?.users || [];
      const vendorUsers = vendorResponse.data?.data || vendorResponse.data?.users || [];
      
      const allUsers = [...partnerUsers, ...vendorUsers];
      console.log('All users found:', allUsers.length);
      
      // Filter out users who already have wallets
      const existingWalletVendorIds = wallets.map(w => {
        const vendorId = w.vendor?._id || w.vendor;
        return vendorId?.toString ? vendorId.toString() : vendorId;
      });
      
      console.log('Existing wallet vendor IDs:', existingWalletVendorIds);
      
      const availableUsers = allUsers.filter(user => {
        const userId = user._id?.toString ? user._id.toString() : user._id;
        return !existingWalletVendorIds.includes(userId);
      });
      
      console.log('Available users (without wallets):', availableUsers.length);
      setAvailableVendors(availableUsers);
      
      if (availableUsers.length === 0 && allUsers.length > 0) {
        toast('All vendors already have wallets', { icon: 'ℹ️' });
      } else if (allUsers.length === 0) {
        toast('No users with partner/vendor role found. Please create user accounts first.', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to load available vendors');
      setAvailableVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      setLoadingVendors(true);
      console.log('Fetching available partners...');
      
      const response = await api.get('/admin/partners', { 
        params: { status: 'approved', limit: 100 } 
      });
      
      console.log('Partners response:', response.data);
      
      const partners = response.data?.data || response.data?.partners || [];
      console.log('All partners found:', partners.length);
      
      // Filter out partners who already have wallets (by checking if they have user accounts with wallets)
      const existingWalletVendorIds = wallets.map(w => {
        const vendorId = w.vendor?._id || w.vendor;
        return vendorId?.toString ? vendorId.toString() : vendorId;
      });
      
      // Get all users with partner/vendor role to check which partners have user accounts
      const [partnerUsers, vendorUsers] = await Promise.all([
        api.get('/admin/users', { params: { role: 'partner', limit: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/admin/users', { params: { role: 'vendor', limit: 100 } }).catch(() => ({ data: { data: [] } }))
      ]);
      
      const allUsers = [
        ...(partnerUsers.data?.data || []),
        ...(vendorUsers.data?.data || [])
      ];
      
      // Map partner emails to user IDs
      const partnerEmailToUserId = {};
      allUsers.forEach(user => {
        if (user.email) {
          partnerEmailToUserId[user.email.toLowerCase()] = user._id?.toString ? user._id.toString() : user._id;
        }
      });
      
      // Filter partners: exclude those whose user accounts already have wallets
      const availablePartnersList = partners.filter(partner => {
        const partnerEmail = partner.email?.toLowerCase();
        if (!partnerEmail) return false;
        
        const userId = partnerEmailToUserId[partnerEmail];
        if (!userId) return true; // Partner doesn't have user account, can create wallet
        
        return !existingWalletVendorIds.includes(userId);
      });
      
      console.log('Available partners (without wallets):', availablePartnersList.length);
      setAvailablePartners(availablePartnersList);
      
      if (availablePartnersList.length === 0 && partners.length > 0) {
        toast('All approved partners already have wallets or user accounts with wallets', { icon: 'ℹ️' });
      } else if (partners.length === 0) {
        toast('No approved partners found. Please approve partners first.', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to load available partners');
      setAvailablePartners([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleCreateWallet = async () => {
    if (createMode === 'user' && !selectedVendorId) {
      toast.error('Please select a vendor');
      return;
    }
    if (createMode === 'partner' && !selectedPartnerId) {
      toast.error('Please select a partner');
      return;
    }

    try {
      const walletData = {
        vendorType: vendorType
      };
      
      if (createMode === 'user') {
        walletData.vendor = selectedVendorId;
      } else {
        walletData.partnerId = selectedPartnerId;
      }
      
      await api.post('/wallets', walletData);
      toast.success('Wallet created successfully!');
      setShowCreateWalletModal(false);
      setSelectedVendorId('');
      setSelectedPartnerId('');
      setVendorType('other');
      setCreateMode('user');
      fetchWallets();
    } catch (error) {
      console.error('Create wallet error:', error);
      toast.error(error.response?.data?.message || 'Failed to create wallet');
    }
  };

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/wallets");
      console.log("Wallets API Response:", response.data);
      // Handle both response formats: { success: true, data: [...] } or { data: [...] }
      const walletsData = response.data.data || response.data.wallets || response.data || [];
      setWallets(Array.isArray(walletsData) ? walletsData : []);
      
      if (walletsData.length === 0) {
        console.log("No wallets found in database");
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to load wallets");
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await api.post(`/wallets/${selectedWallet.vendor._id}/topup`, {
        amount: parseFloat(topupAmount),
        description: description || "Admin top-up"
      });
      toast.success("Wallet topped up successfully!");
      setShowTopupModal(false);
      setTopupAmount("");
      setDescription("");
      setSelectedWallet(null);
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to top-up wallet");
    }
  };

  const handleSettle = async () => {
    if (!settleAmount || parseFloat(settleAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(settleAmount) > selectedWallet.currentBalance) {
      toast.error("Settlement amount cannot exceed current balance");
      return;
    }
    try {
      await api.post(`/wallets/${selectedWallet.vendor._id}/settle`, {
        amount: parseFloat(settleAmount),
        description: description || "Admin settlement"
      });
      toast.success("Wallet settled successfully!");
      setShowSettleModal(false);
      setSettleAmount("");
      setDescription("");
      setSelectedWallet(null);
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to settle wallet");
    }
  };

  const filteredWallets = wallets.filter(wallet =>
    wallet.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.vendor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.vendorType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Vendor Wallet Management
          </h1>
          <p className="text-sm text-gray-600">Manage vendor wallets, top-up, and settlements</p>
        </div>
        <button
          onClick={() => setShowCreateWalletModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center gap-2"
        >
          <BiPlus size={18} />
          Create Wallet
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by vendor name, email, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-900"
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Total Received</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Total Settled</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BiWallet className="text-6xl text-gray-300" />
                      <p className="text-gray-500 text-lg font-medium">
                        {wallets.length === 0 
                          ? "No wallets found in database" 
                          : "No wallets match your search"}
                      </p>
                      {wallets.length === 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Wallets are automatically created when coupons are sent to partners with user accounts. 
                            If you sent a coupon but don't see a wallet, the partner may not have a linked user account.
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWallets.map((wallet, idx) => (
                  <tr
                    key={wallet._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{wallet.vendor?.name || "N/A"}</div>
                      <div className="text-xs text-gray-500">{wallet.vendor?.email || ""}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-600 text-white whitespace-nowrap">
                        {wallet.vendorType?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Other"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600">₹{wallet.currentBalance?.toFixed(2) || "0.00"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{wallet.totalReceived?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{wallet.totalSettled?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center ${
                          wallet.status === "active"
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : wallet.status === "suspended"
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {wallet.status?.charAt(0).toUpperCase() + wallet.status?.slice(1) || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet);
                            setTopupAmount("");
                            setDescription("");
                            setShowTopupModal(true);
                          }}
                          className="flex items-center justify-center p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg min-w-[40px] h-[28px]"
                          title="Top-up"
                        >
                          <BiUpArrow size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet);
                            setSettleAmount("");
                            setDescription("");
                            setShowSettleModal(true);
                          }}
                          className="flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg min-w-[40px] h-[28px]"
                          title="Settle"
                        >
                          <BiDownArrowAlt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopupModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Top-up Wallet</h2>
              <button
                onClick={() => {
                  setShowTopupModal(false);
                  setSelectedWallet(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <input
                  type="text"
                  value={selectedWallet.vendor?.name || ""}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleTopup}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Top-up
                </button>
                <button
                  onClick={() => {
                    setShowTopupModal(false);
                    setSelectedWallet(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {showSettleModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Settle Wallet</h2>
              <button
                onClick={() => {
                  setShowSettleModal(false);
                  setSelectedWallet(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <input
                  type="text"
                  value={selectedWallet.vendor?.name || ""}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance: ₹{selectedWallet.currentBalance?.toFixed(2) || "0.00"}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Amount (₹) *</label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  required
                  min="1"
                  max={selectedWallet.currentBalance}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSettle}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Settle
                </button>
                <button
                  onClick={() => {
                    setShowSettleModal(false);
                    setSelectedWallet(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Wallet</h2>
              <button
                onClick={() => {
                  setShowCreateWalletModal(false);
                  setSelectedVendorId('');
                  setSelectedPartnerId('');
                  setVendorType('other');
                  setCreateMode('user');
                }}
                className="text-white hover:text-gray-200 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Wallet For
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateMode('user');
                      setSelectedVendorId('');
                      setSelectedPartnerId('');
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      createMode === 'user'
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Existing User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateMode('partner');
                      setSelectedVendorId('');
                      setSelectedPartnerId('');
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      createMode === 'partner'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Partner (Auto-create User)
                  </button>
                </div>
              </div>

              {/* User Selection Mode */}
              {createMode === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor (User Account) *
                  </label>
                  {loadingVendors ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading vendors...</p>
                    </div>
                  ) : (
                    <select
                      value={selectedVendorId}
                      onChange={(e) => setSelectedVendorId(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select a vendor...</option>
                      {availableVendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name} ({vendor.email}) - {vendor.role}
                        </option>
                      ))}
                    </select>
                  )}
                  {!loadingVendors && availableVendors.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium mb-2">
                        No users available for wallet creation.
                      </p>
                      <p className="text-xs text-yellow-700">
                        This could mean:
                      </p>
                      <ul className="text-xs text-yellow-700 list-disc list-inside mt-1 space-y-1">
                        <li>All users with partner/vendor role already have wallets</li>
                        <li>No users exist with role 'partner' or 'vendor'</li>
                      </ul>
                      <p className="text-xs text-yellow-700 mt-2">
                        <strong>Tip:</strong> Try "Partner (Auto-create User)" mode to create wallet from partner directly.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Partner Selection Mode */}
              {createMode === 'partner' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Partner *
                  </label>
                  {loadingVendors ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading partners...</p>
                    </div>
                  ) : (
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a partner...</option>
                      {availablePartners.map((partner) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.name} ({partner.email}) - {partner.businessType}
                        </option>
                      ))}
                    </select>
                  )}
                  {!loadingVendors && availablePartners.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium mb-2">
                        No partners available for wallet creation.
                      </p>
                      <p className="text-xs text-yellow-700">
                        This could mean:
                      </p>
                      <ul className="text-xs text-yellow-700 list-disc list-inside mt-1 space-y-1">
                        <li>All approved partners already have wallets</li>
                        <li>No approved partners exist</li>
                        <li>Partners need to be approved first</li>
                      </ul>
                      <p className="text-xs text-yellow-700 mt-2">
                        <strong>Solution:</strong> Go to Partners section, approve partners, then come back here.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    A user account will be automatically created for the partner if it doesn't exist.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Type *
                </label>
                <select
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="food_server">Food Server</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="food_grain_supplier">Food Grain Supplier</option>
                  <option value="pathology_lab">Pathology Lab</option>
                  <option value="hospital">Hospital</option>
                  <option value="milk_bread_vendor">Milk/Bread Vendor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will create a new wallet for the selected vendor. 
                  The wallet will be ready to receive coupons and manage transactions.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCreateWallet}
                  disabled={(createMode === 'user' && !selectedVendorId) || (createMode === 'partner' && !selectedPartnerId) || loadingVendors}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Wallet
                </button>
                <button
                  onClick={() => {
                    setShowCreateWalletModal(false);
                    setSelectedVendorId('');
                    setSelectedPartnerId('');
                    setVendorType('other');
                    setCreateMode('user');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


