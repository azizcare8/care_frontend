"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash } from "react-icons/bi";
import { FiMail, FiPhone } from "react-icons/fi";
import Image from "next/image";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function OurVolunteersTable() {
  const { users, isLoading, getUsers, deleteUser } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        await getUsers({ role: 'volunteer', isActive: true, limit: 100 });
      } catch (error) {
        console.error("Failed to load volunteers:", error);
        toast.error("Failed to load volunteers");
      }
    };
    fetchVolunteers();
  }, [getUsers]);

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setEditFormData({
      name: volunteer.name || "",
      email: volunteer.email || "",
      phone: volunteer.phone || "",
      role: volunteer.role || "volunteer"
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { adminService } = await import("@/services/adminService");
      await adminService.updateUserStatus(editingVolunteer._id, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone
      });
      
      if (editFormData.role !== editingVolunteer.role) {
        await adminService.assignRole(editingVolunteer._id, editFormData.role);
      }
      
      toast.success("Volunteer updated successfully!");
      setShowEditModal(false);
      setEditingVolunteer(null);
      getUsers({ role: 'volunteer', isActive: true, limit: 100 });
    } catch (error) {
      console.error("Failed to update volunteer:", error);
      toast.error(error.response?.data?.message || "Failed to update volunteer");
    }
  };

  const handleDelete = async (userId) => {
    if (confirm("Are you sure you want to remove this volunteer?")) {
      try {
        await deleteUser(userId);
        toast.success("Volunteer removed successfully");
        getUsers({ role: 'volunteer', isActive: true, limit: 100 });
      } catch (error) {
        console.error("Failed to delete volunteer:", error);
        toast.error(error.response?.data?.message || "Failed to remove volunteer");
      }
    }
  };

  const filteredVolunteers = users.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredVolunteers.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Our Volunteer's</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Our Volunteer's Data</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <option value={10} className="text-gray-900">10</option>
              <option value={25} className="text-gray-900">25</option>
            </select>
            <span className="text-sm text-green-600 font-medium">entries per page</span>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900"/>
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading volunteers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">#</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Volunteer Details</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Contact Information</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Role & Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Joined Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((vol, idx) => (
                    <tr key={vol._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-600">
                        {indexOfFirstEntry + idx + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {vol.name?.charAt(0).toUpperCase() || 'V'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{vol.name}</div>
                            <div className="text-xs text-gray-500">ID: {vol._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FiMail size={14} />
                            {vol.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiPhone size={14} />
                            {vol.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-white w-fit">
                            {vol.role}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-green-600 text-white w-fit">
                            ● Active
                          </span>
                          {vol.isVerified && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 text-white w-fit">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {new Date(vol.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(vol)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                          >
                            <BiEdit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(vol._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
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
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">🤝</div>
                      {isLoading ? 'Loading volunteers...' : 'No volunteers found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Volunteer</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVolunteer(null);
                }}
                className="text-white hover:text-gray-200 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="donor">Donor</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="partner">Partner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Update Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVolunteer(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg font-semibold"
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



