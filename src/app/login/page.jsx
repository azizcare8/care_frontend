"use client";
import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import NavBar from "@/components/NavBar";
import useAuthStore from "@/store/authStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading, initializeAuth, _hasHydrated } = useAuthStore();
  const redirectUrl = searchParams.get('redirect');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auth on mount (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    init();
  }, [initializeAuth, isMounted]);

  // Handle redirect after mount and auth check (client-side only)
  useEffect(() => {
    if (!isMounted || !_hasHydrated) return;

    if (isAuthenticated && user && !isLoading) {
      setShouldRedirect(true);
      const timer = setTimeout(() => {
        if (redirectUrl) {
          // Ignore old role-specific dashboard routes
          const isOldDashboardRoute = redirectUrl.match(/^\/(partner|donor|fundraiser|volunteer|vendor|staff)\/dashboard/);
          if (isOldDashboardRoute) {
            // Redirect to new /dashboard route instead
            const userRole = user?.role;
            const destination = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
            router.replace(destination);
          } else {
            router.replace(redirectUrl);
          }
        } else {
          const userRole = user?.role;
          if (!userRole) {
            console.error('User role not found, cannot redirect');
            return;
          }
          // Admin goes to admin dashboard, others go to /dashboard
          const destination = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
          console.log('Login page redirecting to:', destination, 'for role:', userRole);
          router.replace(destination);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShouldRedirect(false);
    }
  }, [isAuthenticated, user, isLoading, router, redirectUrl, isMounted, _hasHydrated]);

  // Always render the same structure on server and client
  // Only show redirect overlay after mount if authenticated (client-side only)
  return (
    <div className="min-h-screen bg-gray-50">
      {isMounted && shouldRedirect && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      )}
      <NavBar />
      <div className="pt-20 lg:pt-32 pb-8">
        <AuthForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
