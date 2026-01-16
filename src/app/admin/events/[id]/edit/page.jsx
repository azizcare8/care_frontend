"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { uploadService } from "@/services/uploadService";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { BiChevronLeft } from "react-icons/bi";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    picture: null,
    picturePreview: null,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadEvent();
    }
  }, [params.id]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/events/${params.id}`);
      const eventData = response.data.data || response.data;
      setEvent(eventData);
      
      // Format date for input (YYYY-MM-DD)
      const eventDate = new Date(eventData.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Populate form with existing data
      setFormData({
        picture: null,
        picturePreview: eventData.picture?.url || null,
        heading: eventData.heading || "",
        date: formattedDate,
        time: eventData.time || "",
        location: eventData.location || "",
        shortBrief: eventData.shortBrief || "",
        description: eventData.description || "",
        videoLink1: eventData.videos?.find(v => v.platform === 'youtube')?.url || "",
        videoLink2: eventData.videos?.filter(v => v.platform === 'youtube')[1]?.url || "",
        videoFile1: null,
        videoFile2: null,
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        image5: null,
        image6: null
      });
    } catch (error) {
      console.error("Failed to load event:", error);
      toast.error("Failed to load event details");
      router.push("/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = fieldName.startsWith('videoFile') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(fieldName.startsWith('videoFile') 
          ? 'Video file size should be less than 50MB' 
          : 'File size should be less than 5MB');
        return;
      }
      
      if (fieldName === 'picture') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, [fieldName]: file, picturePreview: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, [fieldName]: file }));
      }
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
    
    if (!formData.heading || !formData.date || !formData.time || !formData.location || !formData.shortBrief || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      toast.loading('Updating event...');

      let mainImageUrl = formData.picturePreview;
      
      // Upload new picture if changed
      if (formData.picture) {
        setUploadProgress(10);
        mainImageUrl = await uploadImage(formData.picture);
        if (!mainImageUrl) {
          throw new Error('Failed to upload main picture');
        }
      }

      // Upload additional images
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

      // Keep existing images if no new ones uploaded
      if (additionalImages.length === 0 && event?.images) {
        event.images.forEach(img => {
          additionalImages.push({ url: img.url, caption: img.caption || '' });
        });
      }

      setUploadProgress(50);

      // Upload video files
      const uploadedVideos = [];
      if (formData.videoFile1) {
        const videoUrl = await uploadVideo(formData.videoFile1);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Event Video 1' });
      }
      if (formData.videoFile2) {
        const videoUrl = await uploadVideo(formData.videoFile2);
        if (videoUrl) uploadedVideos.push({ url: videoUrl, platform: 'uploaded', caption: 'Event Video 2' });
      }

      // Combine with YouTube links
      const videos = [...uploadedVideos];
      if (formData.videoLink1) videos.push({ url: formData.videoLink1, platform: 'youtube', caption: 'YouTube Video 1' });
      if (formData.videoLink2) videos.push({ url: formData.videoLink2, platform: 'youtube', caption: 'YouTube Video 2' });

      // Keep existing videos if no new ones
      if (videos.length === 0 && event?.videos) {
        event.videos.forEach(video => {
          videos.push({ url: video.url, platform: video.platform || 'youtube', caption: video.caption || '' });
        });
      }

      setUploadProgress(70);

      const backendBaseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

      // Prepare update data
      const updateData = {
        heading: formData.heading.trim(),
        shortBrief: formData.shortBrief.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        time: formData.time.trim(),
        location: formData.location.trim(),
        picture: {
          url: mainImageUrl.startsWith('http') ? mainImageUrl : `${backendBaseURL}${mainImageUrl}`,
          publicId: event?.picture?.publicId || null,
          caption: 'Event Main Picture'
        },
        images: additionalImages.map(img => ({
          url: img.url.startsWith('http') ? img.url : `${backendBaseURL}${img.url}`,
          caption: img.caption
        })),
        videos: videos.map(video => ({
          url: video.url,
          platform: video.platform || 'youtube',
          caption: video.caption
        }))
      };

      setUploadProgress(80);
      toast.dismiss();
      toast.loading('Saving changes...');

      // Update event
      await api.put(`/events/${params.id}`, updateData);
      setUploadProgress(100);

      toast.dismiss();
      toast.success('Event updated successfully! 🎉');
      
      setTimeout(() => {
        router.push("/admin/events");
      }, 1500);

    } catch (error) {
      console.error('Event update failed:', error);
      toast.dismiss();
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else if (error.message) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error('Failed to update event. Please check all fields and try again.', { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <button
          onClick={() => router.push("/admin/events")}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
        >
          <BiChevronLeft size={20} />
          <span>Back to Events</span>
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Edit Event
        </h1>
        <nav className="text-gray-500 text-sm">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li><a href="/admin/events" className="hover:underline text-gray-600">Events</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Edit Event</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></span>
          Update Event Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Event Picture <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3">
              <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                {formData.picturePreview ? 'Change Picture' : 'Choose file'}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'picture')}
                  accept="image/*"
                />
              </label>
              <span className="text-sm text-gray-600 font-medium">
                {formData.picture ? formData.picture.name : formData.picturePreview ? 'Current picture' : 'No file chosen'}
              </span>
            </div>
            {formData.picturePreview && (
              <div className="mt-3 w-32 h-32 relative rounded border">
                <img src={formData.picturePreview} alt="Preview" className="w-full h-full object-cover rounded" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Heading <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="heading" 
              value={formData.heading} 
              onChange={handleChange} 
              placeholder="Enter The Heading Of the Event" 
              className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Time <span className="text-red-500">*</span></label>
              <input 
                type="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Short Brief <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="shortBrief" 
              value={formData.shortBrief} 
              onChange={handleChange} 
              placeholder="Enter Event Short Brief Here" 
              className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Location <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Enter Event Location" 
              className="border-2 border-gray-300 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Description <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={6} 
              className="w-full px-4 py-3 focus:outline-none text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
              placeholder="Enter event description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video Link 1</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video Link 2</label>
              <input
                type="url"
                name="videoLink2"
                value={formData.videoLink2}
                onChange={handleChange}
                placeholder="Paste Link : E.g https://www.youtube.com/embed/qfeIymEYqT"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Video 1</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Video 2</label>
              <div className="flex items-center gap-3">
                <label className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl">
                  Choose video
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'videoFile2')}
                    accept="video/*"
                  />
                </label>
                <span className="text-sm text-gray-600 font-medium">
                  {formData.videoFile2 ? formData.videoFile2.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num}>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload image {num}</label>
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
                Updating...
              </>
            ) : (
              <>
                <span>✓</span>
                Update Event
              </>
            )}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}


