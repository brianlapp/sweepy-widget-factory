(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000;
  const ALLOWED_ORIGINS = ['*']; // We can make this more restrictive later

  // Enhanced error tracking system
  class ErrorTracker {
    constructor() {
      this.errors = [];
      this.errorListeners = new Set();
      this.maxErrors = 10;
    }

    addError(error, context = {}) {
      const errorObj = {
        message: error.message || error,
        stack: error.stack,
        timestamp: Date.now(),
        context
      };
      
      this.errors.push(errorObj);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }
      
      this.notifyListeners(errorObj);
      return errorObj;
    }

    onError(callback) {
      this.errorListeners.add(callback);
      return () => this.errorListeners.delete(callback);
    }

    notifyListeners(error) {
      this.errorListeners.forEach(listener => {
        try {
          listener(error);
        } catch (e) {
          console.error('Error in error listener:', e);
        }
      });
    }

    getErrors() {
      return [...this.errors];
    }

    clear() {
      this.errors = [];
    }
  }

  // Enhanced diagnostic system
  class Diagnostics {
    constructor() {
      this.startTime = Date.now();
      this.events = [];
      this.errorTracker = new ErrorTracker();
      this.resources = new Set();
      this.networkRequests = [];
    }

    log(type, message, data = {}) {
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
    }

    error(message, error = null) {
      return this.errorTracker.addError(error || message, {
        timestamp: Date.now(),
        lastEvent: this.events[this.events.length - 1]
      });
    }

    network(request) {
      const details = {
        url: request.url,
        status: request.status,
        type: request.type,
        timestamp: Date.now()
      };
      this.networkRequests.push(details);
      this.log('network_request', `${request.type} request to ${request.url}`, details);
    }

    getDiagnosticReport() {
      return {
        startTime: this.startTime,
        events: this.events,
        errors: this.errorTracker.getErrors(),
        resources: Array.from(this.resources),
        networkRequests: this.networkRequests,
        uptime: Date.now() - this.startTime
      };
    }
  }

  // Initialize diagnostics
  const diagnostics = new Diagnostics();

  // Enhanced IframeManager with error recovery
  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      this.loadTimeout = null;
      this.initTimeout = null;
      
      window.addEventListener('message', this.handleMessage.bind(this));
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
      
      diagnostics.log('init', 'IframeManager initialized with enhanced error handling');
    }

    handleError(event) {
      diagnostics.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      this.attemptRecovery();
    }

    handlePromiseError(event) {
      diagnostics.error('Unhandled promise rejection', event.reason);
      this.attemptRecovery();
    }

    attemptRecovery() {
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        diagnostics.log('recovery', `Attempting recovery (${this.retryCount}/${MAX_RETRIES})`);
        this.reloadIframe();
      } else {
        this.handleFatalError('Max retries reached');
      }
    }

    handleFatalError(message) {
      diagnostics.error('Fatal error', message);
      this.showErrorUI(message);
      this.cleanup();
    }

    showErrorUI(message) {
      const container = document.getElementById('sweepstakes-widget');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">Widget error: ${message}</p>
            <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Retry
            </button>
          </div>
        `;
      }
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
            diagnostics.connectionStatus.reactLoaded = true;
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
        
        // Enhanced iframe attributes
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        this.iframe.setAttribute('loading', 'eager'); // Prioritize loading
        
        // Enhanced load handling
        this.iframe.onload = () => {
          diagnostics.log('iframe_load', 'Iframe loaded');
          diagnostics.connectionStatus.iframeLoaded = true;
          clearTimeout(this.loadTimeout);
          this.verifyIframeContent();
        };
        
        this.iframe.onerror = (error) => {
          diagnostics.error('Iframe load error', error);
          diagnostics.connectionStatus.iframeLoaded = false;
          this.handleLoadError(error);
        };
        
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        
        // Set up connection monitoring
        this.connectionCheckInterval = setInterval(() => {
          if (!this.isReady) {
            this.checkConnection();
          }
        }, 5000);

        return this.iframe;
      } catch (error) {
        diagnostics.error('Error creating iframe', error);
        throw error;
      }
    }

    checkConnection() {
      const status = diagnostics.connectionStatus;
      diagnostics.log('connection_check', 'Checking connection status', status);
      
      if (!status.iframeLoaded || !status.reactLoaded) {
        this.retryConnection();
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
      clearInterval(this.connectionCheckInterval);
      
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
    
    try {
      const container = document.getElementById('sweepstakes-widget');
      if (!container) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = container.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      diagnostics.log('init', 'Found sweepstakes ID', { sweepstakesId });
      const iframeManager = new IframeManager();
      const iframe = iframeManager.createIframe(sweepstakesId);
      
      if (iframe) {
        container.appendChild(iframe);
        diagnostics.log('init', 'Widget initialized successfully');
      }
    } catch (error) {
      diagnostics.error('Initialization failed', error);
      throw error;
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
