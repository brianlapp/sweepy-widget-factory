(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000;

  // Enhanced diagnostic system with network monitoring
  const diagnostics = {
    startTime: Date.now(),
    events: [],
    errors: [],
    resources: new Set(),
    networkRequests: [],
    log: function(type, message, data = {}) {
      const event = {
        type,
        message,
        timestamp: Date.now(),
        timeSinceStart: Date.now() - this.startTime,
        data
      };
      this.events.push(event);
      console.log(`[Widget Diagnostic] ${type}:`, message, data);
      return event;
    },
    error: function(message, error = null) {
      const errorEvent = {
        message,
        error: error?.toString(),
        stack: error?.stack,
        timestamp: Date.now()
      };
      this.errors.push(errorEvent);
      console.error(`[Widget Error] ${message}`, error);
      return errorEvent;
    },
    network: function(request) {
      const details = {
        url: request.url,
        status: request.status,
        type: request.type,
        timestamp: Date.now()
      };
      this.networkRequests.push(details);
      this.log('network_request', `${request.type} request to ${request.url}`, details);
    }
  };

  // Network request monitoring
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const request = args[0];
    const url = typeof request === 'string' ? request : request.url;
    
    return originalFetch.apply(this, args)
      .then(response => {
        diagnostics.network({
          url,
          status: response.status,
          type: 'fetch',
          ok: response.ok
        });
        return response;
      })
      .catch(error => {
        diagnostics.error('Fetch error:', error);
        throw error;
      });
  };

  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      this.loadTimeout = null;
      this.initTimeout = null;
      
      // Track all resource loads
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          diagnostics.log('resource_load', `Resource loaded: ${entry.name}`, {
            type: entry.initiatorType,
            duration: entry.duration
          });
          diagnostics.resources.add(entry.name);
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      // Listen for messages
      window.addEventListener('message', this.handleMessage.bind(this));
      diagnostics.log('init', 'IframeManager initialized');
    }

    handleMessage(event) {
      try {
        diagnostics.log('message', 'Received message', event.data);
        
        switch(event.data.type) {
          case 'WIDGET_ERROR':
            diagnostics.error('Widget error from iframe', event.data.error);
            break;
          case 'WIDGET_READY':
            this.handleWidgetReady(event.data);
            break;
          case 'DEBUG_LOG':
            diagnostics.log('iframe_debug', event.data.message, event.data);
            break;
          case 'REACT_LOADED':
            diagnostics.log('react_status', 'React initialization status', event.data);
            break;
          case 'setHeight':
            if (this.iframe) {
              this.iframe.style.height = `${event.data.height}px`;
              diagnostics.log('height_update', `Updated iframe height: ${event.data.height}`);
            }
            break;
        }
      } catch (error) {
        diagnostics.error('Message handling error', error);
      }
    }

    handleWidgetReady(data) {
      diagnostics.log('widget_ready', 'Widget reported ready', data);
      clearTimeout(this.initTimeout);
      this.isReady = true;
      
      // Verify React is loaded
      if (this.iframe?.contentWindow) {
        try {
          const hasReact = Boolean(this.iframe.contentWindow.React);
          diagnostics.log('react_check', `React availability: ${hasReact}`);
        } catch (error) {
          diagnostics.error('React verification failed', error);
        }
      }
    }

    createIframe(sweepstakesId) {
      diagnostics.log('create_iframe', 'Creating iframe', { sweepstakesId });
      
      try {
        this.cleanup();
        this.iframe = document.createElement('iframe');
        
        // Set iframe attributes
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        
        // Enhanced load handling
        this.iframe.onload = () => {
          diagnostics.log('iframe_load', 'Iframe loaded');
          clearTimeout(this.loadTimeout);
          this.verifyIframeContent();
        };
        
        this.iframe.onerror = (error) => {
          diagnostics.error('Iframe load error', error);
          this.handleLoadError(error);
        };
        
        // Set source with cache busting and version
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        diagnostics.log('set_src', `Setting iframe src: ${embedUrl}`);
        
        // Set load timeout
        this.loadTimeout = setTimeout(() => {
          if (!this.isReady) {
            diagnostics.error('Iframe load timeout');
            this.handleLoadError(new Error('Load timeout'));
          }
        }, LOAD_TIMEOUT);

        // Initialize widget after load
        this.initTimeout = setTimeout(() => {
          if (this.iframe.contentWindow) {
            const initMessage = {
              type: 'INIT_WIDGET',
              sweepstakesId,
              timestamp: Date.now()
            };
            diagnostics.log('init_message', 'Sending init message', initMessage);
            this.iframe.contentWindow.postMessage(initMessage, '*');
          }
        }, 1000);

        return this.iframe;
      } catch (error) {
        diagnostics.error('Error creating iframe', error);
        throw error;
      }
    }

    verifyIframeContent() {
      try {
        if (!this.iframe.contentWindow) {
          throw new Error('Cannot access iframe content window');
        }

        // Log loaded resources
        diagnostics.log('resources', 'Loaded resources', Array.from(diagnostics.resources));
        
        // Verify React
        if (this.iframe.contentWindow.React) {
          diagnostics.log('react_check', 'React is available');
        } else {
          diagnostics.error('React not found in iframe');
        }

        this.isReady = true;
        diagnostics.log('verify', 'Iframe content verified');
      } catch (error) {
        diagnostics.error('Content verification failed', error);
        this.handleLoadError(error);
      }
    }

    handleLoadError(error) {
      diagnostics.error('Load error occurred', error);
      
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        diagnostics.log('retry', `Retrying (${this.retryCount}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          this.setIframeSource();
        }, 1000 * this.retryCount);
      } else {
        diagnostics.error('Max retries reached');
        this.showError('Failed to load widget content after multiple attempts');
      }
    }

    setIframeSource() {
      try {
        const url = new URL(`${STORAGE_URL}/embed.html`);
        url.searchParams.append('v', VERSION);
        url.searchParams.append('t', Date.now().toString());
        
        diagnostics.log('set_src', `Setting iframe src: ${url.toString()}`);
        this.iframe.src = url.toString();
      } catch (error) {
        diagnostics.error('Error setting iframe source', error);
        throw error;
      }
    }

    showError(message) {
      diagnostics.error('Showing error message', { message });
      const container = document.getElementById('sweepstakes-widget');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">Unable to load sweepstakes widget: ${message}</p>
            <pre style="font-size: 12px; margin-top: 10px; text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
              ${JSON.stringify(diagnostics.events.slice(-5), null, 2)}
            </pre>
          </div>
        `;
      }
    }

    cleanup() {
      diagnostics.log('cleanup', 'Cleaning up iframe manager');
      clearTimeout(this.loadTimeout);
      clearTimeout(this.initTimeout);
      
      if (this.iframe) {
        this.iframe.onload = null;
        this.iframe.onerror = null;
        this.iframe.remove();
        this.iframe = null;
      }

      diagnostics.resources.clear();
      this.isReady = false;
      this.retryCount = 0;
    }
  }

  // Initialize when the script loads
  const initialize = () => {
    diagnostics.log('init', 'Initializing widget script');
    
    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      diagnostics.error('Widget container not found');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      diagnostics.error('No sweepstakes ID provided');
      return;
    }

    diagnostics.log('init', 'Found sweepstakes ID', { sweepstakesId });
    const iframeManager = new IframeManager();
    const iframe = iframeManager.createIframe(sweepstakesId);
    
    if (iframe) {
      container.appendChild(iframe);
      diagnostics.log('init', 'Widget initialized successfully');
    }
  };

  if (document.readyState === 'loading') {
    diagnostics.log('init', 'Document loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    diagnostics.log('init', 'Document ready, initializing immediately');
    initialize();
  }
})();