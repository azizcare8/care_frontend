"use client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import VolunteerCertificateManagement from "@/components/admin/VolunteerCertificateManagement";

export default function VolunteerCertificatesPage() {
  const { canRender, isLoading: authLoading } = useAdminAuth();

  if (authLoading || !canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <VolunteerCertificateManagement />
    </AdminLayout>
  );
}

