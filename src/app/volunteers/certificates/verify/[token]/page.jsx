"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import VolunteerCertificate from "@/components/VolunteerCertificate";
import { BiDownload, BiRefresh, BiCheckCircle } from "react-icons/bi";

export default function VerifyCertificatePage() {
  const params = useParams();
  const token = params?.token;
  const [certificateData, setCertificateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCertificate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCertificate = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/volunteer-cards/certificates/verify/${token}`);
      if (response.data.success && response.data.data) {
        setCertificateData(response.data.data);
        setIsVerified(true);
      } else {
        toast.error("Certificate not found or invalid token");
      }
    } catch (error) {
      console.error("Failed to fetch certificate:", error);
      toast.error("Invalid certificate verification link");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      toast.loading("Generating PDF...");

      // Dynamic import for html2canvas and jspdf
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Get the certificate container
      const certContainer = document.getElementById("certificate-container");
      if (!certContainer) {
        toast.error("Certificate not found");
        return;
      }

      // Create canvas from the certificate
      const canvas = await html2canvas(certContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f3f4f6",
        width: certContainer.scrollWidth,
        height: certContainer.scrollHeight
      });

      // Convert to PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      const fileName = `certificate-${certificateData?.certificateNumber || token || 'cert'}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss();
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      
      // Fallback: Try to download as image
      try {
        const certContainer = document.getElementById("certificate-container");
        if (certContainer) {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(certContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f3f4f6"
          });
          const link = document.createElement("a");
          link.download = `certificate-${certificateData?.certificateNumber || token || 'cert'}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("Certificate downloaded as image!");
        }
      } catch (imgError) {
        toast.error("Please install html2canvas: npm install html2canvas jspdf");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificateData || !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BiRefresh className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            The certificate verification link is invalid or the certificate has been removed.
          </p>
          <button
            onClick={fetchCertificate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
          >
            <BiRefresh size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Verification Badge */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BiCheckCircle className="text-green-600" size={32} />
            <div>
              <h2 className="text-xl font-bold text-green-800">Certificate Verified</h2>
              <p className="text-sm text-green-600">This certificate is authentic and issued by Care Foundation TrustⓇ</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition flex items-center gap-2 font-semibold"
            >
              <BiDownload size={18} />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              <BiDownload size={18} />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Container */}
      <div className="w-full flex justify-center">
        <div id="certificate-container" className="w-full max-w-5xl print:bg-white">
          <VolunteerCertificate 
            certificateData={certificateData} 
            onPrint={handlePrint}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container,
          #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

