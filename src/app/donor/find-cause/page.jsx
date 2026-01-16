"use client";
import { FiSearch, FiFilter, FiHeart, FiMapPin, FiTag } from "react-icons/fi";
import Link from "next/link";

export default function FindCausePage() {
  const categories = [
    { name: "Medical", icon: "🏥", count: "200+ campaigns" },
    { name: "Education", icon: "📚", count: "150+ campaigns" },
    { name: "Emergency", icon: "🆘", count: "100+ campaigns" },
    { name: "Community", icon: "🤝", count: "80+ campaigns" },
    { name: "Memorial", icon: "🕯️", count: "50+ campaigns" },
    { name: "Nonprofit", icon: "💚", count: "120+ campaigns" }
  ];

  const tips = [
    {
      icon: <FiSearch className="text-2xl" />,
      title: "Use Search",
      description: "Search by name, location, or keywords to find specific campaigns"
    },
    {
      icon: <FiFilter className="text-2xl" />,
      title: "Filter by Category",
      description: "Browse medical, education, emergency, and other categories"
    },
    {
      icon: <FiMapPin className="text-2xl" />,
      title: "Find Local Causes",
      description: "Support campaigns in your city or state"
    },
    {
      icon: <FiTag className="text-2xl" />,
      title: "Trending Campaigns",
      description: "See what campaigns are getting the most support"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🔍</span>
          </div>
          <div className="text-sm text-blue-600 font-semibold mb-2">Step 1 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find a Cause</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse campaigns and find a cause that resonates with you. Every donation makes a difference.
          </p>
        </div>

        {/* Categories */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {categories.map((cat, index) => (
            <Link 
              href={`/campaigns?category=${cat.name.toLowerCase()}`}
              key={index} 
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 transform"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.count}</p>
            </Link>
          ))}
        </div>

        {/* How to Find */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Ways to Find Campaigns</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {tip.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Donate Banner */}
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FiHeart className="text-4xl text-blue-200" />
            <h2 className="text-2xl font-bold">Why Your Donation Matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-200">100%</div>
              <div className="text-blue-100">Goes to the cause</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-200">50K+</div>
              <div className="text-blue-100">Lives impacted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-200">80G</div>
              <div className="text-blue-100">Tax benefits</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/campaigns"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Browse All Campaigns →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/donor/make-donation" className="text-blue-600 hover:underline">Make a Donation</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



