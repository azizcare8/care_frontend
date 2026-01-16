"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaAngleRight,
  FaBookReader,
  FaStethoscope,
  FaTshirt,
  FaVideo,
  FaLaptopCode,
  FaLeaf,
} from "react-icons/fa";

export default function PopularCategories() {
  const categories = [
    {
      icon: FaBookReader,
      title: "Education",
      desc: "School, College & University",
      color: "text-indigo-600",
      delay: 0,
    },
    {
      icon: FaStethoscope,
      title: "Medical & Health",
      desc: "Hospitals, Clinics & Health Care",
      color: "text-green-600",
      delay: 0.1,
    },
    {
      icon: FaTshirt,
      title: "Clothes",
      desc: "Dress, Uniform & Essentials",
      color: "text-pink-500",
      delay: 0.2,
    },
    {
      icon: FaVideo,
      title: "Video & Films",
      desc: "Creative Projects & Filmmaking",
      color: "text-yellow-500",
      delay: 0.3,
    },
    {
      icon: FaLaptopCode,
      title: "Technology",
      desc: "Software, Hardware & Innovation",
      color: "text-blue-500",
      delay: 0.4,
    },
    {
      icon: FaLeaf,
      title: "Organic Foods",
      desc: "Farming, Nutrition & Sustainability",
      color: "text-green-500",
      delay: 0.5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2 relative border-y-2 border-violet-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500"></div>
      <div className="max-w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between mb-14"
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <span className="inline-flex items-center text-green-600 font-semibold uppercase tracking-wide text-sm mb-2">
              <FaPlus  />
              What We Do
              <span className="ml-2 text-gray-400 font-bold text-xs">
                Category
              </span>
            </span>
            <h2 className="text-4xl font-extrabold text-gray-800">
              Popular Categories
            </h2>
            <div className="mt-2 w-24 h-1 bg-gradient-to-r from-green-500 to-pink-500 rounded-full" />
          </div>

          {/* <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300"
          >
            View All Categories
            <FaAngleRight />
          </Link> */}
        </motion.div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => {
            const Icon = cat.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.05,
                  rotateX: 8,
                  rotateY: -4,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                }}
                transition={{
                  delay: cat.delay,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="bg-white shadow-xl border-2 border-gray-200 hover:border-green-400 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 group perspective"
              >
                
                <motion.div
                  whileHover={{
                    rotate: [0, 10, -10, 0],
                    scale: 1.15,
                    textShadow: "0 0 12px rgba(0,0,0,0.15)",
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`flex justify-center mb-5 text-5xl ${cat.color}`}
                >
                  <Icon />
                </motion.div>

                <motion.h4
                  whileHover={{ color: "#4f46e5" }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 transition"
                >
                  <Link href={`/campaigns?category=${cat.title.toLowerCase()}`}>{cat.title}</Link>
                </motion.h4>
                <p className="text-gray-600 text-sm">{cat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


