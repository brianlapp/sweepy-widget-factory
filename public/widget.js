(function() {
  const DEBUG = true;
  
  function log(message, type = 'info') {
    if (!DEBUG) return;
    
    const prefix = '[Widget]';
    console[type === 'error' ? 'error' : 'log'](prefix, message);
    
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
      debugOutput.textContent += `${prefix} ${message}\n`;
    }
  }

  // Load React and ReactDOM with proper error handling
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = (e) => {
        log(`Error loading script from ${src}: ${e}`, 'error');
        reject(e);
      };
      document.head.appendChild(script);
    });
  }

  // Get widget URL from current script
  function getWidgetUrl() {
    const currentScript = document.currentScript || 
      document.querySelector('script[src*="widget.js"]');
    if (!currentScript) {
      throw new Error('Could not find widget script element');
    }
    
    // Get the base URL from the widget.js script src
    const scriptUrl = new URL(currentScript.src);
    const baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
    
    // Return the full path to widget.bundle.js in the same directory
    return `${baseUrl}/widget.bundle.js`;
  }

  // Initialize widget when dependencies are loaded
  async function initializeWidget() {
    try {
      const container = document.createElement('div');
      container.id = 'sweepstakes-widget-root';
      
      const currentScript = document.currentScript || 
        document.querySelector('script[src*="widget.js"]');
      if (!currentScript) {
        throw new Error('Could not find widget script element');
      }
      
      currentScript.parentNode.insertBefore(container, currentScript);
      log('Created widget root element');

      // Load dependencies
      log('Loading React and ReactDOM...');
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
      ]);
      log('React and ReactDOM loaded successfully');

      // Load widget bundle
      const widgetUrl = getWidgetUrl();
      log('Loading widget bundle from: ' + widgetUrl);
      await loadScript(widgetUrl);
      log('Widget bundle loaded successfully');

      // Get sweepstakes ID
      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (!widgetContainer) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      log('Initializing widget with ID: ' + sweepstakesId);

      // Render widget
      const root = ReactDOM.createRoot(document.getElementById('sweepstakes-widget-root'));
      root.render(React.createElement(window.SweepstakesWidget, { 
        sweepstakesId: sweepstakesId 
      }));
      log('Widget rendered successfully');

    } catch (error) {
      log(`Widget initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Start initialization
  initializeWidget().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
  });
})();