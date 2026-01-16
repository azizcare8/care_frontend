"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash, BiPlus, BiDownload, BiQr } from "react-icons/bi";
import api from "@/utils/api";
import { uploadService } from "@/services/uploadService";
import toast from "react-hot-toast";

const VOLUNTEER_CATEGORIES = [
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

const VOLUNTEER_ROLES = [
  'doctor_volunteer',
  'nurse_paramedic',
  'hospital_partner',
  'pathology_lab_partner',
  'food_supplier_kitchen_partner',
  'food_server_delivery_volunteer',
  'donor_volunteer',
  'media_social_partner',
  'student_volunteer',
  'event_organizer_helper',
  'technical_it_volunteer',
  'executive_core_team_member'
];

export default function VolunteerCardManagement() {
  const [cards, setCards] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    volunteer: "",
    role: "",
    category: "",
    validityDate: "",
    photo: "",
    gender: "",
    bloodGroup: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchVolunteers();
  }, [filterCategory]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterCategory && filterCategory !== "all") params.category = filterCategory;
      const response = await api.get("/volunteer-cards", { params });
      setCards(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      toast.error("Failed to load volunteer cards");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await api.get("/admin/users", { params: { role: "volunteer" } });
      setVolunteers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a base64 data URL
    if (file.type === 'text/plain' || e.target.value.startsWith('data:')) {
      // Handle base64
      const base64String = e.target.value;
      try {
        setIsUploading(true);
        const uploadResult = await uploadService.uploadBase64(base64String);
        setFormData({ ...formData, photo: uploadResult.url || uploadResult.data?.url });
        setPhotoPreview(uploadResult.url || uploadResult.data?.url);
      } catch (error) {
        toast.error("Failed to upload photo");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Handle file upload
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      
      let photoData = null;
      
      // Upload photo if file is selected
      if (photoFile) {
        const formDataObj = new FormData();
        formDataObj.append('image', photoFile);
        const uploadResult = await uploadService.uploadSingle(formDataObj);
        photoData = {
          url: uploadResult.url || uploadResult.data?.url,
          publicId: uploadResult.publicId || uploadResult.data?.publicId
        };
      } else if (formData.photo) {
        // If photo is a URL string, check if it's base64
        if (formData.photo.startsWith('data:')) {
          const uploadResult = await uploadService.uploadBase64(formData.photo);
          photoData = {
            url: uploadResult.url || uploadResult.data?.url,
            publicId: uploadResult.publicId || uploadResult.data?.publicId
          };
        } else {
          // It's already a URL
          photoData = {
            url: formData.photo,
            publicId: null
          };
        }
      }

      const submitData = {
        volunteer: formData.volunteer,
        role: formData.role,
        category: formData.category,
        validityDate: formData.validityDate,
        photo: photoData,
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup || undefined
      };

      if (editingCard) {
        await api.put(`/volunteer-cards/${editingCard._id}`, submitData);
        toast.success("Volunteer card updated successfully!");
      } else {
        await api.post("/volunteer-cards", submitData);
        toast.success("Volunteer card created successfully!");
      }
      setShowModal(false);
      setEditingCard(null);
      setFormData({
        volunteer: "",
        role: "",
        category: "",
        validityDate: "",
        photo: "",
        gender: "",
        bloodGroup: ""
      });
      setPhotoFile(null);
      setPhotoPreview("");
      fetchCards();
    } catch (error) {
      console.error("Failed to save card:", error);
      toast.error(error.response?.data?.message || "Failed to save card");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm("Are you sure you want to revoke this card?")) return;
    try {
      await api.put(`/volunteer-cards/${id}/revoke`);
      toast.success("Card revoked successfully!");
      fetchCards();
    } catch (error) {
      toast.error("Failed to revoke card");
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      volunteer: card.volunteer?._id || card.volunteer || "",
      role: card.role || "",
      category: card.category || "",
      validityDate: card.validityDate ? new Date(card.validityDate).toISOString().split('T')[0] : "",
      photo: card.photo?.url || "",
      gender: card.gender || "",
      bloodGroup: card.bloodGroup || ""
    });
    setPhotoPreview(card.photo?.url || "");
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleDownloadPDF = async (cardId) => {
    try {
      const response = await api.get(`/volunteer-cards/${cardId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `volunteer-card-${cardId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const filteredCards = cards.filter(card =>
    card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Volunteer Card Management
          </h1>
          <p className="text-sm text-gray-600">Create, manage, and issue volunteer cards with 12 categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCard(null);
            setFormData({
              volunteer: "",
              role: "",
              category: "",
              validityDate: "",
              photo: "",
              gender: "",
              bloodGroup: ""
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <BiPlus size={20} />
          Create Card
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, card number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-900"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {filterCategory === "all" && (
              <option value="all" className="text-gray-900 bg-white" disabled hidden>All Categories</option>
            )}
            {VOLUNTEER_CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="text-gray-900 bg-white">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Card Number</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Validity</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No volunteer cards found
                  </td>
                </tr>
              ) : (
                filteredCards.map((card, idx) => (
                  <tr
                    key={card._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {card.photo?.url ? (
                          <img 
                            src={card.photo.url.startsWith('http') ? card.photo.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${card.photo.url}`} 
                            alt={card.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200">
                            {card.name?.charAt(0)?.toUpperCase() || 'V'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{card.name}</div>
                          <div className="text-xs text-gray-500">{card.volunteer?.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-700">{card.cardNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-white whitespace-nowrap">
                        {card.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(card.validityDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          card.status === "active"
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : card.status === "revoked"
                            ? "bg-gradient-to-r from-red-400 to-red-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {card.status?.charAt(0).toUpperCase() + card.status?.slice(1) || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {card.qrCode?.url && (
                          <button
                            onClick={() => window.open(card.qrCode.url, '_blank')}
                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                            title="View QR Code"
                          >
                            <BiQr size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(card._id)}
                          className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                          title="Download PDF"
                        >
                          <BiDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </button>
                        {card.status === "active" && (
                          <button
                            onClick={() => handleRevoke(card._id)}
                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                            title="Revoke"
                          >
                            <BiTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingCard ? "Edit Card" : "Create Volunteer Card"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCard(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volunteer *</label>
                <select
                  value={formData.volunteer}
                  onChange={(e) => {
                    const selectedVolId = e.target.value;
                    const selectedVol = volunteers.find(v => v._id === selectedVolId);
                    setFormData({ 
                      ...formData, 
                      volunteer: selectedVolId,
                      // Auto-fill gender and bloodGroup from volunteer details
                      gender: selectedVol?.volunteerDetails?.gender || selectedVol?.gender || "",
                      bloodGroup: selectedVol?.volunteerDetails?.bloodGroup || selectedVol?.bloodGroup || ""
                    });
                  }}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="" className="text-gray-900">Select volunteer</option>
                  {volunteers.map(vol => (
                    <option key={vol._id} value={vol._id} className="text-gray-900">{vol.name} ({vol.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      const categoryIndex = VOLUNTEER_ROLES.indexOf(role);
                      setFormData({
                        ...formData,
                        role,
                        category: categoryIndex >= 0 ? VOLUNTEER_CATEGORIES[categoryIndex] : ""
                      });
                    }}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="" className="text-gray-900">Select role</option>
                    {VOLUNTEER_ROLES.map((role, idx) => (
                      <option key={role} value={role} className="text-gray-900">{VOLUNTEER_CATEGORIES[idx]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-900"
                    placeholder="Auto-filled from role"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="" className="text-gray-900">Select gender</option>
                    <option value="Male" className="text-gray-900">Male</option>
                    <option value="Female" className="text-gray-900">Female</option>
                    <option value="Other" className="text-gray-900">Other</option>
                    <option value="Prefer not to say" className="text-gray-900">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="" className="text-gray-900">Select blood group</option>
                    <option value="A+" className="text-gray-900">A+</option>
                    <option value="A-" className="text-gray-900">A-</option>
                    <option value="B+" className="text-gray-900">B+</option>
                    <option value="B-" className="text-gray-900">B-</option>
                    <option value="AB+" className="text-gray-900">AB+</option>
                    <option value="AB-" className="text-gray-900">AB-</option>
                    <option value="O+" className="text-gray-900">O+</option>
                    <option value="O-" className="text-gray-900">O-</option>
                    <option value="N/A" className="text-gray-900">N/A</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validity Date *</label>
                  <input
                    type="date"
                    value={formData.validityDate}
                    onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {photoPreview && (
                    <div className="mt-2">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Or paste base64 image data</p>
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => {
                      setFormData({ ...formData, photo: e.target.value });
                      if (e.target.value.startsWith('data:')) {
                        setPhotoPreview(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mt-2 placeholder:text-gray-900"
                    placeholder="Photo URL or base64 data"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : editingCard ? "Update Card" : "Create Card"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCard(null);
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


