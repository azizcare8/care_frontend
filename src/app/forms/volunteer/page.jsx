"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import VolunteerForm from "@/components/VolunteerForm";

export default function VolunteerFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.post("/form-submissions", {
        formType: "volunteer",
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth
        },
        formData: {
          ...formData
        }
      });
      
      toast.success("Volunteer application submitted successfully! Admin will review it soon.");
      router.push("/volunteer?submitted=true");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Volunteer Application</h1>
          <p className="text-gray-600">
            Join us in making a difference. Fill out the form below to become a volunteer.
          </p>
        </div>
        <VolunteerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

