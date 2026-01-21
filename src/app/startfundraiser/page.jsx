"use client";

import ClientLayout from "../ClientLayout";
import DonationCard from "@/components/DonationCard";
import UploadFundraiserForm from "@/components/admin/UploadFundraiserForm";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function StartFundraiserPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  return (
    <ClientLayout>
      <div className="min-h-screen pt-28 lg:pt-32">
        <section className="bg-gradient-to-br from-white via-green-50 to-emerald-50 py-10 px-6 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Start Your Fundraiser
              </h1>
              <p className="text-gray-600 mt-2">
                Fill the form below to submit your fundraiser for admin review.
              </p>
              <div className="mt-3 w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full" />
            </div>

            {!isAuthenticated && (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-green-100">
                <div className="mb-8">
                  <p className="text-gray-900 text-lg font-semibold mb-2">
                    Start raising funds in minutes
                  </p>
                  <p className="text-gray-600">
                    Trusted by thousands. Quick approval, secure donations, and full transparency.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="text-sm font-bold text-green-700">Fast Approval</p>
                    <p className="text-xs text-green-700/80 mt-1">Admin review within 24–48 hours</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-700">Secure Payments</p>
                    <p className="text-xs text-emerald-700/80 mt-1">Razorpay + verified tracking</p>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                    <p className="text-sm font-bold text-teal-700">Transparent Updates</p>
                    <p className="text-xs text-teal-700/80 mt-1">Share progress with donors</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/login?redirect=/startfundraiser#fundraiser-form")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Login to Continue
                </button>
              </div>
            )}

            {isAuthenticated && (
              <div id="fundraiser-form">
                <UploadFundraiserForm forcePending />
              </div>
            )}
          </div>
        </section>
        
        {/* Bank Details Section */}
        <section className="bg-gradient-to-br from-gray-50 via-green-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
                Donation Information
              </h2>
              <p className="text-gray-600 text-lg">
                Support us through direct bank transfer or UPI
              </p>
              <div className="mt-3 w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full" />
            </div>
            
            <DonationCard />
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}

