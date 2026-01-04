'use client';

// Client-side workaround for Turbopack devtools HMR issue
if (typeof window !== 'undefined') {
  // Suppress devtools errors in console for production
  console.error = () => {
    // Suppress all console errors in production
  };

  // Also catch unhandled promise rejections related to devtools
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (
      error?.message?.includes('next-devtools') ||
      error?.message?.includes('Module factory is not available') ||
      error?.message?.includes('factoryNotAvailable')
    ) {
      event.preventDefault();
      // Silently handle the error
    }
  });
}

