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

  function addStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/brianlapp/sweepy-widget-factory@main/public/widget.css';
    document.head.appendChild(link);
    log('Added widget styles');
  }

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

      addStyles();

      log('Loading dependencies...');
      await Promise.all([
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
        loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'),
        loadScript('https://unpkg.com/@tanstack/react-query@5.0.0/build/umd/index.production.js')
      ]);
      log('Dependencies loaded successfully');

      const bundleUrl = 'https://cdn.jsdelivr.net/gh/brianlapp/sweepy-widget-factory@main/public/widget.bundle.js';
      log('Loading widget bundle from: ' + bundleUrl);
      await loadScript(bundleUrl);
      log('Widget bundle loaded successfully');

      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (!widgetContainer) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      log('Initializing widget with ID: ' + sweepstakesId);

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

  initializeWidget().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
  });
})();