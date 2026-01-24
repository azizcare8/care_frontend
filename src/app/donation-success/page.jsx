"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [campaignId, setCampaignId] = useState('');

  useEffect(() => {
    const id = searchParams.get('campaignId');
    if (id) {
      setCampaignId(id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Thank You! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Your donation was successful
            </p>
          </div>

          {/* Message */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-4">
              Your generous contribution will make a real difference. A receipt has been sent to your email address.
            </p>
            <p className="text-sm text-gray-600">
              You can view your donation history in your dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {campaignId && (
              <Link href={`/campaigns/${campaignId}`}>
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                  View Campaign
                </button>
              </Link>
            )}
            <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role ? '/dashboard' : '/login'}>
              <button className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                Go to Dashboard
              </button>
            </Link>
          </div>

          {/* Share */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-gray-600 mb-4">Share this campaign with your friends!</p>
            <div className="flex justify-center gap-3">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                📘
              </button>
              <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600">
                🐦
              </button>
              <button className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600">
                💬
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  );
}







