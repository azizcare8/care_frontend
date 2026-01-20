"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiCheck, BiX, BiEdit } from "react-icons/bi";
import { FiMail, FiPhone, FiCalendar, FiEye } from "react-icons/fi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function FormSubmissionsTable() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // 'approve', 'reject', 'edit', 'view'
  const [reviewNotes, setReviewNotes] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [editFormData, setEditFormData] = useState({});
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSubmissions();
  }, [filterType, filterStatus]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterType !== "all") params.formType = filterType;
      if (filterStatus !== "all") params.status = filterStatus;
      
      // Try both endpoints - form-submissions and admin/form-submissions
      let response;
      try {
        response = await api.get("/form-submissions", { params });
      } catch (error) {
        // If first endpoint fails, try admin endpoint
        console.log("Trying admin endpoint...");
        response = await api.get("/admin/form-submissions", { params });
      }
      
      console.log("Form submissions API response:", response);
      console.log("Response data:", response.data);
      
      // Handle different response structures
      const submissions = response.data?.data || 
                         response.data?.submissions || 
                         (Array.isArray(response.data) ? response.data : []);
      
      console.log("Parsed submissions:", submissions);
      console.log("Submissions count:", submissions.length);
      
      if (!Array.isArray(submissions)) {
        console.error("Submissions is not an array:", submissions);
        setSubmissions([]);
        return;
      }
      
      setSubmissions(submissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Failed to load form submissions");
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    try {
      await api.put(`/form-submissions/${selectedSubmission._id}/approve`, {
        assignedRole: assignedRole || selectedSubmission.formType,
        reviewNotes
      });
      toast.success("Form approved successfully!");
      setShowModal(false);
      setSelectedSubmission(null);
      setReviewNotes("");
      setAssignedRole("");
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve form");
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !reviewNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      await api.put(`/form-submissions/${selectedSubmission._id}/reject`, {
        reviewNotes
      });
      toast.success("Form rejected");
      setShowModal(false);
      setSelectedSubmission(null);
      setReviewNotes("");
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject form");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    try {
      // Normalize address if it's an object
      const normalizedData = { ...editFormData };
      if (normalizedData.personalInfo?.address) {
        const addr = normalizedData.personalInfo.address;
        if (typeof addr === 'string') {
          normalizedData.personalInfo.address = {
            street: addr,
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          };
        }
      }
      
      await api.put(`/form-submissions/${selectedSubmission._id}`, normalizedData);
      toast.success("Form updated successfully!");
      setShowModal(false);
      setSelectedSubmission(null);
      setEditFormData({});
      fetchSubmissions();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(error.response?.data?.message || "Failed to update form");
    }
  };

  const openModal = (submission, action) => {
    setSelectedSubmission(submission);
    setModalAction(action);
    setShowModal(true);
    if (action === "approve") {
      setAssignedRole(submission.formType);
    }
    if (action === "edit") {
      // Initialize edit form data with current submission data
      const address = submission.personalInfo?.address || {};
      setEditFormData({
        personalInfo: {
          firstName: submission.personalInfo?.firstName || '',
          lastName: submission.personalInfo?.lastName || '',
          email: submission.personalInfo?.email || '',
          phone: submission.personalInfo?.phone || '',
          dateOfBirth: submission.personalInfo?.dateOfBirth ? new Date(submission.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: submission.personalInfo?.gender || '',
          address: {
            street: typeof address === 'string' ? address : (address.street || ''),
            city: typeof address === 'object' ? (address.city || '') : '',
            state: typeof address === 'object' ? (address.state || '') : '',
            pincode: typeof address === 'object' ? (address.pincode || '') : '',
            country: typeof address === 'object' ? (address.country || 'India') : 'India'
          }
        },
        volunteerInfo: submission.volunteerInfo || {},
        vendorInfo: submission.vendorInfo || {},
        beneficiaryInfo: submission.beneficiaryInfo || {},
        partnerInfo: submission.partnerInfo || {},
        formData: submission.formData || {}
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      approved: "bg-gradient-to-r from-green-400 to-green-600 text-white",
      rejected: "bg-gradient-to-r from-red-400 to-red-600 text-white",
      under_review: "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
    };
    return badges[status] || badges.pending;
  };

  const getTypeBadge = (type) => {
    const badges = {
      volunteer: "bg-gradient-to-r from-purple-400 to-purple-600 text-white",
      beneficiary: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
      donor: "bg-gradient-to-r from-green-400 to-green-600 text-white",
      vendor: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
      partner: "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white"
    };
    return badges[type] || badges.volunteer;
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      sub.personalInfo?.firstName?.toLowerCase().includes(searchLower) ||
      sub.personalInfo?.lastName?.toLowerCase().includes(searchLower) ||
      sub.personalInfo?.email?.toLowerCase().includes(searchLower) ||
      sub.personalInfo?.phone?.includes(searchTerm) ||
      sub.formType?.toLowerCase().includes(searchLower) ||
      sub.vendorInfo?.businessName?.toLowerCase().includes(searchLower) ||
      sub.partnerInfo?.organizationName?.toLowerCase().includes(searchLower) ||
      sub.beneficiaryInfo?.category?.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = filteredSubmissions.slice(startIndex, startIndex + entriesPerPage);

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
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Form Submissions
          </h1>
          <p className="text-xs md:text-sm text-gray-600">Manage all form submissions from volunteers, donors, beneficiaries, and vendors</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900 text-sm md:text-base"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Types</option>
            <option value="volunteer">Volunteer</option>
            <option value="beneficiary">Beneficiary</option>
            <option value="donor">Donor</option>
            <option value="vendor">Vendor</option>
            <option value="partner">Partner</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
          </select>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border-2 border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Name</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Type</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Contact</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Submitted</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      <span className="ml-3 text-gray-600 text-sm md:text-base">Loading form submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-base md:text-lg font-semibold">No form submissions found</p>
                      <p className="text-xs md:text-sm mt-1">
                        {filteredSubmissions.length === 0 && submissions.length === 0
                          ? "No submissions have been submitted yet."
                          : "No submissions match your current filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((submission, idx) => (
                  <tr
                    key={submission._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="font-medium text-gray-900 text-sm md:text-base break-words">
                        {submission.personalInfo?.firstName || ''} {submission.personalInfo?.lastName || ''}
                        {!submission.personalInfo?.firstName && !submission.personalInfo?.lastName && 'N/A'}
                      </div>
                      {/* Show additional info based on form type */}
                      {submission.formType === 'vendor' && submission.vendorInfo?.businessName && (
                        <div className="text-xs text-gray-500 break-words">🏢 {submission.vendorInfo.businessName}</div>
                      )}
                      {submission.formType === 'partner' && submission.partnerInfo?.organizationName && (
                        <div className="text-xs text-gray-500 break-words">🤝 {submission.partnerInfo.organizationName}</div>
                      )}
                      {submission.formType === 'beneficiary' && submission.beneficiaryInfo?.category && (
                        <div className="text-xs text-gray-500 break-words">📋 {submission.beneficiaryInfo.category}</div>
                      )}
                      {submission.formType === 'volunteer' && submission.volunteerInfo?.preferredRole && (
                        <div className="text-xs text-gray-500 break-words">👤 {submission.volunteerInfo.preferredRole.join(', ')}</div>
                      )}
                      {submission.formType === 'donor' && (
                        <div className="text-xs text-gray-500">💝 Donor</div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(submission.formType)}`}>
                        {submission.formType?.charAt(0).toUpperCase() + submission.formType?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <div className="text-gray-700 flex items-center gap-1 break-words">
                        <FiMail size={14} />
                        <span className="truncate max-w-[200px]">{submission.personalInfo?.email || "N/A"}</span>
                      </div>
                      <div className="text-gray-600 flex items-center gap-1 mt-1">
                        <FiPhone size={14} />
                        {submission.personalInfo?.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                        {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openModal(submission, "view")}
                          className="p-1.5 md:p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                          title="View Details"
                        >
                          <FiEye size={16} className="md:w-[18px] md:h-[18px]" />
                        </button>
                        {submission.status === "pending" && (
                          <>
                            <button
                              onClick={() => openModal(submission, "approve")}
                              className="p-1.5 md:p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                              title="Approve"
                            >
                              <BiCheck size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <button
                              onClick={() => openModal(submission, "reject")}
                              className="p-1.5 md:p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                              title="Reject"
                            >
                              <BiX size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openModal(submission, "edit")}
                          className="p-1.5 md:p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          title="Edit"
                        >
                          <BiEdit size={16} className="md:w-[18px] md:h-[18px]" />
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600 text-sm">Loading form submissions...</span>
            </div>
          </div>
        ) : currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-base font-semibold">No form submissions found</p>
              <p className="text-xs mt-1">
                {filteredSubmissions.length === 0 && submissions.length === 0
                  ? "No submissions have been submitted yet."
                  : "No submissions match your current filters."}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((submission, idx) => (
            <div
              key={submission._id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4"
            >
              <div className="space-y-3">
                {/* Name and Type */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-base mb-1 break-words">
                      {submission.personalInfo?.firstName || ''} {submission.personalInfo?.lastName || ''}
                      {!submission.personalInfo?.firstName && !submission.personalInfo?.lastName && 'N/A'}
                    </div>
                    {/* Show additional info based on form type */}
                    {submission.formType === 'vendor' && submission.vendorInfo?.businessName && (
                      <div className="text-xs text-gray-500 break-words">🏢 {submission.vendorInfo.businessName}</div>
                    )}
                    {submission.formType === 'partner' && submission.partnerInfo?.organizationName && (
                      <div className="text-xs text-gray-500 break-words">🤝 {submission.partnerInfo.organizationName}</div>
                    )}
                    {submission.formType === 'beneficiary' && submission.beneficiaryInfo?.category && (
                      <div className="text-xs text-gray-500 break-words">📋 {submission.beneficiaryInfo.category}</div>
                    )}
                    {submission.formType === 'volunteer' && submission.volunteerInfo?.preferredRole && (
                      <div className="text-xs text-gray-500 break-words">👤 {submission.volunteerInfo.preferredRole.join(', ')}</div>
                    )}
                    {submission.formType === 'donor' && (
                      <div className="text-xs text-gray-500">💝 Donor</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(submission.formType)} ml-2`}>
                    {submission.formType?.charAt(0).toUpperCase() + submission.formType?.slice(1)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</div>
                  <div className="text-sm text-gray-700 flex items-center gap-2 break-words">
                    <FiMail size={14} className="flex-shrink-0" />
                    <span>{submission.personalInfo?.email || "N/A"}</span>
                  </div>
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    <FiPhone size={14} className="flex-shrink-0" />
                    <span>{submission.personalInfo?.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Status and Date */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                      {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Submitted</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <FiCalendar size={12} />
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openModal(submission, "view")}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <FiEye size={14} />
                      <span>View</span>
                    </button>
                    {submission.status === "pending" && (
                      <>
                        <button
                          onClick={() => openModal(submission, "approve")}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                        >
                          <BiCheck size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => openModal(submission, "reject")}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                        >
                          <BiX size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openModal(submission, "edit")}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <BiEdit size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-0">
          <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs md:text-sm rounded-lg hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs md:text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 md:p-6 rounded-t-xl md:rounded-t-2xl flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-bold">
                {modalAction === "view" && "View Submission"}
                {modalAction === "approve" && "Approve Submission"}
                {modalAction === "reject" && "Reject Submission"}
                {modalAction === "edit" && "Edit Submission"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSubmission(null);
                  setReviewNotes("");
                  setAssignedRole("");
                  setEditFormData({});
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={24} className="md:w-7 md:h-7" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {modalAction === "view" && (
                <div className="space-y-4">
                  {/* Personal Information - Always shown */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Personal Information</h3>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg space-y-2">
                      <p className="text-xs md:text-sm break-words"><span className="font-medium">Name:</span> {selectedSubmission.personalInfo?.firstName || ''} {selectedSubmission.personalInfo?.lastName || ''}</p>
                      <p className="text-xs md:text-sm break-words"><span className="font-medium">Email:</span> {selectedSubmission.personalInfo?.email || "N/A"}</p>
                      <p className="text-xs md:text-sm break-words"><span className="font-medium">Phone:</span> {selectedSubmission.personalInfo?.phone || "N/A"}</p>
                      <p className="text-xs md:text-sm"><span className="font-medium">Date of Birth:</span> {selectedSubmission.personalInfo?.dateOfBirth ? new Date(selectedSubmission.personalInfo.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                      <p className="text-xs md:text-sm"><span className="font-medium">Gender:</span> {selectedSubmission.personalInfo?.gender || "N/A"}</p>
                      {selectedSubmission.personalInfo?.address && (
                        <p className="text-xs md:text-sm break-words"><span className="font-medium">Address:</span> {
                          `${selectedSubmission.personalInfo.address.street || ''} ${selectedSubmission.personalInfo.address.city || ''} ${selectedSubmission.personalInfo.address.state || ''} ${selectedSubmission.personalInfo.address.pincode || ''}`.trim() || "N/A"
                        }</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Volunteer Information */}
                  {selectedSubmission.formType === 'volunteer' && selectedSubmission.volunteerInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Volunteer Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Father's Name:</span> {selectedSubmission.volunteerInfo.fathersName || "N/A"}</p>
                        <p><span className="font-medium">Mother's Name:</span> {selectedSubmission.volunteerInfo.mothersName || "N/A"}</p>
                        <p><span className="font-medium">Academic Qualification:</span> {selectedSubmission.volunteerInfo.academicQualification || "N/A"}</p>
                        <p><span className="font-medium">Professional Qualification:</span> {selectedSubmission.volunteerInfo.professionalQualification || "N/A"}</p>
                        <p><span className="font-medium">Occupation:</span> {selectedSubmission.volunteerInfo.occupation || "N/A"}</p>
                        <p><span className="font-medium">Designation:</span> {selectedSubmission.volunteerInfo.designation || "N/A"}</p>
                        <p><span className="font-medium">Preferred Role:</span> {selectedSubmission.volunteerInfo.preferredRole?.join(', ') || "N/A"}</p>
                        <p><span className="font-medium">Availability:</span> {selectedSubmission.volunteerInfo.availability || "N/A"}</p>
                        <p><span className="font-medium">Why Volunteer:</span> {selectedSubmission.volunteerInfo.whyVolunteer || "N/A"}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Vendor Information */}
                  {selectedSubmission.formType === 'vendor' && selectedSubmission.vendorInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Vendor Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Business Name:</span> {selectedSubmission.vendorInfo.businessName || "N/A"}</p>
                        <p><span className="font-medium">Business Type:</span> {selectedSubmission.vendorInfo.businessType || "N/A"}</p>
                        <p><span className="font-medium">GST Number:</span> {selectedSubmission.vendorInfo.gstNumber || "N/A"}</p>
                        <p><span className="font-medium">License Number:</span> {selectedSubmission.vendorInfo.licenseNumber || "N/A"}</p>
                        <p><span className="font-medium">Business Address:</span> {selectedSubmission.vendorInfo.businessAddress || "N/A"}</p>
                        {selectedSubmission.vendorInfo.bankDetails && (
                          <>
                            <p><span className="font-medium">Bank Name:</span> {selectedSubmission.vendorInfo.bankDetails.bankName || "N/A"}</p>
                            <p><span className="font-medium">Account Number:</span> {selectedSubmission.vendorInfo.bankDetails.accountNumber ? '****' + selectedSubmission.vendorInfo.bankDetails.accountNumber.slice(-4) : "N/A"}</p>
                            <p><span className="font-medium">IFSC:</span> {selectedSubmission.vendorInfo.bankDetails.ifsc || "N/A"}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Beneficiary Information */}
                  {selectedSubmission.formType === 'beneficiary' && selectedSubmission.beneficiaryInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Beneficiary Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Category:</span> {selectedSubmission.beneficiaryInfo.category || "N/A"}</p>
                        <p><span className="font-medium">Reason:</span> {selectedSubmission.beneficiaryInfo.reason || "N/A"}</p>
                        <p><span className="font-medium">Required Amount:</span> {selectedSubmission.beneficiaryInfo.requiredAmount?.toLocaleString() || 0}</p>
                        <p><span className="font-medium">Urgency:</span> {selectedSubmission.beneficiaryInfo.urgency || "N/A"}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Partner Information */}
                  {selectedSubmission.formType === 'partner' && selectedSubmission.partnerInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Partner Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Organization Name:</span> {selectedSubmission.partnerInfo.organizationName || "N/A"}</p>
                        <p><span className="font-medium">Organization Type:</span> {selectedSubmission.partnerInfo.organizationType || "N/A"}</p>
                        <p><span className="font-medium">Designation:</span> {selectedSubmission.partnerInfo.designation || "N/A"}</p>
                        <p><span className="font-medium">Partnership Type:</span> {selectedSubmission.partnerInfo.partnershipType || "N/A"}</p>
                        <p><span className="font-medium">Description:</span> {selectedSubmission.partnerInfo.description || "N/A"}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Donor Information */}
                  {selectedSubmission.formType === 'donor' && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Donor Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Type:</span> Donor</p>
                        <p className="text-sm text-gray-600">Additional donor-specific information will be displayed here if available.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Submission Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Submission Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Form Type:</span> {selectedSubmission.formType?.charAt(0).toUpperCase() + selectedSubmission.formType?.slice(1)}</p>
                      <p><span className="font-medium">Status:</span> {selectedSubmission.status?.charAt(0).toUpperCase() + selectedSubmission.status?.slice(1).replace("_", " ")}</p>
                      <p><span className="font-medium">Submitted At:</span> {new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                      {selectedSubmission.reviewedBy && (
                        <p><span className="font-medium">Reviewed By:</span> {selectedSubmission.reviewedBy?.name || "N/A"}</p>
                      )}
                      {selectedSubmission.reviewedAt && (
                        <p><span className="font-medium">Reviewed At:</span> {new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
                      )}
                      {selectedSubmission.reviewNotes && (
                        <p><span className="font-medium">Review Notes:</span> {selectedSubmission.reviewNotes}</p>
                      )}
                      {selectedSubmission.assignedRole && (
                        <p><span className="font-medium">Assigned Role:</span> {selectedSubmission.assignedRole}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {modalAction === "approve" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Assign Role *</label>
                    <select
                      value={assignedRole}
                      onChange={(e) => setAssignedRole(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="donor">Donor</option>
                      <option value="vendor">Vendor</option>
                      <option value="beneficiary">Beneficiary</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows="3"
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Add any notes about this approval..."
                    />
                  </div>
                  <button
                    onClick={handleApprove}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm md:text-base rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Approve Submission
                  </button>
                </div>
              )}
              {modalAction === "reject" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows="4"
                      required
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                  <button
                    onClick={handleReject}
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm md:text-base rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Reject Submission
                  </button>
                </div>
              )}
              {modalAction === "edit" && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={editFormData.personalInfo?.firstName || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              firstName: e.target.value
                            }
                          })}
                          required
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={editFormData.personalInfo?.lastName || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              lastName: e.target.value
                            }
                          })}
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={editFormData.personalInfo?.email || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              email: e.target.value
                            }
                          })}
                          required
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Phone *</label>
                        <input
                          type="tel"
                          value={editFormData.personalInfo?.phone || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              phone: e.target.value
                            }
                          })}
                          required
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={editFormData.personalInfo?.dateOfBirth || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              dateOfBirth: e.target.value
                            }
                          })}
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={editFormData.personalInfo?.gender || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            personalInfo: {
                              ...editFormData.personalInfo,
                              gender: e.target.value
                            }
                          })}
                          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Address Fields */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={editFormData.personalInfo?.address?.street || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              personalInfo: {
                                ...editFormData.personalInfo,
                                address: {
                                  ...editFormData.personalInfo?.address,
                                  street: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="City"
                            value={editFormData.personalInfo?.address?.city || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              personalInfo: {
                                ...editFormData.personalInfo,
                                address: {
                                  ...editFormData.personalInfo?.address,
                                  city: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="State"
                            value={editFormData.personalInfo?.address?.state || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              personalInfo: {
                                ...editFormData.personalInfo,
                                address: {
                                  ...editFormData.personalInfo?.address,
                                  state: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Pincode"
                            value={editFormData.personalInfo?.address?.pincode || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              personalInfo: {
                                ...editFormData.personalInfo,
                                address: {
                                  ...editFormData.personalInfo?.address,
                                  pincode: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Country"
                            value={editFormData.personalInfo?.address?.country || 'India'}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              personalInfo: {
                                ...editFormData.personalInfo,
                                address: {
                                  ...editFormData.personalInfo?.address,
                                  country: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Type Specific Fields */}
                  {selectedSubmission.formType === 'volunteer' && editFormData.volunteerInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg">Volunteer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                          <input
                            type="text"
                            value={editFormData.volunteerInfo.fathersName || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              volunteerInfo: {
                                ...editFormData.volunteerInfo,
                                fathersName: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                          <input
                            type="text"
                            value={editFormData.volunteerInfo.mothersName || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              volunteerInfo: {
                                ...editFormData.volunteerInfo,
                                mothersName: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Occupation</label>
                          <input
                            type="text"
                            value={editFormData.volunteerInfo.occupation || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              volunteerInfo: {
                                ...editFormData.volunteerInfo,
                                occupation: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Designation</label>
                          <input
                            type="text"
                            value={editFormData.volunteerInfo.designation || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              volunteerInfo: {
                                ...editFormData.volunteerInfo,
                                designation: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.formType === 'vendor' && editFormData.vendorInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg">Vendor Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Business Name</label>
                          <input
                            type="text"
                            value={editFormData.vendorInfo.businessName || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              vendorInfo: {
                                ...editFormData.vendorInfo,
                                businessName: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">GST Number</label>
                          <input
                            type="text"
                            value={editFormData.vendorInfo.gstNumber || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              vendorInfo: {
                                ...editFormData.vendorInfo,
                                gstNumber: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Business Address</label>
                          <input
                            type="text"
                            value={editFormData.vendorInfo.businessAddress || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              vendorInfo: {
                                ...editFormData.vendorInfo,
                                businessAddress: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.formType === 'beneficiary' && editFormData.beneficiaryInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 text-lg">Beneficiary Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Category</label>
                          <input
                            type="text"
                            value={editFormData.beneficiaryInfo.category || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              beneficiaryInfo: {
                                ...editFormData.beneficiaryInfo,
                                category: e.target.value
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Required Amount</label>
                          <input
                            type="number"
                            value={editFormData.beneficiaryInfo.requiredAmount || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              beneficiaryInfo: {
                                ...editFormData.beneficiaryInfo,
                                requiredAmount: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Reason</label>
                          <textarea
                            value={editFormData.beneficiaryInfo.reason || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              beneficiaryInfo: {
                                ...editFormData.beneficiaryInfo,
                                reason: e.target.value
                              }
                            })}
                            rows="3"
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm md:text-base rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                    >
                      Update Submission
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedSubmission(null);
                        setEditFormData({});
                      }}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm md:text-base rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


