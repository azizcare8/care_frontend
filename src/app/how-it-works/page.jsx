"use client";
import { FiCheckCircle, FiHeart, FiUsers, FiGift } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FiUsers className="text-4xl" />,
      title: "Choose a Cause",
      description: "Browse through our various campaigns and choose a cause that resonates with you. From education to healthcare, we have multiple ways to make an impact."
    },
    {
      icon: <FiHeart className="text-4xl" />,
      title: "Make a Donation",
      description: "Contribute any amount you're comfortable with. Every rupee counts and goes directly towards helping those in need."
    },
    {
      icon: <FiCheckCircle className="text-4xl" />,
      title: "Track Your Impact",
      description: "Receive updates on how your donation is being used. We believe in complete transparency and keep you informed every step of the way."
    },
    {
      icon: <FiGift className="text-4xl" />,
      title: "Spread the Word",
      description: "Share our campaigns with your friends and family. Help us reach more people and create a bigger impact together."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Making a difference is simple. Follow these easy steps to start your journey of giving.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                {step.icon}
              </div>
              <div className="text-sm text-green-600 font-semibold mb-2">Step {index + 1}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already creating positive change in communities across India.
          </p>
          <a href="/campaigns" className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
            Start Donating Now
          </a>
        </div>
      </div>
    </div>
  );
}



