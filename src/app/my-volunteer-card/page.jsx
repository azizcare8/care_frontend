"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import api from "@/utils/api";
import toast from "react-hot-toast";
import VolunteerIDCard from "@/components/VolunteerIDCard";
import { BiDownload, BiArrowToLeft, BiRefresh } from "react-icons/bi";
// Note: Install html2canvas and jspdf for PDF download:
// npm install html2canvas jspdf

export default function MyVolunteerCardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchMyCard();
  }, [isAuthenticated, user]);

  const fetchMyCard = async () => {
    try {
      setIsLoading(true);
      // Fetch user's volunteer card
      const response = await api.get("/volunteer-cards/my-card");
      if (response.data.success && response.data.data) {
        setCardData(response.data.data);
      } else {
        // If no card found, try to get user's volunteer card by user ID
        const allCardsResponse = await api.get("/volunteer-cards");
        const cards = allCardsResponse.data.data || [];
        const myCard = cards.find(card => 
          card.volunteer?._id === user._id || 
          card.volunteer === user._id ||
          card.name === user.name
        );
        if (myCard) {
          setCardData(myCard);
        } else {
          toast.error("No volunteer card found. Please contact admin.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch volunteer card:", error);
      // Try alternative endpoint
      try {
        const allCardsResponse = await api.get("/volunteer-cards");
        const cards = allCardsResponse.data.data || [];
        const myCard = cards.find(card => 
          card.volunteer?._id === user._id || 
          card.volunteer === user._id ||
          card.name === user.name
        );
        if (myCard) {
          setCardData(myCard);
        } else {
          toast.error("No volunteer card found. Please contact admin.");
        }
      } catch (err) {
        toast.error("Failed to load volunteer card");
      }
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

      // Get the card container
      const cardContainer = document.getElementById("volunteer-card-container");
      if (!cardContainer) {
        toast.error("Card not found");
        return;
      }

      // Create canvas from the card
      const canvas = await html2canvas(cardContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f3f4f6",
        width: cardContainer.scrollWidth,
        height: cardContainer.scrollHeight
      });

      // Convert to PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [210, 148] // ID card size
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      const fileName = `volunteer-card-${cardData?.cardNumber || user._id || 'card'}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss();
      toast.success("ID Card downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      
      // Fallback: Try to download as image
      try {
        const cardContainer = document.getElementById("volunteer-card-container");
        if (cardContainer) {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(cardContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f3f4f6"
          });
          const link = document.createElement("a");
          link.download = `volunteer-card-${cardData?.cardNumber || user._id || 'card'}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("ID Card downloaded as image!");
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
          <p className="text-gray-600">Loading your volunteer card...</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BiRefresh className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Volunteer Card Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have a volunteer card yet. Please contact the admin to get your card issued.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(user?.role === 'admin' ? '/admin/dashboard' : user?.role ? '/dashboard' : '/login')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              <BiArrowToLeft size={18} />
              Back to Dashboard
            </button>
            <button
              onClick={fetchMyCard}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <BiRefresh size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Merge user data with card data for complete information
  const completeCardData = {
    ...cardData,
    volunteer: {
      ...cardData.volunteer,
      ...user,
      phone: cardData.volunteer?.phone || user.phone || cardData.mobile,
      email: cardData.volunteer?.email || user.email,
      address: cardData.volunteer?.address || user.address || cardData.address
    },
    name: cardData.name || user.name,
    mobile: cardData.mobile || cardData.volunteer?.phone || user.phone,
    address: cardData.address || cardData.volunteer?.address || user.address,
    nationality: cardData.nationality || "Indian"
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(user?.role === 'admin' ? '/admin/dashboard' : user?.role ? '/dashboard' : '/login')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <BiArrowToLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Volunteer ID Card</h1>
              <p className="text-sm text-gray-600">View and download your volunteer identification card</p>
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

      {/* Card Container - Visible on page */}
      <div className="w-full flex justify-center">
        <div id="volunteer-card-container" className="w-full max-w-6xl print:bg-white">
          <VolunteerIDCard 
            cardData={completeCardData} 
            onPrint={handlePrint}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #volunteer-card-container,
          #volunteer-card-container * {
            visibility: visible;
          }
          #volunteer-card-container {
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

