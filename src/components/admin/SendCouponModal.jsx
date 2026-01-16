"use client";
import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { adminService } from "@/services/adminService";
import toast from "react-hot-toast";
import { FaWhatsapp, FaEnvelope, FaSms } from "react-icons/fa";
import { BiUser, BiStore } from "react-icons/bi";

export default function SendCouponModal({ coupon, onClose, onSuccess }) {
  const [isSending, setIsSending] = useState(false);
  const [recipientType, setRecipientType] = useState('manual'); // 'manual', 'partner', 'beneficiary'
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [partners, setPartners] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [recipient, setRecipient] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [methods, setMethods] = useState({
    whatsapp: true,
    email: true,
    sms: true
  });

  // Fetch partners and beneficiaries on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch partners
      setLoadingPartners(true);
      try {
        const partnersRes = await adminService.getAllPartners({ 
          limit: 100, 
          status: 'approved' 
        });
        setPartners(partnersRes.data || partnersRes.partners || []);
      } catch (error) {
        console.error('Failed to load partners:', error);
      } finally {
        setLoadingPartners(false);
      }

      // Fetch beneficiaries
      setLoadingBeneficiaries(true);
      try {
        const beneficiariesRes = await adminService.getBeneficiaries({ 
          status: 'approved' 
        });
        setBeneficiaries(beneficiariesRes.data || beneficiariesRes.beneficiaries || []);
      } catch (error) {
        console.error('Failed to load beneficiaries:', error);
      } finally {
        setLoadingBeneficiaries(false);
      }
    };
    fetchData();
  }, []);

  // Handle partner selection
  const handlePartnerSelect = (partnerId) => {
    setSelectedPartnerId(partnerId);
    if (partnerId) {
      const partner = partners.find(p => p._id === partnerId);
      if (partner) {
        setRecipient({
          name: partner.name || '',
          email: partner.email || '',
          phone: partner.phone || ''
        });
        setSelectedBeneficiaryId(''); // Clear beneficiary selection
      }
    } else {
      setRecipient({ name: '', email: '', phone: '' });
    }
  };

  // Handle beneficiary selection
  const handleBeneficiarySelect = (beneficiaryId) => {
    setSelectedBeneficiaryId(beneficiaryId);
    if (beneficiaryId) {
      const beneficiary = beneficiaries.find(b => b._id === beneficiaryId);
      if (beneficiary) {
        setRecipient({
          name: beneficiary.name || '',
          email: beneficiary.email || '',
          phone: beneficiary.phone || ''
        });
        setSelectedPartnerId(''); // Clear partner selection
      }
    } else {
      setRecipient({ name: '', email: '', phone: '' });
    }
  };

  const handleSend = async () => {
    // Validation
    if (recipientType === 'partner' && !selectedPartnerId) {
      toast.error('Please select a partner');
      return;
    }

    if (recipientType === 'beneficiary' && !selectedBeneficiaryId) {
      toast.error('Please select a beneficiary');
      return;
    }

    if (recipientType === 'manual' && !recipient.name) {
      toast.error('Please enter recipient name');
      return;
    }

    if (!recipient.email && !recipient.phone) {
      toast.error('Please provide at least email or phone number');
      return;
    }

    if (methods.email && !recipient.email) {
      toast.error('Email is required for email delivery');
      return;
    }

    if ((methods.whatsapp || methods.sms) && !recipient.phone) {
      toast.error('Phone number is required for WhatsApp/SMS delivery');
      return;
    }

    setIsSending(true);
    try {
      // Include partnerId if partner is selected
      const sendData = {
        recipient,
        methods,
        ...(selectedPartnerId && { partnerId: selectedPartnerId })
      };

      await couponService.sendCoupon(coupon._id, sendData);
      toast.success('Coupon sent successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send coupon');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Send Coupon</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Coupon Info */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white mb-6">
            <h3 className="text-xl font-bold">{coupon.title}</h3>
            <p className="text-green-100">{coupon.code}</p>
            <p className="text-lg font-semibold mt-2">
              {coupon.value?.percentage 
                ? `${coupon.value.percentage}% OFF`
                : `₹${coupon.value?.amount}`
              }
            </p>
          </div>

          {/* Recipient Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recipient Information</h3>
            
            {/* Recipient Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipient Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('manual');
                    setSelectedPartnerId('');
                    setSelectedBeneficiaryId('');
                    setRecipient({ name: '', email: '', phone: '' });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    recipientType === 'manual'
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('partner');
                    setSelectedBeneficiaryId('');
                    setRecipient({ name: '', email: '', phone: '' });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    recipientType === 'partner'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BiStore size={18} />
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('beneficiary');
                    setSelectedPartnerId('');
                    setRecipient({ name: '', email: '', phone: '' });
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    recipientType === 'beneficiary'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BiUser size={18} />
                  Beneficiary
                </button>
              </div>
            </div>

            {/* Partner Selection */}
            {recipientType === 'partner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Partner *
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => handlePartnerSelect(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a partner...</option>
                  {loadingPartners ? (
                    <option value="">Loading partners...</option>
                  ) : (
                    partners.map(partner => (
                      <option key={partner._id} value={partner._id}>
                        {partner.name} - {partner.businessType} ({partner.email})
                      </option>
                    ))
                  )}
                </select>
                {partners.length === 0 && !loadingPartners && (
                  <p className="text-xs text-gray-500 mt-1">No approved partners found</p>
                )}
              </div>
            )}

            {/* Beneficiary Selection */}
            {recipientType === 'beneficiary' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Beneficiary *
                </label>
                <select
                  value={selectedBeneficiaryId}
                  onChange={(e) => handleBeneficiarySelect(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Choose a beneficiary...</option>
                  {loadingBeneficiaries ? (
                    <option value="">Loading beneficiaries...</option>
                  ) : (
                    beneficiaries.map(beneficiary => (
                      <option key={beneficiary._id} value={beneficiary._id}>
                        {beneficiary.name} - {beneficiary.category} ({beneficiary.phone})
                      </option>
                    ))
                  )}
                </select>
                {beneficiaries.length === 0 && !loadingBeneficiaries && (
                  <p className="text-xs text-gray-500 mt-1">No approved beneficiaries found</p>
                )}
              </div>
            )}

            {/* Manual Entry Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name {recipientType === 'manual' ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Recipient name"
                  required={recipientType === 'manual'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={recipient.email}
                  onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="recipient@example.com"
                  required={methods.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={recipient.phone}
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="9876543210"
                  required={methods.whatsapp || methods.sms}
                />
              </div>
            </div>

            {recipientType !== 'manual' && (selectedPartnerId || selectedBeneficiaryId) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  ✅ {recipientType === 'partner' ? 'Partner' : 'Beneficiary'} selected. 
                  Details auto-filled. You can edit if needed.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Methods */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Delivery Methods</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={methods.whatsapp}
                  onChange={(e) => setMethods({ ...methods, whatsapp: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <FaWhatsapp className="text-green-500 text-xl" />
                <label className="flex-1 text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={methods.email}
                  onChange={(e) => setMethods({ ...methods, email: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <FaEnvelope className="text-blue-500 text-xl" />
                <label className="flex-1 text-sm font-medium text-gray-700">
                  Email
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={methods.sms}
                  onChange={(e) => setMethods({ ...methods, sms: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <FaSms className="text-purple-500 text-xl" />
                <label className="flex-1 text-sm font-medium text-gray-700">
                  SMS
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Coupon'
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

