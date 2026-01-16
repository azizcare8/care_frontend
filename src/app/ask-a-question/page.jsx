"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiSend, FiMessageCircle } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function AskAQuestion() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    question: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Your question has been submitted! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", question: "" });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMessageCircle className="text-4xl text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ask A Question</h1>
          <p className="text-xl text-gray-600">
            Have a question about our work or how to get involved? We're here to help!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="What's your question about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Question *</label>
              <textarea
                required
                rows={6}
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Type your question here..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "Sending..." : <><FiSend /> Submit Question</>}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>You can also reach us at <a href="mailto:carefoundationtrustorg@gmail.com" className="text-green-600 hover:underline">carefoundationtrustorg@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}



