
"use client";

import React from "react";
import Image from "next/image";
import { FaUniversity } from "react-icons/fa";

export default function DonationCard() {
  return (
    <div className="flex justify-center px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md flex flex-col items-center shadow-md hover:shadow-[0_8px_30px_rgba(72,187,120,0.5)] transition-all duration-500">

        <div className="text-green-600 text-5xl mb-4">
          <FaUniversity />
        </div>
        <p className="text-green-700 font-medium text-center mb-6">
          If you want to donate via account details, use these:
        </p>

        <div className="w-full text-left space-y-2 text-gray-800 mb-6">
          <p><span className="font-semibold">Bank A/C No:</span> 50200068627799</p>
          <p><span className="font-semibold">Bank A/C Name:</span> Care Foundation Trust</p>
          <p><span className="font-semibold">Branch IFSC:</span> HDFC0000626</p>
          <p><span className="font-semibold">Bank Name:</span> HDFC Bank</p>
        </div>

        <div className="flex items-center justify-center w-full my-4">
          <span className="text-gray-400 text-sm">— or —</span>
        </div>

        <div className="relative w-[150px] h-[150px]">
          <Image
            src="/qecode.webp"
            alt="QR Code"
            fill
            className="rounded-lg shadow-md opacity-95 object-contain"
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Scan this QR with any UPI app to donate for a noble cause.
        </p>
      </div>
    </div>
  );
}


