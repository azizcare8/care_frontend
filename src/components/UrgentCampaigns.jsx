"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaClock, FaHeartbeat, FaFire } from "react-icons/fa";
import api from "@/utils/api";
import { normalizeImageUrl } from "@/utils/imageUtils";

export default function UrgentCampaigns() {
  const router = useRouter();
  const [urgentCampaigns, setUrgentCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentCampaigns = async () => {
      try {
        const response = await api.get('/campaigns', {
          params: {
            urgent: true,
            limit: 3,
            status: 'active'
          }
        });
        if (response.data) {
          setUrgentCampaigns(response.data.data || response.data.campaigns || []);
        }
      } catch (error) {
        // Don't log network errors (backend not running)
        if (!error?.isNetworkError && !error?.silent) {
          console.error("Failed to fetch urgent campaigns:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrgentCampaigns();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50 px-2 relative border-y-2 border-red-400">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-500"></div>
        <div className="max-w-full mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Urgent Campaigns
            </h2>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (urgentCampaigns.length === 0) {
    return null; // Don't show section if no urgent campaigns
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50 px-2 relative border-y-2 border-red-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-500"></div>
      <div className="max-w-full mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-red-100 text-red-700 px-6 py-2 rounded-full font-bold mb-4">
            <FaFire className="animate-pulse" />
            <span>URGENT - Time Sensitive</span>
            <FaFire className="animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Help Needed Immediately
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These campaigns need your support right now. Every minute counts.
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full" />
        </motion.div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {urgentCampaigns.map((campaign, index) => {
            const progress = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
            const timeLeft = campaign.daysRemaining || 0;

            return (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => router.push(`/campaigns/${campaign._id}`)}
                className="cursor-pointer group"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-red-200 hover:border-red-400 relative">
                  {/* Urgent Badge */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 flex items-center justify-center gap-2 z-10 animate-pulse">
                    <FaHeartbeat />
                    <span className="font-bold text-sm">URGENT - HELP NOW</span>
                    <FaHeartbeat />
                  </div>

                  {/* Image */}
                  <div className="relative h-56 mt-10 overflow-hidden">
                    {(() => {
                      const rawImageUrl = campaign.images?.[0]?.url;
                      const imageUrl = rawImageUrl ? normalizeImageUrl(rawImageUrl) : "/images/c1.jpg";
                      const isBackendUrl = imageUrl?.startsWith("https://carefoundationtrust.org") ||
                        imageUrl?.startsWith("https://carefoundation-backend-1.onrender.com");
                      if (isBackendUrl) {
                        // Use regular img tag for backend URLs to avoid Next.js optimization issues
                        return (
                          <img
                            src={imageUrl}
                            alt={campaign.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        );
                      }
                      return (
                        <Image
                          src={imageUrl}
                          alt={campaign.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      );
                    })()}
                    {/* Time Left Overlay */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2">
                      <FaClock className="text-red-400" />
                      <span className="font-bold text-sm">
                        {timeLeft} {timeLeft === 1 ? 'Day' : 'Days'} Left
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {campaign.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {campaign.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {campaign.shortDescription}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-gray-900">
                          {campaign.currentAmount?.toLocaleString()} raised
                        </span>
                        <span className="text-gray-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Goal: {campaign.goalAmount?.toLocaleString()}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/campaigns/${campaign._id}`);
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <FaHeartbeat />
                      <span>Donate Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => router.push("/campaigns?urgent=true")}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            View All Urgent Campaigns
          </button>
        </motion.div>
      </div>
    </section>
  );
}






