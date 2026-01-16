"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const sliderImages = [
  "/images/main-slider/1.jpg",
  "/images/main-slider/123.jpg",
  "/images/main-slider/2.jpg",
  "/images/main-slider/3.webp",
];

const sliderContent = [
  {
    title: "Making a Difference Together",
    subtitle: "Join us in our mission to help those in need",
    cta: "Donate Now"
  },
  {
    title: "Every Donation Counts",
    subtitle: "100% of your donation goes directly to beneficiaries",
    cta: "Start Donating"
  },
  {
    title: "Join Our Community",
    subtitle: "Become a volunteer and make an impact",
    cta: "Volunteer Now"
  },
  {
    title: "Transparent & Trustworthy",
    subtitle: "Track how your donations are being used",
    cta: "Learn More"
  }
];

export default function ImageSlider({ autoPlay = true, interval = 3000, showContent = false, onCTAClick, fullWidth = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
  };

  return (
    <div
      className={`relative w-full max-w-full ${fullWidth ? 'h-full min-h-[600px]' : 'h-[600px]'} ${fullWidth ? 'rounded-none' : 'rounded-2xl'} overflow-visible ${fullWidth ? '' : 'shadow-2xl border border-gray-200'} group`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 overflow-hidden"
        >
          <Image
            src={sliderImages[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            sizes="(max-width: 1920px) 100vw, 1920px"
            className="object-cover"
            priority={currentIndex === 0 || sliderImages[currentIndex] === '/images/main-slider/123.jpg'}
            unoptimized={sliderImages[currentIndex]?.startsWith('https://carefoundationtrust.org') || sliderImages[currentIndex]?.startsWith('http://localhost:5000') || sliderImages[currentIndex]?.startsWith('http://127.0.0.1:5000') || sliderImages[currentIndex]?.startsWith('https://carefoundation-backend-1.onrender.com')}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 transition duration-500"></div>

          {/* Content Overlay */}
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6 z-10"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {sliderContent[currentIndex]?.title}
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl">
                {sliderContent[currentIndex]?.subtitle}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20 hover:scale-110"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20 hover:scale-110"
        aria-label="Next slide"
      >
        <FaChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`rounded-full transition-all duration-300 ${index === currentIndex
              ? "bg-green-500 w-8 h-3 shadow-lg"
              : "bg-white/50 hover:bg-white/70 w-3 h-3"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

