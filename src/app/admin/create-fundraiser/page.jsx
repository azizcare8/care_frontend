"use client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import UploadFundraiserForm from "@/components/admin/UploadFundraiserForm";

export default function CreateFundraiserPage() {
  const { canRender, isLoading } = useAdminAuth();

  if (isLoading || !canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <UploadFundraiserForm />
    </AdminLayout>
  );
}







