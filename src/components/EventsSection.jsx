"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { BiCalendar, BiTime, BiMap, BiRightArrow, BiShareAlt } from "react-icons/bi";
import { FaWhatsapp, FaFacebook, FaTwitter, FaLink } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import { normalizeImageUrl, shouldUnoptimizeImage } from "@/utils/imageUtils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function EventsSection() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeShareId, setActiveShareId] = useState(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [upcomingEvents]);

  const fetchUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/events/upcoming");
      // Handle both response formats: response.data.data or response.data
      const events = response.data?.data || response.data || [];
      // Show all events (no limit for horizontal scroll)
      setUpcomingEvents(Array.isArray(events) ? events : []);
    } catch (error) {
      // Don't log network errors (backend not running)
      if (!error?.isNetworkError && !error?.silent) {
        console.error("Failed to fetch upcoming events:", error);
      }
      // Keep empty events array if API fails
      setUpcomingEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (event, platform) => {
    const shareUrl = `${window.location.origin}/events/${event._id}`;
    const shareText = `Join us at ${event.heading} on ${new Date(event.date).toLocaleDateString()}! ${shareUrl}`;

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        break;
    }
  };

  const getLocationLink = (event) => {
    if (event.locationLink) return event.locationLink;
    if (!event.location) return "";
    return `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-green-50 px-2 relative border-y-2 border-sky-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-green-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-sky-500"></div>
      <div className="max-w-full mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in our upcoming events and activities to make a difference in the community
          </p>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-12" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-700 text-lg" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-700 text-lg" />
              </button>
            )}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-12 mb-8" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-500"
              >
                {/* Event Image */}
                {(() => {
                  const rawImageUrl = event.picture?.url || event.image;
                  const imageUrl = normalizeImageUrl(rawImageUrl) || "/images/c1.jpg";
                  
                  return (
                    <div className="relative h-48 w-full">
                      <Image
                        src={imageUrl}
                        alt={event.heading || "Event Image"}
                        fill
                        className="object-cover"
                        unoptimized={shouldUnoptimizeImage(imageUrl)}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Upcoming
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {event.heading}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BiCalendar className="text-green-600" />
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <BiTime className="text-green-600" />
                        <span className="text-sm">
                          {event.time}{event.endTime ? ` - ${event.endTime}` : ""}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <BiMap className="text-green-600" />
                        <a
                          href={getLocationLink(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm line-clamp-1 text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.location}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Registration Count */}
                  {event.registration && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          {event.registration.registeredParticipants?.length || 0}
                        </span>{" "}
                        registered
                        {event.registration.maxParticipants && (
                          <span className="text-gray-500">
                            {" "}/ {event.registration.maxParticipants}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/events/${event._id}`)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      View Details
                      <BiRightArrow />
                    </button>
                    <button
                      onClick={() => setActiveShareId(activeShareId === event._id ? null : event._id)}
                      className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      title="Share"
                    >
                      <BiShareAlt className="text-xl" />
                      <span className="text-sm font-semibold hidden sm:inline">Share</span>
                    </button>
                  </div>
                  {activeShareId === event._id && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleShare(event, "whatsapp")}
                        className="flex-1 min-w-[110px] bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaWhatsapp />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare(event, "facebook")}
                        className="flex-1 min-w-[110px] bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaFacebook />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare(event, "twitter")}
                        className="flex-1 min-w-[110px] bg-sky-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTwitter />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare(event, "copy")}
                        className="flex-1 min-w-[110px] bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaLink />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </div>

            
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">No upcoming events at the moment</p>
            <p className="text-sm text-gray-500">Check back soon for new events!</p>
          </div>
        )}

        {/* View All Button */}
        {upcomingEvents.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push("/events")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
            >
              View All Events
              <BiRightArrow />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

