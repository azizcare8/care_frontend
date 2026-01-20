"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useCampaignStore from '@/store/campaignStore';
import useAuthStore from '@/store/authStore';
import toast, { showToastOnce } from '@/utils/toast';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentCampaign: campaign, isLoading, getCampaign } = useCampaignStore();
  const { user } = useAuthStore();
  
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [hasShownDonationReady, setHasShownDonationReady] = useState(false);

  const suggestedAmounts = [500, 1000, 2000, 5000];

  useEffect(() => {
    if (params.id) {
      loadCampaign();
    }
    
    // Check for pre-filled amount from homepage donation form
    if (!hasShownDonationReady) {
      const savedDonorInfo = localStorage.getItem('donorInfo');
      if (savedDonorInfo) {
        try {
          const parsed = JSON.parse(savedDonorInfo);
          if (parsed.amount) {
            setCustomAmount(parsed.amount.toString());
            // Show donation modal automatically if amount is pre-filled
            setTimeout(() => {
              setShowDonationModal(true);
              showToastOnce('Your donation details are ready! Review and proceed.', 'success', { id: 'donation-details-ready' });
              setHasShownDonationReady(true);
            }, 1000);
          }
        } catch (error) {
          console.error('Failed to parse donor info:', error);
        }
      }
    }
  }, [params.id, hasShownDonationReady]);

  const loadCampaign = async () => {
    try {
      if (!params.id) {
        toast.error('Campaign ID is missing');
        router.push('/campaigns');
        return;
      }
      await getCampaign(params.id);
    } catch (error) {
      console.error('Load campaign error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Campaign not found');
      setTimeout(() => {
        router.push('/campaigns');
      }, 2000);
    }
  };

  const handleShare = async (platform) => {
    try {
      if (!campaign) return;
      
      const shareUrl = window.location.href;
      const shareText = `Support ${campaign.title} on Care Foundation`;
      
      if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
      
      toast.success('Thank you for sharing!');
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleDonateClick = () => {
    setShowDonationModal(true);
  };

  const handleDonation = async () => {
    if (!campaign || !campaign._id) {
      toast.error('Campaign information is missing. Please refresh the page.');
      return;
    }

    const amount = customAmount || selectedAmount;
    
    if (!amount || amount < 1) {
      toast.error('Minimum donation amount is ₹1');
      return;
    }

    // Get saved donor info from localStorage (if entered on homepage)
    const savedDonorInfo = localStorage.getItem('donorInfo');
    let donorDetails = {};
    if (savedDonorInfo) {
      try {
        const parsed = JSON.parse(savedDonorInfo);
        donorDetails = {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email,
          phone: parsed.phone,
          address: parsed.address
        };
        // Clear after using
        localStorage.removeItem('donorInfo');
      } catch (error) {
        console.error('Failed to parse donor info:', error);
      }
    }

    // Redirect to payment page with campaign details
    const donationData = {
      campaignId: campaign._id,
      amount: parseInt(amount),
      isAnonymous,
      message,
      ...donorDetails
    };

    // Store in session storage
    sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));
    router.push(`/donate/${campaign._id}`);
  };

  if (isLoading || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
  const daysRemaining = campaign.daysRemaining || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Main Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative h-96">
                {campaign.images && campaign.images[0] ? (
                  <img
                    src={campaign.images[0].url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                    <span className="text-gray-400 text-6xl">📷</span>
                  </div>
                )}
                {campaign.isUrgent && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                    Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Additional Images Gallery (if more than 1 image) */}
            {campaign.images && campaign.images.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {campaign.images.slice(1, 7).map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`${campaign.title} - Image ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign Videos */}
            {campaign.videos && campaign.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaign.videos.map((video, index) => (
                    <div key={index} className="relative">
                      {video.platform === 'youtube' || video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={video.url.includes('embed') ? video.url : `https://www.youtube.com/embed/${video.url.split('/').pop()}`}
                            title={video.caption || `Video ${index + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <div className="relative">
                          <video
                            controls
                            className="w-full rounded-lg"
                            src={video.url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      {video.caption && (
                        <p className="text-sm text-gray-600 mt-2">{video.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {campaign.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>

              <p className="text-gray-600 mb-6">
                {campaign.shortDescription}
              </p>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{campaign.currentAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Raised</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {campaign.analytics?.donations || 0}
                  </div>
                  <div className="text-sm text-gray-600">Donors</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {daysRemaining}
                  </div>
                  <div className="text-sm text-gray-600">Days Left</div>
                </div>
              </div>

              {/* Full Description */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Campaign</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Beneficiary Info */}
              {campaign.beneficiary && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Beneficiary Information</h3>
                  <p className="text-gray-700">
                    <strong>Name:</strong> {campaign.beneficiary.name}<br />
                    <strong>Relationship:</strong> {campaign.beneficiary.relationship}<br />
                    {campaign.beneficiary.age && <><strong>Age:</strong> {campaign.beneficiary.age}<br /></>}
                    {campaign.beneficiary.gender && <><strong>Gender:</strong> {campaign.beneficiary.gender}<br /></>}
                  </p>
                </div>
              )}

              {/* Campaign Updates */}
              {campaign.updates && campaign.updates.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Campaign Updates</h3>
                  {campaign.updates.map((update, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{update.title}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{update.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Donations */}
              {campaign.recentDonations && campaign.recentDonations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Donations</h3>
                  <div className="space-y-3">
                    {campaign.recentDonations.map((donation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-green-600 font-bold">
                              {donation.isAnonymous ? '?' : donation.donor?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {donation.isAnonymous ? 'Anonymous' : donation.donor?.name || 'Anonymous'}
                            </div>
                            {donation.message && (
                              <div className="text-sm text-gray-600">{donation.message}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">
                          ₹{donation.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Progress</span>
                  <span className="font-bold text-green-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹{campaign.currentAmount.toLocaleString()}</span>
                  <span>₹{campaign.goalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Donate Button */}
              <button
                onClick={handleDonateClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 mb-4"
              >
                Donate Now
              </button>

              {/* Share Buttons */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Share This Campaign</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    📘 Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center gap-2 bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center gap-2 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800"
                  >
                    💼 LinkedIn
                  </button>
                </div>
              </div>

              {/* Fundraiser Info */}
              {campaign.fundraiser && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Created By</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold mr-3">
                      {campaign.fundraiser.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {campaign.fundraiser.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {campaign.fundraiser.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDonationModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Make a Donation</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Suggested Amounts */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Or Enter Custom Amount
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount('');
                }}
                placeholder="Enter amount (min ₹100)"
                min="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Donate anonymously</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDonation}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

