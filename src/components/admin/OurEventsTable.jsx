"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { BiCalendar, BiEdit, BiTrash, BiSearch } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function OurEventsTable() {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/events", { params: { showAll: true } });
      console.log("Events API response:", response.data);
      
      // Handle different response structures
      const allEvents = response.data?.data || response.data?.events || response.data || [];
      console.log("All events:", allEvents);
      
      if (!Array.isArray(allEvents)) {
        console.error("Events data is not an array:", allEvents);
        setEvents([]);
        setUpcomingEvents([]);
        setCompletedEvents([]);
        return;
      }
      
      setEvents(allEvents);
      
      const now = new Date();
      const upcoming = allEvents.filter(e => {
        if (!e.date) return false;
        const eventDate = new Date(e.date);
        return eventDate >= now && e.status !== 'completed' && e.eventType !== 'completed';
      });
      const completed = allEvents.filter(e => {
        if (!e.date) return true; // Events without dates go to completed
        const eventDate = new Date(e.date);
        return eventDate < now || e.status === 'completed' || e.eventType === 'completed';
      });
      
      console.log("Upcoming events:", upcoming.length);
      console.log("Completed events:", completed.length);
      
      setUpcomingEvents(upcoming);
      setCompletedEvents(completed);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load events");
      setEvents([]);
      setUpcomingEvents([]);
      setCompletedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (eventId) => {
    if (!window.confirm("Are you sure you want to mark this event as completed?")) {
      return;
    }

    try {
      await api.put(`/events/${eventId}`, {
        eventType: 'completed',
        status: 'published'
      });
      toast.success("Event marked as completed!");
      fetchEvents();
    } catch (error) {
      console.error("Failed to complete event:", error);
      toast.error(error.response?.data?.message || "Failed to mark event as completed");
    }
  };

  const handleEdit = (eventId) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/admin/events/${eventId}/edit`;
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Our Events</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">All Events</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "upcoming"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "completed"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Completed Events ({completedEvents.length})
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value={10} className="text-gray-900">10</option>
              <option value={25} className="text-gray-900">25</option>
              <option value={50} className="text-gray-900">50</option>
            </select>
            <span className="text-sm text-orange-600 font-medium">entries per page</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
            />
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Event Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Short Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Event Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Event Img</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      <span className="ml-3 text-gray-600">Loading events...</span>
                    </div>
                  </td>
                </tr>
              ) : (activeTab === "upcoming" ? upcomingEvents : completedEvents).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="text-gray-500">
                      <BiCalendar className="mx-auto text-4xl mb-2 opacity-50" />
                      <p className="text-lg font-semibold">No {activeTab === "upcoming" ? "upcoming" : "completed"} events found</p>
                      <p className="text-sm mt-1">Create events using the "Upload Events" page</p>
                    </div>
                  </td>
                </tr>
              ) : (activeTab === "upcoming" ? upcomingEvents : completedEvents)
                .filter(event =>
                  event.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.date?.includes(searchTerm)
                )
                .slice(0, entriesPerPage)
                .map((event) => (
                <tr key={event._id || event.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200">
                  <td className="px-4 py-3 text-sm font-medium">{event.heading || event.name}</td>
                  <td className="px-4 py-3 text-sm max-w-md line-clamp-2">{event.description || event.shortDescription}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(event.date).toLocaleDateString()}
                    {event.time && <div className="text-xs text-gray-500">{event.time}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {event.picture?.url || event.image ? (
                      <div className="w-20 h-20 relative rounded border">
                        <Image 
                          src={event.picture?.url || event.image} 
                          alt="Event" 
                          fill 
                          sizes="80px"
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activeTab === "upcoming" 
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                        : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                    }`}>
                      {activeTab === "upcoming" ? "Upcoming" : "Completed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {activeTab === "upcoming" && (
                        <button 
                          onClick={() => handleComplete(event._id || event.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(event._id || event.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event._id || event.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}



