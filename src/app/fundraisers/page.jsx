"use client";

import { useEffect, useRef } from "react";
import ClientLayout from "../ClientLayout";
import TrendingFundraisers from "@/components/TrendingFundraisers";
import DonationCard from "@/components/DonationCard";
import useCampaignStore from "@/store/campaignStore";
import toast from "react-hot-toast";

export default function FundraisersPage() {
  const getTrendingCampaigns = useCampaignStore((state) => state.getTrendingCampaigns);
  const trendingCampaigns = useCampaignStore((state) => state.trendingCampaigns);
  const isLoading = useCampaignStore((state) => state.isLoading);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadCampaigns = async () => {
      try {
        await getTrendingCampaigns();
      } catch (error) {
        console.error("Failed to load fundraisers:", error);
        toast.error("Failed to load fundraisers");
      }
    };

    loadCampaigns();
  }, [getTrendingCampaigns]);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-pink-50 pt-28 lg:pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Active Fundraisers
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto">
            Explore and support ongoing fundraising campaigns making a difference in people's lives
          </p>
          <div className="mt-4 w-32 h-1 bg-white mx-auto rounded-full" />
        </div>
      </section>

      {/* Trending Fundraisers Section */}
      <TrendingFundraisers campaigns={trendingCampaigns} isLoading={isLoading} />

      {/* Bank Details Section */}
      <section className="bg-gradient-to-br from-gray-50 via-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
              Support Through Direct Donation
            </h2>
            <p className="text-gray-600 text-lg">
              You can also donate directly to Care Foundation TrustⓇ
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

