(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = process.env.VITE_APP_VERSION || '1.0.0';
  
  class WidgetLoader {
    constructor() {
      this.iframe = null;
      this.isReady = false;
      console.log('[Widget] Initializing WidgetLoader');
      
      window.addEventListener('message', this.handleMessage.bind(this), false);
      window.addEventListener('error', this.handleError.bind(this), true);
    }

    handleMessage(event) {
      const { type, data } = event.data || {};
      if (!type) return;

      console.log('[Widget] Received message:', type, data);
      
      switch(type) {
        case 'WIDGET_ERROR':
          console.error('[Widget] Error from iframe:', data.error);
          break;
        case 'WIDGET_READY':
          this.isReady = true;
          console.log('[Widget] Ready event received');
          break;
        case 'setHeight':
          if (this.iframe && data?.height) {
            this.iframe.style.height = `${data.height}px`;
          }
          break;
      }
    }

    handleError(event) {
      console.error('[Widget] Global error:', event.error);
    }

    createIframe(sweepstakesId) {
      console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
      
      if (this.iframe) {
        this.iframe.remove();
      }

      this.iframe = document.createElement('iframe');
      this.iframe.style.width = '100%';
      this.iframe.style.border = 'none';
      this.iframe.style.minHeight = '600px';
      this.iframe.setAttribute('scrolling', 'no');
      this.iframe.setAttribute('title', 'Sweepstakes Widget');
      
      const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
      console.log('[Widget] Setting iframe src:', embedUrl);
      this.iframe.src = embedUrl;
      
      this.iframe.onload = () => {
        console.log('[Widget] Iframe loaded, initializing content');
        this.initializeContent(sweepstakesId);
      };
      
      return this.iframe;
    }

    initializeContent(sweepstakesId) {
      if (!this.iframe?.contentWindow) {
        console.error('[Widget] Cannot initialize content - iframe or contentWindow missing');
        return;
      }

      console.log('[Widget] Initializing content with sweepstakes ID:', sweepstakesId);
      this.iframe.contentWindow.postMessage({
        type: 'INITIALIZE_WIDGET',
        sweepstakesId
      }, '*');
    }

    cleanup() {
      if (this.iframe) {
        this.iframe.remove();
        this.iframe = null;
      }
      this.isReady = false;
      console.log('[Widget] Cleanup completed');
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
    const loader = new WidgetLoader();
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