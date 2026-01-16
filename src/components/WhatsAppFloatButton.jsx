"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppFloatButton() {
  const whatsappUrl = "https://wa.me/919136521052";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
      aria-label="Chat on WhatsApp"
      style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)'
      }}
    >
      <FaWhatsapp className="text-white text-3xl" />
    </a>
  );
}

