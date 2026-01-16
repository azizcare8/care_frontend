"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { couponService } from '@/services/couponService';
import { paymentService } from '@/services/paymentService';
import toast from 'react-hot-toast';

function RedeemCouponContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load coupon code from URL if present
  useEffect(() => {
    const codeFromUrl = searchParams?.get('code');
    if (codeFromUrl) {
      setCouponCode(codeFromUrl.toUpperCase());
      // Auto-validate if code is in URL
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }, 500);
    }
  }, [searchParams]);

  const validateCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const code = couponCode.trim().toUpperCase();
      const response = await couponService.getCouponByCode(code);
      
      // Check response structure
      if (response && response.status === 'success' && response.data) {
        // Check if coupon is redeemable
        if (response.data.isRedeemable === false) {
          const reason = response.message || 'Coupon is expired or no longer valid';
          toast.error(reason);
          setCoupon(null);
          return;
        }
        
        setCoupon(response.data);
        // Payment amount is optional - don't auto-set it
        // User can manually enter payment amount if needed
        setPaymentAmount(0);  // Reset to 0 so payment is optional
        toast.success(response.message || 'Coupon is valid!');
      } else if (response && response.status === 'error') {
        // Backend returned error in response
        toast.error(response.message || 'Invalid coupon code');
        setCoupon(null);
      } else {
        toast.error('Invalid coupon code');
        setCoupon(null);
      }
    } catch (error) {
      // Handle error - service always throws structured error {status: 'error', message: '...'}
      let errorMessage = 'Invalid coupon code';
      
      if (error && typeof error === 'object') {
        if (error.status === 'error' && error.message) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      setCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to proceed with payment');
      router.push('/login?redirect=/redeem-coupon' + (couponCode ? `?code=${couponCode}` : ''));
      return;
    }

    if (!coupon) {
      toast.error('Please validate coupon first');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Please enter a valid payment amount (minimum ₹1)');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load Razorpay. Please try again.');
        setIsProcessingPayment(false);
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay is not available. Please refresh the page.');
        setIsProcessingPayment(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await paymentService.createRazorpayOrder({
        amount: amount,
        currency: 'INR',
        partnerId: coupon.partner?._id || coupon.partner,
        consultationId: coupon._id
      });

      if (!orderResponse || !orderResponse.data || !orderResponse.data.orderId) {
        const errorMsg = orderResponse?.message || 'Failed to create payment order. Please try again.';
        toast.error(errorMsg);
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount, // Amount in paise
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: 'Care Foundation',
        description: `Payment for ${coupon.title || 'Coupon Redemption'} - ₹${amount}`,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            
            // Verify payment
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              partnerId: coupon.partner?._id || coupon.partner,
              amount: amount,
              couponId: coupon._id
            });

            if (verifyResponse && verifyResponse.status === 'success') {
              // After successful payment, redeem the coupon
              try {
                const redeemResponse = await couponService.redeemCoupon(coupon._id, {
                  location,
                  notes,
                  paymentReference: {
                    gateway: 'razorpay',
                    transactionId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id
                  }
                });

                // Show remaining uses in success message
                const remainingUses = redeemResponse?.data?.remainingUses;
                const maxUses = redeemResponse?.data?.maxUses;
                
                if (remainingUses !== undefined && maxUses !== undefined) {
                  if (remainingUses === 'Unlimited') {
                    toast.success('Payment successful and coupon redeemed! Unlimited uses remaining.');
                  } else {
                    toast.success(`Payment successful and coupon redeemed! ${remainingUses} uses remaining out of ${maxUses} total.`);
                  }
                } else {
                  toast.success('Payment successful and coupon redeemed!');
                }
                
                // Refresh coupon data to show updated remaining uses
                if (couponCode) {
                  try {
                    const updatedResponse = await couponService.getCouponByCode(couponCode);
                    if (updatedResponse?.data) {
                      setCoupon(updatedResponse.data);  // Update with fresh data
                    }
                  } catch (refreshError) {
                    console.error('Failed to refresh coupon data:', refreshError);
                  }
                }
                
                // Reset form fields but keep coupon code visible
                // setCouponCode('');  // Keep coupon code visible
                setLocation('');
                setNotes('');
                setPaymentAmount(0);
                
                // Don't redirect immediately - let user see updated remaining uses
              } catch (redeemError) {
                toast.error('Payment successful but coupon redemption failed. Please contact support.');
                console.error('Coupon redemption error:', redeemError);
              }
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#9333ea' },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
        toast.error(`Payment failed: ${errorMsg}`);
        setIsProcessingPayment(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to process payment. Please try again.';
      toast.error(errorMsg);
      setIsProcessingPayment(false);
    }
  };

  const handleRedeem = async () => {
    if (!user) {
      toast.error('Please login to redeem coupon');
      router.push('/login?redirect=/redeem-coupon' + (couponCode ? `?code=${couponCode}` : ''));
      return;
    }

    if (!coupon) {
      toast.error('Please validate coupon first');
      return;
    }

    // If payment amount is set, directly trigger Razorpay payment
    if (paymentAmount > 0) {
      await handleRazorpayPayment();
      return;
    }

    setIsRedeeming(true);
    try {
      const redeemResponse = await couponService.redeemCoupon(coupon._id, {
        location,
        notes
      });

      // Show remaining uses in success message
      const remainingUses = redeemResponse?.data?.remainingUses;
      const maxUses = redeemResponse?.data?.maxUses;
      const usedCount = redeemResponse?.data?.usedCount;
      
      if (remainingUses !== undefined && maxUses !== undefined) {
        if (remainingUses === 'Unlimited') {
          toast.success('Coupon redeemed successfully! Unlimited uses remaining.');
        } else {
          toast.success(`Coupon redeemed successfully! ${remainingUses} uses remaining out of ${maxUses} total.`);
        }
      } else {
        toast.success('Coupon redeemed successfully!');
      }
      
      // Refresh coupon data to show updated remaining uses
      if (couponCode) {
        try {
          const updatedResponse = await couponService.getCouponByCode(couponCode);
          if (updatedResponse?.data) {
            setCoupon(updatedResponse.data);  // Update with fresh data showing new usedCount
          }
        } catch (refreshError) {
          console.error('Failed to refresh coupon data:', refreshError);
          // If refresh fails, still show success but don't update coupon
        }
      }
      
      // Reset form fields but keep coupon code visible so user can see updated status
      // setCouponCode('');  // Keep coupon code visible
      setLocation('');
      setNotes('');
      setPaymentAmount(0);  // Always reset payment amount
      
      // Don't redirect immediately - let user see updated remaining uses
      // User can manually navigate away or validate again to see updated count
    } catch (error) {
      toast.error(error.message || 'Failed to redeem coupon');
      console.error(error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Redeem Coupon</h1>
            <p className="text-xl text-gray-600">
              Enter your coupon code to redeem benefits
            </p>
          </div>

          {/* Coupon Validation Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={validateCoupon} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g., FOO12345ABC)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-mono"
                  disabled={isValidating}
                />
                <button
                  type="submit"
                  disabled={isValidating}
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </form>

            {/* Coupon Details */}
            {coupon && (
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{coupon.title}</h3>
                      <p className="text-purple-100 mt-1">{coupon.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {coupon.value?.isPercentage 
                          ? `${coupon.value.percentage}% OFF`
                          : `₹${coupon.value?.amount}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-3 font-mono text-center text-lg">
                    {coupon.code}
                  </div>
                </div>

                {/* Coupon Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">{coupon.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold text-gray-900">{coupon.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(coupon.validity?.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining Uses:</span>
                    <span className="font-semibold text-green-600">
                      {coupon.usage && !coupon.usage.isUnlimited 
                        ? `${coupon.usage.maxUses - (coupon.usage.usedCount || 0)} / ${coupon.usage.maxUses}`
                        : (coupon.remainingUses || 'Unlimited')}
                    </span>
                  </div>
                  {coupon.usage && coupon.usage.maxUses > 1 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Multi-use coupon:</strong> This coupon can be used {coupon.usage.maxUses} times. 
                        {coupon.usage.usedCount > 0 && ` ${coupon.usage.usedCount} time(s) already used.`}
                      </p>
                    </div>
                  )}
                  {coupon.partner && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Partner:</span>
                      <span className="font-semibold text-gray-900">{coupon.partner.name}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {coupon.description && (
                  <div className="mb-6">
                    <p className="text-gray-700">{coupon.description}</p>
                  </div>
                )}

                {/* QR Code */}
                {coupon.qrCode?.url && (
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Scan QR Code</p>
                    <img
                      src={coupon.qrCode.url}
                      alt="Coupon QR Code"
                      className="w-48 h-48 mx-auto border-4 border-purple-500 rounded-lg"
                    />
                  </div>
                )}

                {/* Terms & Conditions */}
                {coupon.terms && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-gray-700">{coupon.terms}</p>
                  </div>
                )}

                {/* Redemption Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location where redeeming"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                  </div>

                  {/* Payment Amount (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Amount (Optional) ₹
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter payment amount (e.g., 100)"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentAmount > 0 
                        ? `Payment of ₹${paymentAmount} will be processed via Razorpay when you click "Redeem Coupon"`
                        : 'Leave empty to redeem coupon without payment'}
                    </p>
                  </div>

                  <button
                    onClick={handleRedeem}
                    disabled={isRedeeming || isProcessingPayment}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </div>
                    ) : isRedeeming ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        Redeeming...
                      </div>
                    ) : paymentAmount > 0 ? (
                      `Redeem & Pay ₹${paymentAmount} via Razorpay`
                    ) : (
                      'Redeem Coupon'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">📌 How to Redeem:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter your coupon code above</li>
              <li>Verify the coupon details</li>
              <li>Click "Redeem Coupon" to use it</li>
              <li>Show the confirmation to the partner</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RedeemCouponPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <RedeemCouponContent />
    </Suspense>
  );
}







