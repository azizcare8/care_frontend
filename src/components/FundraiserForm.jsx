"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useCampaignStore from "@/store/campaignStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function FundraiserForm() {
  const router = useRouter();
  const { createCampaign, isLoading } = useCampaignStore();
  const { isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    category: "medical",
    goalAmount: "",
    beneficiaryName: "",
    beneficiaryContact: "",
    city: "",
    state: "",
    address: "",
    startDate: "",
    endDate: "",
    story: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Please login to start a fundraiser");
      router.push("/login");
      return;
    }

    try {
      // Validate required fields
      if (!formData.title || !formData.shortDescription || !formData.story) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate title length
      if (formData.title.trim().length < 10 || formData.title.trim().length > 100) {
        toast.error("Title must be between 10 and 100 characters");
        return;
      }

      // Validate short description length
      if (formData.shortDescription.trim().length < 20 || formData.shortDescription.trim().length > 200) {
        toast.error("Short description must be between 20 and 200 characters");
        return;
      }

      // Validate description length
      if (formData.story.trim().length < 1 || formData.story.trim().length > 5000) {
        toast.error("Description must be between 1 and 5000 characters");
        return;
      }

      if (!formData.goalAmount || parseInt(formData.goalAmount) < 100) {
        toast.error("Goal amount must be at least ₹100");
        return;
      }

      const campaignData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.story.trim(), // Changed from fullDescription to description
        category: formData.category,
        goalAmount: parseInt(formData.goalAmount),
        beneficiary: {
          name: formData.beneficiaryName.trim(),
          contact: {
            phone: formData.beneficiaryContact.trim(),
          },
        },
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          address: formData.address.trim(),
          country: "India"
        },
        timeline: {
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Default 60 days
        }
      };

      await createCampaign(campaignData);
      toast.success("Fundraiser created successfully! Waiting for admin approval. You can check status in your dashboard.");

      // Reset form
      setFormData({
        title: "",
        shortDescription: "",
        category: "medical",
        goalAmount: "",
        beneficiaryName: "",
        beneficiaryContact: "",
        city: "",
        state: "",
        address: "",
        startDate: "",
        endDate: "",
        story: "",
      });

      // Don't auto-navigate - let user stay on page or navigate manually
      // User can check their campaigns in dashboard if they want
      
    } catch (error) {
      console.error("Campaign creation error:", error);
      
      // Extract error message from various error formats
      let errorMessage = "Failed to create fundraiser";
      
      // Check for errors array first (validation errors)
      if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors.map(e => {
          if (typeof e === 'string') return e;
          if (e.message) return e.message;
          if (e.field && e.message) return `${e.field}: ${e.message}`;
          return JSON.stringify(e);
        }).join(", ");
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors from axios response
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          errorMessage = validationErrors.map(e => {
            if (typeof e === 'string') return e;
            if (e.message) return e.message;
            if (e.field && e.message) return `${e.field}: ${e.message}`;
            return JSON.stringify(e);
          }).join(", ");
        } else if (typeof validationErrors === 'string') {
          errorMessage = validationErrors;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.status === 'error' && error?.message) {
        errorMessage = error.message;
      }
      
      // Log full error for debugging
      console.error("Full error details:", JSON.stringify(error, null, 2));
      
      toast.error(errorMessage);
    }
  };

  return (
    <section className="relative bg-gray-50 overflow-hidden">
      
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0">
          <img
            src="/images/main-slider/123.jpg"
            alt="Fundraiser background"
            className="object-cover w-full h-full scale-105 opacity-60 animate-slow-zoom"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg"
        >
          Start your fundraiser and make a difference today!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative z-10 mt-4 text-lg text-gray-200 max-w-2xl"
        >
          Empower change — raise funds for causes that matter. Let’s bring your
          story to life.
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-6"
        >
          
          <input
            type="text"
            name="title"
            placeholder="Fundraiser Title (minimum 10, maximum 100 characters)"
            value={formData.title}
            onChange={handleChange}
            minLength="10"
            maxLength="100"
            required
            className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
          />
          {formData.title && (
            <p className={`text-xs mt-1 ${
              formData.title.trim().length < 10 
                ? 'text-red-500' 
                : formData.title.trim().length > 100 
                  ? 'text-red-500' 
                  : 'text-gray-500'
            }`}>
              {formData.title.trim().length} / 100 characters 
              {formData.title.trim().length < 10 && ` (minimum 10 required)`}
            </p>
          )}

          <textarea
            name="shortDescription"
            placeholder="Short Description (minimum 20, maximum 200 characters)"
            value={formData.shortDescription}
            onChange={handleChange}
            minLength="20"
            maxLength="200"
            required
            rows="2"
            className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
          />
          {formData.shortDescription && (
            <p className={`text-xs mt-1 ${
              formData.shortDescription.trim().length < 20 
                ? 'text-red-500' 
                : formData.shortDescription.trim().length > 200 
                  ? 'text-red-500' 
                  : 'text-gray-500'
            }`}>
              {formData.shortDescription.trim().length} / 200 characters 
              {formData.shortDescription.trim().length < 20 && ` (minimum 20 required)`}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            >
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="emergency">Emergency</option>
              <option value="memorial">Memorial</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="community">Community</option>
            </select>

            <input
              type="number"
              name="goalAmount"
              placeholder="Goal Amount (INR)"
              value={formData.goalAmount}
              onChange={handleChange}
              required
              min="1000"
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Upload Pictures</label>
            <div className="grid md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="file"
                  className="border p-2 rounded-lg w-full text-gray-600 hover:border-green-400 cursor-pointer transition"
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="beneficiaryName"
              placeholder="Beneficiary Name"
              value={formData.beneficiaryName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <input
              type="text"
              name="beneficiaryContact"
              placeholder="Beneficiary Contact"
              value={formData.beneficiaryContact}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
          </div>

          <div>
            <input
              type="url"
              name="address"
              placeholder="https://maps.google.com/?q=..."
              value={formData.address}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
            />
            <p className="text-xs text-gray-600 mt-1">
              📍 Paste Google Maps location link here. 
              <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline ml-1"
              >
                Get location link
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Aadhar Card</label>
              <input
                type="file"
                className="border p-2 rounded-lg w-full text-gray-600 hover:border-green-400 cursor-pointer transition"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">PAN Card</label>
              <input
                type="file"
                className="border p-2 rounded-lg w-full text-gray-600 hover:border-green-400 cursor-pointer transition"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Upload Supporting Documents</label>
            <div className="grid md:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <input
                  key={i}
                  type="file"
                  className="border p-2 rounded-lg w-full text-gray-600 hover:border-green-400 cursor-pointer transition"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Upload Video</label>
            <input
              type="file"
              className="border p-2 rounded-lg w-full text-gray-600 hover:border-green-400 cursor-pointer transition"
            />
          </div>

          <textarea
            name="story"
            placeholder="Full Story - Explain why you need funds and how they will be used"
            rows={6}
            value={formData.story}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
          />

          <div className="text-center pt-4">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`px-8 py-3 rounded-lg font-medium transition shadow-lg ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Fundraiser'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}


