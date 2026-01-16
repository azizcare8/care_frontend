"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import Image from "next/image";
import { FaPlay, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

export default function CelebritiesPage() {
  const [celebrities, setCelebrities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/celebrities?status=active");
      setCelebrities(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch celebrities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2">
      <div className="max-w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Celebrity Endorsements</h1>
          <p className="text-gray-600">Supporting our cause</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : celebrities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {celebrities.map((celebrity) => (
              <div
                key={celebrity._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {celebrity.image && (
                  <div className="h-64 relative">
                    <Image
                      src={celebrity.image}
                      alt={celebrity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{celebrity.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{celebrity.bio}</p>
                  
                  {/* Social Links */}
                  {celebrity.socialLinks && (
                    <div className="flex gap-3 mb-4">
                      {celebrity.socialLinks.youtube && (
                        <a href={celebrity.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <FaYoutube className="text-red-600 text-xl" />
                        </a>
                      )}
                      {celebrity.socialLinks.instagram && (
                        <a href={celebrity.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <FaInstagram className="text-pink-600 text-xl" />
                        </a>
                      )}
                      {celebrity.socialLinks.twitter && (
                        <a href={celebrity.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <FaTwitter className="text-blue-500 text-xl" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Videos */}
                  {celebrity.videos && celebrity.videos.length > 0 && (
                    <div className="space-y-2">
                      {celebrity.videos.slice(0, 2).map((video, index) => (
                        <a
                          key={index}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-600 hover:text-green-700"
                        >
                          <FaPlay /> {video.title || "Watch Video"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">No celebrities found</p>
          </div>
        )}
      </div>
    </div>
  );
}

