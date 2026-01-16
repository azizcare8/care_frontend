"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash, BiPlus, BiVideo, BiX } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function CelebrityManagement() {
  const [celebrities, setCelebrities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState(null);
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    bio: "",
    image: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      youtube: "",
      facebook: ""
    }
  });
  const [videoData, setVideoData] = useState({
    title: "",
    url: "",
    description: ""
  });

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/celebrities");
      setCelebrities(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch celebrities:", error);
      toast.error("Failed to load celebrities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCelebrity) {
        await api.put(`/celebrities/${editingCelebrity._id}`, formData);
        toast.success("Celebrity updated successfully!");
      } else {
        await api.post("/celebrities", formData);
        toast.success("Celebrity created successfully!");
      }
      setShowModal(false);
      setEditingCelebrity(null);
      setFormData({
        name: "",
        designation: "",
        bio: "",
        image: "",
        socialLinks: {
          instagram: "",
          twitter: "",
          youtube: "",
          facebook: ""
        }
      });
      fetchCelebrities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save celebrity");
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/celebrities/${selectedCelebrity._id}/videos`, videoData);
      toast.success("Video added successfully!");
      setShowVideoModal(false);
      setVideoData({ title: "", url: "", description: "" });
      fetchCelebrities();
    } catch (error) {
      toast.error("Failed to add video");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this celebrity?")) return;
    try {
      await api.delete(`/celebrities/${id}`);
      toast.success("Celebrity deleted successfully!");
      fetchCelebrities();
    } catch (error) {
      toast.error("Failed to delete celebrity");
    }
  };

  const handleEdit = (celebrity) => {
    setEditingCelebrity(celebrity);
    setFormData({
      name: celebrity.name || "",
      designation: celebrity.designation || "",
      bio: celebrity.bio || "",
      image: celebrity.image || "",
      socialLinks: celebrity.socialLinks || {
        instagram: "",
        twitter: "",
        youtube: "",
        facebook: ""
      }
    });
    setShowModal(true);
  };

  const filteredCelebrities = celebrities.filter(celebrity =>
    celebrity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    celebrity.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Celebrity Management
          </h1>
          <p className="text-gray-600">Manage celebrity profiles and videos</p>
        </div>
        <button
          onClick={() => {
            setEditingCelebrity(null);
            setFormData({
              name: "",
              designation: "",
              bio: "",
              image: "",
              socialLinks: {
                instagram: "",
                twitter: "",
                youtube: "",
                facebook: ""
              }
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <BiPlus size={20} />
          Add Celebrity
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search celebrities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Celebrities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCelebrities.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No celebrities found
          </div>
        ) : (
          filteredCelebrities.map((celebrity) => (
            <div
              key={celebrity._id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                {celebrity.image && (
                  <img
                    src={celebrity.image}
                    alt={celebrity.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{celebrity.name}</h3>
                  <p className="text-sm text-gray-600">{celebrity.designation}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">{celebrity.bio}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-gray-600">
                  Videos: {celebrity.videos?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCelebrity(celebrity);
                    setVideoData({ title: "", url: "", description: "" });
                    setShowVideoModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BiVideo size={18} />
                  Add Video
                </button>
                <button
                  onClick={() => handleEdit(celebrity)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                  title="Edit"
                >
                  <BiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(celebrity._id)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                  title="Delete"
                >
                  <BiTrash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingCelebrity ? "Edit Celebrity" : "Add Celebrity"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCelebrity(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingCelebrity ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCelebrity(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showVideoModal && selectedCelebrity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Video for {selectedCelebrity.name}</h2>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setSelectedCelebrity(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={28} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title *</label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube) *</label>
                <input
                  type="url"
                  value={videoData.url}
                  onChange={(e) => setVideoData({ ...videoData, url: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={videoData.description}
                  onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Add Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedCelebrity(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

