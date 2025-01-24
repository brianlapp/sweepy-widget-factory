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
  const MESSAGE_DEBOUNCE = 100;
  const CRITICAL_MESSAGE_TYPES = ['ERROR', 'WIDGET_READY', 'REACT_LOADED'];
  
  class MessageQueue {
    constructor() {
      this.queue = new Map();
      this.isProcessing = false;
      this.lastProcessTime = 0;
    }

    add(message, origin) {
      const now = Date.now();
      const key = `${message.type}-${now}`;
      this.queue.set(key, { message, origin, timestamp: now });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    }

    async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      while (this.queue.size > 0) {
        const now = Date.now();
        if (now - this.lastProcessTime < MESSAGE_DEBOUNCE) {
          await new Promise(resolve => setTimeout(resolve, MESSAGE_DEBOUNCE));
          continue;
        }

        const [firstKey] = this.queue.keys();
        const { message, origin, timestamp } = this.queue.get(firstKey);
        this.queue.delete(firstKey);

        if (now - timestamp > MESSAGE_TIMEOUT) {
          console.warn('[Widget] Dropped stale message:', message.type);
          continue;
        }

        try {
          await this.processMessage(message, origin);
          this.lastProcessTime = now;
        } catch (error) {
          console.error('[Widget] Error processing message:', error);
        }
      }

      this.isProcessing = false;
    }

    async processMessage(message, origin) {
      if (!MessageValidator.validateOrigin(origin)) {
        throw new Error(`Invalid origin: ${origin}`);
      }

      if (CRITICAL_MESSAGE_TYPES.includes(message.type)) {
        window.parent.postMessage(message, '*');
      }

      diagnostics.logLocal(`Processed message: ${message.type}`, message);
    }
  }

  class MessageValidator {
    static validateOrigin(origin) {
      const isValid = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
      diagnostics.logLocal(`Origin validation: ${origin} - ${isValid}`);
      return isValid;
    }

    static validateMessageType(type) {
      const validTypes = ['WIDGET_READY', 'WIDGET_ERROR', 'REACT_LOADED', 'setHeight'];
      return validTypes.includes(type);
    }
  }

  class Diagnostics {
    constructor() {
      this.events = [];
      this.startTime = Date.now();
      this.messageQueue = new MessageQueue();
    }

    logLocal(message, data = {}) {
      const event = {
        message,
        timestamp: Date.now(),
        timeSinceStart: Date.now() - this.startTime,
        data
      };
      
      this.events.push(event);
      console.log(`[Widget] ${message}`, data);
      
      // Cleanup old events
      if (this.events.length > 100) {
        this.events = this.events.slice(-100);
      }
    }

    logCritical(type, message, data = {}) {
      this.logLocal(message, data);
      
      if (CRITICAL_MESSAGE_TYPES.includes(type)) {
        this.messageQueue.add({
          type,
          event: { message, data, timestamp: Date.now() }
        }, window.location.origin);
      }
    }

    error(message, error = null) {
      const errorDetails = {
        message: error?.message || message,
        stack: error?.stack,
        timestamp: Date.now()
      };
      
      this.logCritical('ERROR', message, errorDetails);
      return errorDetails;
    }
  }

  // Initialize global diagnostics
  const diagnostics = new Diagnostics();

  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.isReady = false;
      
      window.addEventListener('message', this.handleMessage.bind(this), false);
      window.addEventListener('error', this.handleError.bind(this), true);
      
      diagnostics.logLocal('IframeManager initialized');
    }

    handleMessage(event) {
      try {
        const { type, data } = event.data || {};
        
        if (!type || !MessageValidator.validateMessageType(type)) {
          return;
        }

        diagnostics.logLocal(`Received message: ${type}`);
        
        switch(type) {
          case 'WIDGET_ERROR':
            diagnostics.error('Widget error from iframe', event.data.error);
            break;
          case 'WIDGET_READY':
            this.handleWidgetReady(event.data);
            break;
          case 'REACT_LOADED':
            diagnostics.logCritical('REACT_LOADED', 'React initialized in iframe');
            break;
          case 'setHeight':
            if (this.iframe && event.data.height) {
              this.iframe.style.height = `${event.data.height}px`;
            }
            break;
        }
      } catch (error) {
        diagnostics.error('Message handling error:', error);
      }
    }

    handleError(event) {
      event.preventDefault();
      diagnostics.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }

    handleWidgetReady(data) {
      diagnostics.logLocal('Widget reported ready', data);
      this.isReady = true;
    }

    createIframe(sweepstakesId) {
      diagnostics.logLocal('Creating iframe', { sweepstakesId });
      
      try {
        this.cleanup();
        this.iframe = document.createElement('iframe');
        
        this.iframe.style.width = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.minHeight = '600px';
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.setAttribute('title', 'Sweepstakes Widget');
        
        this.iframe.onload = () => {
          diagnostics.logCritical('IFRAME_LOADED', 'Iframe loaded successfully');
        };
        
        this.iframe.onerror = (error) => {
          diagnostics.error('Iframe load error', error);
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
      diagnostics.logLocal('Cleaning up iframe manager');
      
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

  const initialize = () => {
    diagnostics.logLocal('Starting initialization');
    
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
        diagnostics.logCritical('WIDGET_INIT', 'Widget initialized successfully');
      }
    } catch (error) {
      diagnostics.error('Initialization failed:', error);
      throw error;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();