"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FaPhone, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { shouldUnoptimizeImage, normalizeImageUrl } from "@/utils/imageUtils";
import { getBackendBaseUrl } from "@/utils/api";

export default function HealthPartners() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sliderRefs = useRef({});

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

  const selectedType = searchParams?.get("type");

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

  const stripUrlsFromAddress = (value) => {
    if (typeof value !== 'string') return '';
    const matches = value.match(/https?:\/\/[^\s,]+/gi) || [];
    let withoutUrls = value;
    matches.forEach((match) => {
      const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      withoutUrls = withoutUrls.replace(new RegExp(escaped, "g"), "");
    });
    return withoutUrls
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s+/g, " ")
      .replace(/^,\s*|\s*,\s*$/g, "")
      .trim();
  };

  // Helper function to get full address
  const getFullAddress = (partner) => {
    try {
      if (!partner) return 'Address not available';
      if (typeof partner.address === 'object' && partner.address) {
        const address = `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
        const normalized = normalizeAddressString(address);
        return normalized || 'Address not available';
      }
      const addressValue = typeof partner.address === 'string' ? partner.address : '';
      const normalized = normalizeAddressString(addressValue);
      return normalized || 'Address not available';
    } catch (error) {
      return 'Address not available';
    }
  };

  const getDisplayAddress = (partner) => {
    const fullAddress = getFullAddress(partner);
    if (!fullAddress || fullAddress === 'Address not available') {
      return 'Address not available';
    }
    const cleaned = stripUrlsFromAddress(fullAddress);
    return cleaned || 'Address not available';
  };

  const sanitizeCardLabel = (value) => {
    if (typeof value !== 'string') return '';
    return value.replace(/ID:\s*[^|]+(\|\s*BLOOD:\s*[^|]+)?/gi, '').trim();
  };

  // Helper function to get image URL - handles all sources
  const getImageUrl = (partner) => {
    // First, check if imageUrl (string) is available (preferred method)
    if (partner.imageUrl && typeof partner.imageUrl === 'string' && partner.imageUrl.trim()) {
      try {
        // Normalize the URL to handle concatenated/malformed URLs
        const normalizedUrl = normalizeImageUrl(partner.imageUrl);
        
        if (normalizedUrl) {
          // Validate the normalized URL
          try {
            new URL(normalizedUrl);
            if (process.env.NODE_ENV === 'development') {
              console.log('Image URL normalized (from imageUrl field):', {
                original: partner.imageUrl,
                normalized: normalizedUrl,
                partner: partner.name
              });
            }
            return normalizedUrl;
          } catch (validationError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Normalized URL validation failed:', normalizedUrl, validationError);
            }
          }
        }
        
        // Fallback: try to handle the URL manually if normalization didn't work
        const imageUrl = partner.imageUrl;
        
        // If URL is already absolute (http:// or https://), validate and return
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            // Validate URL using URL constructor
            new URL(imageUrl);
            return imageUrl;
          } catch (e) {
            // URL is malformed, continue to fallback
          }
        }
      } catch (error) {
        // Continue to images array fallback
      }
    }
    
    // Fallback to images array (for backward compatibility)
    if (partner.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        try {
          // First, normalize the URL to handle concatenated/malformed URLs
          const normalizedUrl = normalizeImageUrl(primaryImage.url);
          
          if (normalizedUrl) {
            // Validate the normalized URL
            try {
              new URL(normalizedUrl);
              if (process.env.NODE_ENV === 'development') {
                console.log('Image URL normalized:', {
                  original: primaryImage.url,
                  normalized: normalizedUrl,
                  partner: partner.name
                });
              }
              return normalizedUrl;
            } catch (validationError) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Normalized URL validation failed:', normalizedUrl, validationError);
              }
            }
          }
          
          // Fallback: try to handle the URL manually if normalization didn't work
          const imageUrl = primaryImage.url;
          
          // If URL is already absolute (http:// or https://), validate and return
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            try {
              // Validate URL using URL constructor
              new URL(imageUrl);
              return imageUrl;
            } catch (e) {
              // URL is malformed, continue to fallback
            }
          }
          
          // If URL is relative, make it absolute with backend base URL
          const backendBaseURL = getBackendBaseUrl();
          
          // Ensure backendBaseURL is valid
          if (backendBaseURL && (backendBaseURL.startsWith('http://') || backendBaseURL.startsWith('https://'))) {
            try {
              // Construct absolute URL using URL constructor to ensure it's valid
              const baseUrl = backendBaseURL.endsWith('/') ? backendBaseURL.slice(0, -1) : backendBaseURL;
              const relativePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
              const absoluteUrl = new URL(relativePath, baseUrl).href;
              return absoluteUrl;
            } catch (e) {
              // URL construction failed
            }
          }
          
          // If all else fails, log and return fallback
          if (process.env.NODE_ENV === 'development') {
            console.warn('Could not process image URL, using fallback:', {
              original: primaryImage.url,
              partner: partner.name
            });
          }
          return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
        } catch (error) {
          // If URL construction fails, return fallback
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error processing image URL:', primaryImage.url, error);
          }
          return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
        }
      }
    }
    return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces';
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
    try {
      const directUrl = getAddressUrl(partner);
      if (directUrl) {
        return directUrl;
      }
      const address = getDisplayAddress(partner);
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

  const normalizedPartners = partners.filter((partner) => partner && (partner._id || partner.id));
  const getPartnerType = (partner) => (partner.businessType || '').toLowerCase();
  const sectionConfigs = [
    { id: 'hospital', title: 'Hospitals', subtitle: 'Trusted hospitals supporting our mission' },
    { id: 'clinic', title: 'Doctor For U', subtitle: 'Medical doctors and clinics for consultations' },
    { id: 'pathology', title: 'Pathology Labs', subtitle: 'Diagnostic and lab partners' },
    { id: 'pharmacy', title: 'Pharmacies', subtitle: 'Pharmacy partners for medicines' },
    { id: 'other', title: 'Other Medical Partners', subtitle: 'Additional medical support services' }
  ];

  const groupedSections = sectionConfigs.map((section) => {
    const sectionPartners = normalizedPartners.filter((partner) => {
      const type = getPartnerType(partner);
      if (!type) return section.id === 'other';
      if (section.id === 'clinic') return type === 'clinic';
      if (section.id === 'other') {
        return !['hospital', 'clinic', 'pathology', 'pharmacy'].includes(type);
      }
      return type === section.id;
    });
    return { ...section, partners: sectionPartners };
  });

  const visibleSections = selectedType
    ? groupedSections.filter((section) => section.id === selectedType)
    : groupedSections;
  const hasVisiblePartners = visibleSections.some((section) => section.partners.length > 0);

  const setSliderRef = (sectionId) => (element) => {
    if (element) {
      sliderRefs.current[sectionId] = element;
    }
  };

  const scrollSection = (sectionId, direction) => {
    const container = sliderRefs.current[sectionId];
    if (!container) return;
    const firstCard = container.querySelector('[data-slider-card="true"]');
    const cardWidth = firstCard?.getBoundingClientRect().width || 320;
    const gap = 24;
    container.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
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

        <div className="space-y-12 px-4 sm:px-6 lg:px-8">
          {!hasVisiblePartners && (
            <div className="text-center py-10 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600">No partners available for this category yet.</p>
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{section.partners.length} partners</span>
                    {section.id === "clinic" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => scrollSection(section.id, -1)}
                          aria-label="Scroll left"
                          className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          <FaChevronLeft className="mx-auto" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollSection(section.id, 1)}
                          aria-label="Scroll right"
                          className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          <FaChevronRight className="mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  ref={section.id === "clinic" ? setSliderRef(section.id) : undefined}
                  className={
                    section.id === "clinic"
                      ? "flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  }
                >
                  {section.partners.map((partner, index) => {
                    try {
                      const address = getDisplayAddress(partner);
                      let mapLink = getMapLink(partner);
                      const specialization = sanitizeCardLabel(getSpecialization(partner));
                      const phone = partner.phone || partner.contactPerson?.phone || 'N/A';
                      const imageUrl = getImageUrl(partner);

                      try {
                        new URL(mapLink);
                      } catch (e) {
                        mapLink = 'https://maps.google.com/';
                      }

                      return (
                        <motion.div
                          key={partner._id || partner.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleCardClick(partner)}
                          data-slider-card={section.id === "clinic" ? "true" : undefined}
                          className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col text-left transition-all duration-300 hover:shadow-2xl border border-gray-200 hover:border-blue-300 group cursor-pointer ${
                            section.id === "clinic"
                              ? "min-w-full sm:min-w-[240px] md:min-w-[260px] lg:min-w-[240px] xl:min-w-[260px] flex-shrink-0 snap-start"
                              : ""
                          }`}
                        >
                          <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 h-24">
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md">
                              <Image
                                src={imageUrl}
                                alt={partner.name || "Health Partner"}
                                fill
                                sizes="80px"
                                className="object-cover"
                                unoptimized={shouldUnoptimizeImage(imageUrl)}
                              />
                            </div>
                          </div>

                          <div className="pt-12 px-4 pb-4 flex flex-col items-center text-center gap-2">
                            <h3 className="text-base font-bold text-gray-800">
                              {partner.name}
                            </h3>
                            {specialization && (
                              <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                {specialization}
                              </div>
                            )}
                          </div>

                          <div className="px-4 pb-4 flex flex-col gap-2 text-left">
                            <p className="text-gray-700 text-xs flex items-center gap-2">
                              <FaPhone className="text-green-600" />
                              <span className="font-semibold">{phone}</span>
                            </p>
                            <p className="text-gray-600 text-xs flex items-start gap-2">
                              <FaMapMarkerAlt className="text-red-600 mt-0.5" />
                              <span className="line-clamp-2 break-words">{address}</span>
                            </p>
                          </div>

                          <div className="px-4 pb-5 flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleBookAppointment(partner)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-md text-xs font-semibold shadow-sm hover:from-green-600 hover:to-green-700 transition-colors"
                            >
                              Consult Now
                            </button>
                            <a
                              href={mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-md text-xs font-semibold shadow-sm hover:from-blue-600 hover:to-indigo-700 transition-colors text-center"
                            >
                              View Map
                            </a>
                          </div>
                        </motion.div>
                      );
                    } catch (error) {
                      console.warn('Error rendering partner:', partner?._id || partner?.id, error);
                      return null;
                    }
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}


