"use client";
import { useState } from "react";
import { uploadService } from "@/services/uploadService";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddPathologyForm({ isPartnerSubmission = false, onBack = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    contactPerson: {
      name: "",
      designation: "",
      phone: "",
      email: ""
    },
    description: "",
    services: [],
    images: [],
    documents: {
      businessLicense: [],
      gstNumber: "",
      panNumber: ""
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: ""
    },
    availableTests: "",
    homeSampleCollection: false,
    reportDeliveryTime: "",
    sameDayReports: false,
    emailReports: false,
    whatsappReports: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith("contactPerson.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: { ...prev.contactPerson, [field]: value }
      }));
    } else if (name.startsWith("documents.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: value }
      }));
    } else if (name.startsWith("bankDetails.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleFileChange = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setIsSubmitting(true);
      const uploadedUrls = [];

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        
        const response = await uploadService.uploadSingle(formData);
        uploadedUrls.push(response.data.url);
      }

      if (type === 'images') {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      } else if (type === 'license') {
        setFormData(prev => ({
          ...prev,
          documents: { 
            ...prev.documents, 
            businessLicense: [...(prev.documents.businessLicense || []), ...uploadedUrls]
          }
        }));
      }

      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const pathologyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessType: 'pathology',
        category: 'medical',
        description: formData.description || `Pathology lab offering ${formData.availableTests || 'various'} tests. ${formData.homeSampleCollection ? 'Home sample collection available.' : ''} Report delivery: ${formData.reportDeliveryTime || 'Standard'}.`,
        address: formData.address,
        contactPerson: formData.contactPerson,
        services: formData.services.length > 0 ? formData.services : [
          { name: "Complete Blood Count (CBC)", price: 0, description: "Complete Blood Count test" },
          { name: "Urine Test", price: 0, description: "Urine analysis test" },
          { name: "Thyroid Profile", price: 0, description: "T3, T4, TSH test" },
          { name: "Liver Function Test (LFT)", price: 0, description: "Liver function analysis" },
          { name: "Kidney Function Test (KFT)", price: 0, description: "Kidney function analysis" },
          { name: "Diabetes Test", price: 0, description: "Blood sugar test" },
          { name: "Lipid Profile", price: 0, description: "Cholesterol and lipid test" },
          { name: "Pregnancy Test", price: 0, description: "Pregnancy detection test" },
          { name: "ECG", price: 0, description: "Electrocardiogram" },
          { name: "X-Ray", price: 0, description: "X-Ray imaging" }
        ],
        images: Array.isArray(formData.images) 
          ? formData.images.map((img, idx) => 
              typeof img === 'string' 
                ? { url: img, isPrimary: idx === 0 } 
                : img
            )
          : formData.images 
            ? [{ url: formData.images, isPrimary: true }]
            : [],
        documents: {
          ...formData.documents,
          bankDetails: formData.bankDetails
        },
        status: isPartnerSubmission ? 'pending' : 'approved',
        isActive: isPartnerSubmission ? false : true,
        metadata: {
          availableTests: formData.availableTests?.split(',').map(t => t.trim()) || [],
          homeSampleCollection: formData.homeSampleCollection,
          reportDeliveryTime: formData.reportDeliveryTime,
          sameDayReports: formData.sameDayReports,
          emailReports: formData.emailReports,
          whatsappReports: formData.whatsappReports
        }
      };

      const response = await api.post('/partners', pathologyData);

      if (response.data.success) {
        if (isPartnerSubmission) {
          toast.success("Your pathology partner request has been submitted! We will review it and get back to you soon.");
          if (onBack) {
            setTimeout(() => {
              onBack();
            }, 2000);
          }
        } else {
          toast.success("Pathology partner added successfully!");
          router.push('/admin/partners');
        }
      }
    } catch (error) {
      console.error('Pathology submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to add pathology partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPartnerSubmission ? 'Register as Pathology Lab Partner' : 'Add Pathology Partner'}
        </h1>
        {isPartnerSubmission ? (
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                ← Back to Partner Types
              </button>
            )}
            <p className="text-gray-600 text-sm">
              Fill out the form below to register as a pathology lab partner. Your request will be reviewed by our team.
            </p>
          </div>
        ) : (
          <nav className="text-gray-500 text-sm">
            <ol className="flex space-x-2 items-center">
              <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700">Add Pathology Partner</li>
            </ol>
          </nav>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-2">Add <span className="text-green-600">Pathology</span> Partner</h2>
        <h3 className="text-lg font-semibold text-green-600 mb-6">Adding Pathology Lab Partner</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lab Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="Enter pathology lab name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="lab@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Delivery Time</label>
                <input
                  type="text"
                  name="reportDeliveryTime"
                  value={formData.reportDeliveryTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="e.g., Same Day, 24 hours, 48 hours"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Tests (comma separated)</label>
                <input
                  type="text"
                  name="availableTests"
                  value={formData.availableTests}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="CBC, Urine Test, Thyroid Profile, LFT, KFT, Diabetes Test, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="Lab description, facilities, and services"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Google Maps Link) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  📍 Paste Google Maps location link here. 
                  <a 
                    href="https://www.google.com/maps" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Get location link
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Person</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="contactPerson.designation"
                  value={formData.contactPerson.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                  placeholder="e.g., Lab Manager, Administrator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Services & Features */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Services & Features</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="homeSampleCollection"
                  checked={formData.homeSampleCollection}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Home Sample Collection</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="sameDayReports"
                  checked={formData.sameDayReports}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Same Day Reports</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="emailReports"
                  checked={formData.emailReports}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Email Reports</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="whatsappReports"
                  checked={formData.whatsappReports}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">WhatsApp Reports</span>
              </label>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business License *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => handleFileChange(e, 'license')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">You can select multiple files</p>
                {formData.documents.businessLicense && formData.documents.businessLicense.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700">Uploaded files ({formData.documents.businessLicense.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.documents.businessLicense.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`License ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border-2 border-gray-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-16 h-16 bg-gray-100 rounded border-2 border-gray-300 items-center justify-center text-xs text-gray-500">
                            PDF
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  businessLicense: prev.documents.businessLicense.filter((_, i) => i !== index)
                                }
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  name="documents.gstNumber"
                  value={formData.documents.gstNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  name="documents.panNumber"
                  value={formData.documents.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lab Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'images')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">You can select multiple files</p>
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700">Uploaded images ({formData.images.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={typeof url === 'string' ? url : url.url} 
                            alt={`Lab Image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border-2 border-gray-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bankDetails.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  name="bankDetails.accountHolderName"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding Pathology Lab..." : "Add Pathology Partner"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/partners')}
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

