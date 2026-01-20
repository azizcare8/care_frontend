"use client";
import { useState, useEffect } from "react";
import { uploadService } from "@/services/uploadService";
import api, { getBackendBaseUrl } from "@/utils/api";
import toast from "react-hot-toast";

export default function AddFoodPartnerForm({ isPartnerSubmission = false, onBack = null }) {
  const [formData, setFormData] = useState({
    banner: null, partnerType: "", restaurantName: "", username: "", date: "", foodCuisine: "", address: "", state: "", email: "", contact: "", specialOffer: "",
    morningFrom: "", morningTo: "", morningDays: [],
    afternoonFrom: "", afternoonTo: "", afternoonDays: [],
    eveningFrom: "", eveningTo: "", eveningDays: [],
    nightFrom: "", nightTo: "", nightDays: [],
    businessLink: "", fsai: "",
    menuCardPhotos: []
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null); // Image preview state
  const [menuCardPhotoPreviews, setMenuCardPhotoPreviews] = useState([]); // Multiple menu card photo previews

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

  // Menu Card Photos handler (multiple images)
  const handleMenuCardPhotosChange = (e) => {
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
        menuCardPhotos: [...prev.menuCardPhotos, ...validFiles]
      }));
      setMenuCardPhotoPreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} photo(s) added`);
    }

    // Reset input to allow selecting same files again
    e.target.value = '';
  };

  const removeMenuCardPhoto = (index) => {
    // Revoke the preview URL
    URL.revokeObjectURL(menuCardPhotoPreviews[index].url);

    setFormData(prev => ({
      ...prev,
      menuCardPhotos: prev.menuCardPhotos.filter((_, i) => i !== index)
    }));
    setMenuCardPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Photo removed');
  };

  // Clean up preview URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
      // Clean up menu card photo previews
      menuCardPhotoPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [bannerPreview, menuCardPhotoPreviews]);

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
    if (!formData.restaurantName || !formData.email || !formData.contact || !formData.address || !formData.state) {
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

    setIsSubmitting(true);
    toast.loading('Creating food partner...');

    try {
      // Upload banner if provided
      let bannerUrl = null;
      if (formData.banner) {
        toast.loading('Uploading banner image...');
        bannerUrl = await uploadBanner(formData.banner);
      }

      // Upload menu card photos if provided
      let menuCardPhotoUrls = [];
      if (formData.menuCardPhotos && formData.menuCardPhotos.length > 0) {
        toast.loading(`Uploading ${formData.menuCardPhotos.length} menu card photo(s)...`);
        for (const photo of formData.menuCardPhotos) {
          const url = await uploadDocument(photo);
          if (url) {
            menuCardPhotoUrls.push(url);
          }
        }
      }

      // Get backend base URL
      const backendBaseURL = getBackendBaseUrl();

      // Map form data to Partner model structure
      const partnerData = {
        name: formData.restaurantName,
        email: formData.email.toLowerCase().trim(),
        phone: cleanPhone,
        businessType: formData.partnerType === 'Cafe' ? 'restaurant' : 'restaurant', // Map partner type
        category: 'food',
        description: formData.foodCuisine || 'Food partner',
        address: {
          street: formData.address,
          city: formData.address.split(',')[0] || 'Mumbai', // Extract city from address or default
          state: formData.state || 'Maharashtra',
          pincode: '400001', // Default pincode, you can add a field for this
          country: 'India'
        },
        contactPerson: {
          name: formData.restaurantName,
          phone: cleanPhone,
          email: formData.email.toLowerCase().trim()
        },
        images: bannerUrl ? [{
          url: bannerUrl.startsWith('http') ? bannerUrl : `${backendBaseURL}${bannerUrl}`,
          caption: 'Restaurant Banner',
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
        // Add admin notes with special offer info and timing slots
        adminNotes: `Special Offer: ${formData.specialOffer || 'N/A'}, FSAI: ${formData.fsai || 'N/A'}, Username: ${formData.username || 'N/A'}, Morning: ${formData.morningFrom || 'N/A'}-${formData.morningTo || 'N/A'} (${formData.morningDays.length > 0 ? formData.morningDays.join(', ') : 'No days'}), Afternoon: ${formData.afternoonFrom || 'N/A'}-${formData.afternoonTo || 'N/A'} (${formData.afternoonDays.length > 0 ? formData.afternoonDays.join(', ') : 'No days'}), Evening: ${formData.eveningFrom || 'N/A'}-${formData.eveningTo || 'N/A'} (${formData.eveningDays.length > 0 ? formData.eveningDays.join(', ') : 'No days'}), Night: ${formData.nightFrom || 'N/A'}-${formData.nightTo || 'N/A'} (${formData.nightDays.length > 0 ? formData.nightDays.join(', ') : 'No days'}), Menu Card Photos: ${formData.menuCardPhotos.length} uploaded`,
        // Provide documents with FSAI as business license for admin-created partners
        documents: {
          businessLicense: formData.fsai || 'Admin-approved partner',
          gstNumber: '',
          panNumber: '',
          menuCardPhotos: menuCardPhotoUrls.map(url =>
            url.startsWith('http') ? url : `${backendBaseURL}${url}`
          )
        },
        status: isPartnerSubmission ? 'pending' : 'approved', // Auto-approve for admin-created partners, pending for partner submissions
        isActive: isPartnerSubmission ? false : true // Ensure partner is active only if approved
      };

      console.log('Submitting partner data:', partnerData);

      // Create partner
      const response = await api.post('/partners', partnerData);

      toast.dismiss();
      if (isPartnerSubmission) {
        toast.success('Your food partner request has been submitted! We will review it and get back to you soon. 🎉');
      } else {
        toast.success('Food partner added successfully! 🎉');
      }

      // Reset form
      setFormData({
        banner: null,
        partnerType: "",
        restaurantName: "",
        username: "",
        date: "",
        foodCuisine: "",
        address: "",
        state: "",
        email: "",
        contact: "",
        specialOffer: "",
        morningFrom: "", morningTo: "", morningDays: [],
        afternoonFrom: "", afternoonTo: "", afternoonDays: [],
        eveningFrom: "", eveningTo: "", eveningDays: [],
        nightFrom: "", nightTo: "", nightDays: [],
        businessLink: "",
        fsai: "",
        menuCardPhotos: []
      });

      // Reset file inputs and previews
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
      }
      // Clean up menu card photo previews
      menuCardPhotoPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      setMenuCardPhotoPreviews([]);

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
      console.error('Partner creation failed:', error);
      toast.dismiss();

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n');
        toast.error(`Validation failed:\n${errorMessages}`, { duration: 6000 });
      } else {
        toast.error(error.message || 'Failed to create food partner. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPartnerSubmission ? 'Register as Food Partner' : 'Add Food Partner'}
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
              Fill out the form below to register as a food partner. Your request will be reviewed by our team.
            </p>
          </div>
        ) : (
          <nav className="text-xs text-gray-500">
            <ol className="flex space-x-2 items-center">
              <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700">Add Food Partner</li>
            </ol>
          </nav>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h3 className="text-lg font-semibold text-green-600 mb-6">Adding Food Partner</h3>

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
              <label className="block text-sm font-medium text-gray-950 mb-2">PARTNER TYPE</label>
              <select name="partnerType" value={formData.partnerType} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm text-gray-900">
                <option className="text-gray-900">Select Partner Type</option>
                <option className="text-gray-900">Food Server</option>
                <option className="text-gray-900">Restaurant</option>
                <option className="text-gray-900">Hawker</option>
                <option className="text-gray-900">General Items</option>
                <option className="text-gray-900">Canting</option>
                <option className="text-gray-900">Food Grains</option>
                <option className="text-gray-900">Milk/Bread</option>
                <option className="text-gray-900">Cafe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">USERNAME</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter Username" className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">RESTAURANT NAME</label>
            <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder="Enter Name Of Restaurant" className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">DATE</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">FSSAI NUMBER</label>
              <input
                type="text"
                name="fsai"
                value={formData.fsai}
                onChange={handleChange}
                placeholder="Enter FSAI No"
                className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">FOOD CUISINE</label>
            <select
              name="foodCuisine"
              value={formData.foodCuisine}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full text-sm text-gray-900"
            >
              <option value="">Select Food Cuisine</option>
              <optgroup label="🇮🇳 Indian Cuisine">
                <option value="Punjabi">Punjabi</option>
                <option value="South Indian">South Indian</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Maharashtrian">Maharashtrian</option>
                <option value="Rajasthani">Rajasthani</option>
              </optgroup>
              <optgroup label="🌍 International Cuisines">
                <option value="Italian">Italian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </optgroup>
              <optgroup label="🍔 Other Types">
                <option value="Fast Food">Fast Food</option>
                <option value="Street Food">Street Food</option>
                <option value="Bakery">Bakery</option>
              </optgroup>
            </select>
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
              <label className="block text-sm font-medium text-gray-900 mb-2">EMAIL</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email here" className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">CONTACT NUMBER</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                setFormData(prev => ({ ...prev, contact: value }));
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter 10 digit mobile number"
              maxLength="10"
              className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900"
            />
          </div>

          {/* Menu Card Photos Section (Multiple) */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-3">🍽️ MENU CARD PHOTO (Multiple)</h4>
            <input
              type="file"
              name="menuCardPhotos"
              accept="image/*"
              multiple
              onChange={handleMenuCardPhotosChange}
              className="border rounded-lg px-3 py-2 w-full text-sm bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.menuCardPhotos.length > 0
                ? `${formData.menuCardPhotos.length} photo(s) selected`
                : 'You can select multiple photos'}
            </p>

            {/* Menu Card Photos Preview Grid */}
            {menuCardPhotoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {menuCardPhotoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                      <img
                        src={preview.url}
                        alt={`Menu Card Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMenuCardPhoto(index)}
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

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">SPECIAL OFFER FOR OUR NGO</label>
            <textarea
              name="specialOffer"
              value={formData.specialOffer}
              onChange={handleChange}
              placeholder="Enter special offer here "
              rows={3}
              className="border rounded-lg px-4 py-2 w-full text-sm placeholder:text-gray-700 text-gray-900 resize-none"
            />
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

            {/* Afternoon Time */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">☀️ AFTERNOON TIME</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => selectAllDays('afternoon')} className="text-xs text-yellow-600 hover:text-yellow-800 font-medium">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={() => clearAllDays('afternoon')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input type="time" name="afternoonFrom" value={formData.afternoonFrom} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
                <span className="text-gray-500 mt-5">→</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input type="time" name="afternoonTo" value={formData.afternoonTo} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full text-sm bg-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle('afternoon', day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.afternoonDays.includes(day)
                        ? 'bg-yellow-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-yellow-400'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {formData.afternoonDays.length > 0 && (
                <p className="text-xs text-yellow-600 mt-2">Selected: {formData.afternoonDays.join(', ')}</p>
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



          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="agree1" className="w-4 h-4" />
              <span className="text-sm text-green-600">1. Do You Agree To Pay Care Foundation Trust 10% Admin Charges? ○ Yes ○ No</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="agree2" className="w-4 h-4" />
              <span className="text-sm text-green-600">2. Do You Agree For Weekly Reimbursement? ○ Yes ○ No</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-green-600">3. I agree to the above Terms and Conditions ○ Yes ○ No</span>
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







