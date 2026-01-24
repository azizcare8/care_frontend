"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import PartnerDashboard from "@/components/dashboards/PartnerDashboard";
import DonorDashboard from "@/components/dashboards/DonorDashboard";
import FundraiserDashboard from "@/components/dashboards/FundraiserDashboard";
import VolunteerDashboard from "@/components/dashboards/VolunteerDashboard";
import VendorDashboard from "@/components/dashboards/VendorDashboard";
import StaffDashboard from "@/components/dashboards/StaffDashboard";
import DefaultDashboard from "@/components/dashboards/DefaultDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    // Admin users should use admin dashboard
    if (user.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }
  }, [isAuthenticated, user, isLoading, _hasHydrated, router]);

  if (isLoading || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  // Admin should not reach here (redirected above), but just in case
  if (user.role === 'admin') {
    return null; // Will redirect
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'partner':
      return <PartnerDashboard />;
    case 'donor':
      return <DonorDashboard />;
    case 'fundraiser':
      return <FundraiserDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'vendor':
      return <VendorDashboard />;
    case 'staff':
      return <StaffDashboard />;
    default:
      return <DefaultDashboard />;
  }
}
