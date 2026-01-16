"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import { BiCalendar, BiUser, BiChevronLeft, BiShareAlt } from "react-icons/bi";
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import toast from "react-hot-toast";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      // Try to fetch by slug first, then by ID
      let response;
      try {
        response = await api.get(`/blogs/slug/${params.slug}`);
        if (response.data.success && response.data.data) {
          setBlog(response.data.data);
          return;
        }
      } catch (slugError) {
        // If slug fails, try fetching by ID
        console.log("Slug fetch failed, trying ID:", slugError.message);
      }
      
      // Try fetching by ID
      try {
        response = await api.get(`/blogs/${params.slug}`);
        if (response.data.success && response.data.data) {
          setBlog(response.data.data);
          return;
        }
      } catch (idError) {
        console.error("Both slug and ID fetch failed:", idError);
        throw idError;
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      toast.error(error.response?.data?.message || "Blog not found");
      // Don't redirect immediately, show error message
      setTimeout(() => {
        router.push("/blogs");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || "";
    const text = blog?.excerpt || "";

    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <button
            onClick={() => router.push("/blogs")}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const featuredImageUrl = typeof blog.featuredImage === 'object' 
    ? blog.featuredImage?.url 
    : blog.featuredImage;

  // Check if URL is a video URL (YouTube, Vimeo, etc.)
  const isVideoUrl = (url) => {
    if (!url) return false;
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

  // Check if URL is a valid image URL
  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (isVideoUrl(url)) return false;
    const imagePatterns = [
      /\.jpg$/i,
      /\.jpeg$/i,
      /\.png$/i,
      /\.gif$/i,
      /\.webp$/i,
      /\.svg$/i,
      /res\.cloudinary\.com/,
      /localhost/,
      /caredigiworld\.com/,
      /images\.unsplash\.com/
    ];
    return imagePatterns.some(pattern => pattern.test(url)) || url.startsWith('data:image/');
  };

  // Extract YouTube video ID for embedding
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/blogs")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <BiChevronLeft size={20} />
            <span>Back to Blogs</span>
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Image or Video */}
        {featuredImageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            {isVideoUrl(featuredImageUrl) ? (
              // YouTube Video Embed
              getYouTubeVideoId(featuredImageUrl) ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(featuredImageUrl)}`}
                    title={blog.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Other video URLs - show as link
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <a
                    href={featuredImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    Watch Video
                  </a>
                </div>
              )
            ) : isValidImageUrl(featuredImageUrl) ? (
              // Valid Image URL - use Next.js Image
              <div className="relative w-full h-96">
                <Image
                  src={featuredImageUrl}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                  priority
                  unoptimized={featuredImageUrl.startsWith('http') && !featuredImageUrl.includes('res.cloudinary.com') && !featuredImageUrl.includes('localhost') && !featuredImageUrl.includes('unsplash.com')}
                />
              </div>
            ) : (
              // Invalid URL or unknown format - use regular img tag
              <div className="relative w-full h-96">
                <img
                  src={featuredImageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <p className="text-gray-500">Image not available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <BiCalendar /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {blog.author && (
              <span className="flex items-center gap-1">
                <BiUser /> {typeof blog.author === 'object' ? blog.author.name || blog.author.email : blog.author}
              </span>
            )}
            {blog.category && (
              <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-xs font-medium">
                {blog.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">{blog.excerpt}</p>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <BiShareAlt /> Share:
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare("whatsapp")}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Share on WhatsApp"
              >
                <FaWhatsapp size={20} />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
              >
                <FaFacebook size={20} />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                title="Share on Twitter"
              >
                <FaTwitter size={20} />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                title="Share on LinkedIn"
              >
                <FaLinkedin size={20} />
              </button>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            {blog.content ? (
              blog.content.includes('<') && blog.content.includes('>') ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {blog.content.split('\n').map((line, index) => (
                    <p key={index} className="mb-4">{line || '\u00A0'}</p>
                  ))}
                </div>
              )
            ) : (
              <p className="text-gray-600">No content available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

