"use client";
import { useState, useEffect } from "react";
import ClientLayout from "../ClientLayout";
import api from "@/utils/api";
import { BiPlay } from "react-icons/bi";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import Image from "next/image";
import BackToHome from "@/components/BackToHome";

export default function FounderPage() {
  const [founderData, setFounderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Using actual founder data
    setFounderData({
      name: "Aziz Gheewala",
      designation: "Founder & CEO, Care Foundation TrustⓇ",
      introduction: "Welcome to Care Foundation TrustⓇ. Since 1997, we have been committed to making a meaningful difference in the lives of those in need through transparent donations, volunteer support, and meaningful partnerships.",
      bio: "Since 1997, Care Foundation TrustⓇ has been committed to making a meaningful difference in the lives of those in need. Our mission is to address critical social issues and uplift lives through compassion, empathy, and dedicated service. With over two decades of service, we have touched thousands of lives through our various programs including food relief, medical assistance, education support, and community development initiatives. Every donation, every volunteer, and every partner contributes to our shared vision of a better, more compassionate world.",
      achievements: [
        "Over 10,000+ beneficiaries helped",
        "500+ active volunteers",
        "100+ partner organizations",
        "Transparent fund utilization"
      ],
      videos: [
        {
          title: "Our Mission",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "Learn about our mission and vision"
        },
        {
          title: "Success Stories",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description: "Real stories of impact"
        }
      ],
      motivationalQuotes: [
        "Every small act of kindness creates a ripple effect of positive change.",
        "Together, we can build a better tomorrow for those in need.",
        "Transparency and trust are the foundations of meaningful impact."
      ],
      image: "/founder.jpg" // Default image
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 pt-28 lg:pt-32">
      {/* Back to Home */}
      <div className="max-w-6xl mx-auto px-4">
        <BackToHome />
      </div>
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-green-500 shadow-xl">
                  <Image
                    src={founderData.image || "/placeholder-founder.jpg"}
                    alt={founderData.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{founderData.name}</h1>
                <p className="text-xl text-green-600 font-semibold mb-4">{founderData.designation}</p>
                <p className="text-gray-700 text-lg leading-relaxed">{founderData.introduction}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Founder</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">{founderData.bio}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {founderData.achievements.map((achievement, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-700 font-medium">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      {founderData.videos && founderData.videos.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Videos & Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {founderData.videos.map((video, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <iframe
                      src={video.url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Motivational Quotes */}
      {founderData.motivationalQuotes && founderData.motivationalQuotes.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Words of Inspiration</h2>
            <div className="space-y-6">
              {founderData.motivationalQuotes.map((quote, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white shadow-xl relative">
                  <FaQuoteLeft className="text-4xl mb-4 opacity-50 absolute top-4 left-4" />
                  <p className="text-xl font-medium italic leading-relaxed pl-12">{quote}</p>
                  <FaQuoteRight className="text-2xl opacity-50 absolute bottom-4 right-4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Us in Making a Difference</h2>
            <p className="text-gray-600 mb-6">
              Together, we can create lasting positive change in our community.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = "/volunteer"}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Become a Volunteer
              </button>
              <button
                onClick={() => window.location.href = "/donate"}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Make a Donation
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ClientLayout>
  );
}
