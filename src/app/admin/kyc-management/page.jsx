"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminService } from "@/services/adminService";
import { BiSearch, BiUser, BiCheck, BiX, BiEnvelope, BiPhone, BiCalendar, BiFile, BiDownload } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function KYCManagementPage() {
  const { canRender, isLoading: authLoading } = useAdminAuth();
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, verified
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState({});

  useEffect(() => {
    if (canRender) {
      loadKYCSubmissions();
    }
  }, [canRender, statusFilter, roleFilter]);

  const loadKYCSubmissions = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      const response = await adminService.getAllKYCSubmissions(params);
      setKycSubmissions(response.data || []);
    } catch (error) {
      console.error("Failed to load KYC submissions:", error);
      toast.error("Failed to load KYC submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await adminService.getKYCDetails(userId);
      setSelectedSubmission(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to load KYC details");
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm("Are you sure you want to approve this KYC verification?")) {
      return;
    }

    try {
      setProcessingAction({ ...processingAction, [userId]: "approving" });
      await adminService.approveKYC(userId);
      toast.success("KYC verification approved successfully!");
      setShowModal(false);
      setSelectedSubmission(null);
      loadKYCSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve KYC");
    } finally {
      setProcessingAction({ ...processingAction, [userId]: false });
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingAction({ ...processingAction, [userId]: "rejecting" });
      await adminService.rejectKYC(userId, rejectionReason);
      toast.success("KYC verification rejected");
      setShowModal(false);
      setSelectedSubmission(null);
      setRejectionReason("");
      loadKYCSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject KYC");
    } finally {
      setProcessingAction({ ...processingAction, [userId]: false });
    }
  };

  const filteredSubmissions = kycSubmissions.filter(submission => 
    submission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.phone?.includes(searchTerm)
  );

  if (authLoading || !canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            KYC Management
          </h1>
          <nav className="text-xs text-gray-500">
            <ol className="flex space-x-2 items-center">
              <li><a href="/admin" className="hover:underline text-gray-600 font-medium">Home</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700 font-semibold">KYC Management</li>
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              <option value="donor">Donor</option>
              <option value="volunteer">Volunteer</option>
              <option value="partner">Partner</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* KYC Submissions Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading KYC submissions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">User Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">KYC Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Documents</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, idx) => (
                    <tr
                      key={submission._id}
                      className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {submission.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{submission.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <BiEnvelope size={12} />
                              {submission.email}
                            </div>
                            {submission.phone && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <BiPhone size={12} />
                                {submission.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                          {submission.role?.charAt(0).toUpperCase() + submission.role?.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                            submission.kyc?.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {submission.kyc?.isVerified ? "✓ Verified" : "⚠ Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BiFile size={16} className="text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {submission.kyc?.documents?.length || 0} docs
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <BiCalendar size={14} />
                          {submission.kyc?.submittedAt
                            ? new Date(submission.kyc.submittedAt).toLocaleDateString()
                            : submission.createdAt
                            ? new Date(submission.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(submission._id)}
                            className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1"
                          >
                            <FiEye size={14} />
                            View
                          </button>
                          {!submission.kyc?.isVerified && (
                            <>
                              <button
                                onClick={() => handleApprove(submission._id)}
                                disabled={processingAction[submission._id]}
                                className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                <BiCheck size={14} />
                                {processingAction[submission._id] === "approving" ? "..." : "Approve"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubmissions.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📄</div>
                        No KYC submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* KYC Details Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BiUser size={28} />
                KYC Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSubmission(null);
                  setRejectionReason("");
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <BiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Name</label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-900 font-medium">{selectedSubmission.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Role</label>
                    <p className="text-gray-900 font-medium">
                      {selectedSubmission.role?.charAt(0).toUpperCase() + selectedSubmission.role?.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">KYC Status</label>
                    <p className="text-gray-900 font-medium">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          selectedSubmission.kyc?.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedSubmission.kyc?.isVerified ? "✓ Verified" : "⚠ Pending"}
                      </span>
                    </p>
                  </div>
                  {selectedSubmission.kyc?.submittedAt && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Submitted At</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedSubmission.kyc.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              {selectedSubmission.address && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmission.address.street && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Street</label>
                        <p className="text-gray-900">{selectedSubmission.address.street}</p>
                      </div>
                    )}
                    {selectedSubmission.address.city && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">City</label>
                        <p className="text-gray-900">{selectedSubmission.address.city}</p>
                      </div>
                    )}
                    {selectedSubmission.address.state && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">State</label>
                        <p className="text-gray-900">{selectedSubmission.address.state}</p>
                      </div>
                    )}
                    {selectedSubmission.address.pincode && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Pincode</label>
                        <p className="text-gray-900">{selectedSubmission.address.pincode}</p>
                      </div>
                    )}
                  </div>
                  {selectedSubmission.kyc?.addressProof && (
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">Address Proof</label>
                      <a
                        href={selectedSubmission.kyc.addressProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <BiDownload size={16} />
                        View Address Proof
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Photo */}
              {selectedSubmission.kyc?.photo && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Photograph</h3>
                  <img
                    src={selectedSubmission.kyc.photo}
                    alt="User photo"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Documents */}
              {selectedSubmission.kyc?.documents && selectedSubmission.kyc.documents.length > 0 && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Identity Documents</h3>
                  <div className="space-y-4">
                    {selectedSubmission.kyc.documents.map((doc, idx) => (
                      <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {doc.type?.replace("_", " ")}
                            </h4>
                            {doc.number && (
                              <p className="text-sm text-gray-600">Number: {doc.number}</p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              doc.verified
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {doc.verified ? "✓ Verified" : "⚠ Pending"}
                          </span>
                        </div>
                        {doc.file && (
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <BiDownload size={14} />
                            View Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role-specific Data - Based on User Role */}
              {selectedSubmission.kyc?.roleSpecificData && (() => {
                const roleData = selectedSubmission.kyc.roleSpecificData;
                const userRole = selectedSubmission.role?.toLowerCase();
                const isDoctor = userRole === 'partner' && (selectedSubmission.email?.includes('doctor') || selectedSubmission.email?.includes('dr') || selectedSubmission.email?.includes('medical'));
                const isPathology = selectedSubmission.email?.includes('pathology') || selectedSubmission.email?.includes('lab');
                const isVolunteer = userRole === 'volunteer';
                const isPartner = userRole === 'partner' || userRole === 'vendor';
                const isFoodPartner = userRole === 'partner' && (selectedSubmission.email?.includes('food') || selectedSubmission.email?.includes('restaurant'));

                return (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {isDoctor || selectedSubmission.email?.includes('doctor') || selectedSubmission.email?.includes('psychology') ? '👨‍⚕️ Doctor/Medical Professional Information' :
                       isPathology ? '🔬 Pathology Lab Information' :
                       isVolunteer ? '❤️ Volunteer Information' :
                       isPartner || isFoodPartner ? '🏢 Business/Partner Information' :
                       '📋 Professional Information'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Doctor/Medical Fields */}
                      {(isDoctor || selectedSubmission.email?.includes('doctor') || selectedSubmission.email?.includes('psychology')) && (
                        <>
                          {roleData.qualification && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Qualification</label>
                              <p className="text-gray-900">{roleData.qualification}</p>
                            </div>
                          )}
                          {roleData.specialization && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Specialization</label>
                              <p className="text-gray-900">{roleData.specialization}</p>
                            </div>
                          )}
                          {roleData.registrationNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Registration Number</label>
                              <p className="text-gray-900">{roleData.registrationNumber}</p>
                            </div>
                          )}
                          {roleData.fees && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Consultation Fees</label>
                              <p className="text-gray-900">{roleData.fees}</p>
                            </div>
                          )}
                          {roleData.location && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Clinic/Hospital Location</label>
                              <p className="text-gray-900">{roleData.location}</p>
                            </div>
                          )}
                          {roleData.experience && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Experience</label>
                              <p className="text-gray-900">{roleData.experience}</p>
                            </div>
                          )}
                          {roleData.organization && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Organization/Institution</label>
                              <p className="text-gray-900">{roleData.organization}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Pathology Lab Fields */}
                      {isPathology && (
                        <>
                          {roleData.labName && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Lab Name</label>
                              <p className="text-gray-900">{roleData.labName}</p>
                            </div>
                          )}
                          {roleData.labRegistration && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Lab Registration Number</label>
                              <p className="text-gray-900">{roleData.labRegistration}</p>
                            </div>
                          )}
                          {roleData.gstNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">GST Number</label>
                              <p className="text-gray-900">{roleData.gstNumber}</p>
                            </div>
                          )}
                          {roleData.location && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Lab Address</label>
                              <p className="text-gray-900">{roleData.location}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Volunteer Fields */}
                      {isVolunteer && (
                        <>
                          {roleData.qualification && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Qualification</label>
                              <p className="text-gray-900">{roleData.qualification}</p>
                            </div>
                          )}
                          {roleData.specialization && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Specialization/Area of Interest</label>
                              <p className="text-gray-900">{roleData.specialization}</p>
                            </div>
                          )}
                          {roleData.registrationNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Registration/Certificate Number</label>
                              <p className="text-gray-900">{roleData.registrationNumber}</p>
                            </div>
                          )}
                          {roleData.experience && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Professional Experience</label>
                              <p className="text-gray-900">{roleData.experience}</p>
                            </div>
                          )}
                          {roleData.organization && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Current Organization/Institution</label>
                              <p className="text-gray-900">{roleData.organization}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Partner/Vendor/Food Fields */}
                      {(isPartner || isFoodPartner) && (
                        <>
                          {roleData.businessName && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Business/Partner Name</label>
                              <p className="text-gray-900 font-medium">{roleData.businessName}</p>
                            </div>
                          )}
                          {roleData.businessType && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Business Type</label>
                              <p className="text-gray-900">{roleData.businessType}</p>
                            </div>
                          )}
                          {roleData.licenseNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">License Number</label>
                              <p className="text-gray-900">{roleData.licenseNumber}</p>
                            </div>
                          )}
                          {roleData.gstNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">GST Number</label>
                              <p className="text-gray-900">{roleData.gstNumber || "N/A"}</p>
                            </div>
                          )}
                          {roleData.experience && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Business Experience</label>
                              <p className="text-gray-900">{roleData.experience}</p>
                            </div>
                          )}
                          {roleData.location && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Business Address/Location</label>
                              <p className="text-gray-900">{roleData.location}</p>
                            </div>
                          )}
                          {(roleData.qualification || roleData.specialization || roleData.registrationNumber) && (
                            <>
                              {roleData.qualification && (
                                <div>
                                  <label className="text-sm font-semibold text-gray-600">Qualification</label>
                                  <p className="text-gray-900">{roleData.qualification}</p>
                                </div>
                              )}
                              {roleData.specialization && (
                                <div>
                                  <label className="text-sm font-semibold text-gray-600">Specialization</label>
                                  <p className="text-gray-900">{roleData.specialization}</p>
                                </div>
                              )}
                              {roleData.registrationNumber && (
                                <div>
                                  <label className="text-sm font-semibold text-gray-600">Registration Number</label>
                                  <p className="text-gray-900">{roleData.registrationNumber}</p>
                                </div>
                              )}
                            </>
                          )}
                          {roleData.organization && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Organization</label>
                              <p className="text-gray-900">{roleData.organization}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Default/Common Fields (if role doesn't match above) */}
                      {!isDoctor && !isPathology && !isVolunteer && !isPartner && !isFoodPartner && (
                        <>
                          {roleData.qualification && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Qualification</label>
                              <p className="text-gray-900">{roleData.qualification}</p>
                            </div>
                          )}
                          {roleData.specialization && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Specialization</label>
                              <p className="text-gray-900">{roleData.specialization}</p>
                            </div>
                          )}
                          {roleData.registrationNumber && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Registration Number</label>
                              <p className="text-gray-900">{roleData.registrationNumber}</p>
                            </div>
                          )}
                          {roleData.experience && (
                            <div>
                              <label className="text-sm font-semibold text-gray-600">Experience</label>
                              <p className="text-gray-900">{roleData.experience}</p>
                            </div>
                          )}
                          {roleData.organization && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-semibold text-gray-600">Organization</label>
                              <p className="text-gray-900">{roleData.organization}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            {!selectedSubmission.kyc?.isVerified && (
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl flex flex-col gap-4 border-t-2 border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedSubmission(null);
                      setRejectionReason("");
                    }}
                    className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSubmission._id)}
                    disabled={processingAction[selectedSubmission._id]}
                    className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <BiCheck size={20} />
                    {processingAction[selectedSubmission._id] === "approving" ? "Approving..." : "Approve KYC"}
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission._id)}
                    disabled={processingAction[selectedSubmission._id] || !rejectionReason.trim()}
                    className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <BiX size={20} />
                    {processingAction[selectedSubmission._id] === "rejecting" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            )}
            {selectedSubmission.kyc?.isVerified && (
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl flex justify-end border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSubmission(null);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

