"use client";

import React from "react";
import { FaUniversity } from "react-icons/fa";
import Image from "next/image";
import DonationCard from "./DonationCard";

export default function FundRaised() {
    return (
        <section className="container mx-auto py-16 bg-gradient-to-r from-green-50 to-pink-50 px-6 text-center">
            
            <div className="mb-10 text-center relative bg-white  rounded-2xl border border-green-200 shadow-[0_4px_20px_rgba(72,187,120,0.3)] p-20 hover:shadow-[0_8px_30px_rgba(72,187,120,0.5)] transition-all duration-500">
                <h5 className="text-green-600 font-semibold uppercase tracking-widest animate-pulse">
                    Completed Campaign
                </h5>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-600 ">
                    Fundraising is at the heart of what we do
                </h1>

                <div className="w-24 md:w-40 h-1 bg-gradient-to-r from-green-500 via-lime-400 to-pink-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(72,187,120,0.6)]"></div>

            </div>

           <DonationCard />
        </section>
    );
}


