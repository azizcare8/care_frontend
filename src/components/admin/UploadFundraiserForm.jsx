"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiUpload } from "react-icons/bi";
import { campaignService } from "@/services/campaignService";
import { uploadService } from "@/services/uploadService";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { getBackendBaseUrl } from "@/utils/api";

export default function UploadFundraiserForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    mainPicture: null,
    summary: "",
    heading: "",
    contact: "",
    startDate: "",
    targetAmount: "",
    description: "",
    videoLink1: "", // YouTube link 1
    videoLink2: "", // YouTube link 2
    videoFile1: null, // Video file upload 1
    videoFile2: null, // Video file upload 2
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB for images, 50MB for videos)
      const maxSize = fieldName.startsWith('videoFile') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(fieldName.startsWith('videoFile') 
          ? 'Video file size should be less than 50MB' 
          : 'File size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const uploadVideo = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await uploadService.uploadSingle(formData);
      return response.data.url;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadService.uploadSingle(formData);
      return response.data.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - Check all required fields
    if (!formData.heading || !formData.targetAmount || !formData.summary || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    // Title validation (10-100 characters)
    if (formData.heading.length < 10) {
      toast.error('Fundraiser heading must be at least 10 characters');
      return;
    }
    if (formData.heading.length > 100) {
      toast.error('Fundraiser heading cannot exceed 100 characters');
      return;
    }

    // Short description validation (20-200 characters)
    if (formData.summary.length < 20) {
      toast.error('Fundraiser summary must be at least 20 characters');
      return;
    }
    if (formData.summary.length > 200) {
      toast.error('Fundraiser summary cannot exceed 200 characters');
      return;
    }

    // Description validation (50-5000 characters)
    if (formData.description.length < 50) {
      toast.error('Fundraiser description must be at least 50 characters');
      return;
    }
    if (formData.description.length > 5000) {
      toast.error('Fundraiser description cannot exceed 5000 characters');
      return;
    }

    // Goal amount validation
    if (formData.targetAmount < 100) {
      toast.error('Target amount must be at least ₹100');
      return;
    }

    if (!formData.mainPicture) {
      toast.error('Please upload main picture');
      return;
    }

    if (!formData.contact) {
      toast.error('Please provide contact number');
      return;
    }

    // Validate contact number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contact.replace(/\D/g, ''))) {
      toast.error('Please provide a valid 10-digit contact number');
      return;
    }

    if (!formData.startDate) {
      toast.error('Please select campaign start date');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Upload main picture
      toast.loading('Uploading images...');
      setUploadProgress(20);
      const mainImageUrl = await uploadImage(formData.mainPicture);
      if (!mainImageUrl) {
        throw new Error('Failed to upload main picture. Please try again.');
      }
      setUploadProgress(40);

      // Upload additional images (all 6 optional)
      const additionalImages = [];
      const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
      for (let i = 0; i < imageFields.length; i++) {
        const fieldName = imageFields[i];
        if (formData[fieldName]) {
          const url = await uploadImage(formData[fieldName]);
          if (url) additionalImages.push({ url, caption: `Additional Image ${i + 1}` });
        }
      }
      setUploadProgress(60);

      // Upload video files (2 optional)
      const uploadedVideos = [];
      if (formData.videoFile1) {
        const videoUrl = await uploadVideo(formData.videoFile1);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Campaign Video 1' });
      }
      if (formData.videoFile2) {
        const videoUrl = await uploadVideo(formData.videoFile2);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Campaign Video 2' });
      }

      // Prepare YouTube video links (2 optional)
      const videos = [...uploadedVideos];
      if (formData.videoLink1) videos.push({ url: formData.videoLink1, platform: 'youtube', caption: 'YouTube Video 1' });
      if (formData.videoLink2) videos.push({ url: formData.videoLink2, platform: 'youtube', caption: 'YouTube Video 2' });

      // Ensure beneficiary name is at least 2 characters (validation requirement)
      const beneficiaryName = formData.heading.trim().split(' ').slice(0, 2).join(' ').trim();
      const finalBeneficiaryName = beneficiaryName.length >= 2 
        ? beneficiaryName 
        : formData.heading.trim().substring(0, Math.min(50, formData.heading.length)) || 'Campaign Beneficiary';

      // Calculate end date properly (3 months from start date)
      const startDateObj = new Date(formData.startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + 3);

      // Get backend base URL
      const backendBaseURL = getBackendBaseUrl();

      // Create campaign data
      const campaignData = {
        title: formData.heading.trim(),
        shortDescription: formData.summary.trim(),
        description: formData.description.trim(),
        goalAmount: parseInt(formData.targetAmount),
        category: 'medical', // You can add a category selector
        images: [
          { url: `${backendBaseURL}${mainImageUrl}`, caption: 'Main Campaign Image', isPrimary: true },
          ...additionalImages.map(img => ({ ...img, url: `${backendBaseURL}${img.url}`, isPrimary: false }))
        ],
        videos: videos.length > 0 ? videos.map(video => ({
          url: video.url,
          caption: video.caption || 'Campaign Video',
          thumbnail: ''
        })) : [],
        timeline: {
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString()
        },
        beneficiary: {
          name: finalBeneficiaryName,
          relationship: 'self', // Default relationship
          contact: {
            phone: formData.contact.replace(/\D/g, ''), // Remove non-digits
            email: user?.email || '' // Use logged in user's email
          }
        },
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      };

      setUploadProgress(80);
      toast.dismiss();
      toast.loading('Creating campaign...');

      // Create campaign (backend will set fundraiser from authenticated user)
      console.log('Sending campaign data:', campaignData);
      const response = await campaignService.createCampaign(campaignData);
      setUploadProgress(100);

      toast.dismiss();
      toast.success('Campaign created successfully and is now LIVE! 🎉');
      
      // Reset form
      handleReset();
      
      // Stay in admin panel - no automatic redirect
      // Just show success message and let admin manually navigate
      setTimeout(() => {
        // Optionally refresh the page to clear the form
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Campaign creation failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      toast.dismiss();
      
      // Show specific validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n');
        toast.error(`Validation failed:\n${errorMessages}`, { duration: 8000 });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else if (error.message) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error('Failed to create campaign. Please check all fields and try again.', { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;
    
    setFormData({
      mainPicture: null,
      summary: "",
      heading: "",
      contact: "",
      startDate: "",
      targetAmount: "",
      description: "",
      video1: "",
      video2: "",
      video3: "",
      image1: null,
      image2: null,
      image3: null
    });
    toast.success('Form reset');
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Upload Fundraiser Campaign</h1>
        <nav className="text-xs text-gray-500">
          <ol className="flex space-x-2 items-center">
            <li>
              <a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600 font-medium">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">Create Fundraiser</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Picture Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Upload Main Picture <span className="text-green-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'mainPicture')}
                  accept="image/*"
                />
              </label>
              <span className="text-sm text-gray-600 font-medium">
                {formData.mainPicture ? formData.mainPicture.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* Fundraiser Summary */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fundraiser summaries <span className="text-green-500">*</span> <span className="text-gray-500 text-xs font-normal">(Min 20 characters, Max 200 characters)</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Enter short summary (minimum 20 characters)"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
            />
            <div className="text-right text-xs mt-1">
              <span className={formData.summary.length < 20 ? 'text-red-500' : formData.summary.length > 200 ? 'text-red-500' : 'text-green-600'}>
                {formData.summary.length} / 200 characters {formData.summary.length < 20 && `(${20 - formData.summary.length} more needed)`}
              </span>
            </div>
          </div>

          {/* Fundraiser Heading and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fundraiser Heading <span className="text-green-500">*</span> <span className="text-gray-500 text-xs font-normal">(Min 10 characters, Max 100 characters)</span>
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                placeholder="Enter The Heading Of the Fundraiser (minimum 10 characters)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
              />
              <div className="text-right text-xs mt-1">
                <span className={formData.heading.length < 10 ? 'text-red-500' : formData.heading.length > 100 ? 'text-red-500' : 'text-green-600'}>
                  {formData.heading.length} / 100 characters {formData.heading.length < 10 && `(${10 - formData.heading.length} more needed)`}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-600 mb-2">
                Amount To be Raised
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="Enter Amount ₹"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Contact and Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fundraiser Contact <span className="text-green-500">*</span> <span className="text-gray-500 text-xs font-normal">(10 digit mobile number)</span>
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter 10 digit mobile number (e.g., 9876543210)"
                maxLength="10"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Start Date Of Campaign <span className="text-green-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Fundraiser Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fundraiser Description <span className="text-green-500">*</span> <span className="text-gray-500 text-xs font-normal">(Min 50 characters, Max 5000 characters)</span>
            </label>
            <div className="border-2 border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                <select className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900">
                  <option>Normal</option>
                  <option>Heading 1</option>
                  <option>Heading 2</option>
                </select>
                <button type="button" className="p-1 hover:bg-gray-100 rounded">
                  <strong>B</strong>
                </button>
                <button type="button" className="p-1 hover:bg-gray-100 rounded italic">
                  I
                </button>
                <button type="button" className="p-1 hover:bg-gray-100 rounded underline">
                  U
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed description (minimum 50 characters)"
                rows={6}
                className="w-full px-2 py-1 focus:outline-none text-sm"
              />
            </div>
            <div className="text-right text-xs mt-1">
              <span className={formData.description.length < 50 ? 'text-red-500' : formData.description.length > 5000 ? 'text-red-500' : 'text-green-600'}>
                {formData.description.length} / 5000 characters {formData.description.length < 50 && `(${50 - formData.description.length} more needed)`}
              </span>
            </div>
          </div>

          {/* YouTube Video Links (2 optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Upload YT 1 Video Link
              </label>
              <input
                type="url"
                name="videoLink1"
                value={formData.videoLink1}
                onChange={handleChange}
                placeholder="Paste Link : E.g https://www.youtube.com/embed/qfeIymEYqT"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-600 mb-2">
                Upload YT 2 Video Link
              </label>
              <input
                type="url"
                name="videoLink2"
                value={formData.videoLink2}
                onChange={handleChange}
                placeholder="Paste Link : E.g https://www.youtube.com/embed/qfeIymEYqT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Video File Uploads (2 optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Upload Video 1
              </label>
              <div className="flex items-center gap-3">
                <label className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                  Choose video
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'videoFile1')}
                    accept="video/*"
                  />
                </label>
                <span className="text-sm text-gray-600 font-medium">
                  {formData.videoFile1 ? formData.videoFile1.name : 'No file chosen'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-600 mb-2">
                Upload Video 2
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
                  Choose video
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'videoFile2')}
                    accept="video/*"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {formData.videoFile2 ? formData.videoFile2.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </div>

          {/* Image Uploads (6 optional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num}>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload image {num}
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                    Choose file
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, `image${num}`)}
                      accept="image/*"
                    />
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {formData[`image${num}`] ? formData[`image${num}`].name : 'No file chosen'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="agree"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="agree" className="text-sm text-green-600">
              I agree I want to Upload The Above Data On website
            </label>
          </div>

          {/* Progress Bar */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">Uploading...</span>
                <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Campaign...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Submit Campaign
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </>
  );
}



