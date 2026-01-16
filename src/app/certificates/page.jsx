"use client";
import { useState } from "react";
import Image from "next/image";
import { FiAward, FiX, FiZoomIn, FiDownload, FiCheckCircle, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import BackToHome from "@/components/BackToHome";

export default function Certificates() {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const certificates = [
    {
      id: 1,
      title: "12A Registration",
      issuer: "Income Tax Department",
      description: "Registered under Section 12A of the Income Tax Act, 1961. This registration exempts the organization from income tax.",
      year: "1997",
      image: "/certificates/12a-registration.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 2,
      title: "80G Certification",
      issuer: "Income Tax Department",
      description: "Donations made to Care Foundation Trust are eligible for tax exemption under Section 80G of the Income Tax Act.",
      year: "1997",
      image: "/certificates/80g-certification.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 3,
      title: "NGO Darpan",
      issuer: "NITI Aayog",
      description: "Registered on NGO Darpan portal of NITI Aayog, Government of India. This ensures transparency and credibility.",
      year: "2017",
      image: "/certificates/ngo-darpan.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 4,
      title: "Trust Registration",
      issuer: "Charity Commissioner",
      description: "Registered under the Bombay Public Trust Act, 1950. This establishes our legal status as a charitable trust.",
      year: "1997",
      image: "/certificates/trust-registration.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 5,
      title: "NGO Registration Certificate",
      issuer: "Registrar of Societies",
      description: "Official registration certificate confirming our status as a registered non-governmental organization.",
      year: "2024",
      image: "/certificates/ngo-registration.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 6,
      title: "NGO PAN Card",
      issuer: "Income Tax Department",
      description: "Permanent Account Number (PAN) card issued to Care Foundation Trust for official transactions and tax purposes.",
      year: "2024",
      image: "/certificates/ngo-pan-card.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 7,
      title: "CSR-1 Registration",
      issuer: "Ministry of Corporate Affairs",
      description: "Eligible to receive Corporate Social Responsibility (CSR) funds from companies as per the Companies Act, 2013.",
      year: "2021",
      image: "/certificates/csr1-registration.jpg", // Replace with actual image path
      status: "active"
    },
    {
      id: 8,
      title: "FCRA Registration",
      issuer: "Ministry of Home Affairs",
      description: "Foreign Contribution Regulation Act (FCRA) registration to receive foreign contributions. Currently under approval process.",
      year: "Pending",
      image: "/certificates/fcra-registration.jpg", // Replace with actual image path
      status: "pending"
    }
  ];

  const openCertificate = (cert) => {
    setSelectedCertificate(cert);
  };

  const closeCertificate = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FiAward className="text-4xl text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Our Certificates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Care Foundation Trust is a registered non-profit organization with all necessary legal certifications and registrations.
          </motion.p>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-green-500"
              onClick={() => openCertificate(cert)}
            >
              {/* Certificate Image Card */}
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                {/* Placeholder for certificate image */}
                <div className="w-full h-full flex items-center justify-center">
                  {cert.image && cert.image.startsWith('/') ? (
                    <Image
                      src={cert.image}
                      alt={cert.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FiAward className="text-6xl text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-green-700 font-semibold">Certificate Image</p>
                    </div>
                  )}
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <FiZoomIn className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {cert.status === "active" ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FiCheckCircle className="text-sm" />
                      Active
                    </span>
                  ) : (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FiClock className="text-sm" />
                      Pending
                    </span>
                  )}
        </div>

                {/* Year Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                    {cert.year}
                  </span>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-sm text-green-600 font-medium mb-2">{cert.issuer}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{cert.description}</p>
                
                {/* View Button */}
                <button 
                  onClick={() => setSelectedCertificate(cert)}
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiZoomIn /> View Certificate
                </button>
            </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Verification?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            For verification of our certificates or any other legal documents, please contact us at{" "}
            <a href="mailto:carefoundationtrustorg@gmail.com" className="text-green-600 hover:underline font-semibold">
              carefoundationtrustorg@gmail.com
            </a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://wa.me/919136521052" 
            target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <FiDownload /> Request Documents
            </a>
            <a 
              href="mailto:carefoundationtrustorg@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Email Us
            </a>
          </div>
        </motion.div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeCertificate}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeCertificate}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-2xl text-gray-700" />
              </button>

              {/* Certificate Image */}
              <div className="relative h-96 bg-gradient-to-br from-green-100 to-green-200">
                {selectedCertificate.image && selectedCertificate.image.startsWith('/') ? (
                  <Image
                    src={selectedCertificate.image}
                    alt={selectedCertificate.title}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <FiAward className="text-8xl text-green-600 mb-4" />
                    <p className="text-green-700 font-semibold">Certificate Image Placeholder</p>
                    <p className="text-sm text-gray-500 mt-2">Upload certificate image to display here</p>
                  </div>
                )}
              </div>

              {/* Certificate Details */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCertificate.title}</h2>
                    <p className="text-lg text-green-600 font-medium">{selectedCertificate.issuer}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                      {selectedCertificate.year}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedCertificate.description}</p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (selectedCertificate.image && selectedCertificate.image.startsWith('/')) {
                        const link = document.createElement('a');
                        link.href = selectedCertificate.image;
                        link.download = `${selectedCertificate.title.replace(/\s+/g, '-')}.jpg`;
                        link.click();
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDownload /> Download
                  </button>
                  <a
                    href={`mailto:carefoundationtrustorg@gmail.com?subject=Certificate Verification Request - ${encodeURIComponent(selectedCertificate.title)}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Request Verification
          </a>
        </div>
      </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
