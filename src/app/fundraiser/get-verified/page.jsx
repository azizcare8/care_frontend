"use client";
import { FiShield, FiClock, FiCheck, FiUser, FiFileText, FiPhone } from "react-icons/fi";
import Link from "next/link";

export default function GetVerifiedPage() {
  const verificationSteps = [
    {
      icon: <FiFileText className="text-3xl" />,
      title: "Document Review",
      description: "Our team carefully reviews all uploaded documents including ID proof, medical reports, and supporting evidence."
    },
    {
      icon: <FiUser className="text-3xl" />,
      title: "Identity Verification",
      description: "We verify the identity of the campaign creator through Aadhar/PAN and phone verification."
    },
    {
      icon: <FiPhone className="text-3xl" />,
      title: "Phone Verification",
      description: "A team member may call to verify details and ensure authenticity of the campaign."
    },
    {
      icon: <FiCheck className="text-3xl" />,
      title: "Approval & Launch",
      description: "Once verified, your campaign goes live and becomes visible to thousands of potential donors."
    }
  ];

  const timeline = [
    { time: "0-2 hours", status: "Document submission review" },
    { time: "2-12 hours", status: "Identity verification" },
    { time: "12-24 hours", status: "Final approval & launch" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <div className="text-sm text-blue-600 font-semibold mb-2">Step 2 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get Verified</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our team reviews and approves your campaign within 24 hours. Verification builds trust with donors.
          </p>
        </div>

        {/* Verification Badge */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 text-center">
          <FiShield className="text-6xl text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Verification Matters</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Verified campaigns receive up to 3x more donations. Our verification badge shows donors that your campaign is legitimate and trustworthy.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {verificationSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <FiClock /> Verification Timeline
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {timeline.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="text-3xl font-bold text-blue-200 mb-2">{item.time}</div>
                <div className="text-blue-100">{item.status}</div>
                {index < timeline.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 w-8 h-0.5 bg-blue-400"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/create-fundraiser"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Campaign Now →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/fundraiser/share-promote" className="text-blue-600 hover:underline">Share & Promote</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



