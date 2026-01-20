"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiTrendingUp } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";
import useAdminStore from "@/store/adminStore";
import toast from "react-hot-toast";

export default function FundraisedDataTable() {
  const { campaigns, isLoading, getAllCampaigns } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        await getAllCampaigns({ status: 'completed', limit: 100 });
      } catch (error) {
        console.error("Failed to load completed campaigns:", error);
        toast.error("Failed to load data");
      }
    };
    fetchCompleted();
  }, [getAllCampaigns]);

  const filteredFundraised = campaigns.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fundraiser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredFundraised.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredFundraised.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Completed FundRaised Data</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li>
              <a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href="/admin/fundraiser-live" className="hover:underline text-gray-600 hover:text-blue-600">
                FundRaiser Live
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Completed FundRaiser</li>
          </ol>
        </nav>
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
            <p className="text-gray-600 mt-4">Loading completed campaigns...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Campaign Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Goal Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Raised Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">% Achieved</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Fundraiser</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((campaign, index) => {
                      const percentage = ((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(1);
                      return (
                        <tr key={campaign._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{campaign.title}</div>
                            <div className="text-xs text-gray-500">{campaign.category}</div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {campaign.goalAmount?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-green-600">
                            {campaign.currentAmount?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <div>{new Date(campaign.timeline.startDate).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">to {new Date(campaign.timeline.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="text-gray-900">{campaign.fundraiser?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-600">{campaign.fundraiser?.phone || campaign.beneficiary?.contact}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-green-600 text-white flex items-center gap-1 w-fit">
                              <FiCheckCircle size={14} />
                              Completed
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">🎉</div>
                        {isLoading ? 'Loading completed campaigns...' : 'No completed fundraisers yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}



