import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

/**
 * Custom hook to protect admin routes
 * PROPERLY waits for user data before redirecting
 */
export function useAdminAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated, getCurrentUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const checkAuth = async () => {
      // Wait for store hydration
      if (!_hasHydrated) {
        return;
      }

      // If store is loading, wait
      if (isLoading) {
        return;
      }

      // If authenticated but no user data, fetch it
      if (isAuthenticated && !user) {
        try {
          await getCurrentUser();
        } catch (error) {
          // Don't redirect immediately - might be network error
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            router.replace('/login?redirect=/admin');
            setIsChecking(false);
          }
          return;
        }
      }

      // Now we have complete data, check role
      if (!isAuthenticated) {
        const timer = setTimeout(() => {
          router.replace('/login?redirect=/admin');
          setIsChecking(false);
        }, 500);
        return () => clearTimeout(timer);
      }

      if (user) {
        if (user.role !== 'admin') {
          router.replace('/dashboard');
          setIsChecking(false);
          return;
        }
        // User is admin, allow rendering
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, user, _hasHydrated, router, getCurrentUser]);

  const canRender = !isLoading && !isChecking && isAuthenticated && user && user.role === 'admin';

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isChecking,
    isAdmin: user?.role === 'admin',
    canRender
  };
}

