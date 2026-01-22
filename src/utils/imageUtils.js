import { getBackendBaseUrl } from "@/utils/api";

// Utility function to check if image should be unoptimized
export const shouldUnoptimizeImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  const unoptimizedDomains = [
    'carefoundationtrust.org',
    'www.carefoundationtrust.org',
    'unsplash.com',
    'images.unsplash.com',
    'localhost',
    '127.0.0.1',
    'localhost:5000',
    '127.0.0.1:5000',
    'carefoundation-backend-1.onrender.com',
    'caredigiworld.com',
    'amazonaws.com',
    's3.amazonaws.com',
    's3.ap-southeast-2.amazonaws.com',
    'care-foundation-uploads.s3'
  ];

  return unoptimizedDomains.some(domain => imageUrl.includes(domain));
};

// Normalize malformed image URLs (e.g., duplicated protocol/base)
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return "";

  const url = imageUrl.trim();
  if (!url) return "";

  // Pre-process: Fix malformed protocol patterns like "orghttps//" or "orghttp//"
  // This handles cases like "carefoundationtrust.orghttps//care-foundation-uploads.s3..."
  let processedUrl = url;
  
  // Pattern: "domain.orghttps//..." or "domain.orghttp//..." -> extract "https://..." or "http://..."
  const domainProtocolMatch = processedUrl.match(/([^\/]+\.org)(https?)\/\/(.+)/i);
  if (domainProtocolMatch) {
    const protocol = domainProtocolMatch[2]; // "https" or "http"
    const restOfUrl = domainProtocolMatch[3]; // Everything after "//"
    processedUrl = `${protocol}://${restOfUrl}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('Fixed malformed protocol:', { original: url, fixed: processedUrl });
    }
  } else {
    // Fallback: Direct replacement if pattern doesn't match
    if (processedUrl.includes('orghttps//')) {
      // Find where "orghttps//" starts and extract everything after "//"
      const index = processedUrl.indexOf('orghttps//');
      if (index !== -1) {
        const afterProtocol = processedUrl.substring(index + 10); // "orghttps//" is 10 chars
        processedUrl = `https://${afterProtocol}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Fixed malformed protocol (fallback orghttps//):', { original: url, fixed: processedUrl });
        }
      }
    } else if (processedUrl.includes('orghttp//')) {
      const index = processedUrl.indexOf('orghttp//');
      if (index !== -1) {
        const afterProtocol = processedUrl.substring(index + 9); // "orghttp//" is 9 chars
        processedUrl = `http://${afterProtocol}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Fixed malformed protocol (fallback orghttp//):', { original: url, fixed: processedUrl });
        }
      }
    }
  }

  // Helper function to try to complete incomplete S3 URLs
  const tryCompleteS3Url = (urlString) => {
    // Check if it looks like an incomplete S3 URL (ends with "s3.a" or "s3.am" etc.)
    if (urlString.includes('.s3.') && !urlString.includes('amazonaws.com')) {
      // Try to complete: "bucket.s3.a" -> "bucket.s3.amazonaws.com"
      // Match pattern: bucket-name.s3.a (with optional path after)
      const s3Pattern = /(https?:\/\/[^\/]+\.s3\.a)([^m]|$)/i;
      const s3Match = urlString.match(s3Pattern);
      if (s3Match) {
        // Extract everything after "s3.a" as potential path
        const afterS3a = urlString.substring(urlString.indexOf('.s3.a') + 5);
        // Remove any invalid characters before the path starts
        const pathMatch = afterS3a.match(/^[^\/]*(\/.*)?$/);
        const path = pathMatch && pathMatch[1] ? pathMatch[1] : '';
        
        // Reconstruct: base + ".s3.amazonaws.com" + path
        const base = s3Match[1].replace(/\.s3\.a$/i, '');
        return base + '.s3.amazonaws.com' + path;
      }
    }
    return urlString;
  };

  // Case 1: Multiple protocol occurrences → extract and try each URL
  const httpMatches = processedUrl.match(/https?:\/\/[^\s"']+/gi);
  if (httpMatches && httpMatches.length > 1) {
    // Try each URL from the end (most likely to be the actual image URL)
    for (let i = httpMatches.length - 1; i >= 0; i--) {
      let candidate = httpMatches[i];
      
      // Try to complete if it's an incomplete S3 URL
      candidate = tryCompleteS3Url(candidate);
      
      try {
        const parsed = new URL(candidate);
        // Check if it's a valid URL with a proper hostname
        if (parsed.hostname && !parsed.hostname.includes("http") && parsed.hostname.length > 0) {
          return parsed.href;
        }
      } catch {
        continue;
      }
    }
  }

  // Case 2: Single URL but might be concatenated (e.g., "carefoundationtrust.orghttps://...")
  // Try to find the first complete URL pattern
  const urlPattern = /https?:\/\/[^\s"']+/i;
  const match = processedUrl.match(urlPattern);
  if (match) {
    let candidate = match[0];
    candidate = tryCompleteS3Url(candidate);
    
    try {
      const parsed = new URL(candidate);
      if (parsed.hostname && !parsed.hostname.includes("http") && parsed.hostname.length > 0) {
        return parsed.href;
      }
    } catch {
      // Continue to next case
    }
  }

  // Case 3: Handle malformed protocol patterns like "orghttps//" or "orghttp//"
  // Pattern: "domain.orghttps//..." or "domain.orghttp//..." - extract and fix
  const malformedProtocolPattern = /\.org(https?)\/\/(.+)/i;
  const malformedProtocolMatch = processedUrl.match(malformedProtocolPattern);
  if (malformedProtocolMatch) {
    try {
      const protocol = malformedProtocolMatch[1]; // "https" or "http"
      const restOfUrl = malformedProtocolMatch[2]; // Everything after "//"
      // Reconstruct with proper protocol: "https://" + rest
      const candidate = `${protocol}://${restOfUrl}`;
      
      try {
        const parsed = new URL(candidate);
        if (parsed.hostname && !parsed.hostname.includes("http") && parsed.hostname.length > 0) {
          return parsed.href;
        }
      } catch {
        // Continue to next case
      }
    } catch {
      // Continue to next case
    }
  }

  // Case 3b: Check if it's a malformed URL with concatenated domains (standard pattern)
  // Pattern: "domain.orghttps://..." - extract the second part
  const malformedPattern = /\.org(https?:\/\/.+)/i;
  const malformedMatch = processedUrl.match(malformedPattern);
  if (malformedMatch) {
    let candidate = malformedMatch[1];
    candidate = tryCompleteS3Url(candidate);
    
    try {
      const parsed = new URL(candidate);
      if (parsed.hostname && !parsed.hostname.includes("http") && parsed.hostname.length > 0) {
        return parsed.href;
      }
    } catch {
      // Continue to next case
    }
  }

  // Case 4: Fully valid absolute URL → return as-is
  try {
    const parsed = new URL(processedUrl);
    if (parsed.hostname && !parsed.hostname.includes("http") && parsed.hostname.length > 0) {
      return parsed.href;
    }
  } catch {
    // Not a valid absolute URL → continue
  }

  // Case 5: Relative path → prefix backend URL when available
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) return processedUrl;
  return `${backendBaseUrl}${processedUrl.startsWith("/") ? "" : "/"}${processedUrl}`;
};
