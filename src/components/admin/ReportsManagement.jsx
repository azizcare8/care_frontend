"use client";
import { useState } from "react";
import { BiDownload, BiFile, BiCalendar } from "react-icons/bi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function ReportsManagement() {
  const [reportType, setReportType] = useState("donations");
  const [format, setFormat] = useState("excel");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const params = new URLSearchParams({
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/reports/${reportType}?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Report downloaded successfully!`);
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error(error.response?.data?.message || "Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Reports & Analytics
        </h1>
        <p className="text-sm text-gray-600">Download comprehensive reports in Excel or PDF format</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReportType("donations")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === "donations"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    reportType === "donations"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    <BiFile size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-gray-900">Donations</div>
                    <div className="text-xs text-gray-500">All donation records</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setReportType("coupons")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === "coupons"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    reportType === "coupons"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    <BiFile size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-gray-900">Coupons</div>
                    <div className="text-xs text-gray-500">Coupon usage & stats</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setReportType("beneficiaries")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === "beneficiaries"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    reportType === "beneficiaries"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    <BiFile size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-gray-900">Beneficiaries</div>
                    <div className="text-xs text-gray-500">Beneficiary data</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">File Format *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat("excel")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  format === "excel"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BiFile size={18} />
                  <span className="font-semibold text-sm">Excel (.xlsx)</span>
                </div>
              </button>

              <button
                onClick={() => setFormat("pdf")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  format === "pdf"
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BiFile size={18} />
                  <span className="font-semibold text-sm">PDF (.pdf)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <BiCalendar className="inline mr-2" />
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="pt-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <BiDownload size={20} />
                  <span>Download {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-blue-200 p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Report Information</h3>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Excel reports include all data with formatted columns</li>
          <li>• PDF reports are optimized for printing and sharing</li>
          <li>• Date range filters help you generate period-specific reports</li>
          <li>• All reports include transaction IDs and verification details</li>
        </ul>
      </div>
    </div>
  );
}

