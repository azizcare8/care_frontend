"use client";
import { FiStar, FiHeart } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function HappyClients() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Donor",
      message: "Care Foundation has been doing exceptional work in the healthcare sector. I've been donating for 5 years and can see the real impact of my contributions.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Volunteer",
      message: "Volunteering with Care Foundation has been a life-changing experience. The team is dedicated and transparent about their work.",
      rating: 5
    },
    {
      name: "Mohammed Ali",
      role: "Beneficiary",
      message: "The medical camp organized by Care Foundation saved my mother's life. We are forever grateful for their support.",
      rating: 5
    },
    {
      name: "Sunita Patel",
      role: "Donor",
      message: "I trust Care Foundation with my donations because they provide complete transparency on how funds are utilized.",
      rating: 5
    },
    {
      name: "Vikram Singh",
      role: "Partner",
      message: "As a doctor partner, I'm proud to be associated with Care Foundation. They truly care about community welfare.",
      rating: 5
    },
    {
      name: "Meera Joshi",
      role: "Volunteer",
      message: "The food distribution drives are well organized. It's heartwarming to see smiles on faces of those we serve.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="text-4xl text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Happy Clients</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from our donors, volunteers, and beneficiaries about their experience with Care Foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{testimonial.message}"</p>
              <div className="border-t pt-4">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-green-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Be a part of our growing family of donors, volunteers, and supporters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/campaigns" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Start Donating
            </a>
            <a href="/volunteer" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Become a Volunteer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



