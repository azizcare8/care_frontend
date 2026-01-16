"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  FiSearch, 
  FiHeart, 
  FiMail, 
  FiTrendingUp, 
  FiZap, 
  FiEdit, 
  FiShare2, 
  FiDollarSign,
  FiArrowRight,
  FiCheck
} from "react-icons/fi";

export default function HowItWorks() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("donor");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const donorSteps = [
    {
      icon: FiSearch,
      title: "Find a Cause",
      description: "Browse campaigns and find a cause that resonates with you",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      link: "/campaigns"
    },
    {
      icon: FiHeart,
      title: "Make a Donation",
      description: "Contribute securely via UPI, card, or net banking",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      link: "/donate"
    },
    {
      icon: FiMail,
      title: "Get Receipt",
      description: "Receive instant receipt and updates on campaign progress",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      link: "/donor/get-receipt"
    },
    {
      icon: FiTrendingUp,
      title: "See Impact",
      description: "Track how your donation is making a real difference",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      link: "/donor/see-impact"
    }
  ];

  const fundraiserSteps = [
    {
      icon: FiEdit,
      title: "Create Campaign",
      description: "Tell your story and set fundraising goals for your cause",
      bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      link: "/startfundraiser"
    },
    {
      icon: FiShare2,
      title: "Share & Promote",
      description: "Share your campaign with friends, family, and on social media",
      bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      link: "/fundraisers"
    },
    {
      icon: FiDollarSign,
      title: "Receive Donations",
      description: "Get donations directly and track your progress in real-time",
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      link: "/fundraisers"
    },
    {
      icon: FiTrendingUp,
      title: "Make Impact",
      description: "Use funds to make a difference and update donors on progress",
      bgColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      link: "/fundraisers"
    }
  ];

  const currentSteps = selectedTab === "donor" ? donorSteps : fundraiserSteps;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-gray-50 to-green-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mb-4"></div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you want to donate or fundraise, we've made it simple and transparent
          </p>
        </div>

        {/* Role Selection Tabs */}
        {isMounted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100 gap-2">
            <button
              onClick={() => setSelectedTab("donor")}
              className={`relative px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center ${
                selectedTab === "donor"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105"
                  : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              <FiHeart className={`text-xl ${selectedTab === "donor" ? "text-white" : "text-red-500"}`} />
              <span>For Donors</span>
              {selectedTab === "donor" && (
                <FiCheck className="text-lg ml-1" />
              )}
            </button>
            
            <div className="w-px h-10 bg-gray-200 my-2"></div>
            
            <button
              onClick={() => setSelectedTab("fundraiser")}
              className={`relative px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center ${
                selectedTab === "fundraiser"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <FiZap className={`text-xl ${selectedTab === "fundraiser" ? "text-white" : "text-blue-500"}`} />
              <span>For Fundraisers</span>
              {selectedTab === "fundraiser" && (
                <FiCheck className="text-lg ml-1" />
              )}
            </button>
          </div>
        </motion.div>
        ) : (
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100 gap-2">
              <button
                onClick={() => setSelectedTab("donor")}
                className={`relative px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center ${
                  selectedTab === "donor"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                }`}
              >
                <FiHeart className={`text-xl ${selectedTab === "donor" ? "text-white" : "text-red-500"}`} />
                <span>For Donors</span>
                {selectedTab === "donor" && (
                  <FiCheck className="text-lg ml-1" />
                )}
              </button>
              
              <div className="w-px h-10 bg-gray-200 my-2"></div>
              
              <button
                onClick={() => setSelectedTab("fundraiser")}
                className={`relative px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center ${
                  selectedTab === "fundraiser"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <FiZap className={`text-xl ${selectedTab === "fundraiser" ? "text-white" : "text-blue-500"}`} />
                <span>For Fundraisers</span>
                {selectedTab === "fundraiser" && (
                  <FiCheck className="text-lg ml-1" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Helper Text */}
        <p className="text-center text-gray-600 mb-12 text-base">
          {selectedTab === "donor" 
            ? "Learn how to donate and make a difference" 
            : "Learn how to start your own fundraiser campaign"}
        </p>

        {/* Steps Grid */}
        {isMounted ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {currentSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 hover:border-green-200 flex flex-col">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`${step.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`${step.iconColor} text-2xl`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-grow text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>

                    {/* Learn More Link */}
                    <button
                      onClick={() => router.push(step.link)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm group/link transition-colors"
                    >
                      <span>Learn more</span>
                      <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Connecting Line (Desktop Only) */}
                  {index < currentSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 z-0">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-blue-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {currentSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 hover:border-green-200 flex flex-col">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`${step.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`${step.iconColor} text-2xl`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-grow text-sm md:text-base leading-relaxed">
                      {step.description}
                    </p>

                    {/* Learn More Link */}
                    <button
                      onClick={() => router.push(step.link)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm group/link transition-colors"
                    >
                      <span>Learn more</span>
                      <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Connecting Line (Desktop Only) */}
                  {index < currentSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 z-0">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-blue-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 md:p-12 shadow-2xl text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to {selectedTab === "donor" ? "Make a Difference?" : "Start Your Campaign?"}
            </h3>
            <p className="text-green-50 mb-8 max-w-2xl mx-auto text-lg">
              {selectedTab === "donor"
                ? "Join thousands of donors creating positive change in communities across India."
                : "Create your fundraiser today and start raising funds for your cause."}
            </p>
            <button
              onClick={() => router.push(selectedTab === "donor" ? "/campaigns" : "/startfundraiser")}
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              {selectedTab === "donor" ? "Start Donating Now" : "Create Campaign"}
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
