"use client";
import { useState, useEffect } from "react";
import { BiSearch, BiEdit, BiTrash, BiPlus, BiX } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    featuredImage: "",
    featuredImageCaption: "",
    isPublished: true,
    isFeatured: false,
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: ""
    }
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/blogs");
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category || 'general',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        isPublished: formData.isPublished,
        status: formData.isPublished ? 'published' : 'draft',
        isFeatured: formData.isFeatured || false
      };

      // Only include excerpt if it's provided
      if (formData.excerpt && formData.excerpt.trim()) {
        submitData.excerpt = formData.excerpt.trim();
      }

      // Only include slug if it's provided and not empty
      if (formData.slug && formData.slug.trim()) {
        submitData.slug = formData.slug.trim();
      }

      // Handle featuredImage - include caption if provided
      // Always send featuredImage if it exists, even if empty (to allow removal)
      if (formData.featuredImage !== undefined) {
        if (formData.featuredImage && formData.featuredImage.trim()) {
          submitData.featuredImage = {
            url: formData.featuredImage.trim(),
            caption: formData.featuredImageCaption?.trim() || ''
          };
        } else {
          // Send null to remove the image
          submitData.featuredImage = null;
        }
      }

      // Author is required - always include it (must be a name, not ID)
      if (!formData.author || !formData.author.trim()) {
        toast.error("Author name is required. Please enter the author name.");
        return;
      }
      submitData.author = formData.author.trim();

      // Handle SEO fields
      if (formData.seo && (formData.seo.metaTitle || formData.seo.metaDescription || formData.seo.keywords)) {
        submitData.seo = {
          metaTitle: formData.seo.metaTitle?.trim() || '',
          metaDescription: formData.seo.metaDescription?.trim() || '',
          keywords: formData.seo.keywords?.trim() || ''
        };
      }

      if (editingBlog) {
        try {
          const response = await api.put(`/blogs/${editingBlog._id}`, submitData);
          toast.success("Blog updated successfully!");
        } catch (updateError) {
          console.error("Blog update error:", updateError);
          const errorMessage = updateError.response?.data?.message || 
                              updateError.response?.data?.details || 
                              updateError.message || 
                              "Failed to update blog";
          toast.error(errorMessage);
          return; // Don't close modal on error
        }
      } else {
        const response = await api.post("/blogs", submitData);
        toast.success("Blog created successfully!");
      }
      setShowModal(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        author: "",
        category: "",
        tags: "",
        featuredImage: "",
        featuredImageCaption: "",
        isPublished: true,
        isFeatured: false,
        seo: {
          metaTitle: "",
          metaDescription: "",
          keywords: ""
        }
      });
      fetchBlogs();
    } catch (error) {
      console.error("Blog save error:", error);
      toast.error(error.response?.data?.message || error.response?.data?.details || "Failed to save blog");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    // Get author - now it's just a string
    // If it's an ObjectId (legacy data), clear it so user can enter a name
    let authorValue = blog.author || "";
    // Check if it's an ObjectId format (24 hex characters)
    if (typeof authorValue === 'string' && /^[0-9a-fA-F]{24}$/.test(authorValue)) {
      authorValue = ""; // Clear ObjectId so user can enter a proper name
    }
    
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      author: authorValue,
      category: blog.category || "",
      tags: blog.tags?.join(", ") || "",
      featuredImage: typeof blog.featuredImage === 'object' && blog.featuredImage !== null 
        ? blog.featuredImage.url || "" 
        : blog.featuredImage || "",
      featuredImageCaption: typeof blog.featuredImage === 'object' && blog.featuredImage !== null
        ? blog.featuredImage.caption || ""
        : "",
      isPublished: blog.status === 'published' || blog.isPublished !== false,
      isFeatured: blog.isFeatured || false,
      seo: {
        metaTitle: blog.seo?.metaTitle || "",
        metaDescription: blog.seo?.metaDescription || "",
        keywords: blog.seo?.keywords ? (Array.isArray(blog.seo.keywords) ? blog.seo.keywords.join(", ") : blog.seo.keywords) : ""
      }
    });
    setShowModal(true);
  };

  // Helper functions for video/image detection
  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const videoPatterns = [
      /youtube\.com\/watch/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /youtube\.com\/embed/,
      /\.mp4$/i,
      /\.webm$/i,
      /\.mov$/i
    ];
    return videoPatterns.some(pattern => pattern.test(url));
  };

  const getYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleView = (blog) => {
    // Debug: Log the blog data to see what we're getting
    console.log("Viewing blog:", blog);
    setViewingBlog(blog);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Blog Management
          </h1>
          <p className="text-gray-600">Create, edit, and manage blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setFormData({
              title: "",
              slug: "",
              content: "",
              excerpt: "",
              author: "",
              category: "",
              tags: "",
              featuredImage: "",
              featuredImageCaption: "",
              isPublished: true,
              isFeatured: false,
              seo: {
                metaTitle: "",
                metaDescription: "",
                keywords: ""
              }
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
        >
          <BiPlus size={20} />
          Create Blog
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Title</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Author</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No blogs found
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog, idx) => (
                  <tr
                    key={blog._id}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{blog.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{blog.excerpt?.substring(0, 60)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(() => {
                        // Handle legacy ObjectId format - if it looks like an ObjectId, show message
                        const author = blog.author || "";
                        if (typeof author === 'string' && /^[0-9a-fA-F]{24}$/.test(author)) {
                          return "Please update author name";
                        }
                        return author || "N/A";
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          blog.status === 'published' || blog.isPublished
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {blog.status === 'published' || blog.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(blog)}
                          className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                          title="View Blog"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                          title="Delete"
                        >
                          <BiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingBlog ? "Edit Blog" : "Create Blog"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBlog(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="success_story">Success Story</option>
                    <option value="media_coverage">Media Coverage</option>
                    <option value="impact_story">Impact Story</option>
                    <option value="event_highlights">Event Highlights</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="10"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Enter author name (e.g., John Doe, Bhushan, etc.)"
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter any author name for this blog post</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image Caption</label>
                <input
                  type="text"
                  value={formData.featuredImageCaption}
                  onChange={(e) => setFormData({ ...formData, featuredImageCaption: e.target.value })}
                  placeholder="Optional caption for the featured image"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Published</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Featured Blog</label>
                </div>
              </div>
              
              {/* SEO Section */}
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seo: { ...formData.seo, metaTitle: e.target.value }
                      })}
                      placeholder="SEO meta title (for search engines)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      value={formData.seo.metaDescription}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seo: { ...formData.seo, metaDescription: e.target.value }
                      })}
                      rows="3"
                      placeholder="SEO meta description (for search engines)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={formData.seo.keywords}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seo: { ...formData.seo, keywords: e.target.value }
                      })}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingBlog ? "Update Blog" : "Create Blog"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBlog(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Blog Modal */}
      {viewingBlog && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingBlog(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">View Blog</h2>
              <button
                onClick={() => setViewingBlog(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <BiX size={28} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(() => {
                // Extract image/video URL
                const mediaUrl = viewingBlog.featuredImage 
                  ? (typeof viewingBlog.featuredImage === 'object' && viewingBlog.featuredImage !== null
                      ? (viewingBlog.featuredImage.url || viewingBlog.featuredImage)
                      : viewingBlog.featuredImage)
                  : null;
                
                if (!mediaUrl || !mediaUrl.trim()) {
                  return null;
                }

                const url = mediaUrl.trim();
                
                // Check if it's a video URL
                if (isVideoUrl(url)) {
                  const youtubeId = getYouTubeVideoId(url);
                  if (youtubeId) {
                    // YouTube video embed
                    return (
                      <div className="w-full rounded-lg overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={viewingBlog.title || "Blog Video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  } else if (url.match(/\.mp4$|\.webm$|\.mov$/i)) {
                    // Direct video file
                    return (
                      <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                        <video
                          controls
                          className="w-full h-auto max-h-96"
                          src={url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  } else {
                    // Other video URLs (Vimeo, etc.) - show as link
                    return (
                      <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                        >
                          Watch Video
                        </a>
                      </div>
                    );
                  }
                } else {
                  // Image
                  return (
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={url}
                        alt={viewingBlog.title || "Blog Image"}
                        className="w-full h-auto max-h-96 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = e.target.nextElementSibling;
                          if (errorDiv) {
                            errorDiv.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden w-full h-64 items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Image not available</p>
                      </div>
                    </div>
                  );
                }
              })()}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                  {viewingBlog.title ? String(viewingBlog.title).trim() : "Untitled Blog"}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                    {viewingBlog.category ? String(viewingBlog.category) : "Uncategorized"}
                  </span>
                  <span className="text-gray-600">
                    By: {(() => {
                      const author = viewingBlog.author || "";
                      // Handle legacy ObjectId format
                      if (typeof author === 'string' && /^[0-9a-fA-F]{24}$/.test(author)) {
                        return "Please update author name";
                      }
                      return author || "N/A";
                    })()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      viewingBlog.status === 'published' || viewingBlog.isPublished
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                        : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                    }`}
                  >
                    {viewingBlog.status === 'published' || viewingBlog.isPublished ? "Published" : "Draft"}
                  </span>
                  {(viewingBlog.createdAt || viewingBlog.publishedAt) && (
                    <span className="text-gray-500">
                      {new Date(viewingBlog.publishedAt || viewingBlog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                {viewingBlog.excerpt && String(viewingBlog.excerpt).trim() && (
                  <p className="text-lg text-gray-700 italic mb-4 border-l-4 border-blue-500 pl-4 break-words">
                    {String(viewingBlog.excerpt).trim()}
                  </p>
                )}
              </div>
              
              <div className="prose max-w-none">
                {viewingBlog.content && String(viewingBlog.content).trim() ? (
                  <div 
                    className="text-gray-800 whitespace-pre-wrap leading-relaxed break-words"
                    style={{ 
                      wordBreak: 'break-word',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {String(viewingBlog.content).trim()}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
              
              {viewingBlog.tags && Array.isArray(viewingBlog.tags) && viewingBlog.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  {viewingBlog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setViewingBlog(null)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

