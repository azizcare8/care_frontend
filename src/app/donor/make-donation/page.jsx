"use client";
import { FiCreditCard, FiSmartphone, FiShield, FiLock } from "react-icons/fi";
import Link from "next/link";

export default function MakeDonationPage() {
  const paymentMethods = [
    {
      icon: <FiSmartphone className="text-4xl" />,
      name: "UPI",
      description: "Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app",
      color: "bg-purple-500"
    },
    {
      icon: <FiCreditCard className="text-4xl" />,
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Rupay - All major cards accepted",
      color: "bg-blue-500"
    },
    {
      icon: "🏦",
      name: "Net Banking",
      description: "Direct bank transfer from 50+ banks supported",
      color: "bg-green-500"
    },
    {
      icon: "💳",
      name: "Wallets",
      description: "Paytm Wallet, Amazon Pay, and other digital wallets",
      color: "bg-orange-500"
    }
  ];

  const steps = [
    { step: "1", title: "Select Campaign", description: "Choose a cause you want to support" },
    { step: "2", title: "Enter Amount", description: "Any amount from 10 is welcome" },
    { step: "3", title: "Fill Details", description: "Name, email for receipt" },
    { step: "4", title: "Complete Payment", description: "Secure checkout" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💝</span>
          </div>
          <div className="text-sm text-green-600 font-semibold mb-2">Step 2 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Make a Donation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contribute securely via UPI, card, or net banking. Every rupee counts!
          </p>
        </div>

        {/* Payment Methods */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Methods</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 transform">
              <div className={`w-16 h-16 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white`}>
                {typeof method.icon === 'string' ? <span className="text-3xl">{method.icon}</span> : method.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-xs text-gray-600">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Donation Process */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Donate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FiShield className="text-4xl text-green-200" />
            <h2 className="text-2xl font-bold">100% Secure Payments</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <FiLock className="text-3xl text-green-200 mb-2" />
              <div className="font-semibold">SSL Encrypted</div>
              <div className="text-sm text-green-100">256-bit security</div>
            </div>
            <div className="flex flex-col items-center">
              <FiShield className="text-3xl text-green-200 mb-2" />
              <div className="font-semibold">PCI Compliant</div>
              <div className="text-sm text-green-100">Bank-grade protection</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <div className="font-semibold">Razorpay Secured</div>
              <div className="text-sm text-green-100">Trusted gateway</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/donate"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Donate Now →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/donor/get-receipt" className="text-green-600 hover:underline">Get Receipt</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



