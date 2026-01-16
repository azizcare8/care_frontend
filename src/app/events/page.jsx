"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "../ClientLayout";
import api from "@/utils/api";
import { BiCalendar, BiTime, BiMap, BiRightArrow } from "react-icons/bi";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import BackToHome from "@/components/BackToHome";

export default function EventsPage() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const [upcomingRes, completedRes] = await Promise.all([
        api.get("/events/upcoming"),
        api.get("/events/completed")
      ]);
      setUpcomingEvents(upcomingRes.data.data || []);
      setCompletedEvents(completedRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
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
    }
  };

  const events = activeTab === "upcoming" ? upcomingEvents : completedEvents;

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 pt-28 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <BackToHome />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Events & Activities</h1>
          <p className="text-xl text-gray-600">
            Join us in making a difference through our events and activities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Completed Events ({completedEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {event.picture?.url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.picture.url}
                      alt={event.heading}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleShare(event, "whatsapp")}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all shadow-lg"
                        title="Share on WhatsApp"
                      >
                        <FaWhatsapp size={16} />
                      </button>
                      <button
                        onClick={() => handleShare(event, "facebook")}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-lg"
                        title="Share on Facebook"
                      >
                        <FaFacebook size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {event.heading}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description || event.shortBrief}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BiCalendar className="text-green-600" />
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <BiTime className="text-green-600" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <BiMap className="text-green-600" />
                        <span className="text-sm line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {activeTab === "upcoming" && event.registration && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-600">
                          {event.registration.registeredParticipants?.length || 0}
                        </span>
                        {" "}volunteers registered
                        {event.registration.maxParticipants && (
                          <span className="text-gray-500">
                            {" "}/ {event.registration.maxParticipants}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    View Details
                    <BiRightArrow />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">
              No {activeTab === "upcoming" ? "upcoming" : "completed"} events at the moment
            </p>
            <p className="text-sm text-gray-500">Check back soon for new events!</p>
          </div>
        )}
      </div>
      </div>
    </ClientLayout>
  );
}

