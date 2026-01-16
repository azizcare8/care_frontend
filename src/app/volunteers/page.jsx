"use client";
import { useState, useEffect } from "react";
import ClientLayout from "../ClientLayout";
import api from "@/utils/api";
import { BiSearch, BiUser, BiShield, BiDownload } from "react-icons/bi";
import Image from "next/image";

export default function VolunteerDirectoryPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const CATEGORIES = [
    'Doctor For U',
    'Nurse / Paramedic',
    'Hospital Partner',
    'Pathology / Lab Partner',
    'Food Supplier / Kitchen Partner',
    'Food Server / Delivery Volunteer',
    'Donor Volunteer',
    'Media / Social Partner',
    'Student Volunteer',
    'Event Organizer / Helper',
    'Technical / IT Volunteer',
    'Executive / Core Team Member'
  ];

  useEffect(() => {
    fetchVolunteers();
  }, [filterCategory]);

  const fetchVolunteers = async () => {
    try {
      setIsLoading(true);
      const params = { status: "active" };
      if (filterCategory !== "all") params.category = filterCategory;
      const response = await api.get("/volunteer-cards", { params });
      setVolunteers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
      setVolunteers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 pt-28 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Volunteer Directory
          </h1>
          <p className="text-xl text-gray-600">
            Meet our verified volunteers making a difference in the community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, category, or card number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Volunteers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredVolunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div
                key={volunteer._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Volunteer Photo */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                  {volunteer.photo?.url ? (
                    <Image
                      src={volunteer.photo.url}
                      alt={volunteer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BiUser className="text-white" size={64} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Volunteer Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{volunteer.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{volunteer.volunteer?.email || ""}</p>
                  
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full text-xs font-medium">
                      {volunteer.category}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <BiShield className="text-green-600" />
                      <span>Card: {volunteer.cardNumber}</span>
                    </div>
                    {volunteer.validityDate && (
                      <div className="flex items-center gap-2">
                        <BiDownload className="text-blue-600" />
                        <span>Valid until: {new Date(volunteer.validityDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {volunteer.qrCode?.verificationLink && (
                    <a
                      href={volunteer.qrCode.verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-semibold"
                    >
                      Verify Volunteer
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">No volunteers found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
      </div>
    </ClientLayout>
  );
}

