"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { campaignService } from "@/services/campaignService";
import { uploadService } from "@/services/uploadService";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { BiUpload, BiChevronLeft } from "react-icons/bi";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    mainPicture: null,
    summary: "",
    heading: "",
    contact: "",
    startDate: "",
    targetAmount: "",
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
      loadCampaign();
    }
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await campaignService.getCampaign(params.id);
      const campaignData = response.data;
      setCampaign(campaignData);
      
      // Pre-fill form with existing data
      setFormData({
        mainPicture: null,
        summary: campaignData.shortDescription || "",
        heading: campaignData.title || "",
        contact: campaignData.beneficiary?.contact?.phone || campaignData.beneficiary?.contact?.email || "",
        startDate: campaignData.timeline?.startDate ? new Date(campaignData.timeline.startDate).toISOString().split('T')[0] : "",
        targetAmount: campaignData.goalAmount?.toString() || "",
        description: campaignData.description || "",
        videoLink1: campaignData.videos?.[0]?.url || "",
        videoLink2: campaignData.videos?.[1]?.url || "",
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
      console.error("Failed to load campaign:", error);
      toast.error("Failed to load campaign");
      router.push("/admin/fundraiser-live");
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
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.heading || !formData.summary || !formData.targetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Validation checks
      if (!formData.heading || formData.heading.length < 10) {
        toast.error("Heading must be at least 10 characters");
        return;
      }
      
      if (!formData.summary || formData.summary.length < 20) {
        toast.error("Summary must be at least 20 characters");
        return;
      }
      
      // Description must be at least 50 characters for validation
      const description = formData.description && formData.description.length >= 50 
        ? formData.description 
        : formData.summary + ". " + (formData.description || "This campaign aims to make a positive impact in the community.");
      
      if (description.length < 50) {
        toast.error("Description must be at least 50 characters");
        return;
      }

      const campaignData = {
        title: formData.heading,
        shortDescription: formData.summary,
        description: description
      };

      // Only add goalAmount if campaign is not active (active campaigns can't change goalAmount)
      if (campaign && campaign.status !== 'active') {
        campaignData.goalAmount = parseFloat(formData.targetAmount);
      }

      // Only update timeline.startDate if provided, preserve existing endDate
      if (formData.startDate && campaign) {
        campaignData.timeline = {
          ...campaign.timeline,
          startDate: new Date(formData.startDate)
        };
      }

      // Upload main picture if new one is selected
      if (formData.mainPicture) {
        setUploadProgress(10);
        const pictureUpload = await uploadService.uploadImage(formData.mainPicture);
        campaignData.images = [{ url: pictureUpload.url, publicId: pictureUpload.publicId }];
        setUploadProgress(30);
      }

      // Upload additional images
      const imageUploads = [];
      for (let i = 1; i <= 6; i++) {
        if (formData[`image${i}`]) {
          const upload = await uploadService.uploadImage(formData[`image${i}`]);
          imageUploads.push({ url: upload.url, publicId: upload.publicId });
        }
      }
      if (imageUploads.length > 0) {
        campaignData.images = [...(campaignData.images || []), ...imageUploads];
      }
      setUploadProgress(60);

      // Handle videos
      const videos = [];
      if (formData.videoLink1) {
        videos.push({ url: formData.videoLink1, platform: 'youtube' });
      }
      if (formData.videoLink2) {
        videos.push({ url: formData.videoLink2, platform: 'youtube' });
      }
      if (formData.videoFile1) {
        const videoUpload = await uploadService.uploadVideo(formData.videoFile1);
        videos.push({ url: videoUpload.url, platform: 'uploaded' });
      }
      if (formData.videoFile2) {
        const videoUpload = await uploadService.uploadVideo(formData.videoFile2);
        videos.push({ url: videoUpload.url, platform: 'uploaded' });
      }
      if (videos.length > 0) {
        campaignData.videos = videos;
      }
      setUploadProgress(80);

      // Log data being sent for debugging
      console.log("Updating campaign with data:", campaignData);

      // Update campaign
      await campaignService.updateCampaign(params.id, campaignData);
      setUploadProgress(100);
      
      toast.success("Campaign updated successfully!");
      router.push("/admin/fundraiser-live");
    } catch (error) {
      console.error("Failed to update campaign:", error);
      console.error("Error response:", error.response?.data);
      console.error("Campaign data sent:", campaignData);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || "Failed to update campaign";
      toast.error(errorMessage);
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
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <BiChevronLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Edit Campaign
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 space-y-6">
          {/* Main Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Picture {campaign?.images?.[0] && <span className="text-gray-500">(Current: {campaign.images[0].url})</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'mainPicture')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading *</label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary *</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹) *</label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Video Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Link 1</label>
              <input
                type="url"
                name="videoLink1"
                value={formData.videoLink1}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Link 2</label>
              <input
                type="url"
                name="videoLink2"
                value={formData.videoLink2}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Video Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video File 1</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'videoFile1')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video File 2</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'videoFile2')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (up to 6)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, `image${num}`)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <BiUpload size={20} />
              {isSubmitting ? "Updating..." : "Update Campaign"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

