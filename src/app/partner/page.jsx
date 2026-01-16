"use client";

import ClientLayout from "../ClientLayout";
import PartnerForm from "@/components/PartnerForm";
import DonationCard from "@/components/DonationCard";

export default function PartnerPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-pink-50 pt-28 lg:pt-32">
        <div>
          <PartnerForm />
          <div className="container mx-auto px-6 pb-16">
            <DonationCard />
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

