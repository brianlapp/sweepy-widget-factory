(function() {
  const DEBUG = true;
  
  function log(message, type = 'info') {
    if (!DEBUG) return;
    
    const prefix = '[Widget]';
    const debugOutput = document.getElementById('debug-output');
    
    if (type === 'error') {
      console.error(prefix, message);
    } else {
      console.log(prefix, message);
    }
    
    if (debugOutput) {
      debugOutput.textContent += `${prefix} ${message}\n`;
    }
  }

  function getBaseUrl() {
    const currentScript = document.currentScript || 
      document.querySelector('script[src*="widget.js"]');
    if (!currentScript) {
      throw new Error('Could not find widget script element');
    }
    return new URL(currentScript.src).origin + '/assets/';
  }

  // Create container div
  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  const currentScript = document.currentScript || 
    document.querySelector('script[src*="widget.js"]');
  
  if (!currentScript) {
    log('Failed to find widget script element', 'error');
    return;
  }
  
  currentScript.parentNode.insertBefore(div, currentScript);
  log('Created widget root element');

  // Add required styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = getBaseUrl() + 'widget.css';
  document.head.appendChild(styles);
  log('Added widget styles');

  // Load React and ReactDOM
  const scripts = [
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js'
  ];

  // Load widget app script
  function loadAppScript() {
    const script = document.createElement('script');
    script.src = getBaseUrl() + 'widget.bundle.js';
    script.onload = () => {
      log('Widget bundle loaded successfully');
      initializeWidget();
    };
    script.onerror = (error) => {
      log(`Error loading widget bundle from ${script.src}: ${error}`, 'error');
    };
    document.head.appendChild(script);
    log('Loading widget bundle from: ' + script.src);
  }

  // Initialize widget when dependencies are loaded
  function initializeWidget() {
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (!widgetContainer) {
      log('Error: Widget container not found', 'error');
      return;
    }

    const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      log('Error: No sweepstakes ID provided', 'error');
      return;
    }

    log('Initializing widget with ID: ' + sweepstakesId);

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      log('Error: React or ReactDOM not loaded', 'error');
      return;
    }

    try {
      const root = ReactDOM.createRoot(document.getElementById('sweepstakes-widget-root'));
      root.render(React.createElement(window.SweepstakesWidget, { 
        sweepstakesId: sweepstakesId 
      }));
      log('Widget rendered successfully');
    } catch (error) {
      log('Error rendering widget: ' + error.message, 'error');
    }
  }

  // Load scripts sequentially
  function loadScripts(index = 0) {
    if (index >= scripts.length) {
      loadAppScript();
      return;
    }

    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => {
      log(index === 0 ? 'React loaded' : 'ReactDOM loaded');
      loadScripts(index + 1);
    };
    script.onerror = (error) => {
      log(`Error loading ${scripts[index]}: ${error}`, 'error');
    };
    document.head.appendChild(script);
  }

  // Start loading scripts
  loadScripts();
})();