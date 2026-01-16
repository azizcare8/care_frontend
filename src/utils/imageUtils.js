// Utility function to check if image should be unoptimized
export const shouldUnoptimizeImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  const unoptimizedDomains = [
    'carefoundationtrust.org',
    'www.carefoundationtrust.org',
    'unsplash.com',
    'images.unsplash.com',
    'localhost:5000',
    '127.0.0.1:5000',
    'carefoundation-backend-1.onrender.com',
    'caredigiworld.com'
  ];

  return unoptimizedDomains.some(domain => imageUrl.includes(domain));
};

