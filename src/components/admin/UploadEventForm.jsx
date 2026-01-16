"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadService } from "@/services/uploadService";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import api, { getBackendBaseUrl } from "@/utils/api";

export default function UploadEventForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    picture: null,
    heading: "",
    date: "",
    time: "",
    location: "",
    shortBrief: "",
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
    
    // Validation
    if (!formData.heading || !formData.date || !formData.time || !formData.location || !formData.shortBrief || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.picture) {
      toast.error('Please upload event picture');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      toast.loading('Uploading event...');

      // Upload main picture
      setUploadProgress(10);
      const mainImageUrl = await uploadImage(formData.picture);
      if (!mainImageUrl) {
        throw new Error('Failed to upload main picture');
      }

      // Upload additional images (all 6 optional)
      setUploadProgress(30);
      const additionalImages = [];
      const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
      for (let i = 0; i < imageFields.length; i++) {
        const fieldName = imageFields[i];
        if (formData[fieldName]) {
          const url = await uploadImage(formData[fieldName]);
          if (url) additionalImages.push({ url, caption: `Event Image ${i + 1}` });
        }
      }
      setUploadProgress(50);

      // Upload video files (2 optional)
      const uploadedVideos = [];
      if (formData.videoFile1) {
        const videoUrl = await uploadVideo(formData.videoFile1);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Event Video 1' });
      }
      if (formData.videoFile2) {
        const videoUrl = await uploadVideo(formData.videoFile2);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Event Video 2' });
      }

      // Prepare YouTube video links (2 optional)
      const videos = [...uploadedVideos];
      if (formData.videoLink1) videos.push({ url: formData.videoLink1, platform: 'youtube', caption: 'YouTube Video 1' });
      if (formData.videoLink2) videos.push({ url: formData.videoLink2, platform: 'youtube', caption: 'YouTube Video 2' });

      setUploadProgress(70);

      // Get backend base URL
      const backendBaseURL = getBackendBaseUrl();

      // Create event data
      const eventData = {
        heading: formData.heading.trim(),
        shortBrief: formData.shortBrief.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        time: formData.time.trim(), // Required field - Event model requires time
        location: formData.location.trim(),
        picture: {
          url: `${backendBaseURL}${mainImageUrl}`,
          publicId: null, // Add publicId if available from upload response
          caption: 'Event Main Picture'
        },
        images: additionalImages.length > 0 ? additionalImages.map(img => ({
          url: `${backendBaseURL}${img.url}`,
          caption: img.caption
        })) : [],
        videos: videos.length > 0 ? videos.map(video => ({
          url: video.url,
          platform: video.platform || 'youtube',
          caption: video.caption
        })) : [],
        eventType: 'upcoming',
        status: 'published'
      };

      setUploadProgress(80);
      toast.dismiss();
      toast.loading('Creating event...');

      // Create event
      const response = await api.post('/events', eventData);
      setUploadProgress(100);

      toast.dismiss();
      toast.success('Event created successfully! 🎉');
      
      // Reset form
      setFormData({
        picture: null,
        heading: "",
        date: "",
        time: "",
        location: "",
        shortBrief: "",
        description: "",
        videoLink1: "",
        videoLink2: "",
        videoFile1: null,
        videoFile2: null,
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        image5: null,
        image6: null
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Event creation failed:', error);
      toast.dismiss();
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else if (error.message) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error('Failed to create event. Please check all fields and try again.', { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">Upload Events</h1>
        <nav className="text-gray-500 text-sm">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600 hover:text-blue-600 font-medium">Home</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 font-semibold">Create Event</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
          Upload Events On Website
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Event Picture <span className="text-green-500">*</span></label>
            <div className="flex items-center gap-3">
              <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'picture')}
                  accept="image/*"
                />
              </label>
              <span className="text-sm text-gray-600 font-medium">
                {formData.picture ? formData.picture.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Heading <span className="text-green-500">*</span></label>
            <input type="text" name="heading" value={formData.heading} onChange={handleChange} placeholder="Enter The Heading Of the Event" className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"/>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Date <span className="text-green-500">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Time <span className="text-green-500">*</span></label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Short Brief <span className="text-green-500">*</span></label>
            <input type="text" name="shortBrief" value={formData.shortBrief} onChange={handleChange} placeholder="Enter Event Short Brief Here" className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"/>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Location <span className="text-green-500">*</span></label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Enter Event Location" className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"/>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Description <span className="text-green-500">*</span></label>
            <div className="border-2 border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-gray-200">
                <select className="text-sm border-2 border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                  <option>Normal</option>
                </select>
                <button type="button" className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 rounded-lg font-bold transition-all border-2 border-transparent hover:border-blue-500">B</button>
                <button type="button" className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 rounded-lg italic transition-all border-2 border-transparent hover:border-blue-500">I</button>
                <button type="button" className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 rounded-lg underline transition-all border-2 border-transparent hover:border-blue-500">U</button>
              </div>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full px-4 py-3 focus:outline-none text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"/>
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

          <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-200">
            <input type="checkbox" id="agree" className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"/>
            <label htmlFor="agree" className="text-sm font-semibold text-gray-700">I agree I want To Upload The Above Data On website</label>
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-lg" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <span>✓</span>
                Submit Event
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}







