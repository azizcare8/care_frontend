"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useCampaignStore from '@/store/campaignStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CampaignCardSkeleton } from '@/components/LoadingSkeleton';
import { NoCampaignsFound, NoSearchResults } from '@/components/EmptyState';
import BackToHome from '@/components/BackToHome';
import { getBackendBaseUrl } from '@/utils/api';

function CampaignsContent() {
  const searchParams = useSearchParams();
  const { campaigns, isLoading, getCampaigns, searchCampaigns } = useCampaignStore();
  const [showDonorBanner, setShowDonorBanner] = useState(false);
  const [donorAmount, setDonorAmount] = useState(0);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: '-createdAt',
    status: 'active',
    page: 1,
    limit: 12
  });

  // Check if user came from homepage donation form
  useEffect(() => {
    const savedDonorInfo = localStorage.getItem('donorInfo');
    if (savedDonorInfo) {
      try {
        const parsed = JSON.parse(savedDonorInfo);
        if (parsed.amount) {
          setDonorAmount(parsed.amount);
          setShowDonorBanner(true);
          
          // Clear any search filters to show all campaigns
          setFilters(prev => ({ 
            ...prev, 
            search: '', 
            category: '',
            page: 1 
          }));
        }
      } catch (error) {
        console.error('Failed to parse donor info:', error);
      }
    }
  }, []);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'animal', label: 'Animal Welfare' },
    { value: 'environment', label: 'Environment' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-currentAmount', label: 'Highest Raised' },
    { value: 'currentAmount', label: 'Lowest Raised' },
    { value: '-goalAmount', label: 'Highest Goal' }
  ];

  useEffect(() => {
    loadCampaigns();
  }, [filters]);

  const loadCampaigns = async () => {
    try {
      if (filters.search) {
        await searchCampaigns(filters.search, filters);
      } else {
        await getCampaigns(filters);
      }
    } catch (error) {
      toast.error('Failed to load campaigns');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const CampaignCard = ({ campaign }) => {
    const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
    const daysRemaining = campaign.daysRemaining || 0;
    
    // Get image URL with fallback
    const getImageUrl = () => {
      if (campaign.images && campaign.images.length > 0) {
        let imageUrl = campaign.images[0]?.url || campaign.images[0];
        
        // Handle if imageUrl is an object
        if (typeof imageUrl === 'object' && imageUrl !== null) {
          imageUrl = imageUrl.url || imageUrl.path || null;
        }
        
        if (typeof imageUrl === 'string' && imageUrl.trim()) {
          // Handle full URLs (already complete)
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
          }
          
          // Handle relative URLs starting with /
          if (imageUrl.startsWith('/')) {
            // If it's a public path, return as is
            if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/public/')) {
              return imageUrl;
            }
            // Otherwise, prepend backend URL
            const backendBaseURL = getBackendBaseUrl();
            return `${backendBaseURL}${imageUrl}`;
          }
          
          // Handle backend upload paths (without leading slash)
          const backendBaseURL = getBackendBaseUrl();
          // Remove leading slash if present to avoid double slashes
          const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
          return `${backendBaseURL}/${cleanUrl}`;
        }
      }
      return null;
    };

    const imageUrl = getImageUrl();
    const [imageError, setImageError] = useState(false);

    return (
      <Link href={`/campaigns/${campaign._id}`}>
          <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-green-200 transform hover:-translate-y-1">
          {/* Campaign Image */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={campaign.title || "Campaign Image"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => {
                  setImageError(true);
                }}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                <span className="text-gray-400 text-4xl">📷</span>
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
            
            {campaign.isUrgent && (
              <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                🚨 Urgent
              </span>
            )}
            {campaign.isFeatured && (
              <span className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Campaign Info */}
          <div className="p-4">
            {/* Category Badge */}
            <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full mb-2">
              {campaign.category}
            </span>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {campaign.title}
            </h3>

            {/* Short Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {campaign.shortDescription}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Raised</span>
                <span className="text-green-600 font-bold">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-900 font-bold">
                  ₹{campaign.currentAmount.toLocaleString()}
                </span>
                <span className="text-gray-500"> raised</span>
              </div>
              <div className="text-gray-600">
                of ₹{campaign.goalAmount.toLocaleString()}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center">
                <span className="mr-1">⏱️</span>
                <span>{daysRemaining} days left</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">👥</span>
                <span>{campaign.analytics?.donations || 0} donors</span>
              </div>
            </div>

            {/* Donate Button - Visible on hover */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                <span>💝</span>
                <span>Donate Now</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Home */}
      <div className="container mx-auto px-4 pt-6">
        <BackToHome />
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Browse Fundraisers</h1>
          <p className="text-xl">Support causes that matter to you</p>
        </div>
      </div>

      {/* Donor Info Banner */}
      {showDonorBanner && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6 shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-20 -ml-24 -mb-24"></div>
            
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl animate-bounce">
                  💝
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Ready to Donate ₹{donorAmount.toLocaleString()}!
                  </h3>
                  <p className="text-gray-700 text-lg">
                    👇 <strong>Click on any campaign below</strong> to complete your donation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDonorBanner(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close banner"
              >
                ×
              </button>
            </div>
            
            {/* Arrow pointing down */}
            <div className="mt-4 flex justify-center">
              <div className="animate-bounce text-green-600 text-4xl">
                ⬇️
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search campaigns..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 px-2 py-1"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `Showing ${campaigns.length} campaigns`}
          </p>
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        ) : filters.search ? (
          <NoSearchResults 
            searchTerm={filters.search} 
            onClear={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))} 
          />
        ) : (
          <NoCampaignsFound 
            resetFilters={() => setFilters({
              category: '',
              search: '',
              sortBy: '-createdAt',
              status: 'active',
              page: 1,
              limit: 12
            })} 
          />
        )}

        {/* Pagination */}
        {campaigns.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-green-500 text-white rounded-md">
                Page {filters.page}
              </span>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={campaigns.length < filters.limit}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  );
}

