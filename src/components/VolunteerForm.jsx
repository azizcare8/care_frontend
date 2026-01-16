"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaArrowRight } from "react-icons/fa";
import DonationCard from "./DonationCard";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

export default function VolunteerForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate phone number
      if (!formData.phone || formData.phone.trim() === '') {
        toast.error('Phone number is required');
        setIsLoading(false);
        return;
      }

      // Validate and format phone number (remove spaces, dashes, etc.)
      let formattedPhone = formData.phone.replace(/\D/g, ''); // Remove non-digits
      
      // Validate phone number format (10 digits)
      if (!/^\d{10}$/.test(formattedPhone)) {
        toast.error('Please enter a valid 10-digit phone number');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate name
      if (!formData.name || formData.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        setIsLoading(false);
        return;
      }

      const volunteerData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formattedPhone,
        password: formData.password || 'volunteer123', // Default password
        role: 'volunteer'
      };

      console.log('Sending registration data:', {
        ...volunteerData,
        password: '***hidden***'
      });

      // API URL should already include /api based on env config
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('API URL:', `${apiUrl}/auth/register`);
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(volunteerData),
      });

      // Get response text first to see raw response
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { message: responseText || 'Unknown error occurred' };
      }
      
      console.log('Registration response:', { 
        status: response.status, 
        statusText: response.statusText,
        data: data,
        rawText: responseText
      });

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400) {
          // Get detailed error message from all possible locations
          let errorMessage = 'Validation failed. Please check your inputs.';
          
          // Try different paths for error message
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.errors) {
            if (Array.isArray(data.errors)) {
              errorMessage = data.errors.join(', ');
            } else if (typeof data.errors === 'object') {
              // If errors is an object with field-specific errors
              const errorArray = Object.values(data.errors);
              errorMessage = errorArray.join(', ');
            }
          } else if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.data && data.data.message) {
            errorMessage = data.data.message;
          } else if (data.status && data.message) {
            errorMessage = data.message;
          }
          
          console.error('=== VALIDATION ERROR DETAILS ===');
          console.error('Error message:', errorMessage);
          console.error('Full response data:', JSON.stringify(data, null, 2));
          console.error('Response status:', response.status);
          console.error('All error paths:', {
            'data.message': data.message,
            'data.error': data.error,
            'data.errors': data.errors,
            'data.data.message': data.data?.message,
            'data.status': data.status
          });
          
          // Show user-friendly error
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        // Handle other errors
        const errorMsg = data.message || data.error || data.status?.message || 'Registration failed';
        console.error('Other error:', errorMsg, data);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      toast.success("Volunteer registration successful! Please check your email for verification. You can login after verification.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        message: ""
      });

      // Don't auto-navigate - let user stay on page
      // They can manually navigate to login when ready

    } catch (error) {
      console.error("Volunteer registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Only show toast if not already shown above
      if (!error.message.includes('Validation failed')) {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-16 bg-gradient-to-r from-green-50 to-pink-50 px-6 text-center">
      <div className="max-w-6xl mx-auto space-y-12">

        <div className="mb-10 text-center relative bg-white  rounded-2xl border border-green-200 shadow-[0_4px_20px_rgba(72,187,120,0.3)] p-20 hover:shadow-[0_8px_30px_rgba(72,187,120,0.5)] transition-all duration-500">
          <h5 className="text-green-600 font-semibold uppercase tracking-widest text-sm animate-pulse">
            Join Us
          </h5>
          <h1 className="text-3xl md:text-4xl mt-2 font-extrabold text-gray-800 leading-snug transform translate-y-5 animate-[fadeIn_0.8s_ease-in-out_0.2s_forwards]">
            Become a Volunteer and Make a Difference with Care Foundation Trust!
          </h1>
          
          <p className="text-gray-600 text-lg max-w-3xl mx-auto  transform translate-y-5 animate-[fadeIn_0.8s_ease-in-out_0.4s_forwards]">
            At Care Foundation Trust, every act of kindness can transform lives. Join our dedicated
            team of volunteers and help bring positive change to those in need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: <FaArrowRight />, text: "You are one Form Away" },
            { icon: <FaUserPlus />, text: "Join Our Volunteer Team" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-5 bg-green-100 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-green-600 text-2xl animate-bounce group-hover:text-emerald-500">
                {item.icon}
              </div>
              <span className="font-medium text-gray-800">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transition-all hover:shadow-3xl hover:-translate-y-2 duration-300">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-800 mb-6">
            Volunteer Registration Form
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Fill out the details below and our team will contact you.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-300"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile Number"
                required
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-300"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create Password"
                required
                minLength="6"
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition duration-300"
              />
            </div>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Why do you want to be part of Care Foundation Trust?"
              required
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none transition duration-300"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white transform hover:scale-105'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Form'} <FaArrowRight />
            </button>
          </form>
        </div>
      </div>

      <DonationCard />
    </section>
  );
}


