"use client";

import React, { useState } from "react";
import { FaUserPlus, FaArrowRight, FaStethoscope, FaHospital, FaUtensils, FaPills, FaFlask, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AddDoctorForm from "@/components/admin/AddDoctorForm";
import AddHospitalForm from "@/components/admin/AddHospitalForm";
import AddFoodPartnerForm from "@/components/admin/AddFoodPartnerForm";
import AddMedicineForm from "@/components/admin/AddMedicineForm";
import AddPathologyForm from "@/components/admin/AddPathologyForm";

export default function PartnerForm() {
  const router = useRouter();
  const [selectedPartnerType, setSelectedPartnerType] = useState(null);

  const partnerTypes = [
    {
      id: "doctor",
      name: "Doctor",
      description: "Join as a medical professional to provide healthcare services",
      icon: FaStethoscope,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      id: "hospital",
      name: "Hospital",
      description: "Partner with us to provide comprehensive healthcare services",
      icon: FaHospital,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    },
    {
      id: "food",
      name: "Food Partner",
      description: "Help us fight hunger by providing food services",
      icon: FaUtensils,
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700"
    },
    {
      id: "medicine",
      name: "Medicine/Pharmacy",
      description: "Provide pharmaceutical services and medicines",
      icon: FaPills,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    },
    {
      id: "pathology",
      name: "Pathology Lab",
      description: "Offer diagnostic and laboratory testing services",
      icon: FaFlask,
      color: "from-cyan-500 to-cyan-600",
      hoverColor: "hover:from-cyan-600 hover:to-cyan-700"
    },
    {
      id: "event",
      name: "Event Form",
      description: "Create and submit new events and activities",
      icon: FaCalendarAlt,
      color: "from-emerald-500 to-green-600",
      hoverColor: "hover:from-emerald-600 hover:to-green-700"
    }
  ];

  const handlePartnerTypeSelect = (typeId) => {
    if (typeId === "event") {
      router.push("/admin/create-event");
      return;
    }
    setSelectedPartnerType(typeId);
    // Scroll to form section
    setTimeout(() => {
      const formSection = document.getElementById('partner-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleBackToSelection = () => {
    setSelectedPartnerType(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderForm = () => {
    switch (selectedPartnerType) {
      case "doctor":
        return <AddDoctorForm isPartnerSubmission={true} onBack={handleBackToSelection} />;
      case "hospital":
        return <AddHospitalForm isPartnerSubmission={true} onBack={handleBackToSelection} />;
      case "food":
        return <AddFoodPartnerForm isPartnerSubmission={true} onBack={handleBackToSelection} />;
      case "medicine":
        return <AddMedicineForm isPartnerSubmission={true} onBack={handleBackToSelection} />;
      case "pathology":
        return <AddPathologyForm isPartnerSubmission={true} onBack={handleBackToSelection} />;
      default:
        return null;
    }
  };

  // If partner type is selected, show the form
  if (selectedPartnerType) {
    return (
      <section className="relative bg-gradient-to-r from-green-50 to-pink-50 py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div id="partner-form-section">
            {renderForm()}
          </div>
        </div>
      </section>
    );
  }

  // Show partner type selection
  return (
    <section className="relative bg-gradient-to-r from-green-50 to-pink-50 py-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h5 className="text-green-600 font-semibold uppercase tracking-widest text-sm animate-pulse mb-4">
            Become A Partner
          </h5>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Join Us in Fighting Hunger and Transform Lives Together!
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select your partner type below to get started with your registration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partnerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() => handlePartnerTypeSelect(type.id)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-green-400"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {type.name}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  {type.description}
                </p>
                <button
                  className={`w-full bg-gradient-to-r ${type.color} ${type.hoverColor} text-white py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  Select <FaArrowRight />
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-green-600 p-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <FaUserPlus className="text-white text-2xl" />
            </div>
            <div>
              <h5 className="text-gray-800 font-semibold text-lg flex items-center gap-2">
                Ready to make a change? Select your partner type above to get started
                <FaArrowRight className="text-green-600" />
              </h5>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/volunteer')}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <FaUserPlus className="text-green-600 text-2xl" />
              <h5 className="text-gray-800 font-medium">Join Our Volunteer Team</h5>
            </motion.div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl shadow-md">
              <FaStethoscope className="text-blue-600 text-2xl" />
              <h5 className="text-gray-800 font-medium">Healthcare Partners Welcome</h5>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
