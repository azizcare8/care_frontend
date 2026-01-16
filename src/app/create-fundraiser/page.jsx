"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FundraiserForm from "@/components/FundraiserForm";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function CreateFundraiserPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !isAuthenticated) {
      toast.error("Please login to create a fundraiser");
      router.push("/login?redirect=/create-fundraiser");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Create Your Fundraiser
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto">
            Start raising funds for your cause today. We'll help you every step of the way.
          </p>
          <div className="mt-4 w-32 h-1 bg-white mx-auto rounded-full" />
        </div>
      </section>

      {/* Welcome Message */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-gray-700">
            <strong>Welcome, {user?.name || 'User'}!</strong> Fill out the form below to create your fundraiser. 
            Our team will review it and publish once approved.
          </p>
        </div>
      </div>

      {/* Fundraiser Form */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <FundraiserForm />
      </div>

      {/* Tips Section */}
      <section className="max-w-7xl mx-auto px-6 py-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            💡 Tips for a Successful Fundraiser
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl">✍️</div>
              <h3 className="font-semibold text-gray-800">Tell Your Story</h3>
              <p className="text-gray-600 text-sm">
                Share why you're raising funds and how it will help. Be honest and detailed.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">📸</div>
              <h3 className="font-semibold text-gray-800">Add Photos/Videos</h3>
              <p className="text-gray-600 text-sm">
                Visual content helps donors connect with your cause emotionally.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🎯</div>
              <h3 className="font-semibold text-gray-800">Set Realistic Goals</h3>
              <p className="text-gray-600 text-sm">
                Set an achievable funding goal that covers your actual needs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">📢</div>
              <h3 className="font-semibold text-gray-800">Share Widely</h3>
              <p className="text-gray-600 text-sm">
                Share your fundraiser on social media, WhatsApp, and with friends.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🔄</div>
              <h3 className="font-semibold text-gray-800">Post Updates</h3>
              <p className="text-gray-600 text-sm">
                Keep donors informed about your progress and how funds are being used.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🙏</div>
              <h3 className="font-semibold text-gray-800">Thank Donors</h3>
              <p className="text-gray-600 text-sm">
                Show gratitude to every donor, no matter the amount.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}






