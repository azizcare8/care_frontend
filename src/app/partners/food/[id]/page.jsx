"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaArrowLeft, FaUtensils, FaStore, FaStar, FaCalendarCheck, FaWhatsapp } from "react-icons/fa";

export default function FoodPartnerProfile() {
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

  // Helper function to get full address
  const getFullAddress = (partner) => {
    if (typeof partner?.address === 'object' && partner?.address) {
      return `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
    }
    return partner?.address || 'Address not available';
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

  // Helper function to get operating hours
  const getOperatingHours = (partner) => {
    if (!partner?.operatingHours) return { days: "MON-SAT", time: "09:00 - 21:00" };
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partner profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner not found</h2>
            <button
              onClick={() => router.back()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
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
  const operatingHours = getOperatingHours(partner);
  const phone = partner.phone || partner.contactPerson?.phone || 'N/A';
  const email = partner.email || partner.contactPerson?.email || 'N/A';

  // Handle consult redirect
  const handleConsult = () => {
    if (!partner?._id) {
      toast.error("Unable to open consult page");
      return;
    }
    router.push(`/partners/food/consult/${partner._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft />
          Back to Food Partners
        </motion.button>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/30 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={partner.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
                  }}
                />
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left flex-grow">
                <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3 backdrop-blur-sm">
                  <FaStore className="inline mr-2" />
                  Food Partner
                </span>
                <h1 className="text-4xl font-bold mb-2">{partner.name}</h1>
                {partner.contactPerson?.name && (
                  <p className="text-orange-100 text-lg mb-4">
                    Contact: {partner.contactPerson.name}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-300">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-lg" />
                  ))}
                  <span className="text-white ml-2">(Trusted Partner)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <FaUtensils className="text-orange-500" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <FaPhone className="text-orange-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-gray-800 font-semibold hover:text-orange-600 transition-colors">
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaEnvelope className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a href={`mailto:${email}`} className="text-gray-800 font-semibold hover:text-orange-600 transition-colors">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div className="bg-red-100 p-3 rounded-full">
                      <FaMapMarkerAlt className="text-red-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="text-gray-800 font-semibold">{address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaClock className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Operating Hours</p>
                      <p className="text-gray-800 font-semibold">{operatingHours.days}</p>
                      <p className="text-gray-600 text-sm">{operatingHours.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About & Description */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
                  <FaStore className="text-orange-500" />
                  About
                </h3>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    {partner.description || `${partner.name} is a trusted food partner committed to providing quality meals and services. We are dedicated to feeding the hungry and supporting our community.`}
                  </p>
                </div>

                {partner.services && partner.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Services Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {typeof service === 'object' ? service.name : service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t-2 border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConsult}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-3"
              >
                <FaUtensils className="text-xl" />
                Order Food
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3"
              >
                <FaMapMarkerAlt className="text-xl" />
                View on Map
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={getWhatsAppLink(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-3"
              >
                <FaWhatsapp className="text-xl" />
                Chat on WhatsApp
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

