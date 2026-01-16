"use client";
import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function DonationDataTable() {
  const { donations, isLoading, getDonations } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        await getDonations({ limit: 100 });
      } catch (error) {
        console.error("Failed to load donations:", error);
        toast.error("Failed to load donations");
      }
    };

    fetchDonations();
  }, [getDonations]);

  // Filter donations based on search
  const filteredDonations = donations.filter(donation =>
    (donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donation.donor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donation.donorDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donation.donorDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     donation.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredDonations.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredDonations.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Donation Received Data</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li>
              <a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600 font-medium">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href="/admin/donations" className="hover:underline text-gray-600 hover:text-blue-600 font-medium">
                Donation Data
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">All Donation Transactions</li>
          </ol>
        </nav>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
          Donation Data Table
        </h2>

        {/* Table Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Entries per page */}
          <div className="flex items-center gap-2">
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries per page</span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900"
            />
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading donations...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border-2 border-gray-200" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Name Of Donor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Donor Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Donor Mobile No.
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Donation For
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Donation Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Amount Donated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((donation, index) => (
                      <tr
                        key={donation._id}
                        className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {donation.isAnonymous ? 'Anonymous' : (donation.donor?.name || donation.donorDetails?.name || 'N/A')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {donation.isAnonymous ? 'Hidden' : (donation.donor?.email || donation.donorDetails?.email || 'N/A')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {donation.isAnonymous ? 'Hidden' : (donation.donorDetails?.phone || 'N/A')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {donation.campaign?.title || 'General Donation'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          ₹{donation.amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 uppercase font-medium">
                          {donation.paymentMethod || donation.paymentDetails?.gateway || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            donation.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                            donation.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                            donation.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        {isLoading ? 'Loading donations...' : 'No donations found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredDonations.length)} of {filteredDonations.length} entries
              </div>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 1 && (
                  <button
                    onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}



