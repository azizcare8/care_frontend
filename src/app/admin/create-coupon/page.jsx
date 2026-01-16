"use client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import CreateCouponForm from "@/components/admin/CreateCouponForm";
import { useRouter } from "next/navigation";

export default function CreateCouponPage() {
  const { canRender, isLoading } = useAdminAuth();
  const router = useRouter();

  if (isLoading || !canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <CreateCouponForm
        onSuccess={() => router.push('/admin/coupons')}
        onCancel={() => router.push('/admin/coupons')}
      />
    </AdminLayout>
  );
}

