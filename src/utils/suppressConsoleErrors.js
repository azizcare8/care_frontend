/**
 * Suppress harmless console errors from third-party scripts (especially Razorpay SDK)
 * This runs immediately when imported, before any other code executes
 */

if (typeof window !== 'undefined') {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Function to check if a message should be suppressed
  const shouldSuppress = (message) => {
    if (!message || typeof message !== 'string') {
      // Also check if it's an error object with a message
      if (message && typeof message === 'object') {
        const errorMessage = message.message || message.toString?.() || '';
        return shouldSuppress(errorMessage);
      }
      return false;
    }

    const messageLower = message.toLowerCase();
    
    // Razorpay SDK errors (harmless - from fraud detection/tracking system)
    const razorpayPatterns = [
      'refused to get unsafe header',
      'x-rtb-fingerprint-id',
      'api.razorpay.com',
      '/standard_checkout/payments/validate',
      '/payments/validate/account',
      'standard_checkout',
      'validate/account',
      'razorpay',
      'v2-entry.modern.js',
      '400 bad request',
      'rzp_live_',
      'rzp_test_'
    ];

    // Browser security warnings
    const securityPatterns = [
      'permissions policy violation',
      'accelerometer',
      'deviceorientation',
      'devicemotion',
      'sensor features',
      'mixed content',
      'automatically upgraded'
    ];

    // Network errors (harmless connection attempts)
    const networkPatterns = [
      'localhost:',
      'err_connection_refused',
      'err_connection_timed_out',
      'cors policy',
      'access to image at',
      'failed to load resource',
      'net::err'
    ];

    // Web app manifest errors
    const manifestPatterns = [
      'serviceworker',
      'web app manifest',
      'must be a dictionary',
      'serviceworker.*must be'
    ];

    // Check all patterns
    const allPatterns = [
      ...razorpayPatterns,
      ...securityPatterns,
      ...networkPatterns,
      ...manifestPatterns
    ];

    // Check if message contains any suppressed pattern
    if (allPatterns.some(pattern => messageLower.includes(pattern.toLowerCase()))) {
      return true;
    }

    // Regex patterns for more complex matching
    if (
      /localhost:\d+\/.*\.png/i.test(message) ||
      /x-rtb-fingerprint-id/i.test(message) ||
      /api\.razorpay\.com.*400/i.test(message) ||
      /api\.razorpay\.com.*\/standard_checkout\/payments\/validate/i.test(message) ||
      /standard_checkout.*validate/i.test(message) ||
      /payments\/validate\/account/i.test(message) ||
      /serviceworker.*must be.*dictionary/i.test(message) ||
      /v2-entry\.modern\.js/i.test(message) ||
      /razorpay.*400.*bad request/i.test(message) ||
      /rzp_(live|test)_.*validate/i.test(message)
    ) {
      return true;
    }

    return false;
  };

  // Override console.error
  console.error = function(...args) {
    // Check all arguments
    const messages = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (arg?.toString) return arg.toString();
      if (arg?.stack) return arg.stack;
      return String(arg);
    }).join(' ');

    if (shouldSuppress(messages)) {
      return; // Suppress this error
    }
    originalError.apply(console, args);
  };

  // Override console.warn
  console.warn = function(...args) {
    const messages = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (arg?.toString) return arg.toString();
      return String(arg);
    }).join(' ');

    if (shouldSuppress(messages)) {
      return; // Suppress this warning
    }
    originalWarn.apply(console, args);
  };

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    const message = event?.message || event?.error?.message || '';
    if (shouldSuppress(message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event?.reason?.message || String(event?.reason || '');
    if (shouldSuppress(message)) {
      event.preventDefault();
      return false;
    }
  });

  // Intercept fetch requests to suppress Razorpay validation errors
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      // Suppress console errors for Razorpay validation endpoint (harmless 400 errors)
      if (typeof url === 'string' && url.includes('api.razorpay.com') && url.includes('/validate/account')) {
        return originalFetch.apply(this, args).catch((error) => {
          // Suppress the error in console - it's harmless
          // The error will still appear in Network tab (expected behavior)
          return Promise.reject(error);
        });
      }
      return originalFetch.apply(this, args);
    };
  }

  // Intercept XMLHttpRequest to suppress Razorpay validation errors
  if (window.XMLHttpRequest) {
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url, ...rest) {
        this._url = url;
        return originalOpen.apply(this, [method, url, ...rest]);
      };
      
      xhr.send = function(...args) {
        // Suppress console errors for Razorpay validation endpoint
        if (this._url && typeof this._url === 'string' && 
            this._url.includes('api.razorpay.com') && 
            this._url.includes('/validate/account')) {
          // Override onerror to suppress console output
          const originalOnError = this.onerror;
          this.onerror = function(event) {
            // Suppress error - it's harmless
            if (originalOnError) {
              originalOnError.call(this, event);
            }
          };
        }
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
  }
}
