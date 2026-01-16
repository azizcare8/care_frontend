"use client";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import api from "@/utils/api";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { BiWallet } from "react-icons/bi";
import { FiArrowUp, FiArrowDown, FiDollarSign } from "react-icons/fi";

export default function VendorWallet({ vendorId }) {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWallet();
  }, [vendorId]);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/wallets/${vendorId || user?.id}`);
      setWallet(response.data.data);

      // Fetch transactions
      const txResponse = await api.get(`/wallets/${vendorId || user?.id}/transactions`);
      setTransactions(txResponse.data.data || []);
    } catch (error) {
      toast.error('Failed to load wallet');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading wallet...</p>
      </div>
    );
  }

  if (!wallet && !isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-dashed border-gray-200">
        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BiWallet className="text-3xl text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Wallet Initializing</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          We're setting up your secure vendor wallet. This usually takes just a few seconds.
        </p>
        <button
          onClick={fetchWallet}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-green-100 font-medium tracking-wide uppercase text-xs mb-1">Available Balance</h3>
              <p className="text-5xl font-extrabold tracking-tight">₹{wallet?.currentBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30">
              <BiWallet className="text-4xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-green-100 text-xs uppercase font-bold tracking-wider mb-1">Total Earned</p>
              <p className="text-2xl font-bold">₹{wallet?.totalReceived?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <div>
              <p className="text-green-100 text-xs uppercase font-bold tracking-wider mb-1">Total Settled</p>
              <p className="text-2xl font-bold">₹{wallet?.totalSettled?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupons in Wallet</h3>

        {wallet.coupons && wallet.coupons.length > 0 ? (
          <div className="space-y-3">
            {wallet.coupons.map((couponItem, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {couponItem.coupon?.title || `Coupon ${couponItem.coupon?._id?.slice(-6)}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Code: {couponItem.coupon?.code || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₹{couponItem.amount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {couponItem.status || 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No coupons in wallet</p>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {tx.type === 'topup' ? (
                    <FiArrowUp className="text-green-500 text-xl" />
                  ) : tx.type === 'settlement' ? (
                    <FiArrowDown className="text-red-500 text-xl" />
                  ) : (
                    <FiDollarSign className="text-blue-500 text-xl" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description || tx.type}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(tx.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-right font-semibold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {tx.type === 'topup' ? '+' : '-'}₹{tx.amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </div>
    </div>
  );
}

