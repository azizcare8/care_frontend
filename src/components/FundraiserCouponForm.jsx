"use client";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { campaignService } from "@/services/campaignService";
import toast from "react-hot-toast";
import { FiX, FiGift } from "react-icons/fi";

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' }
];

const TYPES = [
  { value: 'discount', label: 'Discount' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'free_item', label: 'Free Item' },
  { value: 'service', label: 'Service' }
];

export default function FundraiserCouponForm({ onSuccess, onCancel, campaignId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    type: 'discount',
    campaign: campaignId || '',
    beneficiary: {
      name: '',
      email: '',
      phone: ''
    },
    value: {
      amount: '',
      percentage: '',
      currency: 'INR'
    },
    validity: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true
    },
    usage: {
      maxUses: '1',
      isUnlimited: false
    },
    terms: ''
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns({ 
          limit: 100,
          status: 'active'
        });
        setCampaigns(response.data || []);
      } catch (error) {
        // Don't log 401 errors - they're expected if user is not authenticated
        // Only log other errors
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Failed to load campaigns:', error);
        }
        // Set empty array on error - form will still work without campaign list
        setCampaigns([]);
      }
    };
    fetchCampaigns();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('value.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        value: {
          ...prev.value,
          [field]: value
        }
      }));
    } else if (name.startsWith('beneficiary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare coupon data
      const valueData = {};
      if (formData.type === 'discount' || formData.type === 'cashback') {
        if (formData.value.percentage && formData.value.percentage !== '') {
          valueData.percentage = parseFloat(formData.value.percentage);
          valueData.isPercentage = true;
        } else {
          valueData.amount = parseFloat(formData.value.amount);
          valueData.isPercentage = false;
        }
        valueData.currency = 'INR';
      } else {
        valueData.amount = formData.value.amount;
        valueData.currency = 'INR';
      }

      const couponData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        value: valueData,
        campaign: formData.campaign || undefined,
        beneficiary: formData.beneficiary.name ? formData.beneficiary : undefined,
        validity: {
          startDate: new Date(formData.validity.startDate),
          endDate: new Date(formData.validity.endDate),
          isActive: true
        },
        usage: {
          maxUses: formData.usage.isUnlimited ? null : parseInt(formData.usage.maxUses),
          isUnlimited: formData.usage.isUnlimited
        },
        terms: formData.terms || undefined,
        isPublic: true
      };

      const response = await couponService.createCoupon(couponData);
      
      toast.success('Coupon created successfully!');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      // Extract error message properly
      let errorMessage = 'Failed to create coupon';
      
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
      }
      
      toast.error(errorMessage);
      
      // Only log error if it has meaningful information
      if (error && (error.message || error.response || error.stack)) {
        console.error('Coupon creation error:', {
          message: errorMessage,
          status: error?.response?.status,
          response: error?.response?.data,
          originalError: error
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiGift size={24} />
            Issue Coupon
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Free Meal for Beneficiary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the coupon..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Campaign (Optional)
            </label>
            <select
              name="campaign"
              value={formData.campaign}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Campaign (Optional)</option>
              {campaigns.map(campaign => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Coupon Value</h3>
            <div className="space-y-4">
              {(formData.type === 'discount' || formData.type === 'cashback') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="value.amount"
                      value={formData.value.amount}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="value.percentage"
                      value={formData.value.percentage}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>
              )}
              {(formData.type === 'free_item' || formData.type === 'service') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="value.amount"
                    value={formData.value.amount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Free Medical Checkup"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Beneficiary Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Beneficiary Information (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  name="beneficiary.name"
                  value={formData.beneficiary.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Beneficiary name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="beneficiary.email"
                    value={formData.beneficiary.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="beneficiary@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="beneficiary.phone"
                    value={formData.beneficiary.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Validity Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="validity.startDate"
                  value={formData.validity.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="validity.endDate"
                  value={formData.validity.endDate}
                  onChange={handleChange}
                  required
                  min={formData.validity.startDate}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Limits</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="usage.isUnlimited"
                  checked={formData.usage.isUnlimited}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Unlimited uses
                </label>
              </div>
              {!formData.usage.isUnlimited && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Uses *
                  </label>
                  <input
                    type="number"
                    name="usage.maxUses"
                    value={formData.usage.maxUses}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Terms and conditions..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

