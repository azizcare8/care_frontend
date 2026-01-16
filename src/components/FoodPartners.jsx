"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { shouldUnoptimizeImage } from "@/utils/imageUtils";

export default function FoodPartners() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const response = await partnerService.getFoodPartners({ limit: 50 });
        setPartners(response.data || []);
      } catch (error) {
        // Silently handle errors - show empty state
        // Don't log network errors (backend not running)
        if (process.env.NODE_ENV === 'development' && !error?.isNetworkError && !error?.silent) {
          console.warn("Failed to fetch food partners:", error.message || error);
        }
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [partners]);

  // Helper function to get operating hours string
  const getOperatingHours = (partner) => {
    if (!partner.operatingHours) return "MON-SAT";
    
    const days = [];
    const hours = [];
    
    Object.keys(partner.operatingHours).forEach(day => {
      const schedule = partner.operatingHours[day];
      if (schedule?.isOpen && schedule.open && schedule.close) {
        days.push(day.substring(0, 3).toUpperCase());
        if (!hours.includes(`${schedule.open} - ${schedule.close}`)) {
          hours.push(`${schedule.open} - ${schedule.close}`);
        }
      }
    });
    
    return {
      days: days.length > 0 ? days.join('-') : "MON-SAT",
      time: hours[0] || "09:00 - 21:00"
    };
  };

  // Helper function to get full address
  const getFullAddress = (partner) => {
    if (typeof partner.address === 'object' && partner.address) {
      return `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
    }
    return partner.address || 'Address not available';
  };

  // Helper function to get image URL - handles all sources
  const getImageUrl = (partner) => {
    if (partner.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        // If URL is already absolute (http:// or https://), return as is
        if (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://')) {
          return primaryImage.url;
        }
        // If URL is relative, make it absolute with backend base URL
        const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
  };

  // Helper function to get map link
  const getMapLink = (partner) => {
    const address = getFullAddress(partner);
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };

  // Handle card click to view details
  const handleCardClick = (partner) => {
    if (!partner?._id) {
      return;
    }
    router.push(`/partners/food/${partner._id}`);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partners...</p>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">
              Our Food Partners
            </h2>
            <p className="text-gray-600 text-lg">No food partners available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2 relative border-y-2 border-orange-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"></div>
      <div className="max-w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Our Food Partners
          </h2>
          <p className="text-gray-600  text-lg mt-3">
            Feed The Hungry — Join our mission
          </p>
          <div className="mt-3 w-24 h-1 bg-gradient-to-r from-blue-500 to-pink-500 mx-auto rounded-full" />
        </motion.div>

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
            {partners.map((partner, index) => {
            const operatingHours = getOperatingHours(partner);
            const address = getFullAddress(partner);
            const imageUrl = getImageUrl(partner);
            const mapLink = getMapLink(partner);
            
            return (
              <motion.div
                key={partner._id || partner.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleCardClick(partner)}
                className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-400 group cursor-pointer"
              >
                
                <div className="relative overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={partner.name}
                    width={500}
                    height={200}
                    className="w-full h-52 object-cover"
                    unoptimized={shouldUnoptimizeImage(imageUrl)}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
                    }}
                  />
                  <span className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-lg mt-5 py-2 px-4 text-sm font-bold shadow-lg">
                    {partner.name}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center text-gray-600 text-sm mb-3">
                    <span className="flex items-center mr-4">
                      <i className="fas fa-calendar-alt text-orange-500 mr-2"></i>
                      {operatingHours.days}
                    </span>
                    <span className="flex items-center">
                      <i className="fa fa-clock-o text-orange-500 mr-2"></i>
                      {operatingHours.time}
                    </span>
                  </div>

                  <h4 className="text-gray-700 font-semibold mb-1">
                    Name:{" "}
                    <span className="text-green-800  font-medium">
                      {partner.name}
                    </span>
                  </h4>
                  <h4 className="text-gray-700 font-semibold mb-1">
                    Contact No:{" "}
                    <span className="text-green-800  font-medium">
                      {partner.phone || partner.contactPerson?.phone || 'N/A'}
                    </span>
                  </h4>
                  <h4 className="text-gray-700 font-semibold mb-3">
                    Address:{" "}
                    <span className="text-green-800  font-medium">
                      {address}
                    </span>
                  </h4>

                  <div className="flex gap-3 mb-4" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold text-sm shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all text-center transform hover:scale-105"
                    >
                      View Map
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}


