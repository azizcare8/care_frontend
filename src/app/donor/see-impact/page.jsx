"use client";
import { FiTrendingUp, FiUsers, FiHeart, FiEye, FiBell, FiImage } from "react-icons/fi";
import Link from "next/link";

export default function SeeImpactPage() {
  const impactFeatures = [
    {
      icon: <FiBell className="text-3xl" />,
      title: "Real-time Updates",
      description: "Get notified whenever the campaign reaches a milestone or posts an update"
    },
    {
      icon: <FiImage className="text-3xl" />,
      title: "Photos & Videos",
      description: "See photos and videos of how your donation is being utilized"
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: "Progress Tracking",
      description: "Watch the campaign progress from your donation to goal completion"
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: "Beneficiary Stories",
      description: "Read stories from beneficiaries about how donations changed their lives"
    }
  ];

  const impactStats = [
    { number: "50,000+", label: "Lives Impacted" },
    { number: "5Cr+", label: "Funds Raised" },
    { number: "1,000+", label: "Successful Campaigns" },
    { number: "100%", label: "Transparency" }
  ];

  const trackingWays = [
    "Campaign progress bar and percentage",
    "Fund utilization reports",
    "Photo and video updates",
    "Beneficiary testimonials",
    "Milestone notifications",
    "Final completion report"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✨</span>
          </div>
          <div className="text-sm text-orange-600 font-semibold mb-2">Step 4 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">See Impact</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track how your donation is making a real difference. Complete transparency at every step.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-orange-500 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {impactFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How to Track */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
            <FiEye className="text-orange-500" /> How You Can Track Impact
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {trackingWays.map((way, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <FiHeart className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">{way}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="bg-orange-500 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Commitment to Transparency</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <FiEye className="text-4xl text-orange-200 mx-auto mb-3" />
              <div className="font-semibold">Open Tracking</div>
              <div className="text-sm text-orange-100">Every rupee is accounted for</div>
            </div>
            <div>
              <FiTrendingUp className="text-4xl text-orange-200 mx-auto mb-3" />
              <div className="font-semibold">Regular Updates</div>
              <div className="text-sm text-orange-100">Weekly progress reports</div>
            </div>
            <div>
              <FiUsers className="text-4xl text-orange-200 mx-auto mb-3" />
              <div className="font-semibold">Verified Stories</div>
              <div className="text-sm text-orange-100">Real beneficiary feedback</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/campaigns"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Making an Impact →
          </Link>
          <p className="mt-4 text-gray-500">
            Start over: <Link href="/donor/find-cause" className="text-orange-500 hover:underline">Find a Cause</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



