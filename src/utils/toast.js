import toast from 'react-hot-toast';

// Track shown notifications to prevent duplicates (in-memory, cleared on page reload)
const shownNotifications = new Map();

// Clear old notifications after 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of shownNotifications.entries()) {
    if (now - timestamp > 10000) { // 10 seconds
      shownNotifications.delete(key);
    }
  }
}, 5000); // Check every 5 seconds

export const showToastOnce = (message, type = 'success', options = {}) => {
  // Use provided id or create a unique key for this notification
  const toastId = options.id || `${type}-${message}`;
  const now = Date.now();
  
  // Check if this notification was shown recently (within 10 seconds)
  const lastShown = shownNotifications.get(toastId);
  if (lastShown && (now - lastShown) < 10000) {
    return null; // Don't show duplicate within 10 seconds
  }
  
  // Mark as shown with timestamp
  shownNotifications.set(toastId, now);
  
  // Show the notification with id to prevent duplicates
  if (type === 'success') {
    return toast.success(message, { ...options, id: toastId });
  } else if (type === 'error') {
    return toast.error(message, { ...options, id: toastId });
  } else if (type === 'loading') {
    return toast.loading(message, { ...options, id: toastId });
  } else {
    return toast(message, { ...options, id: toastId, icon: options.icon || 'ℹ️' });
  }
};

// Wrapper functions that use id to prevent duplicates
export const toastSuccess = (message, options = {}) => {
  return toast.success(message, { ...options, id: `success-${message}` });
};

export const toastError = (message, options = {}) => {
  return toast.error(message, { ...options, id: `error-${message}` });
};

// Export regular toast functions
export { toast };
export default toast;

