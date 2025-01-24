(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = process.env.VITE_APP_VERSION || '1.0.0';
  
  // Import the WidgetLoader class
  const { WidgetLoader } = require('../src/widget/core/WidgetLoader');
  
  // Initialize the widget
  const initialize = () => {
    console.log('[Widget] Starting initialization');
    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      console.error('[Widget] Container not found');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      console.error('[Widget] No sweepstakes ID provided');
      return;
    }

    console.log('[Widget] Creating loader for sweepstakes:', sweepstakesId);
    const loader = new WidgetLoader({
      storageUrl: STORAGE_URL,
      version: VERSION
    });
    
    const iframe = loader.createIframe(sweepstakesId);
    container.appendChild(iframe);
  };

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose initialize function globally
  window.initializeWidget = initialize;
})();