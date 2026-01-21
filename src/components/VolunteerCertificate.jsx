"use client";
import Image from "next/image";
import { BiPrinter, BiDownload, BiQr } from "react-icons/bi";

/**
 * Volunteer Certificate Component
 * Displays certificate with government and foundation approval stamps
 */
export default function VolunteerCertificate({ certificateData, onPrint, onDownload }) {
  if (!certificateData) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const certificateNumber = certificateData.certificateNumber || `CFT-CERT-${String(certificateData._id || '').slice(-6).padStart(6, '0')}`;
  const regNumber = "E-17543";

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border-4 border-green-600">
        {/* Certificate Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 border-4 border-white rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600">Q</span>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold mb-1">Care Foundation TrustⓇ</h1>
                <p className="text-lg opacity-90">Established Since 1997</p>
                <p className="text-sm opacity-75">Registration No: {regNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-12 relative">
          {/* Watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <div className="w-96 h-96 border-8 border-green-600 rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold text-green-600">CFT</span>
            </div>
          </div>

          <div className="relative z-10">
            {/* Certificate Title */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold text-gray-900 mb-2">CERTIFICATE</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-green-600 to-green-400 mx-auto"></div>
              <p className="text-2xl font-semibold text-gray-700 mt-4">
                {certificateData.title || "Certificate of Appreciation"}
              </p>
            </div>

            {/* Main Content */}
            <div className="text-center mb-8 space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                This is to certify that
              </p>
              <div className="my-6">
                <h3 className="text-4xl font-bold text-green-600 mb-2 border-b-4 border-green-600 inline-block px-8 pb-2">
                  {certificateData.volunteer?.name || certificateData.name || "Volunteer Name"}
                </h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                {certificateData.description || certificateData.purpose || "has demonstrated exceptional dedication and commitment to serving the community through Care Foundation TrustⓇ."}
              </p>
            </div>

            {/* Program Details */}
            {certificateData.program && (
              <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-8 rounded-r-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Program:</p>
                <p className="text-lg text-gray-900 capitalize">
                  {certificateData.program.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}

            {/* Stamps Section */}
            <div className="flex items-center justify-between mt-12 mb-8">
              {/* Government Approved Stamp */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border-4 border-blue-600 rounded-full flex flex-col items-center justify-center bg-blue-50 relative">
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-full m-2"></div>
                  <div className="text-center z-10">
                    <p className="text-[8px] font-bold text-blue-600 leading-tight">GOVERNMENT</p>
                    <p className="text-[8px] font-bold text-blue-600 leading-tight">OF INDIA</p>
                    <div className="w-8 h-8 mx-auto mt-1 border-2 border-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">✓</span>
                    </div>
                    <p className="text-[7px] font-bold text-blue-600 leading-tight mt-1">APPROVED</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Government Approved</p>
                <p className="text-xs text-gray-500">Reg. No: {regNumber}</p>
              </div>

              {/* Certificate Number */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Certificate No:</p>
                <p className="text-lg font-bold text-gray-900">{certificateNumber}</p>
                {certificateData.qrCode?.url && (
                  <div className="mt-4 w-24 h-24 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <BiQr className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>

              {/* Foundation Approved Stamp */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border-4 border-green-600 rounded-full flex flex-col items-center justify-center bg-green-50 relative">
                  <div className="absolute inset-0 border-2 border-green-400 rounded-full m-2"></div>
                  <div className="text-center z-10">
                    <p className="text-[8px] font-bold text-green-600 leading-tight">CARE</p>
                    <p className="text-[8px] font-bold text-green-600 leading-tight">FOUNDATION</p>
                    <div className="w-8 h-8 mx-auto mt-1 border-2 border-green-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">Q</span>
                    </div>
                    <p className="text-[7px] font-bold text-green-600 leading-tight mt-1">APPROVED</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Foundation Approved</p>
                <p className="text-xs text-gray-500">Est. 1997</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex items-end justify-between mt-12 border-t-2 border-gray-300 pt-8">
              <div className="text-center flex-1">
                <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Volunteer Signature</p>
              </div>
              <div className="text-center flex-1">
                <div className="h-16 border-b-2 border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Witness</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-sm font-semibold text-green-600 mb-1">
                  {certificateData.digitalSignature?.ceoSignature || "Aziz Gheewala"}
                </p>
                <p className="text-xs text-gray-600">CEO, Care Foundation TrustⓇ</p>
                <p className="text-xs text-gray-500 mt-1">Date: {formatDate(certificateData.issuedAt)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>This certificate is issued digitally and can be verified at www.carefoundationtrust.org</p>
              <p className="mt-1">Office: Shop No - S - 61, 2 Nd Flr, AL - EZZ Tower (SBUT), Bhendi Bazaar, Mumbai - 400003</p>
              <p className="mt-1">Contact: +91 7304786365 | Email: contactus@carefoundationtrust.org</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        {onPrint && (
          <button
            onClick={onPrint}
            className="bg-white border-2 border-green-600 text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <BiPrinter size={20} />
            Print Certificate
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-lg"
          >
            <BiDownload size={20} />
            Download PDF
          </button>
        )}
      </div>
    </div>
  );
}

