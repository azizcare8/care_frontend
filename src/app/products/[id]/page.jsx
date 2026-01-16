"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { BiImage, BiChevronLeft, BiShareAlt } from 'react-icons/bi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const suggestedAmounts = [500, 1000, 2000, 5000];

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/products/${params.id}`);
      if (response.data.success && response.data.data) {
        setProduct(response.data.data);
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error(error.response?.data?.message || 'Product not found');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (platform) => {
    try {
      // Redirect to organization's social media accounts
      if (platform === 'facebook') {
        window.open('https://www.facebook.com/carefoundationtrustorg', '_blank');
      } else if (platform === 'twitter') {
        window.open('https://x.com/carefoundationm', '_blank');
      } else if (platform === 'whatsapp') {
        window.open('https://wa.me/919136521052', '_blank');
      } else if (platform === 'linkedin') {
        window.open('https://www.linkedin.com/in/care-foundation-trust-org', '_blank');
      }
    } catch (error) {
      toast.error('Failed to open social media page');
    }
  };

  const handleDonateClick = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to donate');
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }
    setShowDonationModal(true);
  };

  const handleDonation = async () => {
    if (!product || !product._id) {
      toast.error('Product information is missing. Please refresh the page.');
      return;
    }

    const amount = customAmount || selectedAmount;
    
    if (!amount || amount < 1) {
      toast.error('Minimum donation amount is ₹1');
      return;
    }

    // Calculate how many items this donation can buy
    const itemsCanBuy = product.price > 0 ? Math.floor(parseInt(amount) / product.price) : 0;

    // Store donation data
    const donationData = {
      productId: product._id,
      productName: product.name,
      amount: parseInt(amount),
      quantity: quantity,
      itemsCanBuy: itemsCanBuy,
      isAnonymous,
      message,
    };

    // Store in session storage for payment page
    sessionStorage.setItem('pendingProductDonation', JSON.stringify(donationData));
    
    // Redirect to payment/donation page
    // For now, we'll use a simple alert and could integrate with payment gateway later
    toast.success('Redirecting to payment...');
    router.push(`/donate-product/${product._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link href="/" className="text-green-600 hover:text-green-700">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = product.targetQuantity > 0
    ? Math.round((product.currentQuantity / product.targetQuantity) * 100)
    : 0;
  
  const remainingQuantity = Math.max(0, product.targetQuantity - product.currentQuantity);
  const itemsNeeded = remainingQuantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <BiChevronLeft className="text-2xl" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Product Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative h-96">
                {product.image?.url ? (
                  <Image
                    src={product.image.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <BiImage className="text-gray-400" size={64} />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                    Featured
                  </span>
                )}
                {product.category && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 mb-6 text-lg">
                {product.description}
              </p>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {product.currentQuantity || 0}
                  </div>
                  <div className="text-sm text-gray-600">Received</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {product.targetQuantity || 0}
                  </div>
                  <div className="text-sm text-gray-600">Target</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {itemsNeeded}
                  </div>
                  <div className="text-sm text-gray-600">Still Needed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Progress</span>
                  <span className="font-bold text-green-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{product.currentQuantity || 0} {product.unit || 'items'}</span>
                  <span>{product.targetQuantity || 0} {product.unit || 'items'}</span>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Price Info */}
              {product.price > 0 && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">Price per {product.unit || 'item'}</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Progress</span>
                  <span className="font-bold text-green-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{product.currentQuantity || 0}/{product.targetQuantity || 0}</span>
                  <span>{product.unit || 'items'}</span>
                </div>
              </div>

              {/* Donate Button */}
              <button
                onClick={handleDonateClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 mb-4"
              >
                Donate Now
              </button>

              {/* Share Buttons */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Share This Book</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook /> Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center gap-2 bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <FaTwitter /> Twitter
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center gap-2 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <FaLinkedin /> LinkedIn
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'out_of_stock'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status === 'active' ? 'Active' : 
                     product.status === 'out_of_stock' ? 'Out of Stock' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDonationModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Donate for {product.name}</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Quantity Selection */}
            {product.price > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (How many {product.unit || 'items'} do you want to donate?)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={remainingQuantity}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total: ₹{(product.price * quantity).toFixed(2)}
                </p>
              </div>
            )}

            {/* Suggested Amounts */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                      if (product.price > 0) {
                        setQuantity(Math.floor(amount / product.price) || 1);
                      }
                    }}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Or Enter Custom Amount
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount('');
                  if (product.price > 0 && e.target.value) {
                    setQuantity(Math.floor(parseInt(e.target.value) / product.price) || 1);
                  }
                }}
                placeholder="Enter amount (min ₹10)"
                min="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Donate anonymously</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDonation}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

