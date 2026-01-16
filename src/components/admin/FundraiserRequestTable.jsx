"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiCheck, BiX } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function FundraiserRequestTable() {
  const { campaigns, isLoading, getAllCampaigns, reviewCampaign } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        await getAllCampaigns({ status: 'pending', limit: 100 });
      } catch (error) {
        console.error("Failed to load fundraiser requests:", error);
        toast.error("Failed to load requests");
      }
    };
    fetchRequests();
  }, [getAllCampaigns]);

  const handleApprove = async (campaignId) => {
    try {
      await reviewCampaign(campaignId, 'approved');
      toast.success("Fundraiser approved successfully!");
      getAllCampaigns({ status: 'pending', limit: 100 });
    } catch (error) {
      toast.error("Failed to approve fundraiser");
    }
  };

  const handleReject = async (campaignId) => {
    try {
      await reviewCampaign(campaignId, 'rejected');
      toast.success("Fundraiser rejected");
      getAllCampaigns({ status: 'pending', limit: 100 });
    } catch (error) {
      toast.error("Failed to reject fundraiser");
    }
  };

  const filteredRequests = campaigns.filter(campaign =>
    campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.fundraiser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.fundraiser?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.beneficiary?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredRequests.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Fundraiser Requests</h1>
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
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Campaign Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Fundraiser
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Goal Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((campaign, index) => (
                      <tr
                        key={campaign._id}
                        className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          <div className="line-clamp-2">{campaign.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900 font-medium">{campaign.fundraiser?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-600">{campaign.fundraiser?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {campaign.fundraiser?.phone || campaign.beneficiary?.contact || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          ₹{campaign.goalAmount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                            {campaign.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(campaign._id)}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                              title="Approve Campaign"
                            >
                              <BiCheck size={18} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(campaign._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                              title="Reject Campaign"
                            >
                              <BiX size={18} />
                              Reject
                            </button>
                            <a 
                              href={`/campaigns/${campaign._id}`}
                              target="_blank"
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={14} />
                              View
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📋</div>
                        {isLoading ? 'Loading requests...' : 'No fundraiser requests found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredRequests.length)} of {filteredRequests.length} entries
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



