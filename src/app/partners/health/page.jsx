"use client";

import ClientLayout from "../../ClientLayout";
import HealthPartners from "@/components/HealthPartners";

export default function HealthPartnersPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-28 lg:pt-32">
        <div>
          <HealthPartners />
        </div>
      </div>
    </ClientLayout>
  );
}

