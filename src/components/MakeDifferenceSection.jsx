"use client";

import { motion } from "framer-motion";
import { FaChild, FaHandshake, FaUser, FaStore, FaHeart } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa6";
import Link from "next/link";
import React from "react";

export default function MakeDifferenceSection() {
    const cards = [
        {
            title: "Become A Volunteer",
            icon: FaChild,
            desc: "Care Foundation, a charitable trust in Mumbai, appeals to kind people to come together from all across the world. Our goal is to make the world a better place.",
            link: "/forms/volunteer",
            btn: "Apply Now",
            bg: "bg-gray-100",
        },
        {
            title: "Donate To Support",
            icon: FaDollarSign,
            desc: "Our work is made possible by your kind contributions. No matter how much is donated, it has the ability to change lives and communities. Donate money to charity in India through us.",
            link: "/campaigns",
            btn: "Donate Now",
            bg: "bg-white shadow-md",
        },
        {
            title: "Become A Partner",
            icon: FaHandshake,
            desc: "We are convinced with the power of teamwork. Partner with Care Foundation Trust if your company is dedicated to making a positive impact on the community.",
            link: "/partner",
            btn: "Join with Us",
            bg: "bg-gray-100",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 px-2 relative border-y-2 border-emerald-400">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500"></div>
            <div className="max-w-full mx-auto">
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <h5 className="text-green-600 text-2xl md:text-3xl font-bold uppercase mb-3">
                        Let's Make A Difference Today
                    </h5>
                    <p className="text-gray-600 text-lg mb-4">
                        Join us in creating positive change in communities across India
                    </p>
                    <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {cards.map((card, idx) => {
                        const Icon = card.icon;
                        const gradients = [
                            "from-green-500 to-emerald-600",
                            "from-blue-500 to-cyan-600",
                            "from-purple-500 to-pink-600"
                        ];
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-300 group"
                            >
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${gradients[idx]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="text-white text-3xl" />
                                </div>
                                
                                <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                                    {card.title}
                                </h4>
                                
                                <p className="text-gray-600 mb-8 leading-relaxed">{card.desc}</p>
                                
                                <Link
                                    href={card.link}
                                    className={`bg-gradient-to-r ${gradients[idx]} text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                                >
                                    {card.btn}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Additional Forms Section */}
                <div className="mt-16 pt-12 border-t-2 border-gray-200">
                    <motion.h5 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        className="text-green-600 text-xl md:text-2xl font-bold uppercase mb-8 text-center"
                    >
                        More Ways to Get Involved
                    </motion.h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Become A Donor",
                                icon: FaUser,
                                desc: "Register as a donor and support our cause with your contributions.",
                                link: "/forms/donor",
                                btn: "Register as Donor",
                                gradient: "from-blue-500 to-indigo-600"
                            },
                            {
                                title: "Apply as Beneficiary",
                                icon: FaHeart,
                                desc: "Need support? Apply to become a beneficiary and receive help from our community.",
                                link: "/forms/beneficiary",
                                btn: "Apply Now",
                                gradient: "from-pink-500 to-rose-600"
                            },
                            {
                                title: "Become A Vendor",
                                icon: FaStore,
                                desc: "Join as a vendor partner and help us serve the community better.",
                                link: "/forms/vendor",
                                btn: "Apply as Vendor",
                                gradient: "from-orange-500 to-amber-600"
                            }
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                                    viewport={{ once: false, margin: "-50px" }}
                                    className="bg-white rounded-xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 group"
                                >
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="text-white text-2xl" />
                                    </div>
                                    
                                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                        {item.title}
                                    </h4>
                                    
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.desc}</p>
                                    
                                    <Link
                                        href={item.link}
                                        className={`bg-gradient-to-r ${item.gradient} text-white px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                                    >
                                        {item.btn}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};


