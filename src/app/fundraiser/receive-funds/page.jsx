"use client";
import { FiDollarSign, FiCreditCard, FiShield, FiClock, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function ReceiveFundsPage() {
  const features = [
    {
      icon: <FiDollarSign className="text-3xl" />,
      title: "0% Platform Fees",
      description: "We don't charge any platform fees. 100% of donations go directly to your cause."
    },
    {
      icon: <FiCreditCard className="text-3xl" />,
      title: "Direct Bank Transfer",
      description: "Funds are transferred directly to your registered bank account. No middleman."
    },
    {
      icon: <FiClock className="text-3xl" />,
      title: "Fast Withdrawals",
      description: "Withdraw funds within 2-3 business days. Request withdrawals anytime from dashboard."
    },
    {
      icon: <FiShield className="text-3xl" />,
      title: "Secure Transactions",
      description: "All transactions are secured with bank-grade encryption and fraud protection."
    }
  ];

  const withdrawalSteps = [
    { step: "1", title: "Login to Dashboard", description: "Access your campaign dashboard" },
    { step: "2", title: "Request Withdrawal", description: "Click on withdraw and enter amount" },
    { step: "3", title: "Verify Details", description: "Confirm your bank account details" },
    { step: "4", title: "Receive Funds", description: "Get money in 2-3 business days" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💰</span>
          </div>
          <div className="text-sm text-amber-600 font-semibold mb-2">Step 4 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Receive Funds</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get donations directly to your account with 0% platform fees. Fast, secure, and hassle-free.
          </p>
        </div>

        {/* 0% Fee Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white text-center mb-12">
          <div className="text-6xl font-bold mb-2">0%</div>
          <div className="text-2xl font-semibold mb-2">Platform Fees</div>
          <p className="text-amber-100">Every rupee donated goes to your cause. No hidden charges.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-6 text-amber-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Withdrawal Process */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Withdraw Funds</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {withdrawalSteps.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-amber-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Trust Us</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <FiCheckCircle className="text-4xl text-amber-200 mb-3" />
              <div className="font-semibold">Bank-Grade Security</div>
            </div>
            <div className="flex flex-col items-center">
              <FiCheckCircle className="text-4xl text-amber-200 mb-3" />
              <div className="font-semibold">RBI Compliant</div>
            </div>
            <div className="flex flex-col items-center">
              <FiCheckCircle className="text-4xl text-amber-200 mb-3" />
              <div className="font-semibold">80G Tax Benefit</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/create-fundraiser"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Fundraiser Now →
          </Link>
          <p className="mt-4 text-gray-500">
            Back to: <Link href="/fundraiser/create-campaign" className="text-amber-600 hover:underline">Step 1 - Create Campaign</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



