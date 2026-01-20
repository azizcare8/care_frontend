"use client";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { BiGift, BiTime, BiCheckCircle } from "react-icons/bi";
import { FaTag, FaPercent } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CouponsSection() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await couponService.getCoupons({
          limit: 6,
          status: 'active',
          isPublic: true
        });
        setCoupons(response.data || []);
      } catch (error) {
        // Silently handle errors - don't show toast for public page
        // Don't log network errors (backend not running)
        if (process.env.NODE_ENV === 'development' && !error?.isNetworkError && !error?.silent) {
          console.warn("Failed to load coupons:", error.message || error);
        }
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const formatCouponValue = (coupon) => {
    if (coupon.value?.percentage) {
      return `${coupon.value.percentage}% OFF`;
    }
    if (coupon.value?.amount) {
      return `${coupon.value.amount.toLocaleString('en-IN')}`;
    }
    return 'Special Offer';
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Available Coupons & Offers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Exclusive discounts and offers from our trusted partners
            </p>
          </div>
          <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
            <div className="flex gap-6 min-w-max px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse flex-shrink-0 w-80">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (coupons.length === 0) {
    return null; // Don't show section if no coupons
  }

  return (
    <>

    </>
  );
}

