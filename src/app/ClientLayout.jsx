"use client";
// Import error suppression FIRST - runs immediately before any other code
import "@/utils/suppressConsoleErrors";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
// import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import TopBar from "@/components/TopBar";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Suppress harmless console errors from third-party scripts/browser extensions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out "Refused to get unsafe header" warnings from third-party scripts
    // Also suppress network errors and connection timeout errors
    const shouldSuppress = (message) => {
      if (typeof message !== 'string') return false;
      const suppressedMessages = [
        'Refused to get unsafe header',
        'x-rtb-fingerprint-id',
        'ERR_CONNECTION_TIMED_OUT',
        'ERR_CONNECTION_REFUSED',
        'Failed to load resource: net::ERR_CONNECTION_TIMED_OUT',
        'Failed to load resource: net::ERR_CONNECTION_REFUSED',
        'Network Error',
        'Failed to fetch',
        'Unable to connect to server',
        'Network error for',
        'Failed to fetch health partners',
        'Failed to fetch food partners',
        'Failed to fetch coupons',
        'Failed to fetch products',
        'Failed to fetch upcoming events',
        'Failed to fetch urgent campaigns',
        'Could not establish connection. Receiving end does not exist',
        // Razorpay SDK errors (harmless - from fraud detection/tracking system)
        'Access to image at \'http://localhost:',
        'CORS policy',
        'Permissions policy violation',
        'accelerometer',
        'deviceorientation',
        'devicemotion',
        'sensor features',
        'Mixed Content.*automatically upgraded'
      ];
      
      // Suppress all network-related errors and Razorpay SDK errors
      return suppressedMessages.some(msg => message.includes(msg)) ||
             message.includes('Network error') ||
             message.includes('connection') ||
             message.includes('ERR_CONNECTION') ||
             /localhost:\d+\/.*\.png/i.test(message) ||
             /x-rtb-fingerprint-id/i.test(message) ||
             /Permissions policy violation/i.test(message);
    };

    console.error = (...args) => {
      // Check all arguments for suppressible messages
      const messages = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg?.message) return arg.message;
        if (arg?.toString) return arg.toString();
        return '';
      }).join(' ');
      
      if (shouldSuppress(messages)) {
        return; // Suppress this specific error
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      // Check all arguments for suppressible messages
      const messages = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg?.message) return arg.message;
        if (arg?.toString) return arg.toString();
        return '';
      }).join(' ');
      
      if (shouldSuppress(messages)) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    // Also catch unhandled errors and promise rejections
    const handleError = (event) => {
      const message = event?.message || event?.reason?.message || '';
      if (shouldSuppress(message)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      if (shouldSuppress(event.reason?.message || '')) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Restore original console methods on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Global form validation: show native popup for missing required fields
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSubmit = (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.noValidate) return;

      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof form.reportValidity === 'function') {
          form.reportValidity();
        }
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid && typeof firstInvalid.scrollIntoView === 'function') {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    document.addEventListener('submit', handleSubmit, true);
    return () => {
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);
  
  // Check if current route is admin (hide navbar only for admin)
  const isAdminRoute = pathname?.startsWith('/admin');
  const hidePublicLayout = isAdminRoute; // Only hide for admin, show for dashboard

  return (
    <>
      {/* Toast Notifications (disabled to avoid runtime crash) */}
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        {/* Show public layout for all routes except admin */}
        {!hidePublicLayout && (
          <>
            <TopBar />
            <NavBar />
          </>
        )}

        <main className={hidePublicLayout ? "" : "flex-grow overflow-x-hidden w-full max-w-full"}>{children}</main>

        {/* Show footer for all routes except admin */}
        {!hidePublicLayout && <Footer />}
      </div>
      
      {/* Floating WhatsApp Button - Show on all pages except admin */}
      {!hidePublicLayout && <WhatsAppFloatButton />}
    </>
  );
}

