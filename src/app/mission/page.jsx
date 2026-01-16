"use client";
import { FiTarget, FiEye, FiHeart, FiShield } from "react-icons/fi";
import BackToHome from "@/components/BackToHome";

export default function Mission() {
  const values = [
    { icon: <FiHeart />, title: "Compassion", description: "We believe in treating every individual with kindness and empathy." },
    { icon: <FiShield />, title: "Integrity", description: "Transparency and honesty guide all our actions and decisions." },
    { icon: <FiTarget />, title: "Impact", description: "We focus on creating meaningful, lasting change in communities." },
    { icon: <FiEye />, title: "Accountability", description: "We are responsible stewards of every donation we receive." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering communities, transforming lives, and building a better tomorrow.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white mb-12">
          <FiTarget className="text-6xl mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission Statement</h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            To uplift the underprivileged by providing access to quality healthcare, education, and nutrition, 
            while fostering a spirit of community service and volunteerism.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <FiEye className="text-4xl text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
          </div>
          <p className="text-lg text-gray-600">
            We envision a world where every individual has access to basic necessities, healthcare, and education. 
            A world where compassion drives action, and communities come together to support one another. 
            Our vision is to be the bridge between those who want to help and those who need help.
          </p>
        </div>

        {/* Core Values */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



