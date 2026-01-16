"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { BiSearch } from "react-icons/bi";
import { FaCertificate, FaUserCheck } from "react-icons/fa";

export default function VolunteerSearchPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/volunteer-cards?status=active");
      setVolunteers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = !searchTerm || 
      volunteer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || volunteer.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all", "doctor_volunteer", "nurse_paramedic", "hospital_partner",
    "pathology_lab_partner", "food_supplier", "food_server",
    "donor_volunteer", "media_social_partner", "student_volunteer",
    "event_organizer", "technical_it_volunteer", "executive_core_team"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2">
      <div className="max-w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Volunteer Directory</h1>
          <p className="text-gray-600">
            Search and verify our verified volunteers
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Volunteers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading volunteers...</p>
          </div>
        ) : filteredVolunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div
                key={volunteer._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-center">
                  {volunteer.photo ? (
                    <img
                      src={volunteer.photo}
                      alt={volunteer.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-green-100 flex items-center justify-center">
                      <FaUserCheck className="text-4xl text-green-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{volunteer.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{volunteer.role}</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-4">
                    {volunteer.category?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaCertificate className="text-green-600" />
                    <span>Verified Volunteer</span>
                  </div>
                  {volunteer.verificationToken && (
                    <a
                      href={`/volunteers/verify/${volunteer.verificationToken}`}
                      className="mt-4 inline-block text-sm text-green-600 hover:text-green-700"
                    >
                      Verify Card
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">No volunteers found</p>
          </div>
        )}
      </div>
    </div>
  );
}

