"use client";
import Image from "next/image";
import { BiPrinter, BiQr } from "react-icons/bi";
import { FiMapPin, FiPhone, FiMail, FiGlobe } from "react-icons/fi";
import { getBackendBaseUrl } from "@/utils/api";

/**
 * Volunteer ID Card Component
 * Professional ID card design matching the reference image
 * Front and back sides with green theme and Care Foundation branding
 */
export default function VolunteerIDCard({ cardData, onPrint }) {
  if (!cardData) return null;

  // Format date helper
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  // Get photo URL - handle both string and object formats
  const backendBaseUrl = getBackendBaseUrl();
  let photoUrl = '/default-avatar.png';
  if (cardData.photo) {
    if (typeof cardData.photo === 'string') {
      photoUrl = cardData.photo.startsWith('http') 
        ? cardData.photo 
        : `${backendBaseUrl}${cardData.photo}`;
    } else if (cardData.photo.url) {
      photoUrl = cardData.photo.url.startsWith('http') 
        ? cardData.photo.url 
        : `${backendBaseUrl}${cardData.photo.url}`;
    }
  }

  // Get volunteer details with fallbacks
  const volunteer = cardData.volunteer || {};
  const volunteerDetails = volunteer.volunteerDetails || {};
  
  const name = cardData.name || volunteer.name || "N/A";
  const role = cardData.category || cardData.role || "Volunteer CFT";
  const phone = volunteer.phone || cardData.mobile || "N/A";
  const email = volunteer.email || cardData.email || "N/A";
  const dob = volunteerDetails.dateOfBirth ? formatShortDate(volunteerDetails.dateOfBirth) : "N/A";
  const gender = volunteerDetails.gender || cardData.gender || "N/A";
  const bloodGroup = volunteerDetails.bloodGroup || cardData.bloodGroup || "N/A";
  const nationality = volunteerDetails.nationality || cardData.nationality || "Indian";
  const address = cardData.address || volunteerDetails.communicationAddress || volunteer.address?.street || "N/A";
  
  // Format expiry date
  const expiryDate = cardData.validityDate ? formatShortDate(cardData.validityDate) : "1 Year";
  
  const cardNumber = cardData.cardNumber || `CFT-${String(cardData._id || '').slice(-10).padStart(10, '0')}`;
  const regNumber = "E-17543";

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start p-6 bg-gray-100 min-h-screen print:bg-white print:p-0">
      {/* Front Side - Matching Image Design */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-sm mx-auto print:shadow-none print:rounded-none" style={{ height: 'fit-content' }}>
        {/* Top Section - Logo and Slogan */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 relative">
          {/* Decorative arrow/triangle in top-left */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[30px] border-l-green-800 border-t-[30px] border-t-green-500 opacity-80"></div>
          
          <div className="relative z-10 flex items-start gap-3">
            {/* Logo Section */}
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
                <Image
                  src="/trademark.png"
                  alt="Care Foundation TrustⓇ Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-white font-bold text-lg leading-tight">CARE FOUNDATION</h2>
              <h3 className="text-white font-semibold text-sm mt-0.5">TRUST</h3>
              <p className="text-green-100 text-xs mt-1.5">We Care For You</p>
            </div>
          </div>
        </div>

        {/* Middle Section - Photo and Vertical Name Bar */}
        <div className="p-4 bg-white relative">
          <div className="flex gap-3 items-start">
            {/* Photo Section */}
            <div className="relative w-32 h-40 bg-gray-100 border-2 border-gray-300 rounded overflow-hidden flex-shrink-0">
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            
            {/* Vertical Green Bar with Name and Role */}
            <div className="flex-1 bg-gradient-to-b from-green-600 to-green-700 rounded px-3 py-2 relative min-h-[160px] flex flex-col justify-between">
              {/* Decorative triangle in top-right */}
              <div className="absolute top-0 right-0 w-0 h-0 border-r-[20px] border-r-green-500 border-t-[20px] border-t-green-400 opacity-70"></div>
              
              <div className="relative z-10">
                <div className="writing-vertical text-white font-bold text-lg mb-3" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {name.toUpperCase()}
                </div>
                <div className="writing-vertical text-green-100 text-sm mt-2" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {role.toUpperCase()}
                </div>
              </div>
              
              {/* Bottom logo in vertical bar */}
              <div className="relative z-10 mt-auto">
                <div className="text-white text-xs font-bold mb-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  CARE FOUNDATION TRUST
                </div>
                <div className="text-green-100 text-[10px] mt-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Est. Since 1997
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="mt-4 space-y-1.5 text-xs text-gray-900">
            <div className="flex justify-between">
              <span className="font-semibold">Gender:</span>
              <span>{gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Expiry:</span>
              <span>{expiryDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">DOB:</span>
              <span>{dob}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Contact:</span>
              <span className="text-[10px]">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Blood:</span>
              <span>{bloodGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Nationality:</span>
              <span>{nationality}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - ID Number */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 relative">
          {/* Decorative triangle in bottom-left */}
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[25px] border-l-green-800 border-b-[25px] border-b-green-500 opacity-80"></div>
          
          <div className="relative z-10">
            <p className="text-white font-bold text-base mb-1">ID NO: {cardNumber}</p>
            <p className="text-green-100 text-[10px]">Reg. No: {regNumber} | Serving Humanity Since 1997</p>
          </div>
        </div>
      </div>

      {/* Back Side - Matching Image Design */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-sm mx-auto print:shadow-none print:rounded-none" style={{ height: 'fit-content' }}>
        {/* Top Section - Terms & Conditions */}
        <div className="p-4 bg-white">
          <h3 className="text-gray-900 font-bold text-sm mb-3">Terms & Conditions</h3>
          <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
            <p>• The Designation Role Of Individual For Care Foundation TrustⓇ Is Certified By This Identification Card.</p>
            <p>• The Card Cannot Be Changed Into Cash Or Transferred To Another Person.</p>
            <p>• It Belongs To The Care Foundation TrustⓇ Legally.</p>
            <p>• If Found Please Return It To Care Foundation TrustⓇ At The Address Mentioned Below.</p>
          </div>
        </div>

        {/* Middle Section - Signature and Business Info */}
        <div className="p-4 bg-white relative">
          <div className="flex gap-3 items-start">
            {/* Left Side - Signature */}
            <div className="flex-1">
              <p className="text-gray-900 font-semibold text-xs mb-1">Signature Authority</p>
              <p className="text-gray-600 text-[10px] mb-2">CEO, Care Foundation TrustⓇ</p>
              <div className="border-t-2 border-gray-900 pt-1 mt-2">
                <p className="text-gray-900 font-semibold text-xs">Aziz Gheewala</p>
              </div>
            </div>
            
            {/* Right Side - Vertical Green Bar */}
            <div className="bg-gradient-to-b from-green-600 to-green-700 rounded px-2 py-3 relative min-h-[100px] flex flex-col justify-between">
              {/* Decorative triangle in top-right */}
              <div className="absolute top-0 right-0 w-0 h-0 border-r-[15px] border-r-green-500 border-t-[15px] border-t-green-400 opacity-70"></div>
              
              <div className="relative z-10">
                <div className="text-white font-bold text-xs mb-2" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  CARE FOUNDATION TRUST
                </div>
                <div className="text-green-100 text-[10px] mt-2" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Serving Humanity Since 1997
                </div>
              </div>
              
              <div className="relative z-10 mt-auto">
                <div className="text-white text-xs font-bold mb-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  LOGO
                </div>
                <div className="text-green-100 text-[9px] mt-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  We Care For You
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="mt-4 flex flex-col items-center">
            <div className="w-full h-16 bg-gray-900 flex items-center justify-center rounded mb-2">
              <BiQr className="text-white text-3xl" />
            </div>
            <p className="text-gray-900 text-[10px] font-mono tracking-widest">{cardNumber.replace(/-/g, ' ')}</p>
          </div>
        </div>

        {/* Bottom Section - Contact Details */}
        <div className="p-4 bg-white space-y-2 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <FiMapPin className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
            <span>1106, Alexander Tower, Sai World Empire, opposite Swapnapoorti Mhada colony, valley Shilp Road, Sector 36, Kharghar, Navi Mumbai - 410210</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMail className="text-green-600 flex-shrink-0" size={14} />
            <span>carefoundationtrustorg@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPhone className="text-green-600 flex-shrink-0" size={14} />
            <span>+91 9136521052, +91 7304786365</span>
          </div>
          <div className="flex items-center gap-2">
            <FiGlobe className="text-green-600 flex-shrink-0" size={14} />
            <span>https://www.carefoundationtrust.org</span>
          </div>
        </div>

        {/* Decorative triangle in bottom-left */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[25px] border-l-green-600 border-b-[25px] border-b-green-500 opacity-70"></div>
        </div>
      </div>

      {/* Print Button - Hidden in print view */}
      {onPrint && (
        <div className="w-full max-w-sm mx-auto mt-6 print:hidden">
          <button
            onClick={onPrint}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <BiPrinter size={20} />
            Print ID Card
          </button>
        </div>
      )}
    </div>
  );
}
