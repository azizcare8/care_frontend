"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCubes, FaSearch, FaBalanceScale } from "react-icons/fa";
import { BiRupee } from "react-icons/bi";

const leftFeatures = [
  {
    title: "Passion-Driven Mission",
    desc: "Our strategy is based on responsibility, openness, and teamwork. We think that understanding and empathy are the first steps toward true change.",
    icon: FaCubes,
  },
  {
    title: "Transparency",
    desc: "Our NGO prioritizes transparency through regular public reporting, financial accountability, and open communication.",
    icon: FaSearch,
  },
];

const rightFeatures = [
  {
    title: "Accountability",
    desc: "Our NGO upholds accountability through transparent financial practices, regular reporting, and a commitment to ethical conduct, ensuring responsible and trustworthy operations.",
    icon: FaBalanceScale,
  },
  {
    title: "Fundraising for Impact",
    desc: "Our NGO focuses on impactful fundraising efforts, channeling resources to make a meaningful difference in our mission and create positive outcomes.",
    icon: BiRupee,
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-white px-2 relative border-y-2 border-slate-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 via-blue-500 to-indigo-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-slate-500"></div>
      <div className="max-w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h5 className="text-green-600 font-bold uppercase text-lg md:text-xl mb-3 tracking-wide">
            Why Choose Us
          </h5>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Our Work Promise To Uphold The Trust Placed
          </h1>
          <p className="text-gray-600 text-lg">
            We are committed to transparency, accountability, and making a real difference
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          <div className="space-y-8">
            {leftFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center lg:items-start lg:text-left bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 group"
                >
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center w-16 h-16 mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="text-xl" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="relative h-96 w-full flex justify-center items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-3xl blur-3xl"></div>
            <img
              src="/images/whychooseus.webp" 
              alt="Why Choose Us"
              className="relative h-full w-full object-contain rounded-2xl shadow-2xl border-4 border-green-200/50"
            />
          </motion.div>

          <div className="space-y-8">
            {rightFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center lg:items-start lg:text-left bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 group"
                >
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center w-16 h-16 mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="text-xl" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


