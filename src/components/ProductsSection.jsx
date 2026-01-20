"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import { BiImage } from "react-icons/bi";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { normalizeImageUrl } from "@/utils/imageUtils";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [products]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/products", {
        params: { status: "active" }
      });
      // Sort products: featured first, then by priority, then by creation date
      const sortedProducts = (response.data.data || []).sort((a, b) => {
        // Featured products first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by priority (higher priority first)
        if (a.priority !== b.priority) return (b.priority || 0) - (a.priority || 0);
        // Then by creation date (newer first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setProducts(sortedProducts);
    } catch (error) {
      // Don't log network errors (backend not running)
      if (!error?.isNetworkError && !error?.silent) {
        console.error("Failed to fetch products:", error);
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white">
        <div className="max-w-full mx-auto px-2">
          <div className="text-center mb-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-pink-50 to-white px-2 relative border-y-2 border-amber-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500"></div>
      <div className="max-w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Our Products
          </h2>
          <p className="text-gray-600 text-lg mt-3">
            Essential items we need for our beneficiaries. Help us reach our goals!
          </p>
          <div className="mt-3 w-24 h-1 bg-gradient-to-r from-blue-500 to-pink-500 mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="text-gray-700 text-lg" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all border-2 border-gray-200"
              aria-label="Scroll right"
            >
              <FaChevronRight className="text-gray-700 text-lg" />
            </button>
          )}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-12" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {products.slice(0, 6).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
              className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-400 group"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                {product.image?.url ? (
                  <Image
                    src={normalizeImageUrl(product.image.url)}
                    alt={product.name}
                    width={500}
                    height={200}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <BiImage className="text-gray-400" size={48} />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-r-lg mt-5 py-2 px-4 text-sm font-bold shadow-lg">
                    Featured
                  </span>
                )}
                {product.category && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-l-lg mt-5 py-2 px-4 text-sm font-bold shadow-lg">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span className="font-semibold">Progress</span>
                    <span className="font-bold text-green-600">
                      {product.targetQuantity > 0
                        ? Math.round((product.currentQuantity / product.targetQuantity) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          product.targetQuantity > 0
                            ? Math.min((product.currentQuantity / product.targetQuantity) * 100, 100)
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 text-center">
                    <span className="font-semibold text-green-700">
                      {product.currentQuantity || 0}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold">
                      {product.targetQuantity || 0}
                    </span>{" "}
                    {product.unit || "items"}
                  </div>
                </div>

                {product.price > 0 && (
                  <div className="mb-4 text-center">
                    <span className="text-2xl font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href={`/products/${product._id}`}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold text-sm shadow-md hover:from-green-600 hover:to-green-700 transition-all text-center transform hover:scale-105"
                  >
                    Donate Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {products.length > 6 && (
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


