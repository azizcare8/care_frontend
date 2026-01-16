"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { shouldUnoptimizeImage } from "@/utils/imageUtils";
import { getBackendBaseUrl } from "@/utils/api";

export default function HealthPartners() {
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
        const response = await partnerService.getHealthPartners({ limit: 50 });
        // Service now returns { data: [...], pagination: {...} }
        setPartners(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        // Silently handle errors - show empty state
        // Don't log network errors (backend not running)
        if (process.env.NODE_ENV === 'development' && !error?.isNetworkError && !error?.silent) {
          console.warn("Failed to fetch health partners:", error.message || error);
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

  // Helper function to get full address
  const getFullAddress = (partner) => {
    try {
      if (!partner) return 'Address not available';
      if (typeof partner.address === 'object' && partner.address) {
        const address = `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
        return address || 'Address not available';
      }
      return (typeof partner.address === 'string' ? partner.address : 'Address not available') || 'Address not available';
    } catch (error) {
      return 'Address not available';
    }
  };

  // Helper function to get image URL - handles all sources
  const getImageUrl = (partner) => {
    if (partner.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        try {
          const imageUrl = primaryImage.url;
          
          // If URL is already absolute (http:// or https://), validate and return
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Validate URL using URL constructor
            new URL(imageUrl);
            return imageUrl;
          }
          
          // If URL is relative, make it absolute with backend base URL
          const backendBaseURL = getBackendBaseUrl();
          
          // Ensure backendBaseURL is valid
          if (!backendBaseURL || (!backendBaseURL.startsWith('http://') && !backendBaseURL.startsWith('https://'))) {
            throw new Error('Invalid backend base URL');
          }
          
          // Construct absolute URL using URL constructor to ensure it's valid
          const baseUrl = backendBaseURL.endsWith('/') ? backendBaseURL.slice(0, -1) : backendBaseURL;
          const relativePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          const absoluteUrl = new URL(relativePath, baseUrl).href;
          
          return absoluteUrl;
        } catch (error) {
          // If URL construction fails, return fallback
          console.warn('Invalid image URL:', primaryImage.url, error);
          return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
        }
      }
    }
    return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
  };

  // Helper function to get map link
  const getMapLink = (partner) => {
    try {
      const address = getFullAddress(partner);
      // Ensure address is valid and not empty
      if (!address || address.trim() === '' || address === 'Address not available') {
        return 'https://maps.google.com/';
      }
      const encodedAddress = encodeURIComponent(address);
      const mapUrl = `https://maps.google.com/?q=${encodedAddress}`;
      // Validate the constructed URL
      new URL(mapUrl);
      return mapUrl;
    } catch (error) {
      // Return a safe fallback URL if construction fails
      return 'https://maps.google.com/';
    }
  };

  // Helper function to get specialization/role from description
  const getSpecialization = (partner) => {
    try {
      if (!partner) return 'General Physician';
      if (partner.description && typeof partner.description === 'string') {
        // Try to extract specialization from description
        const specMatch = partner.description.match(/Specialization:\s*([^.]+)/i);
        if (specMatch && specMatch[1]) {
          return specMatch[1].trim() || 'General Physician';
        }
      }
      return (partner.contactPerson?.designation && typeof partner.contactPerson.designation === 'string') 
        ? partner.contactPerson.designation 
        : 'General Physician';
    } catch (error) {
      return 'General Physician';
    }
  };

  // Handle card click to view details
  const handleCardClick = (partner) => {
    if (!partner?._id) {
      return;
    }
    // Ensure _id is a valid string to avoid URL construction errors
    const partnerId = String(partner._id).trim();
    if (!partnerId) {
      return;
    }
    router.push(`/partners/health/${partnerId}`);
  };

  // Handle book appointment - redirect to partner details page
  const handleBookAppointment = (partner) => {
    if (!partner?._id) {
      toast.error("Unable to open booking for this partner");
      return;
    }
    // Ensure _id is a valid string to avoid URL construction errors
    const partnerId = String(partner._id).trim();
    if (!partnerId) {
      toast.error("Unable to open booking for this partner");
      return;
    }
    router.push(`/partners/health/${partnerId}`);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
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
              Our Health Partners
            </h2>
            <p className="text-gray-600 text-lg">No health partners available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2 relative border-y-2 border-blue-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-pink-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-500"></div>
      <div className="max-w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Our Health Partners
          </h2>
          <p className="text-gray-600 text-lg mt-3">
            Meet our trusted doctors — always ready to help you stay healthy
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
            {partners
              .filter((partner) => partner && (partner._id || partner.id)) // Filter out invalid partners
              .map((partner, index) => {
              try {
                const address = getFullAddress(partner);
                let mapLink = getMapLink(partner);
                const specialization = getSpecialization(partner);
                const phone = partner.phone || partner.contactPerson?.phone || 'N/A';
                
                // Validate mapLink before using it
                try {
                  new URL(mapLink);
                } catch (e) {
                  mapLink = 'https://maps.google.com/';
                }
                
                return (
              <motion.div
                key={partner._id || partner.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => handleCardClick(partner)}
                className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl border-2 border-gray-200 hover:border-blue-400 group cursor-pointer"
              >
                
                <div className="relative w-40 h-40 mb-4 rounded-full overflow-hidden shadow-lg ring-4 ring-pink-100">
                  <Image
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces"
                    alt={partner.name || 'Health Partner'}
                    fill
                    sizes="160px"
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
                    }}
                  />
                </div>

                <p className="text-blue-600 font-semibold text-sm mb-1 uppercase tracking-wide">
                  {specialization}
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {partner.name}
                </h3>

                <p className="text-gray-600 text-sm flex items-center justify-center gap-1.5">
                  <FaPhone className="text-green-600" />
                  <span>{phone}</span>
                </p>
                <p className="text-gray-600 text-sm mt-1 flex items-center justify-center gap-1.5">
                  <FaMapMarkerAlt className="text-red-600" />
                  <span>{address}</span>
                </p>

                <div className="flex gap-3 w-full mt-6" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleBookAppointment(partner)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  >
                    Consult Now
                  </button>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold text-sm shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all text-center transform hover:scale-105"
                  >
                    View Map
                  </a>
                </div>
              </motion.div>
                );
              } catch (error) {
                // Skip rendering this partner if there's an error
                console.warn('Error rendering partner:', partner?._id || partner?.id, error);
                return null;
              }
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


