"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiUser, BiShield, BiX, BiCalendar, BiMap, BiPhone, BiEnvelope } from "react-icons/bi";
import { FiMail, FiPhone, FiEye } from "react-icons/fi";
import useAdminStore from "@/store/adminStore";
import { adminService } from "@/services/adminService";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function UsersListTable() {
  const { users, isLoading, getUsers, updateUserStatus } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [assigningRole, setAssigningRole] = useState({});
  const [sendingKYCEmail, setSendingKYCEmail] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' or 'error'
  const [emailMessage, setEmailMessage] = useState("");
  const [emailUserEmail, setEmailUserEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await getUsers({ limit: 100 });
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, [getUsers]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, { 
        isActive: newStatus === 'active',
        status: newStatus 
      });
      toast.success("User status updated successfully");
      getUsers({ limit: 100 });
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      setAssigningRole({ ...assigningRole, [userId]: true });
      await adminService.assignRole(userId, newRole);
      toast.success(`Role assigned: ${newRole}`);
      getUsers({ limit: 100 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign role");
    } finally {
      setAssigningRole({ ...assigningRole, [userId]: false });
    }
  };

  const handleSendKYCEmail = async (userId) => {
    try {
      setSendingKYCEmail({ ...sendingKYCEmail, [userId]: true });
      const user = users.find(u => u._id === userId);
      const userEmail = user?.email || 'user';
      
      await adminService.sendKYCVerificationEmail(userId);
      
      // Show success modal
      setEmailStatus('success');
      setEmailMessage(`KYC verification email has been sent successfully to ${userEmail}. The user will receive instructions to complete their KYC verification.`);
      setEmailUserEmail(userEmail);
      setShowEmailModal(true);
      
      console.log("✅ KYC Email sent successfully");
    } catch (error) {
      console.error("❌ Error sending KYC email:", error);
      
      // Extract error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.response?.data?.error ||
                          "An unexpected error occurred while sending the email.";
      
      const user = users.find(u => u._id === userId);
      const userEmail = user?.email || 'user';
      
      // Show error modal
      setEmailStatus('error');
      setEmailMessage(`Failed to send KYC verification email to ${userEmail}. Error: ${errorMessage}`);
      setEmailUserEmail(userEmail);
      setShowEmailModal(true);
    } finally {
      setSendingKYCEmail({ ...sendingKYCEmail, [userId]: false });
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setLoadingUserDetails(true);
      setSelectedUser(userId);
      
      // Fetch full user details
      const response = await api.get(`/admin/users/${userId}`);
      setUserDetails(response.data.data || response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Failed to load user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserDetails(null);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailStatus(null);
    setEmailMessage("");
    setEmailUserEmail("");
  };

  const validRoles = ['donor', 'fundraiser', 'admin', 'partner', 'volunteer', 'vendor', 'staff'];

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">User's Data</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 font-medium">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/admin/users" className="hover:underline text-gray-600 font-medium">User's Data</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">All Website User's Data</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
            <BiUser className="text-green-600" size={28} />
            Website Users ({users.length})
          </h2>
          <div className="flex items-center gap-3">
            <select 
              value={entriesPerPage} 
              onChange={(e) => setEntriesPerPage(Number(e.target.value))} 
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:shadow-md"
            >
              <option value={10} className="text-gray-900">10</option>
              <option value={25} className="text-gray-900">25</option>
              <option value={50} className="text-gray-900">50</option>
            </select>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="border-2 border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900"
              />
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 border-b-2 border-gray-300">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">User Details</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Verification</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(user => 
                  user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.phone?.includes(searchTerm)
                ).slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((user, idx) => (
                  <tr key={user._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            <FiMail size={12} />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FiPhone size={12} />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || 'donor'}
                        onChange={(e) => handleAssignRole(user._id, e.target.value)}
                        disabled={assigningRole[user._id]}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-all ${
                          user.role === 'admin' ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300' :
                          user.role === 'fundraiser' ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300' :
                          user.role === 'volunteer' ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-300' :
                          user.role === 'partner' ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                        } ${assigningRole[user._id] ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                      >
                        {validRoles.map((role) => (
                          <option key={role} value={role} className="bg-white text-gray-900">
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center ${
                          user.isVerified ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                        }`}>
                          {user.isVerified ? '✓ Verified' : '⚠ Pending'}
                        </span>
                        {user.kyc?.isCompleted && (
                          <span className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                            KYC Done
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center ${
                        user.isActive ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                      }`}>
                        {user.isActive ? '● Active' : '● Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* KYC Mail Button - First Action */}
                        <button
                          onClick={() => handleSendKYCEmail(user._id)}
                          disabled={sendingKYCEmail[user._id]}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed h-[28px] min-w-[90px]"
                          title="Send KYC verification email"
                        >
                          {sendingKYCEmail[user._id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <FiMail size={12} />
                              <span>KYC Mail</span>
                            </>
                          )}
                        </button>
                        {user.isActive ? (
                          <button 
                            onClick={() => handleStatusChange(user._id, 'blocked')}
                            className="flex items-center justify-center px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                          >
                            Block
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(user._id, 'active')}
                            className="flex items-center justify-center px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewUser(user._id)}
                          className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                        >
                          <FiEye size={14} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, users.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm)
              ).length)} of {users.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm)
              ).length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(users.filter(user => 
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm)
              ).length / entriesPerPage) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(users.filter(user => 
                  user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.phone?.includes(searchTerm)
                ).length / entriesPerPage)}
                className="px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BiUser size={28} />
                User Details
              </h2>
              <button
                onClick={closeUserModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <BiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            {loadingUserDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading user details...</p>
              </div>
            ) : userDetails ? (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BiUser className="text-green-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{userDetails.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <BiEnvelope size={16} />
                        {userDetails.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <BiPhone size={16} />
                        {userDetails.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Role</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          userDetails.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          userDetails.role === 'fundraiser' ? 'bg-blue-100 text-blue-700' :
                          userDetails.role === 'volunteer' ? 'bg-green-100 text-green-700' :
                          userDetails.role === 'partner' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {userDetails.role?.charAt(0).toUpperCase() + userDetails.role?.slice(1) || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          userDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {userDetails.isActive ? '● Active' : '● Blocked'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Verification</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          userDetails.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {userDetails.isVerified ? '✓ Verified' : '⚠ Pending'}
                        </span>
                      </p>
                    </div>
                    {userDetails.referralCode && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Referral Code</label>
                        <p className="text-gray-900 font-medium font-mono">{userDetails.referralCode}</p>
                      </div>
                    )}
                    {userDetails.createdAt && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Joined Date</label>
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <BiCalendar size={16} />
                          {new Date(userDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {userDetails.address && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BiMap className="text-blue-600" />
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userDetails.address.street && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Street</label>
                          <p className="text-gray-900">{userDetails.address.street}</p>
                        </div>
                      )}
                      {userDetails.address.city && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">City</label>
                          <p className="text-gray-900">{userDetails.address.city}</p>
                        </div>
                      )}
                      {userDetails.address.state && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">State</label>
                          <p className="text-gray-900">{userDetails.address.state}</p>
                        </div>
                      )}
                      {userDetails.address.pincode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Pincode</label>
                          <p className="text-gray-900">{userDetails.address.pincode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KYC Information */}
                {userDetails.kyc && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BiShield className="text-purple-600" />
                      KYC Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">KYC Status</label>
                        <p className="text-gray-900">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            userDetails.kyc.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {userDetails.kyc.isCompleted ? '✓ Completed' : '⚠ Pending'}
                          </span>
                        </p>
                      </div>
                      {userDetails.kyc.documents && userDetails.kyc.documents.length > 0 && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Documents</label>
                          <div className="mt-2 space-y-2">
                            {userDetails.kyc.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{doc.type}:</span>
                                <span className={doc.verified ? 'text-green-600' : 'text-yellow-600'}>
                                  {doc.verified ? '✓ Verified' : '⚠ Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Permissions (if admin/staff) */}
                {userDetails.permissions && (userDetails.role === 'admin' || userDetails.role === 'staff' || userDetails.role === 'volunteer') && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BiShield className="text-indigo-600" />
                      Permissions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(userDetails.permissions).map(([resource, actions]) => (
                        <div key={resource} className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">{resource}</h4>
                          <div className="space-y-1">
                            {Object.entries(actions).map(([action, allowed]) => (
                              <div key={action} className="flex items-center gap-2 text-xs">
                                <span className={allowed ? 'text-green-600' : 'text-gray-400'}>
                                  {allowed ? '✓' : '✗'}
                                </span>
                                <span className="text-gray-600 capitalize">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteer Details */}
                {userDetails.volunteerDetails && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userDetails.volunteerDetails.fathersName && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Father's Name</label>
                          <p className="text-gray-900">{userDetails.volunteerDetails.fathersName}</p>
                        </div>
                      )}
                      {userDetails.volunteerDetails.mothersName && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Mother's Name</label>
                          <p className="text-gray-900">{userDetails.volunteerDetails.mothersName}</p>
                        </div>
                      )}
                      {userDetails.volunteerDetails.occupation && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Occupation</label>
                          <p className="text-gray-900">{userDetails.volunteerDetails.occupation}</p>
                        </div>
                      )}
                      {userDetails.volunteerDetails.academicQualification && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Academic Qualification</label>
                          <p className="text-gray-900">{userDetails.volunteerDetails.academicQualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Referral Stats */}
                {userDetails.referralStats && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Referral Statistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{userDetails.referralStats.totalReferrals || 0}</p>
                        <p className="text-sm text-gray-600">Total Referrals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">₹{userDetails.referralStats.totalReferralDonations?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-600">Referral Donations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">₹{userDetails.referralStats.referralRewards?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-600">Rewards</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600">No user details available</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex justify-end gap-3 border-t-2 border-gray-200">
              <button
                onClick={closeUserModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Status Modal - Top Right Popup */}
      {showEmailModal && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-80 border-2 border-green-500">
            {/* Modal Header */}
            <div className={`p-4 rounded-t-lg ${
              emailStatus === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            } text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {emailStatus === 'success' ? (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <h2 className="text-base font-bold">
                    {emailStatus === 'success' ? 'Email Sent!' : 'Email Failed'}
                  </h2>
                </div>
                <button
                  onClick={closeEmailModal}
                  className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  <BiX size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {emailStatus === 'success' 
                  ? `KYC email sent to ${emailUserEmail}` 
                  : `Failed: ${emailMessage.split('Error:')[1] || emailMessage}`}
              </p>

              {emailStatus === 'success' && emailUserEmail && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-green-600 flex-shrink-0" size={14} />
                    <p className="text-xs text-green-700 truncate">{emailUserEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={closeEmailModal}
                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                  emailStatus === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



