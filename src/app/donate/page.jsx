"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";
import useAuthStore from "@/store/authStore";
import BackToHome from "@/components/BackToHome";

export default function DonatePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amount: "1",
    address: "",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDonation = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!donorInfo.firstName || !donorInfo.email || !donorInfo.amount) {
      toast.error("Please enter your name, email, and donation amount");
      return;
    }

    // Validate amount
    const amount = parseFloat(donorInfo.amount);
    if (isNaN(amount) || amount < 1) {
      toast.error("Minimum donation amount is 1");
      return;
    }

    // Validate phone if provided
    if (donorInfo.phone && !/^\d{10}$/.test(donorInfo.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // Check for duplicate email or phone number
    const previousDonations = JSON.parse(localStorage.getItem('donationHistory') || '[]');
    
    const duplicateEmail = previousDonations.find(d => d.email.toLowerCase() === donorInfo.email.toLowerCase());
    if (duplicateEmail) {
      toast.error("This email has already been used for a donation. Please use a different email or login to your account.");
      return;
    }

    if (donorInfo.phone) {
      const duplicatePhone = previousDonations.find(d => d.phone === donorInfo.phone);
      if (duplicatePhone) {
        toast.error("This phone number has already been used for a donation. Please use a different number or login to your account.");
        return;
      }
    }

    // Save donor info with amount to sessionStorage for payment page
    const donationInfo = {
      ...donorInfo,
      amount: parseFloat(donorInfo.amount)
    };
    sessionStorage.setItem('donorInfo', JSON.stringify(donationInfo));

    // Also save to localStorage for history
    localStorage.setItem('donorInfo', JSON.stringify(donationInfo));

    // Add to donation history to prevent duplicates
    previousDonations.push({
      email: donorInfo.email.toLowerCase(),
      phone: donorInfo.phone || '',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('donationHistory', JSON.stringify(previousDonations));
    
    // Check if user is authenticated before proceeding to payment
    if (!isAuthenticated) {
      // Redirect to login page with redirect parameter
      // Donation info is already saved in sessionStorage above
      toast.info("Please login to proceed with payment");
      router.push("/login?redirect=/donate/payment");
      return;
    }
    
    // If authenticated, proceed to payment page
    router.push("/donate/payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back to Home */}
        <BackToHome />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="text-4xl text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Donate Now</h1>
          <p className="text-gray-600">Your contribution makes a difference in someone's life</p>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmitDonation} className="space-y-5">
            {/* Donation Amount */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Donation Amount *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-xl"></div>
                <input
                  type="number"
                  name="amount"
                  value={donorInfo.amount}
                  onChange={handleInputChange}
                  placeholder="Enter Amount"
                  min="1"
                  step="1"
                  className="p-4 pl-10 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none font-semibold text-xl"
                  required
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-3 flex-wrap">
                {[100, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonorInfo(prev => ({ ...prev, amount: amt.toString() }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      donorInfo.amount === amt.toString()
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={donorInfo.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={donorInfo.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={donorInfo.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={donorInfo.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
                className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Google Maps Link) (Optional)</label>
              <input
                type="url"
                name="address"
                value={donorInfo.address}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/?q=..."
                className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
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

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                name="message"
                value={donorInfo.message}
                onChange={handleInputChange}
                placeholder="Leave a message..."
                rows={3}
                className="p-3 rounded-xl w-full bg-gray-50 border-2 border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
            >
              <FiHeart />
              <span>Donate Now</span>
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-3">
              * Required fields | Minimum donation: 1 | 100% goes to charity
            </p>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">Trusted by thousands of donors</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0%</div>
              <div className="text-xs">Platform Fee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">80G</div>
              <div className="text-xs">Tax Exempt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-xs">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



