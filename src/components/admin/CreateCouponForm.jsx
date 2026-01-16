"use client";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { adminService } from "@/services/adminService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  'food_server',
  'restaurant',
  'food_grain_supplier',
  'pathology_lab',
  'hospital',
  'milk_bread_vendor',
  'food',
  'medical',
  'education',
  'transport',
  'clothing',
  'other'
];

const TYPES = ['discount', 'cashback', 'free_item', 'service'];

export default function CreateCouponForm({ onSuccess, onCancel }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food_server',
    type: 'discount',
    partner: '', // Add partner field
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
      maxUses: '',
      isUnlimited: false
    },
    deliveryMethod: {
      whatsapp: true,
      email: true,
      sms: true
    },
    terms: '',
    conditions: {
      minPurchase: '',
      applicableTo: 'all'
    }
  });

  // Fetch partners on component mount
  useEffect(() => {
    const fetchPartners = async () => {
      setLoadingPartners(true);
      try {
        const response = await adminService.getAllPartners({ limit: 100, status: 'approved' });
        setPartners(response.data || response.partners || []);
      } catch (error) {
        console.error('Failed to load partners:', error);
        // Don't show error toast, just log it
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
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
        // For free_item and service types, amount is used as description
        valueData.amount = formData.value.amount;
        valueData.currency = 'INR';
      }

      const couponData = {
        ...formData,
        partner: formData.partner || undefined, // Include partner if selected
        value: valueData,
        usage: {
          maxUses: formData.usage.isUnlimited ? null : parseInt(formData.usage.maxUses),
          isUnlimited: formData.usage.isUnlimited
        },
        validity: {
          startDate: new Date(formData.validity.startDate),
          endDate: new Date(formData.validity.endDate),
          isActive: true
        }
      };

      const response = await couponService.createCoupon(couponData);
      
      toast.success('Coupon created successfully!');
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        router.push('/admin/coupons');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create coupon');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-900"
              placeholder="e.g., Free Meal Coupon"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-900"
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                {TYPES.map(type => (
                  <option key={type} value={type} className="text-gray-900">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Partner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner (Optional)
            </label>
            <select
              name="partner"
              value={formData.partner}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              <option value="" className="text-gray-900">Select Partner (Optional)</option>
              {loadingPartners ? (
                <option value="" className="text-gray-900">Loading partners...</option>
              ) : (
                partners.map(partner => (
                  <option key={partner._id} value={partner._id} className="text-gray-900">
                    {partner.name} {partner.businessType ? `(${partner.businessType})` : ''}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a partner to assign this coupon. You can also assign later when sending the coupon.
            </p>
          </div>
        </div>

        {/* Value */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Coupon Value</h3>
          
          {(formData.type === 'discount' || formData.type === 'cashback') ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="value.amount"
                  value={formData.value.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-900"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage (Optional)
                </label>
                <input
                  type="number"
                  name="value.percentage"
                  value={formData.value.percentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-900"
                  placeholder="e.g., 20"
                />
              </div>
            </div>
          ) : formData.type === 'free_item' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Item Description *
              </label>
              <input
                type="text"
                name="value.amount"
                value={formData.value.amount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Free Bread"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Description *
              </label>
              <input
                type="text"
                name="value.amount"
                value={formData.value.amount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Free Health Checkup"
              />
            </div>
          )}
        </div>

        {/* Validity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Validity Period</h3>
          
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

        {/* Usage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Usage Limits</h3>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="usage.isUnlimited"
              checked={formData.usage.isUnlimited}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Unlimited Uses
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
                required={!formData.usage.isUnlimited}
                min="1"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 100"
              />
            </div>
          )}
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Delivery Methods</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deliveryMethod.whatsapp"
                checked={formData.deliveryMethod.whatsapp}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">WhatsApp</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deliveryMethod.email"
                checked={formData.deliveryMethod.email}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">Email</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deliveryMethod.sms"
                checked={formData.deliveryMethod.sms}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">SMS</label>
            </div>
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
            rows="4"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Terms and conditions for this coupon..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Coupon'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
  );
}

