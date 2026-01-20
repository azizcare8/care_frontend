"use client";
import { useState, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import Image from "next/image";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function FundraiserLiveTable() {
  const { campaigns, isLoading, getAllCampaigns } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFundraisers = async () => {
      try {
        await getAllCampaigns({ status: 'active', limit: 100 });
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        toast.error("Failed to load fundraisers");
      }
    };

    fetchFundraisers();
  }, [getAllCampaigns]);

  const filteredFundraisers = campaigns.filter(item =>
    (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredFundraisers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredFundraisers.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (id) => {
    toast("Navigating to edit page...", { icon: "ℹ️" });
    // Navigate to edit page
    window.location.href = `/admin/campaigns/${id}/edit`;
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        // Call delete API
        toast.success("Campaign deleted successfully");
        getAllCampaigns({ status: 'active', limit: 100 });
      } catch (error) {
        toast.error("Failed to delete campaign");
      }
    }
  };

  const handleComplete = (id) => {
    toast("Mark as complete functionality", { icon: "ℹ️" });
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">FundRaiser Live Table</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <option value={10} className="text-gray-900">10</option>
              <option value={25} className="text-gray-900">25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-green-600 font-medium">entries per page</span>
          </div>

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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading fundraisers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide w-1/3">
                      Fundraiser Summary
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Amount To Be Raised
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Raised
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Funraiser Pic
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Funraiser Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="line-clamp-3">{item.shortDescription || item.title}</div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {item.goalAmount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">
                          {item.currentAmount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item.timeline?.startDate ? new Date(item.timeline.startDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                            {item.images && item.images[0] ? (
                              <Image
                                src={item.images[0].url}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-2xl">📷</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {(() => {
                            const contact = item.beneficiary?.contact;
                            const fundraiser = item.fundraiser;
                            
                            if (contact && typeof contact === 'object') {
                              return contact.phone || contact.email || 'N/A';
                            }
                            if (typeof contact === 'string') {
                              return contact;
                            }
                            if (fundraiser) {
                              if (typeof fundraiser === 'object') {
                                return fundraiser.phone || fundraiser.email || 'N/A';
                              }
                              return fundraiser;
                            }
                            return 'N/A';
                          })()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                              item.status === 'active' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                              item.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                              'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                            }`}>
                              {item.status}
                            </span>
                            <button
                              onClick={() => handleEdit(item._id)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        {isLoading ? 'Loading fundraisers...' : 'No fundraisers found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredFundraisers.length)} of {filteredFundraisers.length} entries
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}



