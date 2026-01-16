"use client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import AddHospitalForm from "@/components/admin/AddHospitalForm";

export default function CreateHospitalPage() {
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
      <AddHospitalForm />
    </AdminLayout>
  );
}

