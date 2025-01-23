(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  const MESSAGE_TIMEOUT = 5000;
  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 10000; // 10 seconds timeout for iframe loading
  
  // Message types enum for type validation
  const MessageTypes = {
    INIT_WIDGET: 'INIT_WIDGET',
    SET_HEIGHT: 'setHeight',
    WIDGET_ERROR: 'WIDGET_ERROR',
    WIDGET_READY: 'WIDGET_READY'
  };

  // Enhanced logging utility with timestamps and performance tracking
  const logger = {
    _getTimestamp: () => new Date().toISOString(),
    _mark: (name) => {
      if (window.performance && window.performance.mark) {
        window.performance.mark(`widget-${name}`);
      }
    },
    _measure: (name, startMark, endMark) => {
      if (window.performance && window.performance.measure) {
        try {
          window.performance.measure(
            `widget-${name}`,
            `widget-${startMark}`,
            `widget-${endMark}`
          );
          const measures = window.performance.getEntriesByName(`widget-${name}`);
          if (measures.length > 0) {
            console.log(`[Widget ${VERSION}] ${name} took ${measures[0].duration}ms`);
          }
        } catch (e) {
          console.warn(`[Widget ${VERSION}] Error measuring ${name}:`, e);
        }
      }
    },
    info: (message, ...args) => console.log(`[Widget ${VERSION}] ${logger._getTimestamp()} - ${message}`, ...args),
    error: (message, ...args) => console.error(`[Widget ${VERSION}] ${logger._getTimestamp()} - Error: ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[Widget ${VERSION}] ${logger._getTimestamp()} - Warning: ${message}`, ...args),
    performance: (name) => {
      logger._mark(name);
      return {
        end: (endName) => {
          logger._mark(endName);
          logger._measure(`${name}-to-${endName}`, name, endName);
        }
      };
    }
  };

  // Message validation utility
  const validateMessage = (message) => {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format');
    }
    if (!MessageTypes[message.type]) {
      throw new Error(`Invalid message type: ${message.type}`);
    }
    if (message.type === MessageTypes.INIT_WIDGET && !message.sweepstakesId) {
      throw new Error('Missing sweepstakesId in initialization message');
    }
    return true;
  };

  class IframeManager {
    constructor() {
      this.retryCount = 0;
      this.iframe = null;
      this.messageQueue = [];
      this.isReady = false;
      this.loadTimeout = null;
      this.resourcesLoaded = new Set();
    }

    createIframe(sweepstakesId) {
      logger.performance('iframe-creation-start');
      
      try {
        // Cleanup any existing iframe
        this.cleanup();

        this.iframe = document.createElement('iframe');
        this.setupIframeAttributes();
        this.setupLoadTracking();
        this.setupResourceTracking();
        
        // Set iframe source with proper URL construction and validation
        this.setIframeSource();

        logger.performance('iframe-creation-start').end('iframe-creation-complete');
        return this.iframe;
      } catch (error) {
        logger.error('Error creating iframe:', error);
        throw error;
      }
    }

    setupIframeAttributes() {
      this.iframe.style.width = '100%';
      this.iframe.style.border = 'none';
      this.iframe.style.minHeight = '600px';
      this.iframe.setAttribute('scrolling', 'no');
      this.iframe.setAttribute('title', 'Sweepstakes Widget');
      this.iframe.setAttribute('aria-label', 'Sweepstakes Entry Form');
      this.iframe.setAttribute('data-widget-version', VERSION);
    }

    setupLoadTracking() {
      // Set up load timeout
      this.loadTimeout = setTimeout(() => {
        if (!this.isReady) {
          logger.error('Iframe load timeout reached');
          this.handleLoadError(new Error('Iframe load timeout'));
        }
      }, LOAD_TIMEOUT);

      const handleIframeLoad = () => {
        clearTimeout(this.loadTimeout);
        logger.info('Iframe loaded successfully');
        logger.performance('iframe-load').end('iframe-loaded');
        this.verifyIframeContent();
      };
      
      const handleIframeError = (error) => {
        clearTimeout(this.loadTimeout);
        this.handleLoadError(error);
      };
      
      this.iframe.onload = handleIframeLoad;
      this.iframe.onerror = handleIframeError;
    }

    setupResourceTracking() {
      // Track resource loading within iframe
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.initiatorType === 'iframe' && entry.name.includes(STORAGE_URL)) {
            this.resourcesLoaded.add(entry.name);
            logger.info('Resource loaded:', entry.name);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }

    verifyIframeContent() {
      try {
        // Verify iframe content is accessible
        if (!this.iframe.contentWindow) {
          throw new Error('Cannot access iframe content window');
        }

        // Verify required resources are loaded
        const requiredResources = ['widget.js', 'embed.html'];
        const missingResources = requiredResources.filter(resource => 
          !Array.from(this.resourcesLoaded).some(loaded => loaded.includes(resource))
        );

        if (missingResources.length > 0) {
          throw new Error(`Missing required resources: ${missingResources.join(', ')}`);
        }

        this.isReady = true;
        this.processMessageQueue();
      } catch (error) {
        this.handleLoadError(error);
      }
    }

    handleLoadError(error) {
      logger.error('Failed to load iframe:', error);
      
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        logger.warn(`Retrying iframe load (${this.retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => {
          logger.info(`Attempt ${this.retryCount + 1} to load iframe`);
          this.setIframeSource();
        }, 1000 * this.retryCount);
      } else {
        logger.error('Max retries reached, showing error message');
        this.showError('Failed to load widget content after multiple attempts');
      }
    }

    setIframeSource() {
      try {
        const baseUrl = new URL(STORAGE_URL);
        const embedPath = new URL('embed.html', baseUrl);
        
        embedPath.searchParams.append('v', VERSION);
        embedPath.searchParams.append('t', Date.now().toString());
        
        logger.info('Setting iframe src:', embedPath.toString());
        this.iframe.src = embedPath.toString();
      } catch (error) {
        logger.error('Error constructing iframe URL:', error);
        throw new Error('Failed to construct widget URL');
      }
    }

    sendMessage(message, timeout = MESSAGE_TIMEOUT) {
      return new Promise((resolve, reject) => {
        if (!this.isReady) {
          this.messageQueue.push({ message, resolve, reject });
          return;
        }

        try {
          validateMessage(message);
          
          const timeoutId = setTimeout(() => {
            reject(new Error(`Message timeout: ${message.type}`));
          }, timeout);

          const handleResponse = (event) => {
            if (event.data.type === `${message.type}_RESPONSE`) {
              clearTimeout(timeoutId);
              window.removeEventListener('message', handleResponse);
              resolve(event.data);
            }
          };

          window.addEventListener('message', handleResponse);
          this.iframe.contentWindow.postMessage(message, '*');
          logger.info('Message sent:', message);
        } catch (error) {
          logger.error('Error sending message:', error);
          reject(error);
        }
      });
    }

    processMessageQueue() {
      while (this.messageQueue.length > 0) {
        const { message, resolve, reject } = this.messageQueue.shift();
        this.sendMessage(message).then(resolve).catch(reject);
      }
    }

    showError(message) {
      logger.error('Showing error message:', message);
      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = `
          <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">Unable to load sweepstakes widget: ${message}</p>
          </div>
        `;
      }
    }

    cleanup() {
      logger.info('Cleaning up iframe manager');
      clearTimeout(this.loadTimeout);
      
      if (this.iframe) {
        // Remove event listeners
        this.iframe.onload = null;
        this.iframe.onerror = null;
        
        // Remove iframe from DOM
        this.iframe.remove();
        this.iframe = null;
      }

      // Clear tracking state
      this.resourcesLoaded.clear();
      this.messageQueue = [];
      this.isReady = false;
      this.retryCount = 0;
      
      logger.info('Iframe cleanup complete');
    }
  }

  // Initialize when the script loads with enhanced timing logging
  const initialize = () => {
    const initPerf = logger.performance('script-init');
    logger.info('Starting widget script initialization');

    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      logger.error('Widget container not found');
      initPerf.end('init-error');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      logger.error('No sweepstakes ID provided');
      showError('No sweepstakes ID provided');
      initPerf.end('init-error');
      return;
    }

    logger.info('Found sweepstakes ID:', sweepstakesId);
    const iframeManager = new IframeManager();
    const iframe = iframeManager.createIframe(sweepstakesId);
    
    if (iframe) {
      container.appendChild(iframe);
      initPerf.end('init-success');
    }
  };

  if (document.readyState === 'loading') {
    logger.info('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    logger.info('Document already loaded, initializing immediately');
    initialize();
  }
})();