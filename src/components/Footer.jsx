"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FACEBOOK_URL, TWITTER_URL, INSTAGRAM_URL, YOUTUBE_URL } from "@/constants/contact";

const MAP_URL =
  "https://maps.google.com/?q=1106,+Alexander+Tower,+Sai+World+Empire,+opposite+Swapnapoorti+Mhada+colony,+valley+Shilp+Road,+Sector+36,+kharghar,+Navi+Mumbai,+410210";

export default function Footer() {
  // NOTE: Don't use any window/Date logic in render to avoid hydration issues.
  const handleOpenMap = () => {
    // Safe: this only runs on click in the browser, not during SSR.
    if (typeof window !== "undefined") {
      window.open(MAP_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <footer className="bg-green-900/95 backdrop-blur-md shadow-2xl rounded-t-3xl text-white py-16 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/30 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        <div className="flex flex-col items-start animate-fadeIn">
          <Link href="/" className="flex items-center mb-4 transform hover:scale-105 transition duration-500">
            <Image
              src="/trademark.png"
              alt="Care Foundation Trust Logo"
              width={200}
              height={120}
              className="hover:drop-shadow-xl transition-transform duration-500 rounded-lg"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          <p className="text-sm text-gray-300 mb-3">
            Care Foundation Trust is a non-profit organisation committed to compassion and empathy. Our goal is to address critical social issues and uplift lives.
          </p>

          <div className="flex space-x-4 mt-5">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              suppressHydrationWarning
              className="p-3 bg-white/20 rounded-full hover:bg-gradient-to-r from-lime-500 to-green-500 text-white hover:text-white shadow-md hover:shadow-lg transition transform hover:scale-125"
            >
              <FaFacebookF />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/20 rounded-full hover:bg-gradient-to-r from-lime-500 to-green-500 text-white hover:text-white shadow-md hover:shadow-lg transition transform hover:scale-125"
            >
              <FaInstagram />
            </a>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/20 rounded-full hover:bg-gradient-to-r from-lime-500 to-green-500 text-white hover:text-white shadow-md hover:shadow-lg transition transform hover:scale-125"
            >
              <FaTwitter />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/20 rounded-full hover:bg-gradient-to-r from-lime-500 to-green-500 text-white hover:text-white shadow-md hover:shadow-lg transition transform hover:scale-125"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="group relative animate-fadeIn delay-200">
          <h3 className="font-semibold text-lg mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-300 opacity-80 group-hover:opacity-100 transition duration-300">
            <li><Link href="/how-it-works" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">How It Works</Link></li>
            <li><Link href="/ask-a-question" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Ask A Question</Link></li>
            <li><Link href="/project-story" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Project Story</Link></li>
            <li><Link href="/mission" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Mission</Link></li>
            <li><Link href="/certificates" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Certificates</Link></li>
            <li><Link href="/terms-and-conditions" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Terms And Conditions</Link></li>
          </ul>
        </div>

        <div className="group relative animate-fadeIn delay-400">
          <h3 className="font-semibold text-lg mb-4">Company</h3>
          <ul className="space-y-2 text-gray-300 opacity-80 group-hover:opacity-100 transition duration-300">
            <li><Link href="/about-us" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">About Us</Link></li>
            <li><Link href="/volunteer" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Volunteer</Link></li>
            <li><Link href="/happy-clients" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Happy Clients</Link></li>
            <li><Link href="/projects" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Projects</Link></li>
            <li><Link href="/contact-us" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-green-400 hover:underline decoration-2 decoration-green-400 transition">FAQ</Link></li>
          </ul>
        </div>

        <div className="space-y-6 animate-fadeIn delay-600">
          <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start space-x-2">
              <FiMapPin className="text-green-400 mt-1 flex-shrink-0" />
              <span
                onClick={handleOpenMap}
                className="hover:text-green-400 transition-colors cursor-pointer"
              >
                1106, Alexander Tower, Sai World Empire, opposite Swapnapoorti Mhada colony,
                valley Shilp Road,<br /> Navi Mumbai :- 410210. <br /> Sector 36, kharghar.
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <FiPhone className="text-green-400" />
              <a 
                href="https://wa.me/919136521052" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
              >
                +91 9136521052
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <FiMail className="text-green-400" />
              <a 
                href="mailto:carefoundationtrustorg@gmail.com"
                className="hover:text-green-400 transition-colors"
              >
                carefoundationtrustorg@gmail.com
              </a>
            </li>
          </ul>

          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Subscribe to Newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-l-lg focus:ring-2 focus:ring-green-400 border border-gray-300 outline-none text-gray-900 placeholder-gray-500"
              />
              <button className="bg-gradient-to-r from-green-600 to-green-700  px-4 rounded-r-lg font-semibold transition transform hover:scale-105 shadow-md">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


