"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaArrowLeft, FaCalendarCheck, FaHospital, FaUserMd, FaStar, FaWhatsapp } from "react-icons/fa";
import { getBackendBaseUrl } from "@/utils/api";

export default function HealthPartnerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setIsLoading(true);
        const response = await partnerService.getPartner(id);
        setPartner(response.data || response);
      } catch (error) {
        console.error("Failed to fetch partner:", error);
        toast.error("Failed to load partner details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPartner();
    }
  }, [id]);

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
    if (typeof partner?.address === 'object' && partner?.address) {
      const address = `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
      const normalized = normalizeAddressString(address);
      return normalized || 'Address not available';
    }
    const addressValue = typeof partner?.address === 'string' ? partner.address : '';
    const normalized = normalizeAddressString(addressValue);
    return normalized || 'Address not available';
  };

  // Helper function to get image URL
  const getImageUrl = (partner) => {
    if (partner?.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        // If URL is already absolute, return as is
        if (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://')) {
          return primaryImage.url;
        }
        // If URL is relative, make it absolute
        const backendBaseURL = getBackendBaseUrl();
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces';
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

  // Helper function to get specialization
  const getSpecialization = (partner) => {
    if (partner?.description) {
      const specMatch = partner.description.match(/Specialization:\s*([^.]+)/i);
      if (specMatch) {
        return specMatch[1].trim();
      }
    }
    return partner?.contactPerson?.designation || 'General Physician';
  };

  // Helper function to convert phone to WhatsApp link
  const getWhatsAppLink = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'N/A') {
      return 'https://wa.me/919136521052'; // Default to organization number
    }
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // If it starts with 91, use as is, otherwise add 91 prefix
    const whatsappNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    return `https://wa.me/${whatsappNumber}`;
  };

  // Handle consult now
  const handleConsult = () => {
    if (!partner?._id) {
      toast.error("Unable to open consultation");
      return;
    }
    router.push(`/partners/health/consult/${partner._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner not found</h2>
            <button
              onClick={() => router.back()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const address = getFullAddress(partner);
  const imageUrl = getImageUrl(partner);
  const mapLink = getMapLink(partner);
  const specialization = getSpecialization(partner);
  const phone = partner.phone || partner.contactPerson?.phone || 'N/A';
  const email = partner.email || partner.contactPerson?.email || 'N/A';

  return (
    <div className="min-h-screen bg-[#f4f7fb] pt-24">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft />
          Back to Health Partners
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[28px] shadow-[0_25px_70px_-35px_rgba(15,23,42,0.45)] overflow-hidden border border-slate-100"
        >
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-white via-blue-50/60 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start p-6 sm:p-10">
              <div className="order-2 lg:order-1">
                <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3">
                  <FaUserMd className="text-sm" />
                  {specialization}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{partner.name}</h1>
                {partner.contactPerson?.name && (
                  <p className="text-slate-600 text-base sm:text-lg mb-3">
                    Contact: {partner.contactPerson.name}
                  </p>
                )}
                <div className="flex items-center gap-1 text-yellow-400 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-base sm:text-lg" />
                  ))}
                  <span className="text-slate-600 ml-2">(Trusted Partner)</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConsult}
                    className="bg-blue-600 text-white py-3 px-5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <FaCalendarCheck />
                    Consult Now
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-700 py-3 px-5 rounded-xl font-semibold shadow-md border border-blue-100 hover:border-blue-200 transition-all flex items-center gap-2"
                  >
                    <FaMapMarkerAlt />
                    View on Map
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={getWhatsAppLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 text-emerald-700 py-3 px-5 rounded-xl font-semibold shadow-md border border-emerald-100 hover:border-emerald-200 transition-all flex items-center gap-2"
                  >
                    <FaWhatsapp />
                    WhatsApp
                  </motion.a>
                </div>

                <div className="mt-6 space-y-4 max-w-2xl">
                  <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-blue-100 p-2.5 rounded-full">
                      <FaPhone className="text-blue-600 text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <a
                        href={phone && phone !== "N/A" ? `tel:${phone.replace(/\s+/g, "")}` : undefined}
                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-green-100 p-2.5 rounded-full">
                      <FaEnvelope className="text-green-600 text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <a
                        href={email && email !== "N/A" ? `mailto:${email}` : undefined}
                        className="text-sm font-semibold text-slate-800 break-words hover:text-blue-600 transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-red-100 p-2.5 rounded-full">
                      <FaMapMarkerAlt className="text-red-600 text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 break-words hover:text-blue-600 transition-colors"
                      >
                        {address}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative order-1 lg:order-2 lg:justify-self-end w-full">
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-200/60 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-200/60 blur-3xl" />
                <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[30px] overflow-hidden shadow-[0_25px_55px_-20px_rgba(30,64,175,0.45)] ring-8 ring-white/80">
                  <Image
                    src={imageUrl}
                    alt={partner.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-10 border-t border-slate-100 bg-gradient-to-br from-white to-slate-50">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white flex items-center gap-2">
                  <FaClock className="text-white" />
                  <h3 className="text-lg font-semibold">About</h3>
                </div>
                <div className="px-5 py-4">
                  <p className="text-slate-700 leading-relaxed">
                    {partner.description || `${partner.name} is a trusted healthcare partner committed to providing quality medical services. We are dedicated to helping our community stay healthy and well.`}
                  </p>
                </div>
              </div>

              {partner.services && partner.services.length > 0 && (
                <div className="rounded-3xl border border-slate-100 shadow-sm bg-white p-5">
                  <h4 className="font-semibold text-slate-800 mb-3">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {partner.services.map((service, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


