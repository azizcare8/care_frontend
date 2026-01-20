"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { shouldUnoptimizeImage } from "@/utils/imageUtils";
import { getBackendBaseUrl } from "@/utils/api";

export default function FoodPartners() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const selectedType = searchParams?.get("type");

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

  const extractFirstValidUrl = (value) => {
    if (typeof value !== 'string') return null;
    const matches = value.match(/https?:\/\/[^\s,]+/gi);
    if (!matches) return null;
    for (const match of matches) {
      try {
        return new URL(match).href;
      } catch (error) {
        continue;
      }
    }
    return null;
  };

  const normalizeAddressString = (value) => {
    if (typeof value !== 'string') return '';
    const matches = value.match(/https?:\/\/[^\s,]+/gi) || [];
    const uniqueUrls = [];
    matches.forEach((match) => {
      const trimmed = match.trim();
      if (trimmed && !uniqueUrls.includes(trimmed)) {
        uniqueUrls.push(trimmed);
      }
    });

    let withoutUrls = value;
    matches.forEach((match) => {
      const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      withoutUrls = withoutUrls.replace(new RegExp(escaped, "g"), "");
    });

    withoutUrls = withoutUrls
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s+/g, " ")
      .replace(/^,\s*|\s*,\s*$/g, "")
      .trim();

    const parts = [];
    if (uniqueUrls.length > 0) parts.push(uniqueUrls[0]);
    if (withoutUrls) parts.push(withoutUrls);
    return parts.join(", ").trim();
  };

  // Helper function to get full address
  const getFullAddress = (partner) => {
    if (typeof partner.address === 'object' && partner.address) {
      const address = `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
      const normalized = normalizeAddressString(address);
      return normalized || 'Address not available';
    }
    const addressValue = typeof partner.address === 'string' ? partner.address : '';
    const normalized = normalizeAddressString(addressValue);
    return normalized || 'Address not available';
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
        const backendBaseURL = getBackendBaseUrl();
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
  };

  const getAddressUrl = (partner) => {
    if (!partner) return null;
    if (typeof partner.address === 'string') {
      return extractFirstValidUrl(partner.address);
    }
    if (typeof partner.address === 'object' && partner.address) {
      const address = `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`;
      return extractFirstValidUrl(address);
    }
    return null;
  };

  // Helper function to get map link
  const getMapLink = (partner) => {
    const directUrl = getAddressUrl(partner);
    if (directUrl) {
      return directUrl;
    }
    const address = getFullAddress(partner);
    if (!address || address === 'Address not available') {
      return 'https://maps.google.com/';
    }
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };

  // Handle card click to view details
  const handleCardClick = (partner) => {
    if (!partner?._id) {
      return;
    }
    router.push(`/partners/food/${partner._id}`);
  };

  const normalizedPartners = partners.filter((partner) => partner && (partner._id || partner.id));
  const getPartnerType = (partner) => (partner.businessType || '').toLowerCase();
  const sectionConfigs = [
    { id: 'restaurant', title: 'Restaurants', subtitle: 'Meals and dining partners' },
    { id: 'service', title: 'Food Services', subtitle: 'Catering and food services' },
    { id: 'other', title: 'Other Food Partners', subtitle: 'Additional food support partners' }
  ];

  const groupedSections = sectionConfigs.map((section) => {
    const sectionPartners = normalizedPartners.filter((partner) => {
      const type = getPartnerType(partner);
      if (!type) return section.id === 'other';
      if (section.id === 'other') {
        return !['restaurant', 'service'].includes(type);
      }
      return type === section.id;
    });
    return { ...section, partners: sectionPartners };
  });

  const visibleSections = selectedType
    ? groupedSections.filter((section) => section.id === selectedType)
    : groupedSections;
  const hasVisiblePartners = visibleSections.some((section) => section.partners.length > 0);

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

        <div className="space-y-12 px-4 sm:px-6 lg:px-8">
          {!hasVisiblePartners && (
            <div className="text-center py-10 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600">No food partners available for this category yet.</p>
            </div>
          )}
          {visibleSections
            .filter((section) => section.partners.length > 0)
            .map((section) => (
              <div key={section.id}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-2">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.subtitle}</p>
                  </div>
                  <span className="text-sm text-gray-500">{section.partners.length} partners</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.partners.map((partner, index) => {
                    const operatingHours = getOperatingHours(partner);
                    const address = getFullAddress(partner);
                    const imageUrl = getImageUrl(partner);
                    const mapLink = getMapLink(partner);

                    return (
                      <motion.div
                        key={partner._id || partner.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleCardClick(partner)}
                        className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-400 group cursor-pointer"
                      >
                        <div className="relative overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={partner.name}
                            width={500}
                            height={200}
                            className="w-full h-52 object-cover"
                            unoptimized={shouldUnoptimizeImage(imageUrl)}
                          />
                          <span className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-lg mt-5 py-2 px-4 text-sm font-bold shadow-lg">
                            {partner.name}
                          </span>
                        </div>

                        <div className="p-5 space-y-2">
                          <div className="flex flex-wrap items-center text-gray-600 text-sm mb-1 gap-4">
                            <span className="flex items-center gap-2">
                              <span className="text-orange-500">📅</span>
                              {operatingHours.days}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-orange-500">⏰</span>
                              {operatingHours.time}
                            </span>
                          </div>

                          <div className="text-gray-700 font-semibold">
                            <span className="text-green-800 font-medium">{partner.name}</span>
                          </div>
                          <div className="text-gray-600 text-sm flex items-center gap-2 w-full">
                            <FaPhone className="text-green-600" />
                            <span className="flex-1 min-w-0 truncate">{partner.phone || partner.contactPerson?.phone || 'N/A'}</span>
                          </div>
                          <div className="text-gray-600 text-sm flex items-start gap-2 w-full">
                            <FaMapMarkerAlt className="text-red-600" />
                            <span className="flex-1 min-w-0 line-clamp-2 break-words">{address}</span>
                          </div>

                          <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
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
            ))}
        </div>
      </div>
    </section>
  );
}


