"use client";
import { useEffect, Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import ClientLayout from "./ClientLayout";
import HeroSlider from "@/components/HeroSlider";
import Banner from "@/components/Banner";
import TrustIndicators from "@/components/TrustIndicators";
import useCampaignStore from "@/store/campaignStore";
import useAuthStore from "@/store/authStore";

// Lazy load heavy components for faster initial load
const UrgentCampaigns = dynamic(() => import("@/components/UrgentCampaigns"), {
  loading: () => <div className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50"><div className="text-center">Loading urgent campaigns...</div></div>,
  ssr: true
});

const TrendingFundraisers = dynamic(() => import("@/components/TrendingFundraisers"), {
  loading: () => <div className="py-16"><div className="text-center">Loading campaigns...</div></div>,
  ssr: true
});

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  ssr: true
});

const SuccessStories = dynamic(() => import("@/components/SuccessStories"), {
  ssr: true
});

const CausesSection = dynamic(() => import("@/components/CausesSection"), {
  ssr: true
});

const HealthPartners = dynamic(() => import("@/components/HealthPartners"), {
  ssr: true
});

const FoodPartners = dynamic(() => import("@/components/FoodPartners"), {
  ssr: true
});

const CouponsSection = dynamic(() => import("@/components/CouponsSection"), {
  ssr: true
});

const ProductsSection = dynamic(() => import("@/components/ProductsSection"), {
  ssr: true
});

const EventsSection = dynamic(() => import("@/components/EventsSection"), {
  ssr: true
});

const MakeDifferenceSection = dynamic(() => import("@/components/MakeDifferenceSection"), {
  ssr: true
});

const WhyChooseUsSection = dynamic(() => import("@/components/WhyChooseUsSection"), {
  ssr: true
});

export default function Home() {
  const {
    getFeaturedCampaigns,
    getTrendingCampaigns,
    featuredCampaigns,
    trendingCampaigns,
    isLoading
  } = useCampaignStore();

  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize authentication (non-blocking)
    try {
      initializeAuth();
    } catch (error) {
      console.warn('Auth initialization error:', error);
    }

    // Load campaigns with request deduplication and timeout
    const loadCampaigns = async () => {
      try {
        // Use Promise.race with timeout for faster failure
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 3000)
        );

        await Promise.race([
          Promise.all([
            getFeaturedCampaigns(),
            getTrendingCampaigns()
          ]),
          timeoutPromise
        ]);
      } catch (error) {
        // Silently handle errors - don't block page render
        if (error.message !== 'Network Error' && error.message !== 'Failed to fetch' && error.message !== 'Request timeout') {
          console.error("Failed to load campaigns:", error);
        }
      }
    };

    // Defer non-critical data loading
    // Use requestIdleCallback if available, else setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadCampaigns, { timeout: 2000 });
    } else {
      setTimeout(loadCampaigns, 100);
    }
  }, [getFeaturedCampaigns, getTrendingCampaigns, initializeAuth]);

  return (
    <ClientLayout>
      <div className="font-sans min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        {/* Hero Slider Section */}
        <HeroSlider />

        {/* Main content with consistent spacing */}
        <div className="w-full max-w-full box-border">
          <Banner />
          <TrustIndicators />
          <UrgentCampaigns />
          <TrendingFundraisers campaigns={trendingCampaigns} isLoading={isLoading} />
          <HowItWorks />
          <SuccessStories />
          <CausesSection />
          <Suspense fallback={<div className="py-10 text-center">Loading partners...</div>}>
            <HealthPartners />
            <FoodPartners />
          </Suspense>
          <CouponsSection />
          <ProductsSection />
          <EventsSection />
          <MakeDifferenceSection />
          <WhyChooseUsSection />
        </div>
      </div>
    </ClientLayout>
  );
}
