"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { paymentService } from "@/services/paymentService";
import { donationService } from "@/services/donationService";
import toast, { showToastOnce } from "@/utils/toast";
import { FaCreditCard, FaLock, FaCheckCircle } from "react-icons/fa";

export default function DonationPaymentPage() {
  const router = useRouter();
  const [donationData, setDonationData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('dummy');
  const [amount, setAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [hasCheckedData, setHasCheckedData] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is already available and is a constructor
      if (window.Razorpay && typeof window.Razorpay === 'function') {
        setRazorpayLoaded(true);
        resolve(true);
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        // Wait for script to load
        const checkRazorpay = setInterval(() => {
          if (window.Razorpay && typeof window.Razorpay === 'function') {
            clearInterval(checkRazorpay);
            setRazorpayLoaded(true);
            resolve(true);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkRazorpay);
          if (!window.Razorpay || typeof window.Razorpay !== 'function') {
            reject(new Error('Razorpay script loaded but constructor not available'));
          }
        }, 10000);

        existingScript.addEventListener('error', () => {
          clearInterval(checkRazorpay);
          reject(new Error('Failed to load Razorpay script'));
        });
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        // Wait a bit for Razorpay to be available
        const checkRazorpay = setInterval(() => {
          if (window.Razorpay && typeof window.Razorpay === 'function') {
            clearInterval(checkRazorpay);
            setRazorpayLoaded(true);
            resolve(true);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkRazorpay);
          if (!window.Razorpay || typeof window.Razorpay !== 'function') {
            reject(new Error('Razorpay script loaded but constructor not available'));
          }
        }, 10000);
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };

      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    // Prevent multiple executions
    if (hasCheckedData) return;

    // Load donation data from session storage
    const storedData = sessionStorage.getItem('donorInfo');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setDonationData(data);
        setAmount(data.amount || 1);
        setHasCheckedData(true);
      } catch (error) {
        console.error("Failed to parse donation data:", error);
        showToastOnce("Invalid donation data", "error", { id: "invalid-donation-data" });
        router.push("/donate");
        setHasCheckedData(true);
      }
    } else {
      showToastOnce("No donation data found", "error", { id: "no-donation-data" });
      router.push("/donate");
      setHasCheckedData(true);
    }
  }, [router, hasCheckedData]);

  const handleDummyPayment = async () => {
    if (!donationData || amount < 1) {
      toast.error("Invalid donation amount. Minimum is ₹1");
      return;
    }

    setIsProcessing(true);

    try {
      const transactionId = `DONATION-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Format address - convert string to object if needed
      let addressObj = null;
      if (donationData.address) {
        if (typeof donationData.address === 'string') {
          // If address is a string, try to parse it or store as street
          addressObj = {
            street: donationData.address,
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          };
        } else if (typeof donationData.address === 'object') {
          addressObj = donationData.address;
        }
      }

      // Create donation record (general donation, no specific campaign)
      const donationPayload = {
        amount: amount,
        paymentMethod: 'dummy',
        paymentDetails: {
          transactionId: transactionId,
          gateway: 'dummy',
          gatewayResponse: { test: true }
        },
        isAnonymous: false,
        donorDetails: {
          name: `${donationData.firstName} ${donationData.lastName || ''}`.trim(),
          email: donationData.email,
          phone: donationData.phone || '',
          ...(addressObj && { address: addressObj })
        },
        message: donationData.message || ''
        // Note: No campaign field - this is a general donation
      };

      console.log('Creating donation with payload:', donationPayload);
      const donationResponse = await donationService.createDonation(donationPayload);
      console.log('Donation response:', donationResponse);
      
      // Payment successful - no coupon generation
          setPaymentSuccess(true);
          setTransactionId(transactionId);
      toast.success('Payment successful! Thank you for your donation.');
      
      // Clear session storage
      sessionStorage.removeItem('donorInfo');
    } catch (error) {
      // Enhanced error logging
      console.error('Dummy payment error - Full error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      
      // Handle different error types
      let errorMessage = 'Payment failed. Please try again.';
      
      // Check for network errors
      if (error?.message === 'Failed to fetch' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to server. Please check if the backend server is running on http://localhost:5000';
      } 
      // Check for axios response errors
      else if (error?.response) {
        errorMessage = error.response.data?.message || error.response.statusText || `Server error: ${error.response.status}`;
        console.error('Response error:', error.response.data);
      }
      // Check for error object with message
      else if (error?.message) {
        errorMessage = error.message;
      }
      // Check if error is a string
      else if (typeof error === 'string') {
        errorMessage = error;
      }
      // Check for nested error objects
      else if (error?.error?.message) {
        errorMessage = error.error.message;
      }
      // Check for status field
      else if (error?.status === 'error' && error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      console.error('Error details:', {
        message: errorMessage,
        hasResponse: !!error?.response,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status,
        errorCode: error?.code,
        errorMessage: error?.message,
        fullError: error
      });
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!donationData || amount < 1) {
      toast.error("Invalid donation amount. Minimum is ₹1");
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script if not already loaded
      try {
        await loadRazorpayScript();
      } catch (scriptError) {
        console.error('Razorpay script loading error:', scriptError);
        toast.error('Failed to load Razorpay payment gateway. Please refresh the page and try again.');
        setIsProcessing(false);
        return;
      }

      // Double check if Razorpay is available and is a constructor
      if (!window.Razorpay) {
        toast.error('Razorpay is not available. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      if (typeof window.Razorpay !== 'function') {
        console.error('window.Razorpay is not a function:', typeof window.Razorpay, window.Razorpay);
        toast.error('Razorpay payment gateway is not properly initialized. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      // Initialize Razorpay payment
      // Note: Backend expects amount in rupees (it will convert to paise)
      // For general donations, we don't send campaignId or partnerId
      const response = await paymentService.createRazorpayOrder({
        amount: amount, // Send amount in rupees (backend will convert to paise)
        currency: 'INR',
        receipt: `DONATION-${Date.now()}`
      });

      // Validate response
      if (!response || !response.data || !response.data.orderId) {
        const errorMsg = response?.message || 'Failed to create payment order. Please try again.';
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: response.data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'Care Foundation Trust',
        description: `Donation of ₹${amount}`,
        order_id: response.data.orderId,
        handler: async (razorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              amount: amount, // Send amount for general donations
              isAnonymous: false,
              message: donationData.message || ''
              // Note: No campaignId for general donations
            });

            // Check success - verifyResponse is already response.data from the service
            if (verifyResponse?.success || verifyResponse?.status === 'success') {
              // Backend already created the donation during verification
              // Payment successful - no coupon generation
                    setPaymentSuccess(true);
                    setTransactionId(razorpayResponse.razorpay_payment_id);
              toast.success('Payment successful! Thank you for your donation.');
              
              // Clear session storage
              sessionStorage.removeItem('donorInfo');
            } else {
              // Payment verification failed - extract error from response
              let errorMessage = 'Payment verification failed. Please contact support.';
              
              // verifyResponse is already the data object, not nested in .data
              if (verifyResponse?.message) {
                errorMessage = verifyResponse.message;
              } else if (verifyResponse?.error?.message) {
                errorMessage = verifyResponse.error.message;
              } else if (verifyResponse?.error) {
                errorMessage = typeof verifyResponse.error === 'string' 
                  ? verifyResponse.error 
                  : verifyResponse.error.message || 'Payment verification failed';
              } else {
                // Try to extract any meaningful information
                try {
                  const stringified = JSON.stringify(verifyResponse);
                  if (stringified && stringified !== '{}' && stringified !== 'null') {
                    errorMessage = `Verification failed: ${stringified}`;
                  }
                } catch (e) {
                  // Keep default message
                }
              }
              
              console.error('Payment verification failed:', {
                message: errorMessage,
                verifyResponse: verifyResponse,
                responseStatus: verifyResponse?.status
              });
              
              toast.error(errorMessage);
              setIsProcessing(false);
            }
          } catch (error) {
            // Extract error message properly
            let errorMessage = 'Payment verification failed. Please contact support.';
            
            // Check error.responseData first (set by paymentService)
            if (error?.responseData) {
              const errorData = error.responseData;
              if (errorData?.message) {
                errorMessage = errorData.message;
              } else if (typeof errorData === 'string') {
                errorMessage = errorData;
              } else if (errorData?.error) {
                errorMessage = typeof errorData.error === 'string' 
                  ? errorData.error 
                  : errorData.error.message || errorMessage;
              } else if (errorData?.status === 'error' && errorData?.message) {
                errorMessage = errorData.message;
              } else {
                try {
                  const stringified = JSON.stringify(errorData);
                  if (stringified && stringified !== '{}' && stringified !== 'null') {
                    errorMessage = `Verification error: ${stringified}`;
                  }
                } catch (e) {
                  // Keep default message
                }
              }
            } else if (error?.message) {
              errorMessage = error.message;
            } else if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.response?.data) {
              const errorData = error.response.data;
              if (typeof errorData === 'string') {
                errorMessage = errorData;
              } else if (errorData?.message) {
                errorMessage = errorData.message;
              } else if (errorData?.error) {
                errorMessage = typeof errorData.error === 'string' 
                  ? errorData.error 
                  : errorData.error.message || errorMessage;
              } else if (errorData?.status === 'error' && errorData?.message) {
                errorMessage = errorData.message;
              } else {
                try {
                  const stringified = JSON.stringify(errorData);
                  if (stringified && stringified !== '{}' && stringified !== 'null') {
                    errorMessage = `Verification error: ${stringified}`;
                  } else {
                    errorMessage = error.response?.statusText || `Server error: ${error.response?.status || 'Unknown'}`;
                  }
                } catch (e) {
                  errorMessage = error.response?.statusText || `Server error: ${error.response?.status || 'Unknown'}`;
                }
              }
            } else if (typeof error === 'string') {
              errorMessage = error;
            } else if (error?.code) {
              errorMessage = `Verification error: ${error.code}`;
            }
            
            // Log error with full details
            console.error('Payment verification error:', {
              message: errorMessage,
              errorType: typeof error,
              hasResponse: !!error?.response,
              responseStatus: error?.response?.status,
              responseStatusText: error?.response?.statusText,
              responseData: error?.response?.data || error?.responseData,
              errorCode: error?.code,
              errorName: error?.name,
              originalError: error?.message || 'No error message'
            });
            
            toast.error(errorMessage);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${donationData.firstName} ${donationData.lastName || ''}`.trim(),
          email: donationData.email,
          contact: donationData.phone || ''
        },
        theme: {
          color: '#10b981'
        }
      };

      // Final check before instantiating Razorpay
      if (!window.Razorpay) {
        throw new Error('Razorpay is not loaded. Please refresh the page.');
      }

      if (typeof window.Razorpay !== 'function') {
        console.error('window.Razorpay type:', typeof window.Razorpay, window.Razorpay);
        throw new Error('Razorpay constructor is not available. Please refresh the page.');
      }

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response) => {
          console.error('Payment failed:', response);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        });
        razorpay.open();
      } catch (razorpayError) {
        console.error('Razorpay instantiation error:', razorpayError);
        throw new Error(`Failed to initialize Razorpay: ${razorpayError.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Extract error message properly with comprehensive error handling
      let errorMessage = 'Payment initialization failed. Please try again.';
      
      // Check for network errors first
      if (error?.message === 'Failed to fetch' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to server. Please check if the backend server is running on http://localhost:5000';
      } 
      // Check for axios response errors
      else if (error?.response) {
        const responseData = error.response.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.status === 'error' && responseData?.message) {
          errorMessage = responseData.message;
        } else {
          // Try to extract meaningful info from response
          try {
            const stringified = JSON.stringify(responseData);
            if (stringified && stringified !== '{}' && stringified !== 'null') {
              errorMessage = `Server error: ${stringified}`;
            } else {
              errorMessage = error.response.statusText || `Server error: ${error.response.status}`;
            }
          } catch (e) {
            errorMessage = error.response.statusText || `Server error: ${error.response.status}`;
          }
        }
      } 
      // Check for error object with message
      else if (error?.message) {
        errorMessage = error.message;
      } 
      // Check if error is a string
      else if (typeof error === 'string') {
        errorMessage = error;
      } 
      // Check for nested error objects
      else if (error?.error?.message) {
        errorMessage = error.error.message;
      } 
      // Check for status field
      else if (error?.status === 'error' && error?.message) {
        errorMessage = error.message;
      }
      // Check for error code
      else if (error?.code) {
        errorMessage = `Error code: ${error.code}`;
      }
      
      // Log error with full details - ensure all data is serializable
      const errorDetails = {
        message: errorMessage,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name || 'Unknown',
        hasMessage: !!error?.message,
        errorMessage: error?.message || 'No error message',
        hasResponse: !!error?.response,
        responseStatus: error?.response?.status || null,
        responseStatusText: error?.response?.statusText || null,
        errorCode: error?.code || null,
        errorName: error?.name || null,
        stack: error?.stack ? error.stack.substring(0, 500) : null
      };

      // Safely extract response data
      if (error?.response?.data) {
        try {
          const responseDataStr = JSON.stringify(error.response.data);
          errorDetails.responseData = responseDataStr !== '{}' ? responseDataStr : 'Empty response data';
          errorDetails.responseDataType = typeof error.response.data;
        } catch (e) {
          errorDetails.responseData = 'Could not serialize response data';
        }
      }

      console.error('Razorpay payment error:', errorMessage);
      console.error('Full error details:', errorDetails);
      
      // Also log the original error separately for debugging
      if (error) {
        console.error('Original error object:', {
          message: error.message,
          name: error.name,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          } : null
        });
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'dummy') {
      handleDummyPayment();
    } else if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    }
  };

  if (!donationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {paymentSuccess ? (
          // Show success message after payment
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border-2 border-green-200 relative">
            {/* Return to Dashboard Button - Top Right */}
                              <button
              onClick={() => router.push('/dashboard')}
              className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                              >
              <FaCheckCircle />
              Return to Dashboard
                              </button>
            
            <div className="flex items-center justify-center flex-col gap-4">
              <div className="bg-green-500 p-4 rounded-full">
                <FaCheckCircle className="text-white text-4xl" />
                  </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-4">Thank you for your generous donation.</p>
                {transactionId && (
                  <p className="text-sm text-gray-500">Transaction ID: {transactionId}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Show payment form if not successful
          <>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Donation</h1>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Donation Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Donor</p>
                  <p className="text-lg font-semibold text-gray-900">{donationData.firstName} {donationData.lastName || ''}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                {/* Demo Payment */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="dummy"
                    checked={paymentMethod === 'dummy'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500 text-xl" />
                      <div>
                        <p className="font-semibold text-gray-900">Demo Payment (Test Mode)</p>
                        <p className="text-sm text-gray-600">Instant payment for testing - No payment gateway required</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Razorpay */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FaCreditCard className="text-blue-500 text-xl" />
                      <div>
                        <p className="font-semibold text-gray-900">Razorpay</p>
                        <p className="text-sm text-gray-600">Credit/Debit Card, Net Banking, UPI, Wallets</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || amount < 1}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaLock />
                <span>Pay ₹{amount.toLocaleString()}</span>
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                <FaLock className="inline mr-1" />
                Secure payment powered by Razorpay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


