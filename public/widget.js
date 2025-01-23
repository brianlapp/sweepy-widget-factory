(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  const VERSION = '1.0.0';
  
  // Enhanced logging utility
  const logger = {
    info: (message, ...args) => console.log(`[Widget ${VERSION}] ${message}`, ...args),
    error: (message, ...args) => console.error(`[Widget ${VERSION}] Error: ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[Widget ${VERSION}] Warning: ${message}`, ...args)
  };
  
  function initializeWidget(sweepstakesId) {
    logger.info('Starting widget initialization with ID:', sweepstakesId);
    
    try {
      // Validate sweepstakes ID
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      // Create iframe with enhanced error handling and accessibility
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.minHeight = '600px';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('title', 'Sweepstakes Widget');
      iframe.setAttribute('aria-label', 'Sweepstakes Entry Form');
      
      // Enhanced iframe error handling with retry logic
      let loadRetries = 0;
      const MAX_LOAD_RETRIES = 3;
      
      const handleIframeLoad = () => {
        logger.info('Iframe loaded successfully');
        
        // Initialize the widget in the iframe
        iframe.contentWindow.postMessage({
          type: 'INIT_WIDGET',
          sweepstakesId: sweepstakesId,
          timestamp: Date.now()
        }, '*');
      };
      
      const handleIframeError = (error) => {
        logger.error('Failed to load iframe:', error);
        
        if (loadRetries < MAX_LOAD_RETRIES) {
          loadRetries++;
          logger.warn(`Retrying iframe load (${loadRetries}/${MAX_LOAD_RETRIES})...`);
          setTimeout(() => {
            iframe.src = iframe.src;
          }, 1000 * loadRetries);
        } else {
          showError('Failed to load widget content after multiple attempts');
        }
      };
      
      iframe.onload = handleIframeLoad;
      iframe.onerror = handleIframeError;

      // Enhanced message handling
      const messageHandler = (event) => {
        try {
          if (event.data.type === 'WIDGET_ERROR') {
            logger.error('Error from iframe:', event.data.error);
            showError(event.data.error.message);
          }
          if (event.data.type === 'setHeight') {
            iframe.style.height = `${event.data.height}px`;
          }
        } catch (error) {
          logger.error('Error handling message:', error);
        }
      };

      window.addEventListener('message', messageHandler);

      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
      };

      // Set iframe source with proper URL construction and validation
      try {
        const baseUrl = new URL(STORAGE_URL);
        const embedPath = new URL('embed.html', baseUrl);
        
        // Add cache-busting parameter and version
        embedPath.searchParams.append('v', VERSION);
        embedPath.searchParams.append('t', Date.now().toString());
        
        iframe.src = embedPath.toString();
        logger.info('Setting iframe src:', iframe.src);
      } catch (error) {
        logger.error('Error constructing iframe URL:', error);
        throw new Error('Failed to construct widget URL');
      }
      
      return iframe;
    } catch (error) {
      logger.error('Initialization error:', error);
      showError(error.message);
      return null;
    }
  }

  function showError(message) {
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

  // Initialize when the script loads with enhanced timing logging
  const initialize = () => {
    logger.info('Starting widget script initialization');
    const startTime = performance.now();

    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      logger.error('Widget container not found');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      logger.error('No sweepstakes ID provided');
      showError('No sweepstakes ID provided');
      return;
    }

    logger.info('Found sweepstakes ID:', sweepstakesId);
    const iframe = initializeWidget(sweepstakesId);
    if (iframe) {
      container.appendChild(iframe);
      const endTime = performance.now();
      logger.info(`Widget initialization completed in ${Math.round(endTime - startTime)}ms`);
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