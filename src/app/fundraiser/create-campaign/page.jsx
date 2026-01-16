"use client";
import { FiEdit3, FiImage, FiTarget, FiFileText, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function CreateCampaignPage() {
  const steps = [
    {
      icon: <FiEdit3 className="text-3xl" />,
      title: "Write Your Story",
      description: "Create a compelling title and description that explains why you need funds. Be specific about the situation and how the money will be used."
    },
    {
      icon: <FiImage className="text-3xl" />,
      title: "Add Photos & Videos",
      description: "Upload high-quality images and videos that show your situation. Visual content helps donors connect with your cause emotionally."
    },
    {
      icon: <FiTarget className="text-3xl" />,
      title: "Set Your Goal",
      description: "Determine how much money you need. Be realistic and transparent. You can always adjust your goal later if needed."
    },
    {
      icon: <FiFileText className="text-3xl" />,
      title: "Upload Documents",
      description: "Provide supporting documents like medical bills, ID proof, and other relevant paperwork to build trust with donors."
    }
  ];

  const tips = [
    "Use a clear, attention-grabbing title",
    "Tell your story honestly and emotionally",
    "Include specific details about fund usage",
    "Upload at least 3-5 high-quality photos",
    "Add medical reports or bills if applicable",
    "Set a realistic and achievable goal amount"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📝</span>
          </div>
          <div className="text-sm text-emerald-600 font-semibold mb-2">Step 1 of 4</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Create Campaign</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start your fundraiser with photos, story, and goal amount. A well-crafted campaign attracts more donors.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="bg-emerald-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Tips for a Successful Campaign</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <FiCheckCircle className="text-emerald-200 mt-1 flex-shrink-0" />
                <span className="text-emerald-50">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/create-fundraiser"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Creating Your Campaign →
          </Link>
          <p className="mt-4 text-gray-500">
            Next step: <Link href="/fundraiser/get-verified" className="text-emerald-600 hover:underline">Get Verified</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



