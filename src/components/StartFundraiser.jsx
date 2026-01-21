"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaArrowRight, FaWhatsapp, FaPhoneAlt, FaRocket } from "react-icons/fa";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function StartFundraiser() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDirectCreate = () => {
    router.push("/create-fundraiser");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target);
      const formObject = {
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        message: formData.get('message')
      };

      // If user is authenticated, redirect to create fundraiser
      if (isAuthenticated) {
        toast.success("Redirecting to create fundraiser...");
        router.push("/create-fundraiser");
        return;
      }

      // If not authenticated, submit form data (you can create an API endpoint for this)
      // For now, redirect to login with redirect to create-fundraiser
      toast.success("Please login to start your fundraiser");
      router.push(`/login?redirect=/create-fundraiser`);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-white via-green-50 to-emerald-50 py-20 px-6 lg:px-16">
      {/* Direct Create Option for Logged-in Users */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white text-green-600 rounded-full p-4 animate-bounce">
                  <FaRocket className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Ready to Start?</h3>
                  <p className="text-green-50 text-lg">
                    Create your fundraiser directly and get it reviewed quickly!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDirectCreate}
                className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Create Fundraiser Now
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-10">
        
        <div className="lg:w-6/12 space-y-10">
          <div className="pb-3 mb-5">
            <h5 className="text-green-600 font-semibold uppercase tracking-widest text-sm">
              Start Now
            </h5>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
              Why Fundraise With <span className="text-green-600">Care Foundation TrustⓇ</span>
            </h1>
            <div className="mt-3 w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group flex items-center space-x-3 bg-white border border-green-100 p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-green-600 text-xl group-hover:scale-110 transition-transform duration-300">
                <FaArrowRight />
              </div>
              <h5 className="text-lg font-semibold text-gray-700">
                You’re Just One Step Away
              </h5>
            </div>

            <div className="group flex items-center space-x-3 bg-white border border-green-100 p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-green-600 text-xl group-hover:scale-110 transition-transform duration-300">
                <FaPhoneAlt />
              </div>
              <h5 className="text-lg font-semibold text-gray-700">
                24/7 Assistance & Support
              </h5>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed">
            We are dedicated to helping people create change. Whether it’s healthcare,
            education, or environmental causes, your fundraising effort helps make a
            lasting impact. Partnering with us ensures transparency, credibility, and
            a supportive team guiding you every step of the way.
          </p>

          <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center rounded-full w-16 h-16 text-white text-2xl animate-pulse">
              <FaUserPlus />
            </div>
            <div>
              <h5 className="text-gray-900 font-semibold text-lg">
                Ready to make an impact?
              </h5>
              <p className="text-gray-600 text-sm">
                Join thousands of changemakers and start your fundraiser today.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-6/12 bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6">
          <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
            Start Your Fundraiser
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Fill out your details — our team will connect with you to begin your journey.
          </p>

          <form
            onSubmit={handleFormSubmit}
            className="space-y-6 text-gray-800"
          >

            <div>             
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                className="w-full p-4 rounded-xl border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
            </div>

            <div>              
              <input
                type="tel"
                name="mobile"
                placeholder="Enter your contact number"
                className="w-full p-4 rounded-xl border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
            </div>

            <div>             
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="w-full p-4 rounded-xl border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
            </div>

            <div>             
              <textarea
                name="message"
                placeholder="Tell us about your fundraiser"
                className="w-full p-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none h-32 resize-none"
                required
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/919136521052"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-green-100 py-3 rounded-xl font-semibold text-gray-700 transition-all duration-300 shadow-sm border"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
              <a
                href="https://wa.me/919136521052"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-green-100 py-3 rounded-xl font-semibold text-gray-700 transition-all duration-300 shadow-sm border"
              >
                <FaWhatsapp /> WhatsApp
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold shadow-md transition-transform hover:scale-105 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Processing...
                </>
              ) : (
                <>
                  Start a Fundraiser <FaArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}


