(function() {
  function log(message) {
    console.log('[Widget]:', message);
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
      debugOutput.textContent += '[Widget]: ' + message + '\n';
    }
  }

  // Create container div
  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  const currentScript = document.currentScript || 
    document.querySelector('script[src*="widget.js"]');
  currentScript.parentNode.insertBefore(div, currentScript);
  log('Created widget root element');

  // Add required styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = currentScript.src.replace('widget.js', 'style.css');
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
    script.src = currentScript.src.replace('widget.js', 'widget.bundle.js');
    script.onload = initializeWidget;
    script.onerror = (error) => {
      log('Error loading widget app: ' + error);
    };
    document.head.appendChild(script);
    log('Loading widget app script from: ' + script.src);
  }

  // Initialize widget when dependencies are loaded
  function initializeWidget() {
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (!widgetContainer) {
      log('Error: Widget container not found');
      return;
    }

    const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      log('Error: No sweepstakes ID provided');
      return;
    }

    log('Initializing widget with ID: ' + sweepstakesId);

    // Wait for React and ReactDOM to be available
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      log('Error: React or ReactDOM not loaded');
      return;
    }

    try {
      const root = ReactDOM.createRoot(document.getElementById('sweepstakes-widget-root'));
      root.render(React.createElement(window.SweepstakesWidget, { 
        sweepstakesId: sweepstakesId 
      }));
      log('Widget rendered successfully');
    } catch (error) {
      log('Error rendering widget: ' + error.message);
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
    script.onerror = (error) => log('Error loading script: ' + error);
    document.head.appendChild(script);
  }

  // Start loading scripts
  loadScripts();
})();