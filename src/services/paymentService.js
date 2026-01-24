import api from '../utils/api';

// Payment Service
export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await api.post('/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentId, paymentData) => {
    try {
      const response = await api.post(`/payments/verify/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    try {
      const response = await api.get('/payments/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refund payment
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Razorpay methods
  createRazorpayOrder: async (orderData) => {
    try {
      const response = await api.post('/payments/razorpay/create-order', orderData);
      return response.data;
    } catch (error) {
      // Extract proper error message with better handling
      let errorMessage = 'Failed to create Razorpay order';
      
      // Handle 401 Unauthorized errors specifically
      if (error?.response?.status === 401) {
        const errorData = error.response.data;
        const backendMessage = errorData?.message || errorData?.error || error.message;
        
        // Check if this is an authentication error that shouldn't happen for guest donations
        if (backendMessage?.includes('No token provided') || backendMessage?.includes('Access denied')) {
          errorMessage = 'Payment gateway authentication error. This route should allow guest donations. Please contact support if this issue persists.';
          console.error('⚠️ Payment Route Error: The backend is requiring authentication for a route that should allow guest donations.');
          console.error('This suggests the production backend may be using "protect" middleware instead of "optionalAuth".');
          console.error('Please verify that the route uses optionalAuth middleware in production.');
        } else {
          errorMessage = backendMessage || 'Authentication failed. Please try again.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else {
          // Try to stringify if it's an object
          try {
            const stringified = JSON.stringify(errorData);
            if (stringified !== '{}' && stringified !== 'null') {
              errorMessage = stringified;
            }
          } catch {
            // Keep default message
          }
        }
      }
      
      // Create enhanced error with all original error info
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.statusCode = error.response?.status;
      enhancedError.code = error?.code;
      enhancedError.name = error?.name || 'PaymentError';
      
      // Preserve original error details for debugging
      if (error.response?.data) {
        enhancedError.responseData = error.response.data;
      }
      
      throw enhancedError;
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/razorpay/verify', paymentData);
      return response.data;
    } catch (error) {
      // Extract proper error message with better handling
      let errorMessage = 'Failed to verify Razorpay payment';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else {
          // Try to stringify if it's an object
          try {
            const stringified = JSON.stringify(errorData);
            if (stringified !== '{}' && stringified !== 'null') {
              errorMessage = stringified;
            }
          } catch {
            // Keep default message
          }
        }
      }
      
      // Create enhanced error with all original error info
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.statusCode = error.response?.status;
      enhancedError.code = error?.code;
      enhancedError.name = error?.name || 'PaymentVerificationError';
      
      // Preserve original error details for debugging
      if (error.response?.data) {
        enhancedError.responseData = error.response.data;
      }
      
      throw enhancedError;
    }
  },

  // Stripe methods
  createStripeIntent: async (intentData) => {
    try {
      const response = await api.post('/payments/stripe/create-intent', intentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  confirmStripePayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/stripe/confirm', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPI methods
  processUPIPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/upi/process', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // CouponSystem-style payment methods
  // Create payment intent/order (for coupon purchase)
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/create', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify payment (for coupon purchase)
  verifyPayment: async (paymentId, paymentData = {}) => {
    try {
      const response = await api.post('/payments/verify', {
        paymentId,
        ...paymentData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};








