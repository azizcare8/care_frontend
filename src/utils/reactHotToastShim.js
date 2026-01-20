const noop = () => undefined;

const toast = (message, options) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Keep output minimal; avoid crashing when console is overridden.
      console.warn('toast disabled:', message, options);
    } catch (error) {
      // ignore
    }
  }
  return undefined;
};

toast.success = toast;
toast.error = toast;
toast.loading = toast;
toast.dismiss = noop;
toast.remove = noop;
toast.custom = toast;
toast.promise = (promise) => promise;

const Toaster = () => null;

export { toast, Toaster };
export default toast;
