"use client";
import { FiMail, FiDownload, FiFileText, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function GetReceiptPage() {
  const receiptFeatures = [
    {
      icon: <FiMail className="text-3xl" />,
      title: "Instant Email",
      description: "Receive your donation receipt instantly to your registered email address"
    },
    {
      icon: <FiDownload className="text-3xl" />,
      title: "Download Anytime",
      description: "Download your receipts from dashboard anytime you need them"
    },
    {
      icon: <FiFileText className="text-3xl" />,
      title: "80G Certificate",
      description: "Get 80G tax exemption certificate for eligible donations"
    },
    {
      icon: <FiCheckCircle className="text-3xl" />,
      title: "Campaign Updates",
      description: "Receive regular updates on campaign progress and fund utilization"
    }
  ];

  const receiptContains = [
    "Donation amount and date",
    "Campaign details",
    "80G registration number",
    "Transaction ID",
    "Donor details",
    "Organization details"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📧</span>
          </div>
          <div className="text-sm text-purple-600 font-semibold mb-2">Step 3 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get Receipt</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Receive instant receipt and updates on campaign progress. All donations are 80G tax exempt.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {receiptFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Receipt Sample */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's in Your Receipt</h2>
          <div className="max-w-md mx-auto">
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50">
              {receiptContains.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-purple-200 last:border-0">
                  <FiCheckCircle className="text-purple-500" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tax Benefits */}
        <div className="bg-purple-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Tax Benefits Under Section 80G</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-200">50%</div>
              <div className="text-purple-100">Tax deduction on donation</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-200">Instant</div>
              <div className="text-purple-100">Certificate generation</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-200">Valid</div>
              <div className="text-purple-100">For ITR filing</div>
            </div>
          </div>
          <p className="text-center text-purple-200 mt-6 text-sm">
            * Care Foundation Trust is registered under Section 80G of Income Tax Act, 1961
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/donate"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Make a Donation →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/donor/see-impact" className="text-purple-600 hover:underline">See Impact</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



