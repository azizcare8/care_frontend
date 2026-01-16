"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { BiCalendar, BiTime, BiMap, BiUser, BiShareAlt, BiChevronLeft } from "react-icons/bi";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import Image from "next/image";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id, isAuthenticated, user?._id]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/events/${params.id}`);
      const eventData = response.data.data;
      setEvent(eventData);
      
      // Check if user is registered
      // Handle both populated user object and ObjectId string
      if (isAuthenticated && user && eventData?.registration?.registeredParticipants) {
        const userId = user._id || user.id;
        const registered = eventData.registration.registeredParticipants.some(participant => {
          if (!participant.user) return false;
          
          // Handle populated user object (has _id)
          if (participant.user._id) {
            return participant.user._id.toString() === userId.toString();
          }
          
          // Handle ObjectId string
          const participantUserId = participant.user.toString ? participant.user.toString() : participant.user;
          return participantUserId === userId.toString();
        });
        
        console.log('Registration check:', {
          userId,
          participants: eventData.registration.registeredParticipants,
          registered
        });
        
        setIsRegistered(registered);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
      toast.error("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to register for events");
      router.push("/login");
      return;
    }

    try {
      setIsRegistering(true);
      console.log('Registering for event:', params.id);
      console.log('User:', user);
      
      const response = await api.post(`/events/${params.id}/register`);
      console.log('Registration response:', response.data);
      
      toast.success(response.data?.message || "Successfully registered for event!");
      setIsRegistered(true);
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to register for event";
      
      // If error is "already registered", update state
      if (errorMessage.toLowerCase().includes('already registered')) {
        setIsRegistered(true);
        fetchEvent(); // Refresh to get updated event data
      }
      
      toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setIsRegistering(true);
      await api.delete(`/events/${params.id}/register`);
      toast.success("Registration cancelled");
      setIsRegistered(false);
      fetchEvent();
    } catch (error) {
      toast.error("Failed to cancel registration");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}/events/${params.id}`;
    const shareText = `Join us at ${event?.heading} on ${new Date(event?.date).toLocaleDateString()}! ${shareUrl}`;

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
      default:
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const registeredCount = event.registration?.registeredParticipants?.length || 0;
  const maxParticipants = event.registration?.maxParticipants;
  const isRegistrationOpen = event.registration?.isOpen && (!maxParticipants || registeredCount < maxParticipants);
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <BiChevronLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Event Image */}
          {event.picture?.url && (
            <div className="relative h-96 w-full">
              <Image
                src={event.picture.url}
                alt={event.heading}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all shadow-lg"
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp size={20} />
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all shadow-lg"
                  title="Share on Facebook"
                >
                  <FaFacebook size={20} />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500 transition-all shadow-lg"
                  title="Share on Twitter"
                >
                  <FaTwitter size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Event Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  isUpcoming
                    ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                    : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                }`}>
                  {isUpcoming ? "Upcoming" : "Completed"}
                </span>
                {event.registration?.isOpen && isUpcoming && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Registration Open
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.heading}</h1>
              <p className="text-xl text-gray-600">{event.shortBrief}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <BiCalendar className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {event.time && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                  <BiTime className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{event.time}</p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <BiMap className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Info */}
            {isUpcoming && event.registration && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BiUser className="text-green-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Volunteer Registration</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="text-2xl font-bold text-green-600">
                      {registeredCount}
                      {maxParticipants && ` / ${maxParticipants}`}
                    </p>
                  </div>
                </div>
                {isRegistrationOpen ? (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${maxParticipants ? (registeredCount / maxParticipants * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold mb-4">Registration is closed</p>
                )}
                {isRegistrationOpen && (
                  <div>
                    {isRegistered ? (
                      <button
                        onClick={handleCancelRegistration}
                        disabled={isRegistering}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
                      >
                        {isRegistering ? "Cancelling..." : "Cancel Registration"}
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        disabled={isRegistering || !isAuthenticated}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
                      >
                        {isRegistering ? "Registering..." : isAuthenticated ? "Register as Volunteer" : "Login to Register"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Videos */}
            {event.videos && event.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.videos.map((video, idx) => (
                    <div key={idx} className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                      {video.platform === 'youtube' ? (
                        <iframe
                          src={video.url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={video.url} controls className="w-full h-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Gallery */}
            {event.images && event.images.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {event.images.map((img, idx) => (
                    <div key={idx} className="relative h-48 rounded-xl overflow-hidden">
                      <Image
                        src={img.url}
                        alt={`Event image ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

