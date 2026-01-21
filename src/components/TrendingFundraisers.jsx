"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useState, useRef, useEffect } from "react";
import { normalizeImageUrl } from "@/utils/imageUtils";
import { FaChevronLeft, FaChevronRight, FaRocket } from "react-icons/fa";
import { FiTarget, FiFileText } from "react-icons/fi";

export default function TrendingFundraisers({ campaigns = [], isLoading = false }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  // Check scroll position on mount and when campaigns change
  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [campaigns]);

  // Use real campaigns from backend
  const displayCampaigns = campaigns;

  const handleCampaignClick = (campaignId) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const handleContribute = (e, campaignId) => {
    e.stopPropagation();
    router.push(`/donate/${campaignId}`);
  };

  const handleShare = (e, campaign) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Help support: ${campaign.title}`,
        url: `${window.location.origin}/campaigns/${campaign._id}`
      });
    } else {
      
      navigator.clipboard.writeText(`${window.location.origin}/campaigns/${campaign._id}`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2 relative border-y-2 border-blue-400">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
        <div className="max-w-full mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-800">
              Trending Fundraisers
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Loading trending campaigns...
            </p>
          </div>
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-700 text-lg" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-700 text-lg" />
              </button>
            )}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-12" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="w-full h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-3"></div>
                  <div className="h-2 bg-gray-300 rounded mb-3"></div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-gray-300 rounded"></div>
                    <div className="flex-1 h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2">
      <div className="max-w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-extrabold text-gray-800">
            Trending Fundraisers
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            View the fundraisers that are most active right now
          </p>
          <div className="mt-3 w-24 h-1 bg-gradient-to-r from-green-500 to-pink-500 mx-auto rounded-full" />
        </motion.div>

        {displayCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center">
                <FiTarget className="text-blue-600 text-5xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Campaigns Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to start a fundraiser and make a difference!</p>
            
            {isAuthenticated ? (
              <div className="flex gap-4 justify-center flex-wrap">
                <button 
                  onClick={() => router.push('/create-fundraiser')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <FaRocket className="text-xl" />
                  Create Fundraiser Now
                </button>
                <button 
                  onClick={() => router.push('/startfundraiser')}
                  className="bg-white text-green-600 border-2 border-green-500 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all flex items-center gap-2"
                >
                  <FiFileText className="text-lg" />
                  Learn More
                </button>
              </div>
            ) : (
              <div className="flex gap-4 justify-center flex-wrap">
                <button 
                  onClick={() => router.push('/login?redirect=/create-fundraiser')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Login to Create Fundraiser
                </button>
                <button 
                  onClick={() => router.push('/startfundraiser')}
                  className="bg-white text-green-600 border-2 border-green-500 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-700 text-lg" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-700 text-lg" />
              </button>
            )}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-12" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {displayCampaigns.map((campaign, index) => {
            const progress = campaign.progressPercentage || Math.min(
              (campaign.currentAmount / campaign.goalAmount) * 100,
              100
            );

            return (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover:border-green-400 hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => handleCampaignClick(campaign._id)}
              >
                
                <div className="relative w-full h-64 overflow-hidden">
                  {(() => {
                    const rawImageUrl = campaign.images?.[0]?.url;
                    const imageUrl = rawImageUrl ? normalizeImageUrl(rawImageUrl) : "/images/c1.jpg";
                    const isBackendUrl = imageUrl?.startsWith("http://localhost:5000") ||
                                       imageUrl?.startsWith("https://carefoundation-backend-1.onrender.com");
                    if (isBackendUrl) {
                      // Use regular img tag for backend URLs to avoid Next.js optimization issues
                      return (
                        <img
                          src={imageUrl}
                          alt={campaign.title}
                          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      );
                    }
                    return (
                      <Image
                        src={imageUrl}
                        alt={campaign.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/80 text-gray-800 px-3 py-1 text-xs font-semibold rounded-full shadow">
                    {campaign.daysRemaining || campaign.daysLeft || 0} Days Left
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    Raised 
                    {(campaign.currentAmount || 0).toLocaleString("en-IN")} of 
                    {(campaign.goalAmount || 0).toLocaleString("en-IN")}
                  </p>

                  <div className="w-full bg-gray-200 h-2 rounded-full mb-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-2 bg-gradient-to-r from-lime-600 to-green-500 rounded-full"
                    ></motion.div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-5">
                    <span>{progress.toFixed(0)}% Funded</span>
                    <span>Goal {(campaign.goalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex gap-3 mb-5">
                    <button 
                      onClick={(e) => handleContribute(e, campaign._id)}
                      className="flex-1 bg-gradient-to-r from-lime-600 to-green-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 shadow-md transition-all"
                    >
                      Contribute
                    </button>
                    <button 
                      onClick={(e) => handleShare(e, campaign)}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-all"
                    >
                      Share
                    </button>
                  </div>

                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="relative w-10 h-10">
                      <Image
                        src="/logo.webp"
                        alt="Trust Logo"
                        fill
                        sizes="40px"
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {campaign.fundraiser?.name || "Care Foundation TrustⓇ"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.location ? `${campaign.location.city}, ${campaign.location.state}` : "Mumbai, Maharashtra"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}






