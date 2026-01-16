"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash, BiPlus, BiDownload, BiQr, BiLink } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function VolunteerCertificateManagement() {
  const [certificates, setCertificates] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [formData, setFormData] = useState({
    volunteer: "",
    purpose: "",
    title: "",
    description: "",
    program: "",
    isPublic: false
  });

  const CERTIFICATE_PURPOSES = [
    'service',
    'appointment',
    'achievement',
    'participation',
    'recognition',
    'completion'
  ];

  useEffect(() => {
    fetchCertificates();
    fetchVolunteers();
  }, [filterPurpose]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterPurpose !== "all") params.purpose = filterPurpose;
      const response = await api.get("/volunteer-cards/certificates", { params });
      setCertificates(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load certificates");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCertificate) {
        await api.put(`/volunteer-cards/certificates/${editingCertificate._id}`, formData);
        toast.success("Certificate updated successfully!");
      } else {
        await api.post("/volunteer-cards/certificates", formData);
        toast.success("Certificate created successfully!");
      }
      setShowModal(false);
      setEditingCertificate(null);
      setFormData({
        volunteer: "",
        purpose: "",
        title: "",
        description: "",
        program: "",
        isPublic: false
      });
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save certificate");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await api.delete(`/volunteer-cards/certificates/${id}`);
      toast.success("Certificate deleted successfully!");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to delete certificate");
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      volunteer: certificate.volunteer?._id || "",
      purpose: certificate.purpose || "",
      title: certificate.title || "",
      description: certificate.description || "",
      program: certificate.program || "",
      isPublic: certificate.isPublic || false
    });
    setShowModal(true);
  };

  const handleDownloadPDF = async (certId) => {
    try {
      const response = await api.get(`/volunteer-cards/certificates/${certId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleShare = (certificate) => {
    if (certificate.verificationToken) {
      const verificationLink = `${window.location.origin}/volunteers/certificates/verify/${certificate.verificationToken}`;
      navigator.clipboard.writeText(verificationLink);
      toast.success("Verification link copied to clipboard!");
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.volunteer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Volunteer Certificate Management
          </h1>
          <p className="text-sm text-gray-600">Create, manage, and issue digital certificates for volunteers</p>
        </div>
        <button
          onClick={() => {
            setEditingCertificate(null);
            setFormData({
              volunteer: "",
              purpose: "",
              title: "",
              description: "",
              program: "",
              isPublic: false
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <BiPlus size={20} />
          Create Certificate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by volunteer name, title, or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">All Purposes</option>
            {CERTIFICATE_PURPOSES.map(purpose => (
              <option key={purpose} value={purpose}>{purpose.charAt(0).toUpperCase() + purpose.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Volunteer</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Certificate #</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Purpose</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Issued Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Public</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No certificates found
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert, idx) => (
                  <tr
                    key={cert._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{cert.volunteer?.name || "N/A"}</div>
                      <div className="text-xs text-gray-500">{cert.volunteer?.email || ""}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-700">{cert.certificateNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{cert.title}</div>
                      {cert.program && (
                        <div className="text-xs text-gray-500">{cert.program}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-400 to-indigo-600 text-white">
                        {cert.purpose?.charAt(0).toUpperCase() + cert.purpose?.slice(1) || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cert.isPublic
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {cert.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {cert.qrCode?.url && (
                          <button
                            onClick={() => window.open(cert.qrCode.url, '_blank')}
                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                            title="View QR Code"
                          >
                            <BiQr size={18} />
                          </button>
                        )}
                        {cert.verificationToken && (
                          <button
                            onClick={() => handleShare(cert)}
                            className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                            title="Copy Verification Link"
                          >
                            <BiLink size={18} />
                          </button>
                        )}
                        {cert.pdfUrl && (
                          <button
                            onClick={() => handleDownloadPDF(cert._id)}
                            className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                            title="Download PDF"
                          >
                            <BiDownload size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(cert)}
                          className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cert._id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                          title="Delete"
                        >
                          <BiTrash size={18} />
                        </button>
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
              <h2 className="text-2xl font-bold">{editingCertificate ? "Edit Certificate" : "Create Certificate"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCertificate(null);
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
                  onChange={(e) => setFormData({ ...formData, volunteer: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select volunteer</option>
                  {volunteers.map(vol => (
                    <option key={vol._id} value={vol._id}>{vol.name} ({vol.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select purpose</option>
                    {CERTIFICATE_PURPOSES.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose.charAt(0).toUpperCase() + purpose.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Program name (optional)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Certificate title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Certificate description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this certificate publicly viewable
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingCertificate ? "Update Certificate" : "Create Certificate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCertificate(null);
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

