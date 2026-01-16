"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiCheck, BiX, BiUser, BiCalendar, BiMap, BiPhone, BiEnvelope, BiShield, BiIdCard } from "react-icons/bi";
import { FiMail, FiPhone, FiCalendar } from "react-icons/fi";
import Image from "next/image";
import useAdminStore from "@/store/adminStore";
import { adminService } from "@/services/adminService";
import api, { getBackendBaseUrl } from "@/utils/api";
import toast from "react-hot-toast";
import VolunteerIDCard from "@/components/VolunteerIDCard";

export default function VolunteerRequestTable() {
  const { users, isLoading, getUsers, updateUserStatus } = useAdminStore();
  const backendBaseUrl = getBackendBaseUrl();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [assigningRole, setAssigningRole] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [loadingVolunteerDetails, setLoadingVolunteerDetails] = useState(false);
  const [selectedVolunteerForCard, setSelectedVolunteerForCard] = useState(null);
  const [volunteerCardData, setVolunteerCardData] = useState(null);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        // Fetch users with volunteer role - don't filter by isActive to show all requests
        await getUsers({ role: 'volunteer', limit: 1000 });
      } catch (error) {
        console.error("Failed to load volunteers:", error);
        
        // Extract meaningful error message
        let errorMessage = "Failed to load volunteers";
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.isNetworkError) {
          errorMessage = "Network error: Unable to connect to server";
        } else if (error?.isAuthError) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (typeof error === 'object' && Object.keys(error).length > 0) {
          errorMessage = error.message || error.error || "Failed to load volunteers";
        }
        
        console.error("Error details:", {
          message: errorMessage,
          error: error,
          type: typeof error,
          keys: error ? Object.keys(error) : []
        });
        
        toast.error(errorMessage);
      }
    };
    fetchVolunteers();
  }, [getUsers]);

  const handleApprove = async (userId) => {
    try {
      await updateUserStatus(userId, { isActive: true, status: 'approved' });
      toast.success("Volunteer approved!");
      getUsers({ role: 'volunteer', limit: 1000 });
    } catch (error) {
      toast.error("Failed to approve volunteer");
    }
  };

  const handleReject = async (userId) => {
    try {
      await updateUserStatus(userId, { isActive: false, status: 'rejected' });
      toast.success("Volunteer rejected");
      getUsers({ role: 'volunteer', limit: 1000 });
    } catch (error) {
      toast.error("Failed to reject volunteer");
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      setAssigningRole({ ...assigningRole, [userId]: true });
      await adminService.assignRole(userId, newRole);
      toast.success(`Role assigned: ${newRole}`);
      getUsers({ role: 'volunteer', limit: 1000 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign role");
    } finally {
      setAssigningRole({ ...assigningRole, [userId]: false });
    }
  };

  const validRoles = ['volunteer', 'donor', 'fundraiser', 'partner', 'vendor', 'admin'];

  const filteredRequests = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredRequests.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleActivate = (id) => {
    console.log("Activate:", id);
  };

  const handleBlock = (id) => {
    console.log("Block:", id);
  };

  const handleViewVolunteer = async (volunteerId) => {
    try {
      setLoadingVolunteerDetails(true);
      setSelectedVolunteer(volunteerId);
      
      // Fetch full volunteer details
      const response = await api.get(`/admin/users/${volunteerId}`);
      setVolunteerDetails(response.data.data || response.data);
      setShowVolunteerModal(true);
    } catch (error) {
      console.error("Failed to load volunteer details:", error);
      toast.error("Failed to load volunteer details");
    } finally {
      setLoadingVolunteerDetails(false);
    }
  };

  const closeVolunteerModal = () => {
    setShowVolunteerModal(false);
    setSelectedVolunteer(null);
    setVolunteerDetails(null);
  };

  const handleViewIDCard = async (volunteerId) => {
    try {
      setLoadingCard(true);
      setSelectedVolunteerForCard(volunteerId);
      
      // Fetch volunteer details
      const volunteerResponse = await api.get(`/admin/users/${volunteerId}`);
      const volunteer = volunteerResponse.data.data || volunteerResponse.data;
      
      // Check if volunteer has an ID card
      try {
        const cardResponse = await api.get(`/volunteer-cards`);
        const allCards = cardResponse.data.data || [];
        const volunteerCard = allCards.find(card => 
          (card.volunteer?._id || card.volunteer)?.toString() === volunteerId.toString()
        );
        
        if (volunteerCard) {
          // Use existing card data
          setVolunteerCardData({
            ...volunteerCard,
            volunteer: volunteer,
            name: volunteer.name,
            photo: volunteerCard.photo,
            mobile: volunteer.phone,
            email: volunteer.email
          });
        } else {
          // Create demo card data from volunteer info
          setVolunteerCardData({
            _id: volunteer._id,
            volunteer: volunteer,
            name: volunteer.name,
            email: volunteer.email,
            mobile: volunteer.phone,
            role: volunteer.role || 'volunteer',
            category: volunteer.volunteerDetails?.preferredRole?.[0] || 'Volunteer CFT',
            photo: volunteer.avatar ? {
              url: volunteer.avatar.startsWith('http') ? volunteer.avatar : `${backendBaseUrl}${volunteer.avatar}`,
              publicId: null
            } : '/default-avatar.png',
            cardNumber: `CFT-DEMO-${volunteer._id.slice(-8)}`,
            issuedAt: volunteer.createdAt,
            validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            gender: volunteer.volunteerDetails?.gender || volunteer.gender,
            bloodGroup: volunteer.volunteerDetails?.bloodGroup || volunteer.bloodGroup,
            nationality: volunteer.volunteerDetails?.nationality || 'Indian',
            address: volunteer.address ? 
              (typeof volunteer.address === 'string' ? volunteer.address : 
               `${volunteer.address.street || ''}, ${volunteer.address.city || ''}, ${volunteer.address.state || ''}`) :
              volunteer.volunteerDetails?.communicationAddress || 'N/A'
          });
        }
      } catch (cardError) {
        // If no card exists, create demo data
        setVolunteerCardData({
          _id: volunteer._id,
          volunteer: volunteer,
          name: volunteer.name,
          email: volunteer.email,
          mobile: volunteer.phone,
          role: volunteer.role || 'volunteer',
          category: 'Volunteer CFT',
          photo: volunteer.avatar ? {
            url: volunteer.avatar.startsWith('http') ? volunteer.avatar : `${backendBaseUrl}${volunteer.avatar}`,
            publicId: null
          } : '/default-avatar.png',
          cardNumber: `CFT-DEMO-${volunteer._id.slice(-8)}`,
          issuedAt: volunteer.createdAt,
          validityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          gender: volunteer.volunteerDetails?.gender || 'N/A',
          bloodGroup: volunteer.volunteerDetails?.bloodGroup || 'N/A',
          nationality: volunteer.volunteerDetails?.nationality || 'Indian',
          address: volunteer.address ? 
            (typeof volunteer.address === 'string' ? volunteer.address : 
             `${volunteer.address.street || ''}, ${volunteer.address.city || ''}`) :
            volunteer.volunteerDetails?.communicationAddress || 'N/A'
        });
      }
      
      setShowIDCardModal(true);
    } catch (error) {
      console.error("Failed to load volunteer card:", error);
      toast.error("Failed to load volunteer ID card");
    } finally {
      setLoadingCard(false);
    }
  };

  const closeIDCardModal = () => {
    setShowIDCardModal(false);
    setSelectedVolunteerForCard(null);
    setVolunteerCardData(null);
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Volunteer Request Data</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/admin/volunteer-requests" className="hover:underline text-gray-600 hover:text-blue-600">Volunteer Rqst</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Volunteer Request Data</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <option value={10} className="text-gray-900">10</option>
              <option value={25} className="text-gray-900">25</option>
              <option value={50} className="text-gray-900">50</option>
            </select>
            <span className="text-sm text-green-600 font-medium">entries per page</span>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900"/>
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading volunteers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Volunteer Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Joined Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((volunteer, index) => (
                      <tr key={volunteer._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleViewVolunteer(volunteer._id)}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {volunteer.name?.charAt(0).toUpperCase() || 'V'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{volunteer.name}</div>
                              <div className="text-xs text-gray-500">{volunteer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FiPhone size={14} />
                            {volunteer.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-xs mt-1">
                            <FiMail size={12} />
                            {volunteer.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={volunteer.role || 'volunteer'}
                            onChange={(e) => handleAssignRole(volunteer._id, e.target.value)}
                            disabled={assigningRole[volunteer._id]}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-gray-900 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-blue-200"
                          >
                            {validRoles.map((role) => (
                              <option key={role} value={role} className="bg-white text-gray-900">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center ${
                              volunteer.isActive ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                            }`}>
                              {volunteer.isActive ? '● Active' : '● Blocked'}
                            </span>
                            {volunteer.isVerified && (
                              <span className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px] h-[28px] flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <FiCalendar size={14} />
                            {new Date(volunteer.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewIDCard(volunteer._id)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                              title="View ID Card"
                            >
                              <BiIdCard size={14} />
                              ID Card
                            </button>
                            {volunteer.isActive ? (
                              <button 
                                onClick={() => handleReject(volunteer._id)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                              >
                                <BiX size={16} />
                                Block
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApprove(volunteer._id)}
                                className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg min-w-[80px] h-[28px]"
                              >
                                <BiCheck size={16} />
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">🤝</div>
                        {isLoading ? 'Loading volunteers...' : 'No volunteers found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {showVolunteerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BiUser size={28} />
                Volunteer Details
              </h2>
              <button
                onClick={closeVolunteerModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <BiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            {loadingVolunteerDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading volunteer details...</p>
              </div>
            ) : volunteerDetails ? (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BiUser className="text-green-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Volunteer ID</label>
                      <p className="text-gray-900 font-medium font-mono">{volunteerDetails._id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Name</label>
                      <p className="text-gray-900 font-medium">{volunteerDetails.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <BiEnvelope size={16} />
                        {volunteerDetails.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <BiPhone size={16} />
                        {volunteerDetails.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Role</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          volunteerDetails.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          volunteerDetails.role === 'volunteer' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {volunteerDetails.role?.charAt(0).toUpperCase() + volunteerDetails.role?.slice(1) || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          volunteerDetails.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {volunteerDetails.isActive ? '● Active' : '● Blocked'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Verification</label>
                      <p className="text-gray-900 font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          volunteerDetails.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {volunteerDetails.isVerified ? '✓ Verified' : '⚠ Pending'}
                        </span>
                      </p>
                    </div>
                    {volunteerDetails.createdAt && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Joined Date</label>
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <BiCalendar size={16} />
                          {new Date(volunteerDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {volunteerDetails.address && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BiMap className="text-blue-600" />
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {volunteerDetails.address.street && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Street</label>
                          <p className="text-gray-900">{volunteerDetails.address.street}</p>
                        </div>
                      )}
                      {volunteerDetails.address.city && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">City</label>
                          <p className="text-gray-900">{volunteerDetails.address.city}</p>
                        </div>
                      )}
                      {volunteerDetails.address.state && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">State</label>
                          <p className="text-gray-900">{volunteerDetails.address.state}</p>
                        </div>
                      )}
                      {volunteerDetails.address.pincode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Pincode</label>
                          <p className="text-gray-900">{volunteerDetails.address.pincode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Volunteer Details */}
                {volunteerDetails.volunteerDetails && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Specific Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {volunteerDetails.volunteerDetails.fathersName && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Father's Name</label>
                          <p className="text-gray-900">{volunteerDetails.volunteerDetails.fathersName}</p>
                        </div>
                      )}
                      {volunteerDetails.volunteerDetails.mothersName && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Mother's Name</label>
                          <p className="text-gray-900">{volunteerDetails.volunteerDetails.mothersName}</p>
                        </div>
                      )}
                      {volunteerDetails.volunteerDetails.occupation && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Occupation</label>
                          <p className="text-gray-900">{volunteerDetails.volunteerDetails.occupation}</p>
                        </div>
                      )}
                      {volunteerDetails.volunteerDetails.academicQualification && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Academic Qualification</label>
                          <p className="text-gray-900">{volunteerDetails.volunteerDetails.academicQualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KYC Information */}
                {volunteerDetails.kyc && (
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
                            volunteerDetails.kyc.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {volunteerDetails.kyc.isCompleted ? '✓ Completed' : '⚠ Pending'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600">No volunteer details available</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex justify-end gap-3 border-t-2 border-gray-200">
              <button
                onClick={closeVolunteerModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer ID Card Modal */}
      {showIDCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 relative">
            {/* Close Button */}
            <button
              onClick={closeIDCardModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <BiX size={24} className="text-gray-700" />
            </button>

            {/* ID Card Content */}
            <div className="p-6">
              {loadingCard ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  <p className="ml-4 text-gray-600">Loading ID Card...</p>
                </div>
              ) : volunteerCardData ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Volunteer ID Card - {volunteerCardData.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {volunteerCardData.cardNumber?.startsWith('CFT-DEMO') ? 'Demo Preview' : 'Official ID Card'}
                    </p>
                  </div>
                  <VolunteerIDCard 
                    cardData={volunteerCardData} 
                    onPrint={() => window.print()} 
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No ID card data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



