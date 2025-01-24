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
      this.connectionStatus = {
        iframeLoaded: false,
        reactLoaded: false,
        widgetReady: false
      };
    }

    addError(error, context = {}) {
      const errorObj = {
        message: error.message || error,
        stack: error.stack,
        timestamp: Date.now(),
        context: {
          ...context,
          connectionStatus: { ...this.connectionStatus }
        }
      };
      
      this.errors.push(errorObj);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }
      
      this.notifyListeners(errorObj);
      
      // Send error to parent
      try {
        window.parent.postMessage({
          type: 'WIDGET_ERROR',
          error: errorObj
        }, '*');
      } catch (e) {
        console.error('Failed to send error to parent:', e);
      }
      
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

    updateConnectionStatus(key, value) {
      this.connectionStatus[key] = value;
      window.parent.postMessage({
        type: 'CONNECTION_STATUS',
        status: this.connectionStatus
      }, '*');
    }

    getErrors() {
      return [...this.errors];
    }

    clear() {
      this.errors = [];
    }
  }

  // Enhanced diagnostic system with connection tracking
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
      
      // Send diagnostic info to parent
      try {
        window.parent.postMessage({
          type: 'WIDGET_DIAGNOSTIC',
          event
        }, '*');
      } catch (e) {
        console.error('Failed to send diagnostic to parent:', e);
      }
      
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

    updateConnectionStatus(key, value) {
      this.errorTracker.updateConnectionStatus(key, value);
      this.log('connection_status', `Updated ${key} to ${value}`);
    }

    getDiagnosticReport() {
      return {
        startTime: this.startTime,
        events: this.events,
        errors: this.errorTracker.getErrors(),
        resources: Array.from(this.resources),
        networkRequests: this.networkRequests,
        uptime: Date.now() - this.startTime,
        connectionStatus: this.errorTracker.connectionStatus
      };
    }
  }

  // Initialize diagnostics
  const diagnostics = new Diagnostics();

  // Enhanced IframeManager with better error recovery
  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      this.loadTimeout = null;
      this.initTimeout = null;
      
      // Enhanced error handling setup
      window.addEventListener('message', this.handleMessage.bind(this), false);
      window.addEventListener('error', this.handleError.bind(this), true);
      window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this), true);
      
      diagnostics.log('init', 'IframeManager initialized with enhanced error handling');
    }

    handleError(event) {
      // Prevent default to ensure we catch all errors
      event.preventDefault();
      
      const errorDetails = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      };
      
      diagnostics.error('Global error caught', errorDetails);
      this.attemptRecovery(errorDetails);
    }

    handlePromiseError(event) {
      event.preventDefault();
      diagnostics.error('Unhandled promise rejection', event.reason);
      this.attemptRecovery({ message: 'Promise rejection', error: event.reason });
    }

    attemptRecovery(errorDetails) {
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        diagnostics.log('recovery', `Attempting recovery (${this.retryCount}/${MAX_RETRIES})`, errorDetails);
        this.reloadIframe();
      } else {
        this.handleFatalError('Max retries reached', errorDetails);
      }
    }

    reloadIframe() {
      if (this.iframe) {
        diagnostics.log('reload', 'Reloading iframe');
        this.cleanup();
        this.setIframeSource();
      }
    }

    handleFatalError(message, details = {}) {
      diagnostics.error('Fatal error', { message, details });
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
        if (!ALLOWED_ORIGINS.includes('*') && !ALLOWED_ORIGINS.includes(event.origin)) {
          throw new Error(`Unauthorized message origin: ${event.origin}`);
        }

        diagnostics.log('message', 'Received message', { type: event.data?.type });
        
        switch(event.data?.type) {
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
            diagnostics.updateConnectionStatus('reactLoaded', true);
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
      diagnostics.updateConnectionStatus('widgetReady', true);
    }

    createIframe(sweepstakesId) {
      diagnostics.log('create_iframe', 'Creating iframe', { sweepstakesId });
      
      try {
        this.cleanup();
        this.iframe = document.createElement('iframe');
        
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        this.iframe.setAttribute('loading', 'eager');
        
        this.iframe.onload = () => {
          diagnostics.log('iframe_load', 'Iframe loaded');
          diagnostics.updateConnectionStatus('iframeLoaded', true);
          clearTimeout(this.loadTimeout);
        };
        
        this.iframe.onerror = (error) => {
          diagnostics.error('Iframe load error', error);
          diagnostics.updateConnectionStatus('iframeLoaded', false);
          this.handleLoadError(error);
        };
        
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        
        return this.iframe;
      } catch (error) {
        diagnostics.error('Error creating iframe', error);
        throw error;
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
      
      // Reset connection status
      diagnostics.updateConnectionStatus('iframeLoaded', false);
      diagnostics.updateConnectionStatus('reactLoaded', false);
      diagnostics.updateConnectionStatus('widgetReady', false);
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