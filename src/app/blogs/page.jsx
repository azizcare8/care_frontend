"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import { BiCalendar, BiUser } from "react-icons/bi";
import BackToHome from "@/components/BackToHome";

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchBlogs();
  }, [categoryFilter]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const params = { status: "published", limit: 20 };
      if (categoryFilter !== "all") params.category = categoryFilter;
      
      const response = await api.get("/blogs", { params });
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2">
      <div className="max-w-full mx-auto px-4">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog & News</h1>
          <p className="text-gray-600">Stories of impact, success cases, and updates</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex justify-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="success_stories">Success Stories</option>
            <option value="impact">Impact Stories</option>
            <option value="updates">Updates</option>
            <option value="news">News</option>
          </select>
        </div>

        {/* Blogs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => router.push(`/blogs/${blog.slug || blog._id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {blog.featuredImage && (() => {
                  const imageUrl = typeof blog.featuredImage === 'object' 
                    ? blog.featuredImage?.url 
                    : blog.featuredImage;
                  
                  // Check if it's a video URL
                  const isVideoUrl = /youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.mov/i.test(imageUrl);
                  
                  if (isVideoUrl) {
                    return (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">📹 Video</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="h-48 relative">
                      <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        unoptimized={imageUrl.startsWith('http') && !imageUrl.includes('res.cloudinary.com') && !imageUrl.includes('localhost')}
                      />
                    </div>
                  );
                })()}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BiCalendar /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                    </span>
                    {blog.author && (
                      <span className="flex items-center gap-1">
                        <BiUser /> {blog.author.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt || blog.content?.substring(0, 150)}</p>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags?.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">No blog posts found</p>
          </div>
        )}
      </div>
    </div>
  );
}

