(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000;

  // Enhanced logging and monitoring utility
  const logger = {
    _getTimestamp: function() {
      return new Date().toISOString();
    },
    _metrics: {
      errors: [],
      performance: [],
      resources: new Set(),
      interactions: []
    },
    info: function(msg, ...args) {
      console.log(`[Widget ${VERSION}] ${this._getTimestamp()} - ${msg}`, ...args);
    },
    error: function(msg, ...args) {
      console.error(`[Widget ${VERSION}] ${this._getTimestamp()} - Error:`, msg, ...args);
      this._metrics.errors.push({
        message: msg,
        args,
        timestamp: this._getTimestamp(),
        stack: new Error().stack
      });
    }
  };

  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      this.loadTimeout = null;
      this.resourcesLoaded = new Set();
      
      window.addEventListener('message', this.handleMessage.bind(this));
      
      // Track all resource loads
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          logger.info('Resource loaded:', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration
          });
          this.resourcesLoaded.add(entry.name);
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }

    handleMessage(event) {
      logger.info('Message received:', event.data);
      
      switch(event.data.type) {
        case 'WIDGET_ERROR':
          logger.error('Widget error:', event.data.error);
          break;
        case 'WIDGET_READY':
          logger.info('Widget ready');
          this.isReady = true;
          break;
        case 'DEBUG_LOG':
          logger.info('Debug:', event.data.message);
          break;
      }
    }

    createIframe(sweepstakesId) {
      logger.info('Creating iframe for sweepstakes:', sweepstakesId);
      
      try {
        this.cleanup();
        this.iframe = document.createElement('iframe');
        
        // Set iframe attributes
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        
        // Set up load handlers
        this.iframe.onload = () => {
          logger.info('Iframe loaded');
          clearTimeout(this.loadTimeout);
          this.verifyIframeContent();
        };
        
        this.iframe.onerror = (error) => {
          logger.error('Iframe load error:', error);
          this.handleLoadError(error);
        };
        
        // Set source with cache busting
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        logger.info('Setting iframe src:', embedUrl);
        
        // Set load timeout
        this.loadTimeout = setTimeout(() => {
          if (!this.isReady) {
            logger.error('Iframe load timeout');
            this.handleLoadError(new Error('Load timeout'));
          }
        }, LOAD_TIMEOUT);

        // Initialize widget after a short delay
        setTimeout(() => {
          if (this.iframe.contentWindow) {
            const initMessage = {
              type: 'INIT_WIDGET',
              sweepstakesId,
              timestamp: Date.now()
            };
            logger.info('Sending init message:', initMessage);
            this.iframe.contentWindow.postMessage(initMessage, '*');
          }
        }, 1000);

        return this.iframe;
      } catch (error) {
        logger.error('Error creating iframe:', error);
        throw error;
      }
    }

    verifyIframeContent() {
      try {
        if (!this.iframe.contentWindow) {
          throw new Error('Cannot access iframe content window');
        }

        // Log all loaded resources
        logger.info('Loaded resources:', Array.from(this.resourcesLoaded));
        
        // Check React availability
        if (this.iframe.contentWindow.React) {
          logger.info('React is available in iframe');
        } else {
          logger.error('React not found in iframe');
        }

        this.isReady = true;
        logger.info('Iframe content verified successfully');
      } catch (error) {
        logger.error('Content verification failed:', error);
        this.handleLoadError(error);
      }
    }

    handleLoadError(error) {
      logger.error('Load error:', error);
      
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        logger.info(`Retrying (${this.retryCount}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          this.setIframeSource();
        }, 1000 * this.retryCount);
      } else {
        logger.error('Max retries reached');
        this.showError('Failed to load widget content after multiple attempts');
      }
    }

    setIframeSource() {
      try {
        const url = new URL(`${STORAGE_URL}/embed.html`);
        url.searchParams.append('v', VERSION);
        url.searchParams.append('t', Date.now().toString());
        
        logger.info('Setting iframe src:', url.toString());
        this.iframe.src = url.toString();
      } catch (error) {
        logger.error('Error setting iframe source:', error);
        throw error;
      }
    }

    showError(message) {
      logger.error('Showing error message:', message);
      const container = document.getElementById('sweepstakes-widget');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">Unable to load sweepstakes widget: ${message}</p>
          </div>
        `;
      }
    }

    cleanup() {
      logger.info('Cleaning up');
      clearTimeout(this.loadTimeout);
      
      if (this.iframe) {
        this.iframe.onload = null;
        this.iframe.onerror = null;
        this.iframe.remove();
        this.iframe = null;
      }

      this.resourcesLoaded.clear();
      this.isReady = false;
      this.retryCount = 0;
    }
  }

  // Initialize when the script loads
  const initialize = () => {
    logger.info('Initializing widget');
    
    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      logger.error('Widget container not found');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      logger.error('No sweepstakes ID provided');
      return;
    }

    logger.info('Found sweepstakes ID:', sweepstakesId);
    const iframeManager = new IframeManager();
    const iframe = iframeManager.createIframe(sweepstakesId);
    
    if (iframe) {
      container.appendChild(iframe);
      logger.info('Widget initialized successfully');
    }
  };

  if (document.readyState === 'loading') {
    logger.info('Document loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    logger.info('Document ready, initializing immediately');
    initialize();
  }
})();