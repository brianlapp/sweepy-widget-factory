(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000;
  const ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'https://xrycgmzgskcbhvdclflj.supabase.co'
  ];
  const MESSAGE_DEBOUNCE = 100; // 100ms debounce
  const VERIFICATION_POINTS = {
    initialization: false,
    originValidation: false,
    messageDebouncing: false,
    errorHandling: false
  };
  
  let lastMessageTime = 0;
  let messageQueue = [];
  let isProcessingQueue = false;
  let messageCache = new Set();
  let diagnosticCount = 0;
  const MAX_DIAGNOSTIC_COUNT = 1000;

  class MessageValidator {
    static validateOrigin(origin) {
      const isValid = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
      console.log(`[Widget Verification] Origin validation: ${origin} - ${isValid}`);
      VERIFICATION_POINTS.originValidation = true;
      return isValid;
    }

    static validateMessageType(type) {
      const validTypes = ['WIDGET_READY', 'WIDGET_ERROR', 'REACT_LOADED', 'setHeight'];
      return validTypes.includes(type);
    }

    static shouldProcessMessage(message, origin) {
      const now = Date.now();
      if (now - lastMessageTime < MESSAGE_DEBOUNCE) {
        console.log('[Widget Verification] Message debounced');
        return false;
      }

      const messageKey = `${JSON.stringify(message)}-${now}`;
      if (messageCache.has(messageKey)) {
        console.log('[Widget Verification] Duplicate message blocked');
        return false;
      }

      if (!this.validateOrigin(origin)) {
        console.error('[Widget Verification] Invalid origin blocked:', origin);
        return false;
      }

      messageCache.add(messageKey);
      if (messageCache.size > 100) {
        const oldestKey = Array.from(messageCache)[0];
        messageCache.delete(oldestKey);
      }

      lastMessageTime = now;
      VERIFICATION_POINTS.messageDebouncing = true;
      return true;
    }
  }

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
      if (this.connectionStatus[key] === value) return; // Prevent unnecessary updates
      this.connectionStatus[key] = value;
    }

    getErrors() {
      return [...this.errors];
    }

    clear() {
      this.errors = [];
    }
  }

  class Diagnostics {
    constructor() {
      this.startTime = Date.now();
      this.events = [];
      this.errorTracker = new ErrorTracker();
      this.resources = new Set();
      this.networkRequests = [];
    }

    log(type, message, data = {}) {
      if (diagnosticCount >= MAX_DIAGNOSTIC_COUNT) {
        console.warn('[Widget Verification] Max diagnostic count reached');
        return null;
      }

      if (!MessageValidator.shouldProcessMessage({ type, message }, window.location.origin)) {
        return null;
      }

      diagnosticCount++;
      const event = {
        type,
        message,
        timestamp: Date.now(),
        timeSinceStart: Date.now() - this.startTime,
        data,
        verificationPoint: Object.keys(VERIFICATION_POINTS).find(key => !VERIFICATION_POINTS[key])
      };
      
      this.events.push(event);
      console.log(`[Widget Verification] ${type}:`, message, data);
      
      // Only send critical messages to parent
      if (['ERROR', 'WIDGET_READY', 'REACT_LOADED'].includes(type)) {
        try {
          window.parent.postMessage({
            type: 'WIDGET_DIAGNOSTIC',
            event
          }, '*');
        } catch (e) {
          console.error('[Widget Verification] Failed to send diagnostic:', e);
          VERIFICATION_POINTS.errorHandling = true;
        }
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
      if (key === 'widgetReady' && value === true) {
        this.log('connection_status', 'Widget is ready');
      }
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

  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      this.loadTimeout = null;
      this.initTimeout = null;
      
      window.addEventListener('message', this.handleMessage.bind(this), false);
      window.addEventListener('error', this.handleError.bind(this), true);
      window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this), true);
      
      console.log('[Widget Verification] IframeManager initialized');
      VERIFICATION_POINTS.initialization = true;
    }

    handleMessage(event) {
      try {
        if (!MessageValidator.shouldProcessMessage(event.data, event.origin)) {
          return;
        }

        const { type, data } = event.data || {};
        if (!type || !MessageValidator.validateMessageType(type)) {
          return;
        }

        console.log('[Widget Verification] Processing valid message:', type);
        
        switch(type) {
          case 'WIDGET_ERROR':
            this.errorTracker.addError('Widget error from iframe', event.data.error);
            break;
          case 'WIDGET_READY':
            this.handleWidgetReady(event.data);
            break;
          case 'REACT_LOADED':
            this.updateConnectionStatus('reactLoaded', true);
            break;
          case 'setHeight':
            if (this.iframe && event.data.height) {
              this.iframe.style.height = `${event.data.height}px`;
            }
            break;
        }
      } catch (error) {
        console.error('[Widget Verification] Message handling error:', error);
        VERIFICATION_POINTS.errorHandling = true;
      }
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
      
      this.errorTracker.error('Global error caught', errorDetails);
      this.attemptRecovery(errorDetails);
    }

    handlePromiseError(event) {
      event.preventDefault();
      this.errorTracker.error('Unhandled promise rejection', event.reason);
      this.attemptRecovery({ message: 'Promise rejection', error: event.reason });
    }

    attemptRecovery(errorDetails) {
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        console.log('[Widget Verification] Attempting recovery:', this.retryCount);
        this.reloadIframe();
      } else {
        this.handleFatalError('Max retries reached', errorDetails);
      }
    }

    reloadIframe() {
      if (this.iframe) {
        console.log('[Widget Verification] Reloading iframe');
        this.cleanup();
        this.setIframeSource();
      }
    }

    handleFatalError(message, details = {}) {
      this.errorTracker.error('Fatal error', { message, details });
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

    handleWidgetReady(data) {
      console.log('[Widget Verification] Widget reported ready', data);
      clearTimeout(this.initTimeout);
      this.isReady = true;
      this.updateConnectionStatus('widgetReady', true);
    }

    createIframe(sweepstakesId) {
      console.log('[Widget Verification] Creating iframe', { sweepstakesId });
      
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
          console.log('[Widget Verification] Iframe loaded');
          this.updateConnectionStatus('iframeLoaded', true);
          clearTimeout(this.loadTimeout);
        };
        
        this.iframe.onerror = (error) => {
          this.errorTracker.error('Iframe load error', error);
          this.updateConnectionStatus('iframeLoaded', false);
          this.handleLoadError(error);
        };
        
        const embedUrl = `${STORAGE_URL}/embed.html?v=${VERSION}&t=${Date.now()}`;
        this.iframe.src = embedUrl;
        
        return this.iframe;
      } catch (error) {
        this.errorTracker.error('Error creating iframe', error);
        throw error;
      }
    }

    cleanup() {
      console.log('[Widget Verification] Cleaning up iframe manager');
      clearTimeout(this.loadTimeout);
      clearTimeout(this.initTimeout);
      
      if (this.iframe) {
        this.iframe.onload = null;
        this.iframe.onerror = null;
        this.iframe.remove();
        this.iframe = null;
      }

      this.resources.clear();
      this.isReady = false;
      this.retryCount = 0;
      
      // Reset connection status
      this.updateConnectionStatus('iframeLoaded', false);
      this.updateConnectionStatus('reactLoaded', false);
      this.updateConnectionStatus('widgetReady', false);
    }
  }

  // Initialize when the script loads
  const initialize = () => {
    console.log('[Widget Verification] Starting initialization');
    
    try {
      const container = document.getElementById('sweepstakes-widget');
      if (!container) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = container.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      const iframeManager = new IframeManager();
      const iframe = iframeManager.createIframe(sweepstakesId);
      
      if (iframe) {
        container.appendChild(iframe);
        console.log('[Widget Verification] Widget initialized successfully');
        
        // Log verification status after 5 seconds
        setTimeout(() => {
          console.table(VERIFICATION_POINTS);
        }, 5000);
      }
    } catch (error) {
      console.error('[Widget Verification] Initialization failed:', error);
      VERIFICATION_POINTS.errorHandling = true;
      throw error;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
