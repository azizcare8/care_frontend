"use client";

import ClientLayout from "../ClientLayout";
import StartFundraiser from "@/components/StartFundraiser";
import DonationCard from "@/components/DonationCard";

export default function StartFundraiserPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen pt-28 lg:pt-32">
        <StartFundraiser />
        
        {/* Bank Details Section */}
        <section className="bg-gradient-to-br from-gray-50 via-green-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
                Donation Information
              </h2>
              <p className="text-gray-600 text-lg">
                Support us through direct bank transfer or UPI
              </p>
              <div className="mt-3 w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full" />
            </div>
            
            <DonationCard />
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}

