"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import useAuthStore from '@/store/authStore';
import toast, { showToastOnce } from '@/utils/toast';
import { paymentService } from '@/services/paymentService';
import { couponService } from '@/services/couponService';
import { generateCouponPDF } from '@/utils/pdfGenerator';
import Image from 'next/image';
import { BiImage } from 'react-icons/bi';
import { FaCheckCircle, FaCopy, FaDownload } from 'react-icons/fa';
import { FiEye, FiTrash2 } from 'react-icons/fi';

export default function DonateProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [hasCheckedData, setHasCheckedData] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [generatedCoupons, setGeneratedCoupons] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [viewCoupon, setViewCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

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
    // Load Razorpay script on component mount
    loadRazorpayScript().catch((error) => {
      console.error('Failed to load Razorpay:', error);
      toast.error('Failed to load payment gateway. Please refresh the page.');
    });
  }, []);

  useEffect(() => {
    // Prevent multiple executions
    if (hasCheckedData) return;

    if (!isAuthenticated || !user) {
      showToastOnce('Please login to make a donation', 'error', { id: 'login-required-donation' });
      router.push(`/login?redirect=/donate-product/${params.id}`);
      setHasCheckedData(true);
      return;
    }

    // Get donation data from session storage
    const pending = sessionStorage.getItem('pendingProductDonation');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setDonationData(data);
        fetchProduct();
        setHasCheckedData(true);
      } catch (error) {
        console.error('Failed to parse donation data:', error);
        showToastOnce('Invalid donation data', 'error', { id: 'invalid-donation-data-product' });
        router.push(`/products/${params.id}`);
        setHasCheckedData(true);
      }
    } else {
      showToastOnce('No donation data found', 'error', { id: 'no-donation-data-product' });
      router.push(`/products/${params.id}`);
      setHasCheckedData(true);
    }
  }, [params.id, isAuthenticated, user, router, hasCheckedData]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/products/${params.id}`);
      if (response.data.success && response.data.data) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!donationData || !product) {
      toast.error('Donation information is missing');
      return;
    }

    setIsProcessing(true);

    try {
      const amount = donationData.amount;

      // Validate amount
      if (!amount || amount < 1) {
        toast.error('Minimum donation amount is 1');
        setIsProcessing(false);
        return;
      }

      // Check if Razorpay is loaded
      if (!razorpayLoaded) {
        await loadRazorpayScript();
      }

      if (typeof window.Razorpay !== 'function') {
        console.error('window.Razorpay is not a function:', typeof window.Razorpay, window.Razorpay);
        toast.error('Razorpay payment gateway is not properly initialized. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      // Initialize Razorpay payment
      // Note: Backend expects amount in rupees (it will convert to paise)
      // No campaignId for product donations - it's a general donation
      const response = await paymentService.createRazorpayOrder({
        amount: amount, // Send amount in rupees (backend will convert to paise)
        currency: 'INR',
        receipt: `PRODUCT-DONATION-${Date.now()}`
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
        description: `Product Donation: ${product.name} - ${amount}`,
        order_id: response.data.orderId,
        handler: async (razorpayResponse) => {
          try {
            // Prepare product message for donation
            const productMessage = `Product Donation: ${product.name}${donationData.quantity ? ` (Quantity: ${donationData.quantity} ${product.unit || 'items'})` : ''}${donationData.message ? `\n\nMessage: ${donationData.message}` : ''}`;

            // Verify payment
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              amount: amount, // Send amount for product donations
              isAnonymous: donationData.isAnonymous || false,
              message: productMessage
              // No campaignId for product donations - it's a general donation
            });

            // Check success - verifyResponse is already response.data from the service
            if (verifyResponse && verifyResponse.status === 'success' && verifyResponse.success) {
              // Backend already created the donation during verification
              // Now generate coupons after successful payment
              try {
                // Clean up old coupons - keep only last 10
                try {
                  const userCouponsResponse = await couponService.getMyCoupons({ limit: 100, status: 'active' });
                  const allUserCoupons = Array.isArray(userCouponsResponse) 
                    ? userCouponsResponse 
                    : (userCouponsResponse?.data || []);
                  
                  if (allUserCoupons.length > 10) {
                    const sortedCoupons = allUserCoupons.sort((a, b) => {
                      const dateA = new Date(a.createdAt || a.validity?.startDate || 0);
                      const dateB = new Date(b.createdAt || b.validity?.startDate || 0);
                      return dateB - dateA;
                    });
                    
                    const couponsToDelete = sortedCoupons.slice(10);
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
                          const errorData = err.response.data;
                          if (typeof errorData === 'string') {
                            errorMsg = errorData;
                          } else if (errorData?.error) {
                            errorMsg = errorData.error;
                          } else {
                            try {
                              const stringified = JSON.stringify(errorData);
                              if (stringified !== '{}' && stringified !== 'null') {
                                errorMsg = stringified;
                              }
                            } catch (e) {
                              errorMsg = `Error status: ${err.response?.status || 'Unknown'}`;
                            }
                          }
                        } else if (typeof err === 'string') {
                          errorMsg = err;
                        } else if (err?.code) {
                          errorMsg = `Error code: ${err.code}`;
                        }
                        
                        // Only log if it's not a "cannot delete redeemed coupon" error (expected)
                        if (!errorMsg.includes('redeemed') && 
                            !errorMsg.includes('Cannot delete') && 
                            !errorMsg.includes('permission') &&
                            !errorMsg.includes('not found')) {
                          console.warn(`Failed to delete coupon ${coupon._id}: ${errorMsg}`);
                        }
                        return null;
                      });
                    });
                    
                    await Promise.all(deletePromises);
                  }
                } catch (cleanupError) {
                  console.warn('Could not clean up old coupons:', cleanupError);
                }

                // Get coupon packages
                const packages = await couponService.getPackages();
                const generalPackage = packages.find(pkg => 
                  pkg.category?.toLowerCase() === 'food' || 
                  pkg.id?.includes('FOOD')
                );
                
                if (generalPackage) {
                  const couponResponse = await couponService.purchaseCoupons({
                    packageId: generalPackage.id,
                    quantity: 1,
                    beneficiaryName: user?.name || '',
                    beneficiaryPhone: user?.phone || '',
                    beneficiaryEmail: user?.email || '',
                    assignBeneficiary: true,
                    paymentReferences: {
                      gateway: 'razorpay',
                      transactionId: razorpayResponse.razorpay_payment_id,
                      gatewayId: razorpayResponse.razorpay_order_id,
                      gatewayDetails: verifyResponse.data,
                      amount: amount
                    }
                  });

                  // Handle different response structures
                  let coupons = [];
                  if (Array.isArray(couponResponse.data?.coupons)) {
                    coupons = couponResponse.data.coupons;
                  } else if (Array.isArray(couponResponse.data)) {
                    coupons = couponResponse.data;
                  } else if (couponResponse.data?.coupon) {
                    coupons = [couponResponse.data.coupon];
                  } else if (couponResponse.coupons) {
                    coupons = Array.isArray(couponResponse.coupons) ? couponResponse.coupons : [couponResponse.coupons];
                  }
                  
                  if (coupons.length > 0) {
                    setGeneratedCoupons(coupons);
                    setPaymentSuccess(true);
                    setTransactionId(razorpayResponse.razorpay_payment_id);
                    toast.success(`Payment successful! ${coupons.length} coupon(s) generated.`);
                    
                    // Clear session storage
                    sessionStorage.removeItem('pendingProductDonation');
                  } else {
                    console.warn('No coupons in response:', couponResponse);
                    toast.error('Payment successful but no coupons were generated. Please contact support.');
                    setPaymentSuccess(true);
                    setTransactionId(razorpayResponse.razorpay_payment_id);
                    
                    // Clear session storage
                    sessionStorage.removeItem('pendingProductDonation');
                  }
                } else {
                  // If no package found, create coupon manually with payment amount
                  const couponData = {
                    title: `Product Donation Coupon - ${amount}`,
                    description: productMessage || `Thank you for your product donation of ${amount}`,
                    category: 'food',
                    type: 'discount',
                    value: {
                      amount: amount,
                      currency: 'INR',
                      isPercentage: false
                    },
                    beneficiary: {
                      name: user?.name || '',
                      phone: user?.phone || '',
                      email: user?.email || ''
                    },
                    validity: {
                      startDate: new Date(),
                      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                      isActive: true
                    },
                    paymentReferences: {
                      gateway: 'razorpay',
                      transactionId: razorpayResponse.razorpay_payment_id,
                      amount: amount
                    },
                    status: 'active'
                  };

                  const couponResponse = await couponService.createCoupon(couponData);
                  
                  // Handle different response structures
                  let coupon = null;
                  if (couponResponse.data) {
                    coupon = couponResponse.data;
                  } else if (couponResponse.coupon) {
                    coupon = couponResponse.coupon;
                  } else {
                    coupon = couponResponse;
                  }
                  
                  if (coupon) {
                    setGeneratedCoupons([coupon]);
                    setPaymentSuccess(true);
                    setTransactionId(razorpayResponse.razorpay_payment_id);
                    toast.success('Payment successful! Coupon generated.');
                    
                    // Clear session storage
                    sessionStorage.removeItem('pendingProductDonation');
                  } else {
                    console.warn('No coupon in response:', couponResponse);
                    toast.error('Payment successful but coupon generation failed. Please contact support.');
                    setPaymentSuccess(true);
                    setTransactionId(razorpayResponse.razorpay_payment_id);
                    
                    // Clear session storage
                    sessionStorage.removeItem('pendingProductDonation');
                  }
                }
              } catch (couponError) {
                console.error('Coupon generation error:', couponError);
                const couponErrorMsg = couponError?.message || couponError?.response?.data?.message || 'Payment successful but coupon generation failed. Please contact support.';
                toast.warning(couponErrorMsg);
                
                // Payment was successful, so still clear session and show success
                setPaymentSuccess(true);
                setTransactionId(razorpayResponse.razorpay_payment_id);
                sessionStorage.removeItem('pendingProductDonation');
              }
            } else {
              throw new Error(verifyResponse?.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMsg = error?.message || error?.response?.data?.message || 'Payment verification failed. Please contact support.';
            toast.error(errorMsg);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error?.message || error?.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (!donationData || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation Information Not Found</h2>
          <button
            onClick={() => router.push(`/products/${params.id}`)}
            className="text-green-600 hover:text-green-700"
          >
            Go back to product page
          </button>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentCoupons = generatedCoupons.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(generatedCoupons.length / entriesPerPage);

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(couponId);
        setGeneratedCoupons(prev => prev.filter(c => c._id !== couponId));
        toast.success('Coupon deleted successfully');
        const newTotalPages = Math.ceil((generatedCoupons.length - 1) / entriesPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (generatedCoupons.length === 1) {
          setCurrentPage(1);
        }
      } catch (error) {
        const errorMsg = error?.message || error?.response?.data?.message || 'Failed to delete coupon';
        toast.error(errorMsg);
      }
    }
  };

  // Show coupon display if payment successful
  if (paymentSuccess && generatedCoupons.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className={`max-w-${generatedCoupons.length > 0 ? '7xl' : '2xl'} mx-auto`}>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200 w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-3 rounded-full">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                  <p className="text-gray-600">Your coupons have been generated ({generatedCoupons.length} total)</p>
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

            {/* Coupons Table */}
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
                      <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCoupons.map((coupon, index) => {
                      const couponValue = typeof coupon.value === 'object' && coupon.value?.amount 
                        ? coupon.value.amount 
                        : (typeof coupon.value === 'number' ? coupon.value : donationData.amount);
                      
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
                              {coupon.title || `Product Donation Coupon ${indexOfFirstEntry + index + 1}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {coupon.description || `Thank you for your product donation`}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-green-600 text-lg">{couponValue}</span>
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
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewCoupon(coupon)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FiEye size={16} />
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
                                onClick={() => handleDeleteCoupon(coupon._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Coupon"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, generatedCoupons.length)} of {generatedCoupons.length} coupons
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Coupon Modal */}
            {viewCoupon && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Coupon Details</h3>
                      <button
                        onClick={() => setViewCoupon(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Coupon Code</label>
                        <p className="text-lg font-mono font-bold text-gray-900">{viewCoupon.code || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Title</label>
                        <p className="text-gray-900">{viewCoupon.title || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Description</label>
                        <p className="text-gray-900">{viewCoupon.description || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Value</label>
                        <p className="text-lg font-bold text-green-600">
                          {typeof viewCoupon.value === 'object' && viewCoupon.value?.amount 
                            ? viewCoupon.value.amount 
                            : (typeof viewCoupon.value === 'number' ? viewCoupon.value : donationData.amount)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Valid Until</label>
                        <p className="text-gray-900">
                          {viewCoupon.validity?.endDate 
                            ? new Date(viewCoupon.validity.endDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '90 days from now'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Status</label>
                        <p className="text-gray-900">{viewCoupon.status || 'Active'}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => {
                          try {
                            generateCouponPDF(viewCoupon);
                            toast.success('Coupon PDF downloaded successfully!');
                          } catch (error) {
                            console.error('PDF generation error:', error);
                            toast.error('Failed to generate PDF');
                          }
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => setViewCoupon(null)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to Products Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/products')}
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
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
                <p className="text-sm text-gray-600">Donating for</p>
                <p className="text-lg font-semibold text-gray-900">{product.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-green-600">{donationData.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Product Image */}
          {product.image?.url && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={product.image.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Donation Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Donation Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Donor Name:</span>
                <span className="font-semibold">{donationData.isAnonymous ? 'Anonymous' : user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              {donationData.quantity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{donationData.quantity} {product.unit || 'items'}</span>
                </div>
              )}
              {donationData.itemsCanBuy > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Items this donation can buy:</span>
                  <span className="font-semibold text-green-600">{donationData.itemsCanBuy} {product.unit || 'items'}</span>
                </div>
              )}
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
              <label className="flex items-center p-4 border-2 border-green-500 rounded-lg cursor-pointer hover:border-green-600 transition-colors bg-green-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold text-gray-900">Razorpay</div>
                  <div className="text-sm text-gray-600">Credit/Debit Card, Net Banking, UPI, Wallets</div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ${donationData.amount.toLocaleString()}`}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
