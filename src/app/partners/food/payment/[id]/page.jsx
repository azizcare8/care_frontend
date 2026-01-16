"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { partnerService } from "@/services/partnerService";
import { paymentService } from "@/services/paymentService";
import { couponService } from "@/services/couponService";
import { generateCouponPDF } from "@/utils/pdfGenerator";
import toast from "react-hot-toast";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaArrowLeft, FaStore, FaCreditCard, FaLock, FaCheckCircle, FaRupeeSign, FaCopy, FaQrcode, FaGift, FaEye, FaTrash, FaDownload } from "react-icons/fa";
import useAuthStore from "@/store/authStore";

export default function FoodPaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [partner, setPartner] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('dummy');
  const [amount, setAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCoupons, setGeneratedCoupons] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [viewCoupon, setViewCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to proceed with payment");
      router.push(`/login?redirect=/partners/food/payment/${id}`);
      return;
    }

    // Load consultation data from session storage
    const storedData = sessionStorage.getItem('foodConsultationData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setConsultationData(data);
        // Set default amount to 0, user will enter their own price
        setAmount(data.amount || 1);
      } catch (error) {
        console.error("Failed to parse consultation data:", error);
        toast.error("Consultation data not found. Please fill the form again.");
        router.push(`/partners/food/consult/${id}`);
      }
    } else {
      toast.error("No consultation data found. Please fill the form first.");
      router.push(`/partners/food/consult/${id}`);
    }

    // Load partner details
    const fetchPartner = async () => {
      try {
        setIsLoading(true);
        const response = await partnerService.getPartner(id);
        setPartner(response.data || response);
      } catch (error) {
        console.error("Failed to fetch partner:", error);
        toast.error("Failed to load partner details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPartner();
    }
  }, [id, isAuthenticated, router]);

  const getFullAddress = (partner) => {
    if (typeof partner?.address === 'object' && partner?.address) {
      return `${partner.address.street || ''}, ${partner.address.city || ''}, ${partner.address.state || ''} ${partner.address.pincode || ''}`.trim();
    }
    return partner?.address || 'Address not available';
  };

  const getImageUrl = (partner) => {
    if (partner?.images && partner.images.length > 0) {
      const primaryImage = partner.images.find(img => img.isPrimary) || partner.images[0];
      if (primaryImage?.url) {
        if (primaryImage.url.startsWith('http://') || primaryImage.url.startsWith('https://')) {
          return primaryImage.url;
        }
        const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${backendBaseURL}${primaryImage.url.startsWith('/') ? '' : '/'}${primaryImage.url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);

      // Before payment: Clean up old coupons - keep only last 10, delete rest
      try {
        const userCouponsResponse = await couponService.getMyCoupons({ limit: 100, status: 'active' });
        // Handle different response structures
        const allUserCoupons = Array.isArray(userCouponsResponse) 
          ? userCouponsResponse 
          : (userCouponsResponse?.data || []);
        
        if (allUserCoupons.length > 10) {
          // Sort by creation date (newest first)
          const sortedCoupons = allUserCoupons.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.validity?.startDate || 0);
            const dateB = new Date(b.createdAt || b.validity?.startDate || 0);
            return dateB - dateA;
          });
          
          // Keep last 10, delete the rest
          const couponsToDelete = sortedCoupons.slice(10);
          
          // Delete old coupons in parallel
          const deletePromises = couponsToDelete.map(coupon => {
            if (!coupon || !coupon._id) return Promise.resolve(null);
            return couponService.deleteCoupon(coupon._id).catch(err => {
              // Extract error message properly
              let errorMsg = 'Unknown error';
              if (err?.message) {
                errorMsg = err.message;
              } else if (err?.response?.data?.message) {
                errorMsg = err.response.data.message;
              } else if (err?.response?.data) {
                errorMsg = typeof err.response.data === 'string' 
                  ? err.response.data 
                  : JSON.stringify(err.response.data);
              } else if (typeof err === 'string') {
                errorMsg = err;
              }
              
              // Only log if it's not a "cannot delete redeemed coupon" error (expected)
              if (!errorMsg.includes('redeemed') && 
                  !errorMsg.includes('Cannot delete') && 
                  !errorMsg.includes('permission')) {
                console.warn(`Failed to delete coupon ${coupon._id}:`, errorMsg);
              }
              // Don't show toast for cleanup errors, just log
              return null; // Continue even if one fails
            });
          });
          
          await Promise.all(deletePromises);
          console.log(`Cleaned up ${couponsToDelete.length} old coupons, kept last 10`);
        }
      } catch (cleanupError) {
        // Log error details for debugging
        console.error('Error cleaning up old coupons:', {
          message: cleanupError?.message || 'Unknown error',
          response: cleanupError?.response?.data,
          error: cleanupError
        });
        // Continue with payment even if cleanup fails
      }

      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load Razorpay. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay is not available. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await paymentService.createRazorpayOrder({
        amount: amount, // Amount in rupees (backend will convert to paise)
        currency: 'INR',
        partnerId: partner?._id,
        consultationId: consultationData?.submittedAt
      });

      if (!orderResponse || !orderResponse.data || !orderResponse.data.orderId) {
        const errorMsg = orderResponse?.message || 'Failed to create payment order. Please try again.';
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.orderId,
        name: 'Care Foundation',
        description: `Consultation with ${partner?.name || 'Food Partner'}`,
        // Only include image if not on localhost HTTP (to avoid mixed content error)
        ...(typeof window !== 'undefined' && 
            (window.location.hostname !== 'localhost' || window.location.protocol === 'https:') && 
            { image: `${window.location.protocol}//${window.location.host}/logo.webp` }),
        handler: async function (response) {
          try {
            setIsProcessing(true);
            
            // Verify payment
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              partnerId: partner?._id,
              amount: amount,
              consultationData: consultationData
            });

            // Generate coupon after successful payment
            try {
              // Get food coupon packages
              const packages = await couponService.getPackages();
              const foodPackage = packages.find(pkg => pkg.category?.toLowerCase() === 'food');
              
              if (foodPackage) {
                // Get quantity from consultation data or default to 1
                const quantity = consultationData.quantity || 1;
                
                // Generate ONE coupon with multiple uses
                const couponResponse = await couponService.purchaseCoupons({
                  packageId: foodPackage.id,
                  quantity: quantity, // Number of uses for the coupon
                  partnerId: partner?._id,
                  beneficiaryName: consultationData.name,
                  beneficiaryPhone: consultationData.phone,
                  beneficiaryEmail: consultationData.email,
                  assignBeneficiary: true,
                  paymentReferences: {
                    gateway: 'razorpay',
                    transactionId: response.razorpay_payment_id,
                    gatewayId: response.razorpay_payment_id,
                    gatewayDetails: verifyResponse.data,
                    amount: amount
                  }
                });

                // Handle single coupon response (new format) or array (backward compatibility)
                const coupon = couponResponse.data?.coupon || couponResponse.data?.coupons?.[0];
                setGeneratedCoupons(coupon ? [coupon] : []);
                setPaymentSuccess(true);
                setTransactionId(response.razorpay_payment_id);
                
                toast.success(`Payment successful! Coupon created with ${quantity} uses available.`);
              } else {
                // If no food package found, create coupon manually with payment amount
                const couponData = {
                  title: `Food Coupon - ${partner?.name}`,
                  description: consultationData.message || `Food consultation with ${partner?.name} - Payment: ₹${amount}`,
                  category: 'food',
                  type: 'discount',
                  value: {
                    amount: amount,
                    currency: 'INR',
                    isPercentage: false
                  },
                  partner: partner?._id,
                  beneficiary: {
                    name: consultationData.name,
                    phone: consultationData.phone,
                    email: consultationData.email
                  },
                  validity: {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                    isActive: true
                  },
                  paymentReferences: {
                    gateway: 'razorpay',
                    transactionId: response.razorpay_payment_id,
                    amount: amount
                  },
                  status: 'active'
                };

                const couponResponse = await couponService.createCoupon(couponData);
                setGeneratedCoupons([couponResponse.data]);
                setPaymentSuccess(true);
                setTransactionId(response.razorpay_payment_id);
                toast.success('Payment successful! Coupon generated.');
              }
            } catch (couponError) {
              console.error('Coupon generation error:', couponError);
              toast.error('Payment successful but coupon generation failed. Please contact support.');
            }

            setIsProcessing(false);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || consultationData?.name || '',
          email: user?.email || consultationData?.email || '',
          contact: user?.phone || consultationData?.phone || ''
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
        toast.error(`Payment failed: ${errorMsg}`);
        setIsProcessing(false);
      });
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
      setIsProcessing(false);
    }
  };

  const handleDummyPayment = async () => {
    try {
      setIsProcessing(true);

      if (amount <= 0) {
        toast.error('Please enter a valid amount');
        setIsProcessing(false);
        return;
      }

      // Before payment: Clean up old coupons - keep only last 10, delete rest
      if (isAuthenticated && user) {
        try {
          const userCouponsResponse = await couponService.getMyCoupons({ limit: 100, status: 'active' });
          // Handle different response structures
          const allUserCoupons = Array.isArray(userCouponsResponse) 
            ? userCouponsResponse 
            : (userCouponsResponse?.data || []);
          
          if (Array.isArray(allUserCoupons) && allUserCoupons.length > 10) {
            // Sort by creation date (newest first)
            const sortedCoupons = allUserCoupons
              .filter(coupon => coupon && coupon._id) // Filter out invalid coupons
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.validity?.startDate || 0);
                const dateB = new Date(b.createdAt || b.validity?.startDate || 0);
                return dateB - dateA;
              });
            
            // Keep last 10, delete the rest
            const couponsToDelete = sortedCoupons.slice(10);
            
            if (couponsToDelete.length > 0) {
              // Delete old coupons in parallel
              const deletePromises = couponsToDelete.map(coupon => {
                if (!coupon || !coupon._id) return Promise.resolve(null);
                return couponService.deleteCoupon(coupon._id).catch(err => {
                  console.warn(`Failed to delete coupon ${coupon._id}:`, err?.message || err);
                  return null; // Continue even if one fails
                });
              });
              
              await Promise.all(deletePromises);
              console.log(`Cleaned up ${couponsToDelete.length} old coupons, kept last 10`);
            }
          }
        } catch (cleanupError) {
          // Log error details for debugging but don't block payment
          // Handle empty error objects
          if (cleanupError && typeof cleanupError === 'object') {
            const errorMessage = cleanupError?.message 
              || cleanupError?.response?.data?.message 
              || cleanupError?.response?.statusText
              || (Object.keys(cleanupError).length > 0 ? JSON.stringify(cleanupError) : 'API call failed');
            if (errorMessage && errorMessage !== '{}') {
              console.warn('Could not clean up old coupons (continuing with payment):', errorMessage);
            }
          } else if (cleanupError) {
            console.warn('Could not clean up old coupons (continuing with payment):', cleanupError);
          }
          // Continue with payment even if cleanup fails
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate transaction ID
      const transactionId = `FOOD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Generate coupon after successful payment
      try {
        // Get food coupon packages
        const packages = await couponService.getPackages();
        const foodPackage = packages.find(pkg => pkg.category?.toLowerCase() === 'food');
        
        if (foodPackage) {
          // Get quantity from consultation data or default to 1
          const quantity = consultationData.quantity || 1;
          
          // Generate ONE coupon with multiple uses
          const couponResponse = await couponService.purchaseCoupons({
            packageId: foodPackage.id,
            quantity: quantity, // Number of uses for the coupon
            partnerId: partner?._id,
            beneficiaryName: consultationData.name,
            beneficiaryPhone: consultationData.phone,
            beneficiaryEmail: consultationData.email,
            assignBeneficiary: true,
            paymentReferences: {
              gateway: 'dummy',
              transactionId: transactionId,
              gatewayId: transactionId,
              amount: amount
            }
          });

          // Handle single coupon response (new format) or array (backward compatibility)
          const coupon = couponResponse.data?.coupon || couponResponse.data?.coupons?.[0];
          setGeneratedCoupons(coupon ? [coupon] : []);
          setPaymentSuccess(true);
          setTransactionId(transactionId);
          
          toast.success(`Payment successful! Coupon created with ${quantity} uses available.`);
        } else {
          // If no food package found, create coupon manually with payment amount
          const couponData = {
            title: `Food Coupon - ${partner?.name}`,
            description: consultationData.message || `Food consultation with ${partner?.name} - Payment: ₹${amount}`,
            category: 'food',
            type: 'discount',
            value: {
              amount: amount,
              currency: 'INR',
              isPercentage: false
            },
            partner: partner?._id,
            beneficiary: {
              name: consultationData.name,
              phone: consultationData.phone,
              email: consultationData.email
            },
            validity: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
              isActive: true
            },
            paymentReferences: {
              gateway: 'dummy',
              transactionId: transactionId,
              amount: amount
            },
            status: 'active'
          };

          const couponResponse = await couponService.createCoupon(couponData);
          setGeneratedCoupons([couponResponse.data]);
          setPaymentSuccess(true);
          setTransactionId(transactionId);
          toast.success('Payment successful! Coupon generated.');
        }
      } catch (couponError) {
        console.error('Coupon generation error:', couponError);
        toast.error('Payment successful but coupon generation failed. Please contact support.');
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Dummy payment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Demo payment failed. Please try again.';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'dummy') {
      handleDummyPayment();
    } else if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      toast.error('Selected payment method is not available yet');
    }
  };

  if (isLoading || !consultationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner not found</h2>
            <button
              onClick={() => router.back()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to convert phone to WhatsApp link
  const getWhatsAppLink = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'N/A') {
      return 'https://wa.me/919136521052'; // Default to organization number
    }
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // If it starts with 91, use as is, otherwise add 91 prefix
    const whatsappNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    return `https://wa.me/${whatsappNumber}`;
  };

  const address = getFullAddress(partner);
  const imageUrl = getImageUrl(partner);
  const phone = partner.phone || partner.contactPerson?.phone || 'N/A';
  const email = partner.email || partner.contactPerson?.email || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 pt-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft />
          Back to Consultation Form
        </motion.button>

        <div className={`grid grid-cols-1 ${paymentSuccess ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
          {/* Order Summary */}
          <div className={paymentSuccess ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment</h1>
              <p className="text-gray-600 mb-8">Complete your consultation request by making a payment</p>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partner:</span>
                    <span className="font-semibold text-gray-800">{partner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-800">{consultationData.quantity}</span>
                  </div>
                  {consultationData.date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Date:</span>
                      <span className="font-semibold text-gray-800">{new Date(consultationData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {consultationData.time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Time:</span>
                      <span className="font-semibold text-gray-800">{consultationData.time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaRupeeSign className="text-orange-600" />
                  Enter Amount
                </h2>
                <div className="space-y-3">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full pl-10 pr-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg font-semibold"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-600">Minimum amount: ₹1</p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>
                <div className="space-y-3">
                  {/* Dummy Payment - For Testing */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-yellow-50"
                         style={{ borderColor: paymentMethod === 'dummy' ? '#f97316' : '#fbbf24' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="dummy"
                      checked={paymentMethod === 'dummy'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🧪 Demo Payment (Test Mode)</div>
                      <div className="text-sm text-gray-600">Instant payment for testing - No payment gateway required</div>
                    </div>
                    <div className="text-2xl">🧪</div>
                  </label>

                  {/* Razorpay */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                         style={{ borderColor: paymentMethod === 'razorpay' ? '#f97316' : '#e5e7eb' }}>
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
                </div>
              </div>

              {/* Payment Button */}
              <motion.button
                onClick={handlePayment}
                disabled={isProcessing || amount <= 0}
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="text-xl" />
                    Pay ₹{amount}
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                <FaLock className="text-xs" />
                Secure payment powered by Razorpay
              </p>
            </motion.div>

            {/* Generated Coupons Section - Full Screen */}
            {paymentSuccess && generatedCoupons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200 w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-3 rounded-full">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                      <p className="text-gray-600">
                        {generatedCoupons.length > 0 && generatedCoupons[0]?.usage?.maxUses > 1
                          ? `Coupon created! This coupon can be used ${generatedCoupons[0].usage.maxUses} times.`
                          : `Your coupon has been generated`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                </div>

                {/* Coupons Table - Full Width */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-green-300 overflow-hidden w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gradient-to-r from-green-500 to-emerald-600 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">S.No</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Coupon Code</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Title</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Description</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Value</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Valid Until</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase whitespace-nowrap">Transaction ID</th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const indexOfLastEntry = currentPage * entriesPerPage;
                          const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
                          const currentCoupons = generatedCoupons.slice(indexOfFirstEntry, indexOfLastEntry);
                          const totalPages = Math.ceil(generatedCoupons.length / entriesPerPage);

                          return currentCoupons.map((coupon, index) => {
                            const couponValue = typeof coupon.value === 'object' && coupon.value?.amount 
                              ? coupon.value.amount 
                              : (typeof coupon.value === 'number' ? coupon.value : amount);
                            
                            return (
                              <tr
                                key={coupon._id || index}
                                className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                              >
                                <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                                  {indexOfFirstEntry + index + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900 text-sm">{coupon.code || 'N/A'}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(coupon.code || '');
                                        toast.success('Coupon code copied!');
                                      }}
                                      className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                      title="Copy code"
                                    >
                                      <FaCopy size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-gray-800 text-sm">
                                    {coupon.title || `Food Coupon ${indexOfFirstEntry + index + 1}`}
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="text-xs text-gray-600 line-clamp-2">
                                    {coupon.description || `Coupon for ${partner?.name}`}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-green-600 text-lg">₹{couponValue}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                  {coupon.validity?.endDate 
                                    ? new Date(coupon.validity.endDate).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })
                                    : '90 days from now'}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs whitespace-nowrap">
                                    {coupon.status === 'active' ? 'Active' : coupon.status || 'Active'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-mono text-xs text-gray-600 break-all">{transactionId || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setViewCoupon(coupon)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="View Details"
                                    >
                                      <FaEye size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        try {
                                          generateCouponPDF(coupon);
                                          toast.success('Coupon PDF downloaded successfully!');
                                        } catch (error) {
                                          console.error('PDF generation error:', error);
                                          toast.error('Failed to generate PDF');
                                        }
                                      }}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Download PDF"
                                    >
                                      <FaDownload size={16} />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this coupon?')) {
                                          try {
                                            await couponService.deleteCoupon(coupon._id);
                                            setGeneratedCoupons(prev => prev.filter(c => c._id !== coupon._id));
                                            toast.success('Coupon deleted successfully');
                                            // Reset to first page if current page becomes empty
                                            const totalPages = Math.ceil((generatedCoupons.length - 1) / entriesPerPage);
                                            if (currentPage > totalPages && totalPages > 0) {
                                              setCurrentPage(totalPages);
                                            } else if (generatedCoupons.length === 1) {
                                              setCurrentPage(1);
                                            }
                                          } catch (error) {
                                            console.error('Delete coupon error:', error);
                                            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete coupon';
                                            toast.error(errorMessage);
                                          }
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Coupon"
                                    >
                                      <FaTrash size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {(() => {
                    const totalPages = Math.ceil(generatedCoupons.length / entriesPerPage);
                    const indexOfLastEntry = currentPage * entriesPerPage;
                    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

                    return (
                      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing <span className="font-semibold">{indexOfFirstEntry + 1}</span> to{' '}
                          <span className="font-semibold">{Math.min(indexOfLastEntry, generatedCoupons.length)}</span> of{' '}
                          <span className="font-semibold">{generatedCoupons.length}</span> coupons
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 10) {
                                pageNum = i + 1;
                              } else if (currentPage <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 4) {
                                pageNum = totalPages - 9 + i;
                              } else {
                                pageNum = currentPage - 4 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* View Coupon Modal */}
                {viewCoupon && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Coupon Details</h3>
                        <button
                          onClick={() => setViewCoupon(null)}
                          className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Coupon Code</label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={viewCoupon.code || 'N/A'}
                                readOnly
                                className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono font-bold text-lg text-gray-800"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(viewCoupon.code || '');
                                  toast.success('Coupon code copied!');
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                              >
                                <FaCopy />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Value</label>
                            <div className="mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-bold text-lg text-green-600">
                              ₹{typeof viewCoupon.value === 'object' && viewCoupon.value?.amount 
                                ? viewCoupon.value.amount 
                                : (typeof viewCoupon.value === 'number' ? viewCoupon.value : amount)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 font-semibold uppercase">Title</label>
                          <div className="mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-semibold">
                            {viewCoupon.title || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 font-semibold uppercase">Description</label>
                          <div className="mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            {viewCoupon.description || 'N/A'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Valid Until</label>
                            <div className="mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                              {viewCoupon.validity?.endDate 
                                ? new Date(viewCoupon.validity.endDate).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : '90 days from now'}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Status</label>
                            <div className="mt-1">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                                {viewCoupon.status === 'active' ? 'Active' : viewCoupon.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {viewCoupon.qrCode?.url && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                            <label className="text-xs text-gray-500 font-semibold uppercase block mb-2">
                              <FaQrcode className="inline mr-1" />
                              QR Code
                            </label>
                            <Image
                              src={viewCoupon.qrCode.url}
                              alt="Coupon QR Code"
                              width={200}
                              height={200}
                              className="mx-auto rounded-lg"
                            />
                          </div>
                        )}

                        {transactionId && (
                          <div>
                            <label className="text-xs text-gray-500 font-semibold uppercase">Transaction ID</label>
                            <div className="mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono text-sm">
                              {transactionId}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setViewCoupon(null)}
                          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please save your coupon codes. You can use them at {partner?.name} to redeem your order.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Partner Info Card - Hide when payment is successful */}
          {!paymentSuccess && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 sticky top-24"
              >
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-orange-200">
                  <Image
                    src={imageUrl}
                    alt={partner.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop';
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{partner.name}</h2>
                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <FaStore className="inline mr-2" />
                  Food Partner
                </span>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaPhone className="text-orange-500" />
                  <a href={getWhatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">{phone}</a>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FaEnvelope className="text-orange-500" />
                  <a href={`mailto:${email}`} className="hover:text-orange-600 text-sm break-all">{email}</a>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-orange-500 mt-1" />
                  <span className="text-sm">{address}</span>
                </div>
              </div>
            </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

