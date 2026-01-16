"use client";
import { FiShare2, FiMessageCircle, FiUsers, FiTrendingUp } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import Link from "next/link";

export default function SharePromotePage() {
  const platforms = [
    {
      icon: <FaWhatsapp className="text-4xl" />,
      name: "WhatsApp",
      description: "Share directly with contacts and groups. Personal messages get higher response rates.",
      color: "bg-green-500"
    },
    {
      icon: <FaFacebook className="text-4xl" />,
      name: "Facebook",
      description: "Post on your timeline, share in groups, and ask friends to spread the word.",
      color: "bg-blue-600"
    },
    {
      icon: <FaTwitter className="text-4xl" />,
      name: "Twitter",
      description: "Tweet your campaign with relevant hashtags to reach a wider audience.",
      color: "bg-sky-500"
    },
    {
      icon: <FaInstagram className="text-4xl" />,
      name: "Instagram",
      description: "Share stories and posts with campaign link in bio. Visual content performs best.",
      color: "bg-pink-500"
    }
  ];

  const tips = [
    {
      icon: <FiMessageCircle />,
      title: "Personal Messages Work Best",
      description: "Reach out personally to friends and family. Explain why this cause matters to you."
    },
    {
      icon: <FiUsers />,
      title: "Ask for Shares, Not Just Donations",
      description: "Even those who can't donate can share. One share can reach hundreds of potential donors."
    },
    {
      icon: <FiTrendingUp />,
      title: "Post Regular Updates",
      description: "Keep supporters engaged with progress updates. Share milestones and thank donors publicly."
    },
    {
      icon: <FiShare2 />,
      title: "Use Multiple Platforms",
      description: "Don't rely on just one platform. Cross-post to reach different audiences."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📢</span>
          </div>
          <div className="text-sm text-purple-600 font-semibold mb-2">Step 3 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Share & Promote</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share on social media and reach thousands of supporters. The more you share, the more you raise!
          </p>
        </div>

        {/* Social Platforms */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Share on These Platforms</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {platforms.map((platform, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow hover:-translate-y-1 transform">
              <div className={`w-16 h-16 ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white`}>
                {platform.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{platform.name}</h3>
              <p className="text-sm text-gray-600">{platform.description}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Promotion Tips</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-purple-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Sharing Impact</h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-200">10x</div>
              <div className="text-purple-100 text-sm">More donations with sharing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-200">500+</div>
              <div className="text-purple-100 text-sm">Average reach per share</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-200">72%</div>
              <div className="text-purple-100 text-sm">Donations from shared links</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/create-fundraiser"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Create Campaign & Start Sharing →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/fundraiser/receive-funds" className="text-purple-600 hover:underline">Receive Funds</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



