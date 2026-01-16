import Link from 'next/link';

export const NoCampaignsFound = ({ resetFilters }) => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">🔍</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Campaigns Found
      </h3>
      <p className="text-gray-600 mb-6">
        We couldn't find any campaigns matching your criteria.
      </p>
    </div>
    {resetFilters && (
      <button
        onClick={resetFilters}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        Clear Filters
      </button>
    )}
  </div>
);

export const NoDonationsYet = ({ ctaLink, ctaText }) => (
  <div className="text-center py-16 px-4 bg-white rounded-lg">
    <div className="mb-6">
      <div className="text-8xl mb-4">💝</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Donations Yet
      </h3>
      <p className="text-gray-600 mb-6">
        Start making a difference by donating to a campaign.
      </p>
    </div>
    {ctaLink && (
      <Link href={ctaLink}>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
          {ctaText || 'Browse Campaigns'}
        </button>
      </Link>
    )}
  </div>
);

export const NoCampaignsCreated = () => (
  <div className="text-center py-16 px-4 bg-white rounded-lg">
    <div className="mb-6">
      <div className="text-8xl mb-4">🚀</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Campaigns Yet
      </h3>
      <p className="text-gray-600 mb-6">
        Create your first campaign and start raising funds for your cause.
      </p>
    </div>
    <Link href="/admin/create-fundraiser">
      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
        Create Campaign
      </button>
    </Link>
  </div>
);

export const NoCouponsAvailable = () => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">🎫</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Coupons Available
      </h3>
      <p className="text-gray-600 mb-6">
        There are no coupons available at the moment. Check back later!
      </p>
    </div>
  </div>
);

export const NoSearchResults = ({ searchTerm, onClear }) => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">🔎</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Results for "{searchTerm}"
      </h3>
      <p className="text-gray-600 mb-6">
        Try adjusting your search terms or filters.
      </p>
    </div>
    {onClear && (
      <button
        onClick={onClear}
        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
      >
        Clear Search
      </button>
    )}
  </div>
);

export const ErrorState = ({ title, message, onRetry }) => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-red-600 mb-2">
        {title || 'Something Went Wrong'}
      </h3>
      <p className="text-gray-600 mb-6">
        {message || 'An error occurred. Please try again.'}
      </p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
      >
        Try Again
      </button>
    )}
  </div>
);

export const EmptyInbox = () => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">📭</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Inbox is Empty
      </h3>
      <p className="text-gray-600">
        You have no messages at this time.
      </p>
    </div>
  </div>
);

export const NoDataAvailable = ({ icon = "📊", title = "No Data Available", message = "There's no data to display right now." }) => (
  <div className="text-center py-16 px-4">
    <div className="mb-6">
      <div className="text-8xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {message}
      </p>
    </div>
  </div>
);







