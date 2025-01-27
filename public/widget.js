(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = process.env.VITE_APP_VERSION || '1.0.0';
  
  class WidgetLoader {
    constructor(config) {
      this.storageUrl = config.storageUrl;
      this.version = config.version;
    }

    createIframe(sweepstakesId) {
      console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
      
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.minHeight = '600px';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('title', 'Sweepstakes Widget');
      
      // Set the iframe source to the embed.html with the sweepstakes ID
      const embedUrl = `${this.storageUrl}/embed.html?id=${sweepstakesId}&v=${this.version}`;
      iframe.src = embedUrl;
      
      // Handle iframe messages for height adjustments
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'setHeight') {
          iframe.style.height = `${event.data.height}px`;
        }
      });

      return iframe;
    }
  }
  
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