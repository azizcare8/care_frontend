"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import toast from "react-hot-toast";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaArrowLeft, FaHospital, FaUserMd, FaCheckCircle } from "react-icons/fa";
import useAuthStore from "@/store/authStore";

export default function HealthConsultPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    quantity: 1,
    date: "",
    time: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setIsLoading(true);
        const response = await partnerService.getPartner(id);
        setPartner(response.data || response);
        
        // Pre-fill form with user data if logged in
        if (isAuthenticated && user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || ""
          }));
        }
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
  }, [id, isAuthenticated, user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please login to submit consultation request");
      router.push(`/login?redirect=/partners/health/consult/${id}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Import consultation service
      const { consultationService } = await import('@/services/consultationService');
      
      // Save consultation data to backend
      const consultationData = {
        partnerId: partner._id,
        partnerName: partner.name,
        category: 'health',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        quantity: formData.quantity || 1,
        date: formData.date || undefined,
        time: formData.time || undefined
      };
      
      // Save to backend
      const response = await consultationService.createConsultation(consultationData);
      
      // Also save to session storage for payment page
      const sessionData = {
        consultationId: response.data._id,
        partnerId: partner._id,
        partnerName: partner.name,
        ...formData,
        submittedAt: new Date().toISOString()
      };
      
      sessionStorage.setItem('healthConsultationData', JSON.stringify(sessionData));
      
      toast.success("Consultation request submitted successfully!");
      
      // Redirect to payment page
      router.push(`/partners/health/payment/${id}`);
    } catch (error) {
      console.error("Failed to submit consultation:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit consultation request";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const getFullAddress = (partner) => {
    if (typeof partner?.address === 'object' && partner?.address) {
      return `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
    }
    return partner?.address || 'Address not available';
  };

  const getImageUrl = (partner) => {
    if (partner?.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        if (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://')) {
          return primaryImage.url;
        }
        const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=300&fit=crop&crop=faces';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partner details...</p>
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
          Back to Partner Details
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partner Info Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-blue-200">
                  <Image
                    src={imageUrl}
                    alt={partner.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=300&fit=crop&crop=faces';
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{partner.name}</h2>
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <FaHospital className="inline mr-2" />
                  Health Partner
                </span>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhone className="text-blue-500" />
                  <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{phone}</a>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FaEnvelope className="text-blue-500" />
                  <a href={`mailto:${email}`} className="hover:text-blue-600 text-sm break-all">{email}</a>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-blue-500 mt-1" />
                  <span className="text-sm">{address}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Consultation Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Consult with {partner.name}</h1>
              <p className="text-gray-600 mb-8">Fill out the form below to request a consultation or appointment</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="10-digit phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message / Special Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Tell us about your health concerns, symptoms, or any special requirements..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-xl" />
                      Submit Consultation Request
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

