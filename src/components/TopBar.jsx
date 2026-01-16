"use client";

import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen, FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS, FACEBOOK_URL, TWITTER_URL, LINKEDIN_URL, INSTAGRAM_URL, YOUTUBE_URL } from "@/constants/contact";

export default function TopBar() {
  const emailHref = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="w-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-2 hidden lg:block shadow-md">
      <div className="max-w-full mx-auto flex justify-between items-center h-11">
        
        <div className="flex items-center gap-4 text-sm text-white">
          <a
            href="https://share.google/eM17lOZkXE4CV8K0U"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-green-100 transition-colors font-medium"
          >
            <FaMapMarkerAlt className="text-green-200" /> {CONTACT_ADDRESS}
          </a>
          <a
            href="https://wa.me/919136521052"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-green-100 transition-colors font-medium"
          >
            <FaPhoneAlt className="text-green-200" /> {CONTACT_PHONE}
          </a>
          <a
            href={emailHref}
            className="flex items-center gap-2 hover:text-green-100 transition-colors font-medium"
          >
            <FaEnvelopeOpen className="text-green-200" /> {CONTACT_EMAIL}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <FaTwitter className="text-sm" />
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            suppressHydrationWarning
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <FaFacebookF className="text-sm" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <FaLinkedinIn className="text-sm" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <FaInstagram className="text-sm" />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <FaYoutube className="text-sm" />
          </a>
        </div>
      </div>
    </div>
  );
}


