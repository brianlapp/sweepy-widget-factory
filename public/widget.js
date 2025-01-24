(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000;
  const ALLOWED_ORIGINS = ['*']; // Allow all origins for testing
  const MESSAGE_DEBOUNCE = 100;
  
  class Diagnostics {
    constructor() {
      this.events = [];
      this.startTime = Date.now();
    }

    log(level, message, data = {}) {
      const event = {
        level,
        message,
        timestamp: Date.now(),
        timeSinceStart: Date.now() - this.startTime,
        data
      };
      
      this.events.push(event);
      console[level](`[Widget] ${message}`, data);
      
      if (this.events.length > 100) {
        this.events = this.events.slice(-100);
      }

      // Send critical messages to parent
      if (level === 'error' || message.includes('CRITICAL')) {
        window.parent.postMessage({
          type: 'WIDGET_LOG',
          event
        }, '*');
      }
    }

    info(message, data = {}) { this.log('info', message, data); }
    error(message, error = null) {
      const errorDetails = {
        message: error?.message || message,
        stack: error?.stack,
        timestamp: Date.now()
      };
      this.log('error', message, errorDetails);
    }
    warn(message, data = {}) { this.log('warn', message, data); }
  }

  class IframeManager {
    constructor(diagnostics) {
      this.diagnostics = diagnostics;
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      
      window.addEventListener('message', this.handleMessage.bind(this), false);
      window.addEventListener('error', this.handleError.bind(this), true);
      
      this.diagnostics.info('IframeManager initialized');
    }

    handleMessage(event) {
      try {
        const { type, data } = event.data || {};
        if (!type) return;

        this.diagnostics.info(`Received message: ${type}`, data);
        
        switch(type) {
          case 'WIDGET_ERROR':
            this.diagnostics.error('Widget error from iframe', data.error);
            break;
          case 'WIDGET_READY':
            this.handleWidgetReady(data);
            break;
          case 'setHeight':
            if (this.iframe && data?.height) {
              this.iframe.style.height = `${data.height}px`;
            }
            break;
        }
      } catch (error) {
        this.diagnostics.error('Message handling error:', error);
      }
    }

    handleError(event) {
      event.preventDefault();
      this.diagnostics.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }

    handleWidgetReady(data) {
      this.diagnostics.info('Widget reported ready', data);
      this.isReady = true;
    }

    createIframe(sweepstakesId) {
      this.diagnostics.info('Creating iframe', { sweepstakesId });
      
      try {
        this.cleanup();
        this.iframe = document.createElement('iframe');
        
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        
        this.iframe.onload = () => {
          this.diagnostics.info('Iframe loaded successfully');
          this.initializeContent(sweepstakesId);
        };
        
        this.iframe.onerror = (error) => {
          this.diagnostics.error('Iframe load error', error);
        };
        
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        
        return this.iframe;
      } catch (error) {
        this.diagnostics.error('Error creating iframe', error);
        throw error;
      }
    }

    initializeContent(sweepstakesId) {
      try {
        if (!this.iframe.contentWindow) {
          throw new Error('Iframe content window not available');
        }

        // Initialize the widget in the iframe
        this.iframe.contentWindow.postMessage({
          type: 'INITIALIZE_WIDGET',
          sweepstakesId
        }, '*');

      } catch (error) {
        this.diagnostics.error('Error initializing iframe content', error);
      }
    }

    cleanup() {
      this.diagnostics.info('Cleaning up iframe manager');
      
      if (this.iframe) {
        this.iframe.onload = null;
        this.iframe.onerror = null;
        this.iframe.remove();
        this.iframe = null;
      }
      
      this.isReady = false;
      this.retryCount = 0;
    }
  }

  // Initialize the widget system
  const initialize = () => {
    const diagnostics = new Diagnostics();
    diagnostics.info('Starting initialization');
    
    try {
      const container = document.getElementById('sweepstakes-widget');
      if (!container) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = container.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      const iframeManager = new IframeManager(diagnostics);
      const iframe = iframeManager.createIframe(sweepstakesId);
      
      if (iframe) {
        container.appendChild(iframe);
        diagnostics.info('Widget initialized successfully');
      }
    } catch (error) {
      diagnostics.error('Initialization failed:', error);
      throw error;
    }
  };

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();