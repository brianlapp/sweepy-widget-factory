(function() {
  const DEBUG = true;
  const GITHUB_REPO = 'brianlapp/sweepy-widget-factory';
  const GITHUB_BRANCH = 'main';
  
  function log(message, type = 'info') {
    if (!DEBUG) return;
    
    const prefix = '[Widget]';
    console[type === 'error' ? 'error' : 'log'](prefix, message);
    
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
      debugOutput.textContent += `${prefix} ${message}\n`;
    }
  }

  // Load CSS from GitHub
  function loadCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Use jsDelivr for CSS
    link.href = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/public/widget.css`;
    document.head.appendChild(link);
    log('Loading widget CSS...');
  }

  // Load script with proper error handling
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        log(`Script loaded successfully: ${src}`);
        resolve();
      };
      script.onerror = (e) => {
        const error = `Error loading script from ${src}: ${e}`;
        log(error, 'error');
        reject(new Error(error));
      };
      document.head.appendChild(script);
    });
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

      // Load CSS
      loadCSS();

      // Load dependencies
      log('Loading React and ReactDOM...');
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
      ]);
      log('React and ReactDOM loaded successfully');

      // Load widget bundle from jsDelivr
      const widgetBundleUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/dist/widget.bundle.js`;
      log('Loading widget bundle from: ' + widgetBundleUrl);
      await loadScript(widgetBundleUrl);
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
      // Display error in the widget container
      const container = document.getElementById('sweepstakes-widget-root');
      if (container) {
        container.innerHTML = `
          <div style="padding: 1rem; border: 1px solid #f87171; border-radius: 0.375rem; background-color: #fee2e2; color: #991b1b;">
            <p style="margin: 0; font-family: system-ui, sans-serif;">
              Widget failed to load: ${error.message}
            </p>
          </div>
        `;
      }
      throw error;
    }
  }

  // Start initialization
  initializeWidget().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
  });
})();