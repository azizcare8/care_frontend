"use client";

import { Suspense } from "react";
import ClientLayout from "../../ClientLayout";
import HealthPartners from "@/components/HealthPartners";

export default function HealthPartnersPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 pt-28 lg:pt-32">
        <Suspense fallback={<div className="py-10 text-center">Loading partners...</div>}>
          <HealthPartners />
        </Suspense>
      </div>
    </ClientLayout>
  );
}

