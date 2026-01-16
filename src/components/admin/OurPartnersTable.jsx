"use client";
import { useState, useEffect } from "react";
import { BiEdit, BiTrash, BiSearch, BiX } from "react-icons/bi";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function OurPartnersTable() {
  const { partners, isLoading, getPartners, deletePartner, updatePartner } =
    useAdminStore();
  const [editingPartner, setEditingPartner] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [viewingPartner, setViewingPartner] = useState(null);

  const handleView = (partner) => {
    setViewingPartner(partner);
  };

  const handleBlock = async (partnerId) => {
    if (!window.confirm("Are you sure you want to block this partner?")) return;

    try {
      await updatePartner(partnerId, {
        status: "blocked",
        isActive: false,
      });

      toast.success("Partner blocked successfully");

      // Refresh list
      await getPartners({ status: "approved", limit: 100 });
    } catch (error) {
      console.error("Block error:", error);
      toast.error(error?.response?.data?.message || "Failed to block partner");
    }
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        await getPartners({ status: "approved", limit: 100 });
      } catch (error) {
        console.error("Failed to load partners:", error);
        toast.error("Failed to load partners");
      }
    };
    fetchPartners();
  }, [getPartners]);

  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [foodSearchTerm, setFoodSearchTerm] = useState("");

  // Hospital Partners (businessType === 'hospital')
  const hospitalPartners = partners
    .filter(
      (p) =>
        p.businessType === "hospital" && (p.status === "approved" || p.isActive)
    )
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(hospitalSearchTerm.toLowerCase()) ||
        p.contactPerson?.name
          ?.toLowerCase()
          .includes(hospitalSearchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(hospitalSearchTerm.toLowerCase()) ||
        p.phone?.includes(hospitalSearchTerm) ||
        p.address?.city
          ?.toLowerCase()
          .includes(hospitalSearchTerm.toLowerCase())
    );

  // Doctor Partners (medical category but not hospital)
  const doctorPartners = partners
    .filter(
      (p) =>
        p.category === "medical" &&
        p.businessType !== "hospital" &&
        (p.status === "approved" || p.isActive)
    )
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        p.contactPerson?.name
          ?.toLowerCase()
          .includes(doctorSearchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        p.phone?.includes(doctorSearchTerm) ||
        p.address?.city?.toLowerCase().includes(doctorSearchTerm.toLowerCase())
    );

  const foodPartners = partners
    .filter(
      (p) => p.category === "food" && (p.status === "approved" || p.isActive)
    )
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(foodSearchTerm.toLowerCase()) ||
        p.contactPerson?.name
          ?.toLowerCase()
          .includes(foodSearchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(foodSearchTerm.toLowerCase()) ||
        p.phone?.includes(foodSearchTerm) ||
        p.address?.city?.toLowerCase().includes(foodSearchTerm.toLowerCase())
    );

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    const metadata = partner.metadata || {};

    // Extract bed capacity - handle both number and string
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
      // Validate email
      if (editFormData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editFormData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }
      }

      // Validate phone
      if (editFormData.phone) {
        const phoneRegex = /^\d{10}$/;
        const cleanPhone = editFormData.phone.replace(/\D/g, "");
        if (!phoneRegex.test(cleanPhone)) {
          toast.error("Please provide a valid 10-digit contact number");
          return;
        }
        editFormData.phone = cleanPhone;
      }

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
        // Convert bedCapacity to number if it's a valid string/number
        let bedCapacity = null;
        const bedCapValue = editFormData.bedCapacity;

        if (
          bedCapValue !== undefined &&
          bedCapValue !== null &&
          bedCapValue !== ""
        ) {
          const bc = parseInt(bedCapValue.toString().trim());
          if (!isNaN(bc) && bc > 0) {
            bedCapacity = bc;
          }
        }

        // Process specializations
        let specializations = [];
        if (
          editFormData.specializations &&
          editFormData.specializations.trim() !== ""
        ) {
          specializations = editFormData.specializations
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s.length > 0);
        }

        // Build metadata object - merge with existing metadata
        const existingMetadata = editingPartner.metadata || {};
        const metadataUpdate = {
          ...existingMetadata,
          bedCapacity:
            bedCapacity !== null
              ? bedCapacity
              : existingMetadata.bedCapacity || null,
          specializations:
            specializations.length > 0
              ? specializations
              : existingMetadata.specializations || [],
          emergencyServices: Boolean(editFormData.emergencyServices),
          ambulanceServices: Boolean(editFormData.ambulanceServices),
          icuFacility: Boolean(editFormData.icuFacility),
          operationTheatre: Boolean(editFormData.operationTheatre),
        };

        updateData.metadata = metadataUpdate;
      }

      const response = await updatePartner(editingPartner._id, updateData);

      // Close modal first
      handleCloseEdit();

      // Force refresh partners list to get updated data from server
      // Add a small delay to ensure backend has processed the update
      setTimeout(async () => {
        try {
          await getPartners({ status: "approved", limit: 100 });
        } catch (error) {
          console.error("Failed to refresh partners:", error);
        }
      }, 300);

      toast.success("Partner updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update partner");
    }
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await deletePartner(partnerId);
        toast.success("Partner deleted successfully");
        // Refresh the partners list
        await getPartners({ status: "approved", limit: 100 });
      } catch (error) {
        console.error("Delete error:", error);
        // Extract error message properly
        let errorMessage = "Failed to delete partner";
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Partner's
        </h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li>
              <a
                href="/admin"
                className="hover:underline text-gray-600 font-medium"
              >
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">Partner's Section</li>
          </ol>
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading partners...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hospital Partners */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
                🏥 Hospital Partners ({hospitalPartners.length})
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search hospital partners..."
                  value={hospitalSearchTerm}
                  onChange={(e) => setHospitalSearchTerm(e.target.value)}
                  className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64 transition-all shadow-sm hover:shadow-md"
                />
                <BiSearch
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="max-h-[400px] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#9CA3AF #F3F4F6",
                }}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-red-500 via-pink-500 to-red-500">
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Hospital Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        License No.
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Specializations
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Bed Capacity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalPartners.length > 0 ? (
                      hospitalPartners.map((partner, idx) => {
                        const metadata = partner.metadata || {};
                        // Get specializations from metadata or description
                        let specializations = [];
                        if (
                          metadata.specializations &&
                          Array.isArray(metadata.specializations)
                        ) {
                          specializations = metadata.specializations;
                        } else if (
                          metadata.specializations &&
                          typeof metadata.specializations === "string"
                        ) {
                          specializations = metadata.specializations
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s);
                        } else if (partner.description) {
                          const match = partner.description.match(
                            /Specialization[s]?:\s*([^.]+)/i
                          );
                          if (match) {
                            specializations = match[1]
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s);
                          }
                        }

                        // Get bed capacity from multiple sources with better extraction
                        let bedCapacity = null;

                        // First check metadata.bedCapacity
                        if (metadata && metadata.bedCapacity) {
                          const bc = metadata.bedCapacity.toString().trim();
                          if (
                            bc &&
                            bc !== "" &&
                            bc !== "0" &&
                            bc !== "null" &&
                            bc !== "undefined"
                          ) {
                            bedCapacity = bc;
                          }
                        }

                        // If not found, check description for bed capacity
                        if (!bedCapacity && partner.description) {
                          // Try multiple patterns
                          const patterns = [
                            /bed capacity[:\s]*(\d+)/i,
                            /(\d+)\s*beds?/i,
                            /capacity[:\s]*(\d+)/i,
                            /(\d+)\s*bed/i,
                          ];
                          for (const pattern of patterns) {
                            const match = partner.description.match(pattern);
                            if (match && match[1]) {
                              bedCapacity = match[1].trim();
                              break;
                            }
                          }
                        }

                        // Also check if bedCapacity is stored directly on partner object
                        if (!bedCapacity && partner.bedCapacity) {
                          const bc = partner.bedCapacity.toString().trim();
                          if (
                            bc &&
                            bc !== "" &&
                            bc !== "0" &&
                            bc !== "null" &&
                            bc !== "undefined"
                          ) {
                            bedCapacity = bc;
                          }
                        }

                        // Check adminNotes as last resort
                        if (!bedCapacity && partner.adminNotes) {
                          const match = partner.adminNotes.match(
                            /bed capacity[:\s]*(\d+)/i
                          );
                          if (match && match[1]) {
                            bedCapacity = match[1].trim();
                          }
                        }

                        // Get contact person name (only if different from hospital name)
                        const contactPersonName =
                          partner.contactPerson?.name &&
                          partner.contactPerson.name !== partner.name
                            ? partner.contactPerson.name
                            : null;

                        return (
                          <tr
                            key={partner._id}
                            className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">
                                {partner.name}
                              </div>
                              {contactPersonName && (
                                <div className="text-xs text-gray-500">
                                  Contact: {contactPersonName}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {partner.documents?.businessLicense ||
                                partner.documents?.gstNumber ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-4">
                              {specializations.length > 0 ? (
                                <>
                                  <div className="text-sm text-gray-700">
                                    {specializations.slice(0, 2).join(", ")}
                                  </div>
                                  {specializations.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{specializations.length - 2} more
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  General Medicine
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="text-gray-700">
                                {partner.email ||
                                  partner.contactPerson?.email ||
                                  "N/A"}
                              </div>
                              <div className="text-gray-600">
                                {partner.phone ||
                                  partner.contactPerson?.phone ||
                                  "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                              <div className="line-clamp-2">
                                {partner.address?.city || "N/A"},{" "}
                                {partner.address?.state || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {bedCapacity &&
                              bedCapacity !== "0" &&
                              bedCapacity !== ""
                                ? `${bedCapacity} beds`
                                : "N/A"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2 flex-wrap">
                                {/* VIEW */}
                                <button
                                  onClick={() => handleView(partner)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-green-500 hover:bg-green-600
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                                >
                                  👁️ View
                                </button>

                                {/* EDIT (EXISTING – KEEP AS IS) */}
                                <button
                                  onClick={() => handleEdit(partner)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-blue-500 to-blue-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-blue-600 hover:to-blue-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                                >
                                  <BiEdit size={14} />
                                  Edit
                                </button>

                                {/* BLOCK */}
                                <button
                                  onClick={() => handleBlock(partner._id)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-slate-600 hover:bg-slate-700
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                                >
                                  🚫 Block
                                </button>

                                {/* DELETE (EXISTING – KEEP AS IS) */}
                                <button
                                  onClick={() => handleDelete(partner._id)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-red-500 to-red-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-red-600 hover:to-red-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                                >
                                  <BiTrash size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          <div className="text-4xl mb-2">🏥</div>
                          No hospital partners found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Doctor Partners */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                👨‍⚕️ Doctor Partners ({doctorPartners.length})
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctor partners..."
                  value={doctorSearchTerm}
                  onChange={(e) => setDoctorSearchTerm(e.target.value)}
                  className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-all shadow-sm hover:shadow-md"
                />
                <BiSearch
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="max-h-[400px] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#9CA3AF #F3F4F6",
                }}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500">
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Doctor Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Registration
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Specialization
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Discount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPartners.length > 0 ? (
                      doctorPartners.map((partner, idx) => {
                        // Get specialization
                        const specialization =
                          partner.description
                            ?.match(/Specialization:\s*([^.]+)/i)?.[1]
                            ?.trim() ||
                          partner.contactPerson?.designation ||
                          "General Physician";

                        // Get qualification
                        const qualification = partner.description
                          ?.match(/Qualification:\s*([^.]+)/i)?.[1]
                          ?.trim();

                        // Get registration number
                        const registration =
                          partner.documents?.businessLicense ||
                          partner.documents?.gstNumber ||
                          partner.adminNotes
                            ?.match(/Registration:\s*([^,]+)/)?.[1]
                            ?.trim() ||
                          null;

                        // Get contact person name (only if different from doctor name)
                        const contactPersonName =
                          partner.contactPerson?.name &&
                          partner.contactPerson.name !== partner.name
                            ? partner.contactPerson.name
                            : null;

                        return (
                          <tr
                            key={partner._id}
                            className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">
                                {partner.name}
                              </div>
                              {contactPersonName ? (
                                <div className="text-xs text-gray-500">
                                  Contact: {contactPersonName}
                                </div>
                              ) : (
                                partner.contactPerson?.designation && (
                                  <div className="text-xs text-gray-500">
                                    {partner.contactPerson.designation}
                                  </div>
                                )
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {registration || "N/A"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-700">
                                {specialization}
                              </div>
                              {qualification && (
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {qualification}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="text-gray-700">
                                {partner.email ||
                                  partner.contactPerson?.email ||
                                  "N/A"}
                              </div>
                              <div className="text-gray-600">
                                {partner.phone ||
                                  partner.contactPerson?.phone ||
                                  "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                              <div className="line-clamp-2">
                                {partner.address?.city || "N/A"},{" "}
                                {partner.address?.state || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {partner.adminNotes?.match(
                                /NGO Offer:\s*([^,]+)/
                              )?.[1] ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  {partner.adminNotes
                                    .match(/NGO Offer:\s*([^,]+)/)?.[1]
                                    .trim()}
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2 flex-wrap">
                                {/* VIEW */}
                                <button
                                  onClick={() => handleView(partner)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-green-500 hover:bg-green-600
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                                >
                                  👁️ View
                                </button>

                                {/* EDIT (EXISTING – KEEP AS IS) */}
                                <button
                                  onClick={() => handleEdit(partner)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-blue-500 to-blue-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-blue-600 hover:to-blue-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                                >
                                  <BiEdit size={14} />
                                  Edit
                                </button>

                                {/* BLOCK */}
                                <button
                                  onClick={() => handleBlock(partner._id)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-slate-600 hover:bg-slate-700
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                                >
                                  🚫 Block
                                </button>

                                {/* DELETE (EXISTING – KEEP AS IS) */}
                                <button
                                  onClick={() => handleDelete(partner._id)}
                                  className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-red-500 to-red-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-red-600 hover:to-red-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                                >
                                  <BiTrash size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          <div className="text-4xl mb-2">👨‍⚕️</div>
                          No doctor partners found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Food Partners */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-orange-900 flex items-center gap-2">
                🍽️ Food Partners ({foodPartners.length})
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search food partners..."
                  value={foodSearchTerm}
                  onChange={(e) => setFoodSearchTerm(e.target.value)}
                  className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64 transition-all shadow-sm hover:shadow-md"
                />
                <BiSearch
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="max-h-[400px] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#9CA3AF #F3F4F6",
                }}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500">
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Business Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        FSSAI No.
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Cuisine/Services
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Discount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodPartners.length > 0 ? (
                      foodPartners.map((partner, idx) => (
                        <tr
                          key={partner._id}
                          className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">
                              {partner.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {partner.contactPerson?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {partner.adminNotes
                              ?.match(/FSAI:\s*([^,]+)/)?.[1]
                              ?.trim() ||
                              partner.documents?.businessLicense ||
                              "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700">
                              {partner.description || "Multi-cuisine"}
                            </div>
                            {partner.description && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {partner.description.substring(0, 50)}...
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="text-gray-700">
                              {partner.email ||
                                partner.contactPerson?.email ||
                                "N/A"}
                            </div>
                            <div className="text-gray-600">
                              {partner.phone ||
                                partner.contactPerson?.phone ||
                                "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                            <div className="line-clamp-2">
                              {partner.address?.city || "N/A"},{" "}
                              {partner.address?.state || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {partner.adminNotes?.match(
                              /Special Offer:\s*([^,]+)/
                            )?.[1] ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                {partner.adminNotes
                                  .match(/Special Offer:\s*([^,]+)/)?.[1]
                                  .trim()}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {/* VIEW */}
                              <button
                                onClick={() => handleView(partner)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-green-500 hover:bg-green-600
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                              >
                                👁️ View
                              </button>

                              {/* EDIT (EXISTING – KEEP AS IS) */}
                              <button
                                onClick={() => handleEdit(partner)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-blue-500 to-blue-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-blue-600 hover:to-blue-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                              >
                                <BiEdit size={14} />
                                Edit
                              </button>

                              {/* BLOCK */}
                              <button
                                onClick={() => handleBlock(partner._id)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5
             bg-slate-600 hover:bg-slate-700
             text-white text-xs rounded-lg
             transition-all min-w-[80px] h-[28px]"
                              >
                                🚫 Block
                              </button>

                              {/* DELETE (EXISTING – KEEP AS IS) */}
                              <button
                                onClick={() => handleDelete(partner._id)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5
                 bg-gradient-to-r from-red-500 to-red-600
                 text-white text-xs font-medium rounded-lg
                 hover:from-red-600 hover:to-red-700
                 transition-all shadow-md hover:shadow-lg
                 min-w-[80px] h-[28px]"
                              >
                                <BiTrash size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          <div className="text-4xl mb-2">🍽️</div>
                          No food partners found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`sticky top-0 text-white p-6 rounded-t-2xl flex items-center justify-between ${
                editingPartner.businessType === "hospital"
                  ? "bg-gradient-to-r from-red-500 to-pink-500"
                  : editingPartner.category === "food"
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-green-500 to-blue-500"
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold">
                  {editingPartner.businessType === "hospital"
                    ? "🏥 Edit Hospital Partner"
                    : editingPartner.category === "food"
                    ? "🍽️ Edit Food Partner"
                    : "👨‍⚕️ Edit Doctor Partner"}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {editingPartner.businessType === "hospital"
                    ? "Update hospital information and facilities"
                    : "Update partner information"}
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={28} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* General Partner Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                  {editingPartner.businessType === "hospital"
                    ? "🏥 Hospital Basic Information"
                    : "📋 Partner Information"}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Business/Partner Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    required
                    maxLength={10}
                    placeholder="Enter 10 digit mobile number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={editFormData.city || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={editFormData.state || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={editFormData.adminNotes || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      adminNotes: e.target.value,
                    })
                  }
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                  placeholder="Internal notes about this partner..."
                />
              </div>

              {/* Hospital-specific fields */}
              {editingPartner?.businessType === "hospital" && (
                <>
                  <div className="border-t-2 border-red-200 pt-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏥</span>
                      <h3 className="text-xl font-bold text-gray-800">
                        Hospital-Specific Details
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      These fields are specific to hospitals. General partner
                      information is shown above.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Bed Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={editFormData.bedCapacity || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditFormData({
                            ...editFormData,
                            bedCapacity: value,
                          });
                        }}
                        min="1"
                        step="1"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all shadow-sm hover:shadow-md"
                        placeholder="Enter bed capacity (e.g., 50)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Total number of beds available
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Specializations
                      </label>
                      <input
                        type="text"
                        value={editFormData.specializations || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            specializations: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
                        placeholder="Cardiology, Neurology, Orthopedics"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate multiple specializations with commas
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Available Facilities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          id="emergencyServices"
                          checked={editFormData.emergencyServices || false}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              emergencyServices: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <label
                          htmlFor="emergencyServices"
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          🚨 Emergency Services
                        </label>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          id="ambulanceServices"
                          checked={editFormData.ambulanceServices || false}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              ambulanceServices: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <label
                          htmlFor="ambulanceServices"
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          🚑 Ambulance Services
                        </label>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          id="icuFacility"
                          checked={editFormData.icuFacility || false}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              icuFacility: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <label
                          htmlFor="icuFacility"
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          🏥 ICU Facility
                        </label>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-colors">
                        <input
                          type="checkbox"
                          id="operationTheatre"
                          checked={editFormData.operationTheatre || false}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              operationTheatre: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <label
                          htmlFor="operationTheatre"
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          ⚕️ Operation Theatre
                        </label>
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
      {viewingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Partner Details</h2>
              <button onClick={() => setViewingPartner(null)}>
                <BiX size={24} />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {viewingPartner.name}
              </p>
              <p>
                <strong>Email:</strong> {viewingPartner.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewingPartner.phone}
              </p>
              <p>
                <strong>City:</strong> {viewingPartner.address?.city}
              </p>
              <p>
                <strong>State:</strong> {viewingPartner.address?.state}
              </p>
              <p>
                <strong>Description:</strong> {viewingPartner.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
