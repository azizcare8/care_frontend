"use client";
import { useRouter } from "next/navigation";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { FiTrendingUp, FiActivity, FiDownload } from "react-icons/fi";
import { FaReceipt, FaHeart } from "react-icons/fa";

export default function DonorDashboard() {
  const router = useRouter();
  const { dashboardData, isLoading, user } = useDashboardData();

  const recentDonations = dashboardData.roleData?.recentDonations || [];
  const donationStats = dashboardData.donations || {};
  
  // Calculate people helped from coupon redemptions
  const peopleHelped = dashboardData.coupons?.totalRedemptions || 0;

  const handleDownloadReport = async (format = 'excel') => {
    try {
      if (format === 'excel') {
        const response = await api.get('/users/donations/report', {
          params: { format: 'excel' },
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        });
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tax-report-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("Excel report downloaded!");
      } else {
        toast.info("PDF format starting soon...");
      }
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-20 lg:pt-32 pb-8 px-2">
        <div className="max-w-full mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-green-100">
              View your donation history and impact
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">Total Donated</p>
                    <p className="text-3xl font-black mt-1">₹{donationStats.totalDonated?.toLocaleString() || 0}</p>
                  </div>
                  <FaHeart className="text-5xl text-rose-200 opacity-60" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Donation Count</p>
                    <p className="text-3xl font-black mt-1">{donationStats.donationCount || 0}</p>
                  </div>
                  <FiActivity className="text-5xl text-blue-200 opacity-60" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">People Helped</p>
                    <p className="text-3xl font-black mt-1">{peopleHelped || 0}</p>
                  </div>
                  <FiTrendingUp className="text-5xl text-emerald-200 opacity-60" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Impact Actions</h3>
                  <p className="text-gray-500 font-medium">Choose how you want to make a difference today</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => router.push("/campaigns")}
                  className="group relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white p-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-rose-100 transition-all transform hover:-translate-y-1"
                >
                  <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
                    <FaHeart className="text-4xl" />
                  </div>
                  <span className="text-xl font-black">Donate Now</span>
                </button>

                <button
                  onClick={() => handleDownloadReport('excel')}
                  className="group relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-2xl font-bold hover:shadow-xl hover:shadow-emerald-100 transition-all transform hover:-translate-y-1"
                >
                  <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 transition-transform">
                    <FiDownload className="text-4xl" />
                  </div>
                  <span className="text-xl font-black">Tax Report</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <FaReceipt className="text-rose-500" />
                  Recent Donations
                </h3>
                <button onClick={() => router.push('/my-donations')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
              </div>
              <div className="p-6">
                {recentDonations.length > 0 ? (
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-rose-50/20 transition-all group">
                        <div>
                          <p className="font-bold text-gray-900 leading-none mb-1 group-hover:text-rose-600 transition-colors">
                            {donation.campaign?.title || "General Fund"}
                          </p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-gray-900">₹{donation.amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-green-600 font-bold">SUCCESS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-medium italic mb-4">No donations found.</p>
                    <button
                      onClick={() => router.push("/campaigns")}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Make your first donation →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
