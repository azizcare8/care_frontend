// Loading Skeleton Components for Better UX

export const CampaignCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-full"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      <div className="space-y-2 mt-4">
        <div className="h-2 bg-gray-300 rounded-full w-full"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-300 rounded flex-1"></div>
        <div className="h-8 bg-gray-300 rounded w-8"></div>
      </div>
    </div>
  </div>
);

export const CampaignDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-12 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded-full w-full"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-300 h-32 rounded-xl"></div>
      ))}
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-300 rounded"></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-300 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg overflow-hidden animate-pulse">
    <div className="p-4 border-b">
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
    </div>
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="bg-white rounded-lg p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    ))}
    <div className="h-12 bg-gray-300 rounded w-full"></div>
  </div>
);

export const PaymentSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white rounded-lg p-6 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);







