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

// Normalize malformed image URLs (e.g., duplicated protocol/base)
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return "";

  const url = imageUrl.trim();
  if (!url) return "";

  // Case 1: Multiple protocol occurrences → extract last valid one
  const firstHttpIndex = url.indexOf("http");
  const lastHttpIndex = url.lastIndexOf("http");
  if (firstHttpIndex !== -1 && lastHttpIndex !== firstHttpIndex) {
    const candidate = url.slice(lastHttpIndex);
    try {
      return new URL(candidate).href;
    } catch {
      return "";
    }
  }

  // Case 2: Fully valid absolute URL → return as-is
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("http")) {
      // Guard against malformed hostnames like "carefoundationtrust.orghttps"
      return "";
    }
    return parsed.href;
  } catch {
    // Not a valid absolute URL → continue
  }

  // Case 3: Relative path → prefix backend URL
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
