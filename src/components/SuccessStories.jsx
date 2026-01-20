"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaQuoteLeft, FaHeart, FaStar } from "react-icons/fa";
import { BiCheckCircle } from "react-icons/bi";

export default function SuccessStories() {
  const router = useRouter();

  const stories = [
    {
      name: "Riya's Cancer Treatment",
      image: "/images/c1.jpg",
      amount: "₹12,50,000",
      supporters: 1250,
      category: "Medical",
      story: "With your support, 8-year-old Riya successfully completed her cancer treatment and is now cancer-free!",
      testimonial: "Thank you all for giving my daughter a second chance at life. Your kindness saved our family.",
      author: "Sunita Sharma (Mother)",
      rating: 5,
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Village School Renovation",
      image: "/images/c2.jpg",
      amount: "₹8,75,000",
      supporters: 890,
      category: "Education",
      story: "Built new classrooms and provided books for 300+ students in a rural Maharashtra village.",
      testimonial: "Our children now have a proper school with facilities. This wouldn't be possible without your generosity.",
      author: "Ramesh Patil (Village Head)",
      rating: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Flood Relief Kerala",
      image: "/images/c3.jpg",
      amount: "₹15,20,000",
      supporters: 2100,
      category: "Disaster Relief",
      story: "Provided emergency supplies, shelter, and medical aid to 500+ families affected by Kerala floods.",
      testimonial: "When we lost everything, Care Foundation was there. You helped us rebuild our lives.",
      author: "Suresh Kumar (Beneficiary)",
      rating: 5,
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-purple-50 to-pink-50 px-2 relative border-y-2 border-purple-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></div>
      <div className="max-w-full mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories of hope, healing, and transformation powered by your generosity
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
        </motion.div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-purple-300 group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${story.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5`}>
                    <BiCheckCircle className="text-base" />
                    <span>Completed Fundraised</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {story.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {story.name}
                  </h3>

                  {/* Story */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {story.story}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="text-center">
                      <p className={`text-lg font-bold bg-gradient-to-r ${story.color} bg-clip-text text-transparent`}>
                        {story.amount}
                      </p>
                      <p className="text-xs text-gray-500">Raised</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{story.supporters}</p>
                      <p className="text-xs text-gray-500">Supporters</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        {[...Array(story.rating)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400 text-sm" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 relative">
                    <FaQuoteLeft className="text-purple-200 text-2xl absolute top-2 left-2" />
                    <p className="text-sm text-gray-700 italic mb-2 pl-6">
                      {story.testimonial}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold text-right">
                      — {story.author}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl"
        >
          <div className="flex items-center justify-center mb-4">
            <FaHeart className="text-5xl animate-pulse" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Be Part of the Next Success Story
          </h3>
          <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
            Every donation makes a difference. Join thousands of changemakers and help create more success stories.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/campaigns")}
              className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
            >
              Donate to a Campaign
            </button>
            <button
              onClick={() => router.push("/create-fundraiser")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
            >
              Start Your Campaign
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}






