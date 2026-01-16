"use client";

import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function BackToHome() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors mb-6 group"
    >
      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
        <FaHome className="text-green-600 text-sm" />
      </span>
      <span>Back to Home</span>
    </Link>
  );
}

