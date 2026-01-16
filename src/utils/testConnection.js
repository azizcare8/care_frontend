// Helper to get base URL based on environment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) return 'http://localhost:5000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://carefoundationtrust.org/api';
};

// Test connection to backend
export const testBackendConnection = async () => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Test registration endpoint
export const testRegistration = async (testData) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log('✅ Registration test response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    return { success: false, error: error.message };
  }
};









