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
        const backendBaseURL = getBackendBaseUrl();
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces';
  };

  // Helper function to get map link
  const getMapLink = (partner) => {
    const address = getFullAddress(partner);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
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

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-8 text-white">
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
                    e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces';
                  }}
                />
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left flex-grow">
                <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3 backdrop-blur-sm">
                  <FaUserMd className="inline mr-2" />
                  {specialization}
                </span>
                <h1 className="text-4xl font-bold mb-2">{partner.name}</h1>
                {partner.contactPerson?.name && (
                  <p className="text-blue-100 text-lg mb-4">
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
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                  <FaHospital className="text-blue-500" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaPhone className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaEnvelope className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a href={`mailto:${email}`} className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="bg-red-100 p-3 rounded-full">
                      <FaMapMarkerAlt className="text-red-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="text-gray-800 font-semibold">{address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About & Description */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  About
                </h3>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    {partner.description || `${partner.name} is a trusted healthcare partner committed to providing quality medical services. We are dedicated to helping our community stay healthy and well.`}
                  </p>
                </div>

                {partner.services && partner.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Services Offered:</h4>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t-2 border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConsult}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-3"
              >
                <FaCalendarCheck className="text-xl" />
                Consult Now
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


