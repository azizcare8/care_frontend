"use client";

import ClientLayout from "../../ClientLayout";
import FoodPartners from "@/components/FoodPartners";

export default function FoodPartnersPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-28 lg:pt-32">
        <div>
          <FoodPartners />
        </div>
      </div>
    </ClientLayout>
  );
}

