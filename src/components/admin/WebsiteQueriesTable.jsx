"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiMailSend } from "react-icons/bi";
import { FiPhone, FiMessageSquare } from "react-icons/fi";
import { BiEnvelope } from "react-icons/bi";
import { adminService } from "@/services/adminService";
import toast from "react-hot-toast";

export default function WebsiteQueriesTable() {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllContactQueries({
        page: 1,
        limit: entriesPerPage
      });
      setQueries(response.data || []);
    } catch (error) {
      console.error('Failed to load queries:', error);
      toast.error('Failed to load contact queries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsResolved = async (queryId) => {
    try {
      await adminService.updateQueryStatus(queryId, { status: 'resolved' });
      toast.success('Query marked as resolved');
      fetchQueries(); // Refresh the list
    } catch (error) {
      console.error('Failed to update query:', error);
      toast.error('Failed to update query status');
    }
  };

  const filteredQueries = queries.filter(query => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      query.name?.toLowerCase().includes(searchLower) ||
      query.email?.toLowerCase().includes(searchLower) ||
      query.phone?.includes(searchTerm) ||
      query.subject?.toLowerCase().includes(searchLower) ||
      query.message?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="mb-6 md:mb-8 bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Contact Queries</h1>
        <nav className="text-gray-500 text-xs md:text-sm">
          <ol className="flex flex-wrap space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 font-medium">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/admin/queries" className="hover:underline text-gray-600 font-medium">Contact Queries</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">All Contact Queries</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-3 md:p-4 backdrop-blur-sm">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <span className="w-1 h-6 md:h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
          <span className="text-base md:text-2xl">Website Contact Queries Table</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="border-2 border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <option value={10} className="text-gray-900">10</option>
            </select>
            <span className="text-xs md:text-sm text-green-600 font-medium">entries per page</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-2 border-gray-300 rounded-xl pl-4 pr-10 py-2 md:py-2.5 text-xs md:text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md placeholder:text-gray-900"/>
            <BiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Name</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Mobile Number</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Subject</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Message</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-12 text-center text-gray-500 text-sm md:text-base">
                    Loading queries...
                  </td>
                </tr>
              ) : filteredQueries.length > 0 ? (
                filteredQueries.map((query, idx) => (
                  <tr key={query._id} className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <BiEnvelope className="text-gray-400 flex-shrink-0" size={16} />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 break-words">{query.name}</div>
                          <div className="text-xs text-gray-500 break-words">{query.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                        <span className="break-words">{query.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900 break-words">{query.subject}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm max-w-md">
                      <div className="line-clamp-2 text-gray-700 break-words">{query.message}</div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                        query.status === 'resolved' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                        query.status === 'in-progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                      }`}>
                        {query.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <button 
                        onClick={() => handleMarkAsResolved(query._id)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs md:text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={query.status === 'resolved'}
                      >
                        {query.status === 'resolved' ? 'Resolved' : 'Mark As Fixed'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-12 text-center text-gray-500 text-sm md:text-base">
                    No queries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-3 text-sm">Loading queries...</p>
              </div>
            </div>
          ) : filteredQueries.length > 0 ? (
            filteredQueries.map((query, idx) => (
              <div key={query._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                <div className="space-y-3">
                  {/* Name and Email */}
                  <div className="flex items-start gap-2 border-b border-gray-200 pb-3">
                    <BiEnvelope className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-base mb-1 break-words">{query.name}</div>
                      <div className="text-xs text-gray-500 break-words">{query.email}</div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Phone:</div>
                    <div className="text-sm text-gray-700 flex items-center gap-1 flex-1">
                      <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                      <span className="break-words">{query.phone}</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex items-start gap-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Subject:</div>
                    <div className="text-sm font-medium text-gray-900 flex-1 break-words">{query.subject}</div>
                  </div>

                  {/* Message */}
                  <div className="flex items-start gap-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Message:</div>
                    <div className="text-sm text-gray-700 flex-1 break-words line-clamp-3">{query.message}</div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        query.status === 'resolved' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                        query.status === 'in-progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                      }`}>
                        {query.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleMarkAsResolved(query._id)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={query.status === 'resolved'}
                    >
                      {query.status === 'resolved' ? 'Resolved' : 'Mark Fixed'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-base font-semibold">No queries found</p>
                <p className="text-xs mt-1">Try adjusting your search terms</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}



