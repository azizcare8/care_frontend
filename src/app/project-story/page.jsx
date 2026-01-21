"use client";
import { FiHeart, FiUsers, FiTarget, FiAward } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function ProjectStory() {
  const milestones = [
    { year: "1997", title: "Foundation Established", description: "Care Foundation TrustⓇ was established with a vision to serve the underprivileged." },
    { year: "2005", title: "Healthcare Initiative", description: "Launched our first healthcare program providing free medical camps." },
    { year: "2010", title: "Education Program", description: "Started educational support for underprivileged children." },
    { year: "2015", title: "Food Distribution", description: "Initiated daily food distribution program for the needy." },
    { year: "2020", title: "Digital Expansion", description: "Expanded our reach through digital platforms during pandemic." },
    { year: "2024", title: "Partner Network", description: "Built a network of doctors, hospitals, and food partners." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Project Story</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A journey of compassion, dedication, and transforming lives since 1997.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiHeart className="text-4xl text-red-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">27+</div>
            <div className="text-gray-600">Years of Service</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiUsers className="text-4xl text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-gray-600">Lives Impacted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiTarget className="text-4xl text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">100+</div>
            <div className="text-gray-600">Projects Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiAward className="text-4xl text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Volunteers</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year.slice(2)}
                  </div>
                  {index < milestones.length - 1 && <div className="w-0.5 h-full bg-green-200 mt-2" />}
                </div>
                <div className="flex-1 pb-8">
                  <div className="text-sm text-green-600 font-semibold">{milestone.year}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



