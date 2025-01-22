(function() {
  function log(message) {
    console.log('[Widget]:', message);
    // Log to debug output if available
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
  styles.href = currentScript.src.replace('widget.js', 'widget.css');
  document.head.appendChild(styles);
  log('Added widget styles');

  // Load React and ReactDOM
  const scripts = [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
  ];

  // Load scripts sequentially
  function loadScripts(index = 0) {
    if (index >= scripts.length) {
      initializeWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => loadScripts(index + 1);
    script.onerror = (error) => log('Error loading script: ' + error);
    document.head.appendChild(script);
    log('Loading ' + (index === 0 ? 'React' : 'ReactDOM'));
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

    // Create and render the widget component
    const root = ReactDOM.createRoot(document.getElementById('sweepstakes-widget-root'));
    root.render(React.createElement(window.SweepstakesWidget, { 
      sweepstakesId: sweepstakesId 
    }));
  }

  // Start loading scripts
  loadScripts();
})();