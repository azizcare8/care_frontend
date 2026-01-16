"use client";
import { FiHeart, FiUsers, FiBook, FiHome } from "react-icons/fi";
import Link from "next/link";
import BackToHome from "@/components/BackToHome";

export default function Projects() {
  const projects = [
    {
      icon: <FiHeart className="text-4xl" />,
      title: "Healthcare Camps",
      description: "Free medical camps providing checkups, medicines, and consultations to underprivileged communities.",
      impact: "10,000+ patients served",
      color: "red"
    },
    {
      icon: <FiBook className="text-4xl" />,
      title: "Education Support",
      description: "Scholarships, study materials, and educational resources for children from low-income families.",
      impact: "500+ students supported",
      color: "blue"
    },
    {
      icon: <FiUsers className="text-4xl" />,
      title: "Food Distribution",
      description: "Daily meal distribution to homeless, elderly, and needy individuals across Mumbai.",
      impact: "1,000+ meals daily",
      color: "green"
    },
    {
      icon: <FiHome className="text-4xl" />,
      title: "Shelter Support",
      description: "Providing temporary shelter and rehabilitation support to homeless individuals.",
      impact: "200+ families helped",
      color: "purple"
    }
  ];

  const colorClasses = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our ongoing initiatives that are making a real difference in communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${colorClasses[project.color]}`}>
                  {project.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {project.impact}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Support Our Projects?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Your contribution can help us expand our reach and impact more lives. Every donation counts!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/campaigns" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              View Campaigns
            </Link>
            <Link href="/contact-us" className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



