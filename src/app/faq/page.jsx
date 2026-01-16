"use client";
import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiHelpCircle } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Care Foundation Trust?",
      answer: "Care Foundation Trust is a registered non-profit organization established in 1997. We work towards providing healthcare, education, and nutrition support to underprivileged communities across India."
    },
    {
      question: "How can I donate to Care Foundation?",
      answer: "You can donate through our website by selecting a campaign and making an online payment. We accept UPI, credit/debit cards, and net banking. You can also donate via bank transfer or cheque."
    },
    {
      question: "Is my donation tax-deductible?",
      answer: "Yes! Care Foundation Trust is registered under Section 80G of the Income Tax Act, 1961. All donations are eligible for tax exemption, and you will receive a donation receipt for your records."
    },
    {
      question: "How is my donation used?",
      answer: "We maintain complete transparency in fund utilization. Donations are used for our various programs including medical camps, food distribution, educational support, and other welfare activities. You can track your donation impact through our updates."
    },
    {
      question: "Can I become a volunteer?",
      answer: "Absolutely! We welcome volunteers from all backgrounds. You can register as a volunteer through our website and choose activities based on your interests and availability."
    },
    {
      question: "How can I verify the authenticity of Care Foundation?",
      answer: "Care Foundation Trust is registered with the Charity Commissioner, has 12A and 80G certifications, and is listed on NGO Darpan. You can verify our credentials by contacting us or checking our certificates page."
    },
    {
      question: "Do you accept corporate donations?",
      answer: "Yes, we accept CSR contributions from corporates. We are registered under CSR-1 and can provide all necessary documentation for corporate donors."
    },
    {
      question: "How can I partner with Care Foundation?",
      answer: "We welcome partnerships with doctors, hospitals, restaurants, and other organizations. You can apply through our partner registration page or contact us directly."
    },
    {
      question: "Can I donate in kind instead of money?",
      answer: "Yes, we accept donations in kind such as food, medicines, clothes, educational materials, etc. Please contact us to arrange for in-kind donations."
    },
    {
      question: "How do I get my donation receipt?",
      answer: "Donation receipts are automatically sent to your registered email after a successful donation. You can also download receipts from your dashboard if you have an account."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHelpCircle className="text-4xl text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about Care Foundation Trust.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <FiChevronUp className="text-green-600 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 border-t">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-green-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-green-100 mb-6">
            Can't find what you're looking for? Feel free to reach out to us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact-us" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Contact Us
            </a>
            <a href="https://wa.me/919136521052" target="_blank" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



