"use client";
import { FiHeart, FiUsers, FiTarget, FiAward } from "react-icons/fi";
import Image from "next/image";
import BackToHome from "@/components/BackToHome";

export default function AboutUs() {
  const team = [
    { name: "Care Foundation Team", role: "Dedicated Volunteers", description: "Working tirelessly for the community" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Care Foundation Trust - Serving humanity with compassion since 1997
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                Care Foundation Trust is a non-profit organization established in 1997 with a mission to uplift 
                the underprivileged communities across India. Based in Mumbai, we have been working tirelessly 
                to provide healthcare, education, and nutrition to those in need.
              </p>
              <p className="text-gray-600 mb-4">
                Over the past 27+ years, we have touched the lives of thousands of individuals through our 
                various programs and initiatives. Our team of dedicated volunteers and staff work round the 
                clock to ensure that help reaches those who need it the most.
              </p>
              <p className="text-gray-600">
                We believe in transparency, accountability, and creating sustainable impact. Every donation 
                received is utilized efficiently to maximize the benefit to our beneficiaries.
              </p>
            </div>
            <div className="bg-green-100 rounded-2xl p-8 text-center">
              <Image src="/footer_logo.jpeg" alt="Care Foundation Trust Logo" width={150} height={150} className="mx-auto mb-6" />
              <p className="text-green-700 font-semibold">Est. Since 1997</p>
              <p className="text-gray-600 mt-2">27+ Years of Service</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiHeart className="text-4xl text-red-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">27+</div>
            <div className="text-gray-600">Years</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiUsers className="text-4xl text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-gray-600">Lives Touched</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiTarget className="text-4xl text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">100+</div>
            <div className="text-gray-600">Projects</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiAward className="text-4xl text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Volunteers</div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Be a part of our journey to make a difference. Every contribution counts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/campaigns" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Donate Now
            </a>
            <a href="/volunteer" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Become a Volunteer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

