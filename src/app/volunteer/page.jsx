"use client";
import { useState } from "react";
import ClientLayout from "../ClientLayout";
import toast from "react-hot-toast";
import { FiHeart, FiUsers, FiClock, FiMapPin } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";
import { authService } from "@/services/authService";

export default function Volunteer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    interests: "",
    availability: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = formData.phone.replace(/\D/g, "");

    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: cleanPhone,
        role: "volunteer",
        volunteerDetails: {
          communicationAddress: formData.city?.trim() || "",
          hobbies: formData.interests || "",
          whyVolunteer: formData.availability
            ? `Availability: ${formData.availability}`
            : "",
          designation: "Volunteer"
        }
      });

      toast.success("Volunteer form submitted! Your request is pending approval.");
      setFormData({ name: "", email: "", phone: "", city: "", interests: "", availability: "" });
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to submit volunteer form.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: <FiHeart />, title: "Make a Difference", description: "Directly impact lives and communities in need" },
    { icon: <FiUsers />, title: "Build Connections", description: "Meet like-minded people passionate about giving back" },
    { icon: <FiClock />, title: "Flexible Hours", description: "Choose your own schedule and availability" },
    { icon: <FiMapPin />, title: "Local Impact", description: "Serve your local community and see the change" }
  ];

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-28 lg:pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Become a Volunteer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our team of dedicated volunteers and make a real difference in people's lives.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Register as a Volunteer</h2>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your city"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
              <select
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select your interest</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="food">Food Distribution</option>
                <option value="events">Event Management</option>
                <option value="fundraising">Fundraising</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select availability</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="both">Both</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
}
