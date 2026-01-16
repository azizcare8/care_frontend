"use client";
import { useState, useEffect } from "react";
import { uploadService } from "@/services/uploadService";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function AddDoctorForm({ isPartnerSubmission = false, onBack = null }) {
  const [formData, setFormData] = useState({
    banner: null, username: "", name: "", registration: "", qualification: "", specialization: "", address: "", state: "", email: "", contact: "",
    morningFrom: "", morningTo: "",
    morningDays: [],
    eveningFrom: "", eveningTo: "",
    eveningDays: [],
    nightFrom: "", nightTo: "",
    nightDays: [],
    fees: "", feesOffer: "", businessLink: "", panCard: null, aadharCard: null, clinicPhotos: []
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null); // Image preview state
  const [clinicPhotoPreviews, setClinicPhotoPreviews] = useState([]); // Multiple clinic photo previews
  const [panCardPreview, setPanCardPreview] = useState(null); // PAN Card preview
  const [aadharCardPreview, setAadharCardPreview] = useState(null); // Aadhar Card preview

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDayToggle = (slot, day) => {
    const fieldName = `${slot}Days`;
    setFormData(prev => {
      const currentDays = prev[fieldName] || [];
      if (currentDays.includes(day)) {
        return { ...prev, [fieldName]: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, [fieldName]: [...currentDays, day] };
      }
    });
  };

  const selectAllDays = (slot) => {
    const fieldName = `${slot}Days`;
    setFormData(prev => ({ ...prev, [fieldName]: [...daysOfWeek] }));
  };

  const clearAllDays = (slot) => {
    const fieldName = `${slot}Days`;
    setFormData(prev => ({ ...prev, [fieldName]: [] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        // Reset file input
        e.target.value = '';
        return;
      }

      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        // Reset file input
        e.target.value = '';
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Clean up old preview
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      setBannerPreview(previewUrl);
      setFormData(prev => ({ ...prev, banner: file }));
      toast.success('Banner image selected!');
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Create preview URL for document
      const previewUrl = URL.createObjectURL(file);

      // Set preview based on field name
      if (fieldName === 'panCard') {
        if (panCardPreview) URL.revokeObjectURL(panCardPreview);
        setPanCardPreview(previewUrl);
      } else if (fieldName === 'aadharCard') {
        if (aadharCardPreview) URL.revokeObjectURL(aadharCardPreview);
        setAadharCardPreview(previewUrl);
      }

      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleClinicPhotosChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate each file
    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }

      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
      });
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        clinicPhotos: [...prev.clinicPhotos, ...validFiles]
      }));
      setClinicPhotoPreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} photo(s) added`);
    }

    // Reset input to allow selecting same files again
    e.target.value = '';
  };

  const removeClinicPhoto = (index) => {
    // Revoke the preview URL
    URL.revokeObjectURL(clinicPhotoPreviews[index].url);

    setFormData(prev => ({
      ...prev,
      clinicPhotos: prev.clinicPhotos.filter((_, i) => i !== index)
    }));
    setClinicPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Photo removed');
  };

  // Clean up preview URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
      // Clean up document previews
      if (panCardPreview) {
        URL.revokeObjectURL(panCardPreview);
      }
      if (aadharCardPreview) {
        URL.revokeObjectURL(aadharCardPreview);
      }
      // Clean up clinic photo previews
      clinicPhotoPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [bannerPreview, clinicPhotoPreviews]);

  const uploadBanner = async (file) => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadService.uploadSingle(formData);
      return response.data.url;
    } catch (error) {
      console.error('Banner upload failed:', error);
      throw error;
    }
  };

  const uploadDocument = async (file) => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadService.uploadSingle(formData);
      return response.data.url;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.contact || !formData.address || !formData.state) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = formData.contact.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Please provide a valid 10-digit contact number');
      return;
    }

    // Validate both documents are provided
    if (!formData.panCard) {
      toast.error('Please upload PAN Card (required)');
      return;
    }
    if (!formData.aadharCard) {
      toast.error('Please upload Aadhar Card (required)');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Creating doctor partner...');

    try {
      // Upload banner if provided
      let bannerUrl = null;
      if (formData.banner) {
        toast.loading('Uploading banner image...');
        bannerUrl = await uploadBanner(formData.banner);
      }

      // Upload documents if provided
      let panCardUrl = null;
      let aadharCardUrl = null;
      let clinicPhotoUrls = [];
      if (formData.panCard) {
        toast.loading('Uploading PAN Card...');
        panCardUrl = await uploadDocument(formData.panCard);
      }
      if (formData.aadharCard) {
        toast.loading('Uploading Aadhar Card...');
        aadharCardUrl = await uploadDocument(formData.aadharCard);
      }
      if (formData.clinicPhotos && formData.clinicPhotos.length > 0) {
        toast.loading(`Uploading ${formData.clinicPhotos.length} clinic photo(s)...`);
        for (const photo of formData.clinicPhotos) {
          const url = await uploadDocument(photo);
          if (url) {
            clinicPhotoUrls.push(url);
          }
        }
      }

      // Get backend base URL
      const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

      // Build description with doctor details
      const doctorDescription = `${formData.qualification ? `Qualification: ${formData.qualification}. ` : ''}${formData.specialization ? `Specialization: ${formData.specialization}. ` : ''}${formData.registration ? `Registration No: ${formData.registration}. ` : ''}${formData.fees ? `Actual Fees: ₹${formData.fees}. ` : ''}${formData.feesOffer ? `Special Offer for NGO: ${formData.feesOffer}. ` : ''}`.trim() || 'Medical partner';

      // Map form data to Partner model structure
      const partnerData = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        phone: cleanPhone,
        businessType: 'clinic', // Default to clinic for doctors
        category: 'medical',
        description: doctorDescription,
        address: {
          street: formData.address,
          city: formData.address.split(',')[0] || 'Mumbai', // Extract city from address or default
          state: formData.state || 'Maharashtra',
          pincode: '400001', // Default pincode
          country: 'India'
        },
        contactPerson: {
          name: formData.name,
          phone: cleanPhone,
          email: formData.email.toLowerCase().trim(),
          designation: 'Doctor'
        },
        images: bannerUrl ? [{
          url: `${backendBaseURL}${bannerUrl}`,
          caption: 'Doctor Profile Banner',
          isPrimary: true
        }] : [],
        socialLinks: {
          website: formData.businessLink || ''
        },
        operatingHours: {
          monday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          tuesday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          wednesday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          thursday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          friday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          saturday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: true
          },
          sunday: {
            open: formData.morningFrom || '09:00',
            close: formData.nightTo || '21:00',
            isOpen: false
          }
        },
        // Add admin notes with doctor-specific info including timing slots
        adminNotes: `Username: ${formData.username || 'N/A'}, Registration: ${formData.registration || 'N/A'}, Qualification: ${formData.qualification || 'N/A'}, Specialization: ${formData.specialization || 'N/A'}, Actual Fees: ${formData.fees || 'N/A'}, NGO Offer: ${formData.feesOffer || 'N/A'}, Morning: ${formData.morningFrom || 'N/A'}-${formData.morningTo || 'N/A'} (${formData.morningDays.length > 0 ? formData.morningDays.join(', ') : 'No days'}), Evening: ${formData.eveningFrom || 'N/A'}-${formData.eveningTo || 'N/A'} (${formData.eveningDays.length > 0 ? formData.eveningDays.join(', ') : 'No days'}), Night: ${formData.nightFrom || 'N/A'}-${formData.nightTo || 'N/A'} (${formData.nightDays.length > 0 ? formData.nightDays.join(', ') : 'No days'})`,
        // Provide documents with registration number as business license
        documents: {
          businessLicense: formData.registration || 'Admin-approved doctor partner',
          gstNumber: '',
          panNumber: panCardUrl ? `${backendBaseURL}${panCardUrl}` : '',
          aadharNumber: aadharCardUrl ? `${backendBaseURL}${aadharCardUrl}` : '',
          clinicPhotos: clinicPhotoUrls.map(url => `${backendBaseURL}${url}`)
        },
        status: isPartnerSubmission ? 'pending' : 'approved', // Auto-approve for admin-created partners, pending for partner submissions
        isActive: isPartnerSubmission ? false : true // Ensure partner is active only if approved
      };

      console.log('Submitting doctor partner data:', partnerData);

      // Create partner
      const response = await api.post('/partners', partnerData);

      toast.dismiss();
      if (isPartnerSubmission) {
        toast.success('Your doctor partner request has been submitted! We will review it and get back to you soon. 🎉');
      } else {
        toast.success('Doctor partner added successfully! 🎉');
      }

      // Reset form
      setFormData({
        banner: null,
        username: "",
        name: "",
        registration: "",
        qualification: "",
        specialization: "",
        address: "",
        state: "",
        email: "",
        contact: "",
        morningFrom: "",
        morningTo: "",
        morningDays: [],
        eveningFrom: "",
        eveningTo: "",
        eveningDays: [],
        nightFrom: "",
        nightTo: "",
        nightDays: [],
        fees: "",
        feesOffer: "",
        businessLink: "",
        panCard: null,
        aadharCard: null,
        clinicPhotos: []
      });

      // Reset file inputs and previews
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
      }
      // Clean up document previews
      if (panCardPreview) {
        URL.revokeObjectURL(panCardPreview);
        setPanCardPreview(null);
      }
      if (aadharCardPreview) {
        URL.revokeObjectURL(aadharCardPreview);
        setAadharCardPreview(null);
      }
      // Clean up clinic photo previews
      clinicPhotoPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      setClinicPhotoPreviews([]);

      // Reload after 2 seconds (only for admin mode)
      if (!isPartnerSubmission) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (onBack) {
        // For partner submissions, call onBack after a delay
        setTimeout(() => {
          onBack();
        }, 2000);
      }

    } catch (error) {
      console.error('Doctor partner creation failed:', error);
      toast.dismiss();

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n');
        toast.error(`Validation failed:\n${errorMessages}`, { duration: 6000 });
      } else {
        toast.error(error.message || 'Failed to create doctor partner. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPartnerSubmission ? 'Register as Doctor Partner' : 'Add Doctor Partner'}
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
              Fill out the form below to register as a doctor partner. Your request will be reviewed by our team.
            </p>
          </div>
        ) : (
          <nav className="text-gray-500 text-sm">
            <ol className="flex space-x-2 items-center">
              <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700">Add Doctor Partner</li>
            </ol>
          </nav>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Adding Doctor Partner</h3>

        {/* Banner Image Preview */}
        {bannerPreview && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-80 h-44 rounded-lg overflow-hidden border-2 border-green-400 shadow-lg">
                <img
                  src={bannerPreview}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                ✓ Selected
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-orange-700 mb-2">
              Upload Banner
            </label>
            <input
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleFileChange}
              className="border rounded-lg px-3 py-2 w-full text-sm bg-white"
            />
            {formData.banner ? (
              <p className="text-xs text-green-600 mt-1">✓ {formData.banner.name}</p>
            ) : (
              <p className="text-xs text-orange-600 mt-1">📸 Select a banner image (JPG, PNG, or WebP)</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">USERNAME</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username Of Doctor" className="border rounded-lg px-4 py-2 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">REGISTRATION NO.</label>
              <input type="text" name="registration" value={formData.registration} onChange={handleChange} placeholder="Enter Registration no. here" className="border rounded-lg px-4 py-2 w-full text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">NAME OF THE DOCTOR</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Name Of Doctor" className="border rounded-lg px-4 py-2 w-full text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">QUALIFICATION</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="Enter qualification here" className="border rounded-lg px-4 py-2 w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">SPECIALIZATION</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Enter Specialization here" className="border rounded-lg px-4 py-2 w-full text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              LOCATION (Google Maps Link) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="https://maps.google.com/?q=..."
              className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-500 text-gray-900"
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">STATE</label>
              <select name="state" value={formData.state} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm text-gray-900">
                <option className="text-gray-900">Select State</option>
                <option className="text-gray-900">Andaman and Nicobar Islands</option>
                <option className="text-gray-900">Andhra Pradesh</option>
                <option className="text-gray-900">Arunachal Pradesh</option>
                <option className="text-gray-900">Assam</option>
                <option className="text-gray-900">Bihar</option>
                <option className="text-gray-900">Chandigarh</option>
                <option className="text-gray-900">Chhattisgarh</option>
                <option className="text-gray-900">Dadra and Nagar Haveli and Daman and Diu</option>
                <option className="text-gray-900">Delhi</option>
                <option className="text-gray-900">Goa</option>
                <option className="text-gray-900">Gujarat</option>
                <option className="text-gray-900">Haryana</option>
                <option className="text-gray-900">Himachal Pradesh</option>
                <option className="text-gray-900">Jammu and Kashmir</option>
                <option className="text-gray-900">Jharkhand</option>
                <option className="text-gray-900">Karnataka</option>
                <option className="text-gray-900">Kerala</option>
                <option className="text-gray-900">Ladakh</option>
                <option className="text-gray-900">Lakshadweep</option>
                <option className="text-gray-900">Madhya Pradesh</option>
                <option className="text-gray-900">Maharashtra</option>
                <option className="text-gray-900">Manipur</option>
                <option className="text-gray-900">Meghalaya</option>
                <option className="text-gray-900">Mizoram</option>
                <option className="text-gray-900">Nagaland</option>
                <option className="text-gray-900">Odisha</option>
                <option className="text-gray-900">Puducherry</option>
                <option className="text-gray-900">Punjab</option>
                <option className="text-gray-900">Rajasthan</option>
                <option className="text-gray-900">Sikkim</option>
                <option className="text-gray-900">Tamil Nadu</option>
                <option className="text-gray-900">Telangana</option>
                <option className="text-gray-900">Tripura</option>
                <option className="text-gray-900">Uttar Pradesh</option>
                <option className="text-gray-900">Uttarakhand</option>
                <option className="text-gray-900">West Bengal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">EMAIL ID</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email here" className="border rounded-lg px-4 py-2 w-full text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">CONTACT NUMBER</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Enter 10 digit mobile number (e.g., 9876543210)" maxLength="10" className="border rounded-lg px-4 py-2 w-full text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Doctors Actual Fees</label>
            <input type="text" name="fees" value={formData.fees} onChange={handleChange} placeholder="Enter actual Fees of Doctor" className="border rounded-lg px-4 py-2 w-full text-sm" />
          </div>

          {/* Timing Slots */}
          <div className="space-y-4">
            {/* Morning Time */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">🌅 MORNING TIME</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => selectAllDays('morning')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={() => clearAllDays('morning')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input type="time" name="morningFrom" value={formData.morningFrom} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
                <span className="text-gray-500 mt-5">→</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input type="time" name="morningTo" value={formData.morningTo} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle('morning', day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.morningDays.includes(day)
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {formData.morningDays.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">Selected: {formData.morningDays.join(', ')}</p>
              )}
            </div>

            {/* Evening Time */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">🌆 EVENING TIME</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => selectAllDays('evening')} className="text-xs text-orange-600 hover:text-orange-800 font-medium">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={() => clearAllDays('evening')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input type="time" name="eveningFrom" value={formData.eveningFrom} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
                <span className="text-gray-500 mt-5">→</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input type="time" name="eveningTo" value={formData.eveningTo} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle('evening', day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.eveningDays.includes(day)
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-orange-400'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {formData.eveningDays.length > 0 && (
                <p className="text-xs text-orange-600 mt-2">Selected: {formData.eveningDays.join(', ')}</p>
              )}
            </div>

            {/* Night Time */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">🌙 NIGHT TIME</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => selectAllDays('night')} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={() => clearAllDays('night')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input type="time" name="nightFrom" value={formData.nightFrom} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
                <span className="text-gray-500 mt-5">→</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input type="time" name="nightTo" value={formData.nightTo} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle('night', day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.nightDays.includes(day)
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-400'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {formData.nightDays.length > 0 && (
                <p className="text-xs text-purple-600 mt-2">Selected: {formData.nightDays.join(', ')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Fees For Care Foundation Trust</label>
            <input type="text" name="feesOffer" value={formData.feesOffer} onChange={handleChange} placeholder="Enter Any Offer For NGO" className="border rounded-lg px-4 py-2 w-full text-sm" />
          </div>



          {/* Document Uploads - Both Required */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-4">📄 Required Documents</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  UPLOAD PAN CARD <span className="text-green-500">*</span>
                </label>
                <input
                  type="file"
                  name="panCard"
                  accept="image/*"
                  onChange={handleDocumentChange}
                  className="border rounded-lg px-3 py-2 w-full text-sm bg-white"
                />
                {formData.panCard && (
                  <p className="text-xs text-green-600 mt-1">✓ Selected: {formData.panCard.name}</p>
                )}
                {/* PAN Card Preview */}
                {panCardPreview && (
                  <div className="mt-3 relative">
                    <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-green-300 shadow-md">
                      <img
                        src={panCardPreview}
                        alt="PAN Card Preview"
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(panCardPreview);
                        setPanCardPreview(null);
                        setFormData(prev => ({ ...prev, panCard: null }));
                        const input = document.querySelector('input[name="panCard"]');
                        if (input) input.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  UPLOAD AADHAR CARD <span className="text-green-500">*</span>
                </label>
                <input
                  type="file"
                  name="aadharCard"
                  accept="image/*"
                  onChange={handleDocumentChange}
                  className="border rounded-lg px-3 py-2 w-full text-sm bg-white"
                />
                {formData.aadharCard && (
                  <p className="text-xs text-green-600 mt-1">✓ Selected: {formData.aadharCard.name}</p>
                )}
                {/* Aadhar Card Preview */}
                {aadharCardPreview && (
                  <div className="mt-3 relative">
                    <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-green-300 shadow-md">
                      <img
                        src={aadharCardPreview}
                        alt="Aadhar Card Preview"
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(aadharCardPreview);
                        setAadharCardPreview(null);
                        setFormData(prev => ({ ...prev, aadharCard: null }));
                        const input = document.querySelector('input[name="aadharCard"]');
                        if (input) input.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">UPLOAD CLINIC PHOTOS (Multiple)</label>
            <input
              type="file"
              name="clinicPhotos"
              accept="image/*"
              multiple
              onChange={handleClinicPhotosChange}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.clinicPhotos.length > 0
                ? `${formData.clinicPhotos.length} photo(s) selected`
                : 'You can select multiple photos'}
            </p>

            {/* Clinic Photos Preview Grid */}
            {clinicPhotoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {clinicPhotoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                      <img
                        src={preview.url}
                        alt={`Clinic Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClinicPhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="agree1" value="Yes" className="w-4 h-4" />
              <span className="text-sm text-gray-900">1. Do You Agree To Pay Care Foundation Trust 20% Admin Charges? ○ Yes ○ No</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="agree2" value="Yes" className="w-4 h-4" />
              <span className="text-sm text-gray-900">2. Do You Agree For Weekly Reimbursement? ○ Yes ○ No</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-900">3. I agree to the above Terms and Conditions ○ Yes ○ No</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </>
  );
}

