"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function ContactSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/contact', formData);

      if (response.data && response.data.status === 'success') {
        toast.success("Message sent successfully! We'll get back to you soon.");
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }

    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          
          <div className="lg:w-1/2 space-y-6">
            <div>
              <span className="inline-flex items-center text-green-600 font-semibold uppercase tracking-wide text-sm mb-2">
                <i className="fas fa-plus mr-2"></i> Donate Projects
                <span className="ml-2 text-gray-400 font-bold text-xs">Donate</span>
              </span>
              <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                Ready to Get More Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sed ut perspiciatis unde omnis natus voluptatem accusantium dolore dantiumy totam apeam eaquey quaventore veritatis architecto beatae.
              </p>
              <a
                href="/events"
                className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Get Free Quote <i className="far fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition">
              <div className="text-green-600 text-3xl mb-3">
                <i className="flaticon-place"></i>
              </div>
              <h5 className="font-semibold text-gray-800 mb-1">Our Location</h5>
              <p className="text-gray-600 text-sm">
                5075 Main Road, D- Block, 2nd Floor, New York
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition">
              <div className="text-green-600 text-3xl mb-3">
                <i className="flaticon-envelope"></i>
              </div>
              <h5 className="font-semibold text-gray-800 mb-1">Email Address</h5>
              <p className="text-gray-600 text-sm">
                carefoundationtrustorg@gmail.com <br /> www.funden.com
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow hover:shadow-lg transition">
              <div className="text-green-600 text-3xl mb-3">
                <i className="flaticon-phone-call-1"></i>
              </div>
              <h5 className="font-semibold text-gray-800 mb-1">Support 24/7</h5>
              <a 
                href="https://wa.me/919136521052" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 text-sm hover:text-green-600 transition-colors"
              >
                +91 9136521052
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-5/12 h-96 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.123456789!2d72.123456789!3d19.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA3JzI0LjQiTiA3MsKwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              title="Location Map"
            ></iframe>
          </div>

          <div className="lg:w-7/12 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Send Us Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Willie M. Stanley"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="support@gmail.com"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="I would like to"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Write Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Hello"
                  required
                  className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-400 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Send Us Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}


