"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useCampaignStore from '@/store/campaignStore';
import useAuthStore from '@/store/authStore';
import { paymentService } from '@/services/paymentService';
import { donationService } from '@/services/donationService';
import toast, { showToastOnce } from '@/utils/toast';
import { FaCheckCircle } from 'react-icons/fa';

export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const { currentCampaign: campaign, getCampaign } = useCampaignStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [donationData, setDonationData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('dummy'); // Default to dummy payment for testing
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [hasCheckedData, setHasCheckedData] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasCheckedData) return;

    // Load campaign
    const loadCampaign = async () => {
      if (params.id) {
        try {
          await getCampaign(params.id);
        } catch (error) {
          console.error('Failed to load campaign:', error);
          showToastOnce('Failed to load campaign', 'error', { id: 'load-campaign-error' });
        }
      }
    };

    loadCampaign();

    // Get donation data from session storage
    const pending = sessionStorage.getItem('pendingDonation');
    if (pending) {
      try {
        setDonationData(JSON.parse(pending));
        setHasCheckedData(true);
      } catch (error) {
        console.error('Failed to parse donation data:', error);
        showToastOnce('Invalid donation data', 'error', { id: 'invalid-donation-data' });
        router.push('/campaigns');
        setHasCheckedData(true);
      }
    } else {
      showToastOnce('No donation data found', 'error', { id: 'no-donation-data' });
      router.push(`/campaigns/${params.id}`);
      setHasCheckedData(true);
    }
  }, [params.id, isAuthenticated, user, getCampaign, router, hasCheckedData]);


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadStripeScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);

      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load Razorpay. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Check if Razorpay is available
      if (!window.Razorpay) {
        toast.error('Razorpay is not available. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      // Validate donation data
      if (!donationData || !donationData.amount || !donationData.campaignId) {
        toast.error('Invalid donation data. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await paymentService.createRazorpayOrder({
        amount: donationData.amount,
        campaignId: donationData.campaignId,
        currency: 'INR'
      });

      // Validate order response
      if (!orderResponse || !orderResponse.data || !orderResponse.data.orderId) {
        toast.error('Failed to create payment order. Please try again.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: 'Care Foundation',
        description: campaign?.title || 'Donation',
        // Only include image if not on localhost HTTP (to avoid mixed content error)
        ...(typeof window !== 'undefined' && 
            (window.location.hostname !== 'localhost' || window.location.protocol === 'https:') && 
            { image: `${window.location.protocol}//${window.location.host}/logo.webp` }),
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              campaignId: donationData.campaignId,
              amount: donationData.amount,
              isAnonymous: donationData.isAnonymous,
              message: donationData.message
            });

            // Clear session storage
            sessionStorage.removeItem('pendingDonation');

            // Payment successful - no coupon generation
            setPaymentSuccess(true);
            setTransactionId(response.razorpay_payment_id);
            toast.success('Donation successful! Thank you for your support.');
          } catch (error) {
            toast.error('Payment verification failed');
            if (error && (error.message || error.response)) {
              console.error('Payment verification error:', error.message || error.response?.data || error);
            }
          }
        },
        prefill: {
          name: donationData?.firstName
            ? `${donationData.firstName} ${donationData.lastName || ''}`.trim()
            : donationData?.donorDetails?.name || user?.name || '',
          email: donationData?.email || donationData?.donorDetails?.email || user?.email || '',
          contact: donationData?.phone || donationData?.donorDetails?.phone || user?.phone || ''
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      // Extract error message properly
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          try {
            const stringified = JSON.stringify(error.response.data);
            if (stringified !== '{}') {
              errorMessage = stringified;
            }
          } catch (e) {
            // Keep default message
          }
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.code) {
        errorMessage = `Error code: ${error.code}`;
      }
      
      console.error('Razorpay payment error:', errorMessage);
      console.error('Error details:', {
        message: errorMessage,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        hasResponse: !!error?.response,
        errorCode: error?.code,
        errorType: error?.name
      });
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);

      // Load Stripe
      const res = await loadStripeScript();
      if (!res) {
        toast.error('Failed to load Stripe. Please try again.');
        return;
      }

      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

      // Create payment intent
      const intentResponse = await paymentService.createStripeIntent({
        amount: donationData.amount,
        campaignId: donationData.campaignId,
        currency: 'inr'
      });

      const { error } = await stripe.confirmCardPayment(intentResponse.data.clientSecret, {
        payment_method: {
          card: {
            // This will open Stripe's hosted payment page
          },
          billing_details: {
            name: donationData?.firstName
              ? `${donationData.firstName} ${donationData.lastName || ''}`.trim()
              : donationData?.donorDetails?.name || user?.name || 'Guest Donor',
            email: donationData?.email || donationData?.donorDetails?.email || user?.email || ''
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Confirm payment on backend
        const confirmResponse = await paymentService.confirmStripePayment({
          paymentIntentId: intentResponse.data.paymentIntentId,
          campaignId: donationData.campaignId,
          amount: donationData.amount,
          isAnonymous: donationData.isAnonymous,
          message: donationData.message
        });

        // Payment successful - no coupon generation
        setPaymentSuccess(true);
        setTransactionId(intentResponse.data.paymentIntentId);
        
        sessionStorage.removeItem('pendingDonation');
        toast.success('Donation successful! Thank you for your support.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
      
      // Only log error if it has meaningful information
      if (error && (error.message || error.response || error.stack)) {
        console.error('Stripe payment error:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUPIPayment = async () => {
    try {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }

      setIsProcessing(true);

      const response = await paymentService.processUPIPayment({
        upiId: upiId,
        amount: donationData.amount,
        campaignId: donationData.campaignId,
        isAnonymous: donationData.isAnonymous,
        message: donationData.message
      });

      toast.success('UPI payment initiated. Please complete on your UPI app.');
      
      // Show UPI details
      alert(`Please pay ${donationData.amount} to UPI ID: ${response.data.upiId}\n\nTransaction ID: ${response.data.transactionId}`);

      // Payment successful - no coupon generation
      setPaymentSuccess(true);
      setTransactionId(response.data?.transactionId);
      
      router.push(`/campaigns/${donationData.campaignId}`);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'UPI payment failed';
      toast.error(errorMessage);
      
      // Only log error if it has meaningful information
      if (error && (error.message || error.response || error.stack)) {
        console.error('UPI payment error:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dummy/test payment (for testing without payment gateway)
  const handleDummyPayment = async () => {
    try {
      if (!donationData || !donationData.campaignId) {
        toast.error('Donation data is missing');
        return;
      }

      setIsProcessing(true);

      const donorName = donationData.firstName
        ? `${donationData.firstName} ${donationData.lastName || ''}`.trim()
        : donationData.donorDetails?.name || user?.name || 'Guest Donor';
      const donorEmail = donationData.email || donationData.donorDetails?.email || user?.email || '';
      const donorPhone = donationData.phone || donationData.donorDetails?.phone || user?.phone || '';

      // Create test donation directly
      const response = await donationService.createTestDonation({
        campaign: donationData.campaignId,
        amount: donationData.amount,
        isAnonymous: donationData.isAnonymous || false,
        message: donationData.message || '',
        donorDetails: {
          name: donorName,
          email: donorEmail,
          phone: donorPhone
        }
      });

      console.log('Test donation response:', response);

      const paymentDetails = response.data?.paymentDetails;
      
      // Payment successful - no coupon generation
      setPaymentSuccess(true);
      setTransactionId(paymentDetails?.transactionId || `TEST-${Date.now()}`);
      toast.success('🎉 Donation successful! Thank you for your support.');

      // Clear session storage
      sessionStorage.removeItem('pendingDonation');
    } catch (error) {
      console.error('Dummy payment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Dummy donation failed. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'dummy') {
      handleDummyPayment();
    } else if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (paymentMethod === 'stripe') {
      handleStripePayment();
    } else if (paymentMethod === 'upi') {
      handleUPIPayment();
    }
  };

  if (!donationData || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Donation</h1>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Donating to</p>
                <p className="text-lg font-semibold text-gray-900">{campaign.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-green-600">{donationData.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Donation Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Donation Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Donor Name:</span>
                <span className="font-semibold">
                  {donationData.isAnonymous
                    ? 'Anonymous'
                    : donationData.firstName
                      ? `${donationData.firstName} ${donationData.lastName || ''}`.trim()
                      : donationData.donorDetails?.name || user?.name || 'Guest Donor'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">
                  {donationData.email || donationData.donorDetails?.email || user?.email || '—'}
                </span>
              </div>
              {donationData.message && (
                <div>
                  <span className="text-gray-600">Message:</span>
                  <p className="text-gray-900 mt-1">{donationData.message}</p>
                </div>
              )}
            </div>
          </div>


          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>
            
            <div className="space-y-3">
              {/* Dummy Payment - For Testing */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-yellow-50"
                     style={{ borderColor: paymentMethod === 'dummy' ? '#10b981' : '#fbbf24' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="dummy"
                  checked={paymentMethod === 'dummy'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">🧪 Dummy Payment (Test Mode)</div>
                  <div className="text-sm text-gray-600">Instant donation for testing - No payment gateway required</div>
                </div>
                <div className="text-2xl">🧪</div>
              </label>

              {/* Razorpay */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: paymentMethod === 'razorpay' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Razorpay</div>
                  <div className="text-sm text-gray-600">Credit/Debit Card, Net Banking, UPI, Wallets</div>
                </div>
                <div className="text-2xl">💳</div>
              </label>

              {/* Stripe */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: paymentMethod === 'stripe' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Stripe</div>
                  <div className="text-sm text-gray-600">International Cards</div>
                </div>
                <div className="text-2xl">🌍</div>
              </label>

              {/* UPI */}
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: paymentMethod === 'upi' ? '#10b981' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">UPI</div>
                  <div className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</div>
                </div>
                <div className="text-2xl">📱</div>
              </label>
            </div>

            {/* UPI ID Input */}
            {paymentMethod === 'upi' && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${donationData.amount.toLocaleString()}`
            )}
          </button>

          {/* Security Notice */}
          {!paymentSuccess && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 Your payment is secure and encrypted. We never store your card details.
              </p>
            </div>
          )}

          {/* Payment Success Message */}
          {paymentSuccess && (
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border-2 border-green-200 relative">
              {/* Return to Dashboard Button - Top Right */}
              <button
                onClick={() => router.push(user?.role === 'admin' ? '/admin/dashboard' : user?.role ? '/dashboard' : '/login')}
                className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center gap-2 z-10"
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
                    <p className="text-sm text-gray-500 mb-6">Transaction ID: {transactionId}</p>
                  )}
                  {/* Return to Dashboard Button - Below Message */}
                  <button
                    onClick={() => router.push(user?.role === 'admin' ? '/admin/dashboard' : user?.role ? '/dashboard' : '/login')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <FaCheckCircle />
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






