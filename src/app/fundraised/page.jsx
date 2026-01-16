"use client";

import ClientLayout from "../ClientLayout";
import FundRaised from "@/components/FundRaised";

export default function FundraisedPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-blue-50 pt-28 lg:pt-32">
        <FundRaised />
      </div>
    </ClientLayout>
  );
}

