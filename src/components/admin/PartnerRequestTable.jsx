"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiCheck, BiX, BiEdit } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function PartnerRequestTable() {
  const { partners, isLoading, getPartners, updatePartner } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        await getPartners({ limit: 100 });
      } catch (error) {
        console.error("Failed to load partner requests:", error);
        toast.error("Failed to load partner requests");
      }
    };
    fetchPartners();
  }, [getPartners]);

  const handleApprove = async (partnerId) => {
    try {
      await updatePartner(partnerId, { status: 'approved', isActive: true });
      toast.success("Partner approved successfully!");
      getPartners({ limit: 100 });
    } catch (error) {
      toast.error("Failed to approve partner");
    }
  };

  const handleReject = async (partnerId) => {
    try {
      await updatePartner(partnerId, { status: 'rejected', isActive: false });
      toast.success("Partner rejected");
      getPartners({ limit: 100 });
    } catch (error) {
      toast.error("Failed to reject partner");
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    const metadata = partner.metadata || {};

    // Extract bed capacity
    let bedCapacity = "";
    if (metadata.bedCapacity) {
      bedCapacity = metadata.bedCapacity.toString();
    } else if (partner.description) {
      const match = partner.description.match(/bed capacity[:\s]*(\d+)/i);
      if (match) {
        bedCapacity = match[1];
      }
    }

    // Extract specializations
    let specializations = "";
    if (metadata.specializations) {
      if (Array.isArray(metadata.specializations)) {
        specializations = metadata.specializations.join(", ");
      } else if (typeof metadata.specializations === "string") {
        specializations = metadata.specializations;
      }
    }

    setEditFormData({
      name: partner.name || "",
      email: partner.email || partner.contactPerson?.email || "",
      phone: partner.phone || partner.contactPerson?.phone || "",
      address: partner.address?.street || "",
      city: partner.address?.city || "",
      state: partner.address?.state || "",
      description: partner.description || "",
      adminNotes: partner.adminNotes || "",
      // Hospital-specific fields
      bedCapacity: bedCapacity,
      specializations: specializations,
      emergencyServices: metadata.emergencyServices === true,
      ambulanceServices: metadata.ambulanceServices === true,
      icuFacility: metadata.icuFacility === true,
      operationTheatre: metadata.operationTheatre === true,
    });
  };

  const handleCloseEdit = () => {
    setEditingPartner(null);
    setEditFormData({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingPartner) return;

    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email?.toLowerCase().trim(),
        phone: editFormData.phone,
        description: editFormData.description,
        address: {
          street: editFormData.address,
          city: editFormData.city,
          state: editFormData.state,
          ...(editingPartner.address || {}),
        },
        adminNotes: editFormData.adminNotes,
        contactPerson: {
          ...(editingPartner.contactPerson || {}),
          name: editFormData.name,
          email: editFormData.email?.toLowerCase().trim(),
          phone: editFormData.phone,
        },
      };

      // Add metadata for hospital partners
      if (editingPartner.businessType === "hospital") {
        let bedCapacity = null;
        const bedCapValue = editFormData.bedCapacity;

        if (bedCapValue !== undefined && bedCapValue !== null && bedCapValue !== "") {
          const bc = parseInt(bedCapValue.toString().trim());
          if (!isNaN(bc) && bc > 0) {
            bedCapacity = bc;
          }
        }

        let specializations = [];
        if (editFormData.specializations && editFormData.specializations.trim() !== "") {
          specializations = editFormData.specializations
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s.length > 0);
        }

        const existingMetadata = editingPartner.metadata || {};
        const metadataUpdate = {
          ...existingMetadata,
          bedCapacity: bedCapacity !== null ? bedCapacity : existingMetadata.bedCapacity || null,
          specializations: specializations.length > 0 ? specializations : existingMetadata.specializations || [],
          emergencyServices: Boolean(editFormData.emergencyServices),
          ambulanceServices: Boolean(editFormData.ambulanceServices),
          icuFacility: Boolean(editFormData.icuFacility),
          operationTheatre: Boolean(editFormData.operationTheatre),
        };

        updateData.metadata = metadataUpdate;
      }

      await updatePartner(editingPartner._id, updateData);
      handleCloseEdit();
      toast.success("Partner updated successfully");
      getPartners({ limit: 100 });
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update partner");
    }
  };

  const filteredRequests = partners.filter(partner =>
    partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.contactPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.contactPerson?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredRequests.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Partner Request</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 font-medium">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/admin/partner-requests" className="hover:underline text-gray-600 font-medium">Partner Request</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">Partner Request Section</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
          Partner Request
        </h2>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <option value={10} className="text-gray-900">10</option>
            </select>
            <span className="text-sm text-green-600 font-medium">entries per page</span>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900" />
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading partner requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Business Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Contact Person</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Contact Info</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((partner, idx) => (
                    <tr key={partner._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {partner.name && partner.name !== partner.contactPerson?.name
                            ? partner.name
                            : partner.businessName
                              ? partner.businessName
                              : partner.businessType && partner.category
                                ? `${partner.businessType.charAt(0).toUpperCase() + partner.businessType.slice(1)} - ${partner.category.charAt(0).toUpperCase() + partner.category.slice(1)}`
                                : partner.description
                                  ? partner.description.substring(0, 30) + (partner.description.length > 30 ? '...' : '')
                                  : 'N/A'}
                        </div>
                        {partner.registrationNumber && (
                          <div className="text-xs text-gray-500">Reg: {partner.registrationNumber}</div>
                        )}
                        {partner.documents?.businessLicense && (
                          <div className="text-xs text-gray-500">License: {partner.documents.businessLicense.substring(0, 20)}...</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${partner.category === 'food' || partner.type === 'food' ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                          partner.category === 'medical' || partner.type === 'health' || partner.type === 'medical' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                            'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
                          }`}>
                          {partner.category || partner.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {partner.contactPerson?.name || partner.name || 'N/A'}
                        </div>
                        {partner.contactPerson?.designation && (
                          <div className="text-xs text-gray-500">{partner.contactPerson.designation}</div>
                        )}
                        {!partner.contactPerson?.designation && partner.businessType && (
                          <div className="text-xs text-gray-500">{partner.businessType}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="text-gray-700">{partner.contactPerson?.email || 'N/A'}</div>
                        <div className="text-gray-600">{partner.contactPerson?.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                        <div className="line-clamp-2">
                          {partner.address?.street && `${partner.address.street}, `}
                          {partner.address?.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center ${partner.status === 'approved' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                          partner.status === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                            'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                          }`}>
                          {partner.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {partner.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(partner._id)}
                              className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                              title="Approve Partner"
                            >
                              <BiCheck size={16} />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(partner)}
                            className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                            title="Edit Partner"
                          >
                            <BiEdit size={16} />
                            Edit
                          </button>
                          {partner.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(partner._id)}
                              className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                              title="Reject Partner"
                            >
                              <BiX size={16} />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">🤝</div>
                      {isLoading ? 'Loading partners...' : 'No partner requests found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 text-white p-6 rounded-t-2xl flex items-center justify-between ${editingPartner.businessType === "hospital"
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : editingPartner.category === "food"
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-blue-500"
              }`}>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingPartner.businessType === "hospital"
                    ? "🏥 Edit Hospital Partner"
                    : editingPartner.category === "food"
                      ? "🍽️ Edit Food Partner"
                      : "✏️ Edit Partner Request"}
                </h2>
                <p className="text-sm opacity-90 mt-1">Update partner information</p>
              </div>
              <button onClick={handleCloseEdit} className="text-white hover:text-gray-200 transition-colors">
                <BiX size={28} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Business/Partner Name *</label>
                  <input
                    type="text"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    required
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editFormData.state || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={editFormData.address || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={editFormData.adminNotes || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  placeholder="Internal notes..."
                />
              </div>

              {editingPartner?.businessType === "hospital" && (
                <>
                  <div className="border-t-2 border-red-200 pt-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Hospital Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Bed Capacity</label>
                      <input
                        type="number"
                        value={editFormData.bedCapacity || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, bedCapacity: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Specializations</label>
                      <input
                        type="text"
                        value={editFormData.specializations || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, specializations: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Facilities</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={editFormData.emergencyServices || false}
                          onChange={(e) => setEditFormData({ ...editFormData, emergencyServices: e.target.checked })}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Emergency</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={editFormData.ambulanceServices || false}
                          onChange={(e) => setEditFormData({ ...editFormData, ambulanceServices: e.target.checked })}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Ambulance</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={editFormData.icuFacility || false}
                          onChange={(e) => setEditFormData({ ...editFormData, icuFacility: e.target.checked })}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">ICU</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={editFormData.operationTheatre || false}
                          onChange={(e) => setEditFormData({ ...editFormData, operationTheatre: e.target.checked })}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">O.T.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  Update Partner
                </button>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}



