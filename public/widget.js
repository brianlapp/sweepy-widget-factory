(function() {
  function log(message) {
    console.log('[Widget]:', message);
    // If we're in the test environment, also log to the debug output
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
      debugOutput.textContent += '[Widget]: ' + message + '\n';
    }
  }

  // Create container div
  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  document.currentScript.parentNode.insertBefore(div, document.currentScript);
  log('Created widget root element');

  // Load required React and ReactDOM scripts
  const scripts = [
    { src: 'https://unpkg.com/react@18/umd/react.production.min.js', global: 'React' },
    { src: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', global: 'ReactDOM' }
  ];

  let loadedScripts = 0;

  // Function to load app script after React is loaded
  function loadAppScript() {
    log('Loading widget app script');
    const script = document.createElement('script');
    script.src = document.currentScript.src.replace('widget.js', 'widget-app.js');
    script.onload = () => {
      log('Widget app script loaded');
      initializeWidget();
    };
    script.onerror = (error) => {
      log('Error loading widget app script: ' + error);
    };
    document.head.appendChild(script);
  }

  // Load React scripts sequentially
  function loadNextScript() {
    if (loadedScripts < scripts.length) {
      const script = document.createElement('script');
      script.src = scripts[loadedScripts].src;
      log('Loading ' + scripts[loadedScripts].global);
      script.onload = () => {
        log(scripts[loadedScripts].global + ' loaded');
        loadedScripts++;
        if (loadedScripts === scripts.length) {
          loadAppScript();
        } else {
          loadNextScript();
        }
      };
      script.onerror = (error) => {
        log('Error loading ' + scripts[loadedScripts].global + ': ' + error);
      };
      document.head.appendChild(script);
    }
  }

  // Initialize widget when all scripts are loaded
  function initializeWidget() {
    // Get sweepstakes ID from data attribute
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (widgetContainer) {
      const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
      if (sweepstakesId) {
        log('Initializing sweepstakes widget with ID: ' + sweepstakesId);
        window.initSweepstakesWidget(sweepstakesId);
      } else {
        log('Error: No sweepstakes ID provided');
      }
    } else {
      log('Error: Widget container not found');
    }
  }

  // Load required styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = document.currentScript.src.replace('widget.js', 'widget.css');
  document.head.appendChild(styles);
  log('Added widget styles');

  // Start loading scripts
  loadNextScript();

  // Expose initialization function globally
  window.initSweepstakesWidget = function(sweepstakesId) {
    if (!sweepstakesId) {
      log('Error: Sweepstakes ID is required');
      return;
    }
    
    if (!window.React || !window.ReactDOM) {
      log('Error: React is not loaded yet');
      return;
    }

    const rootElement = document.getElementById('sweepstakes-widget-root');
    if (!rootElement) {
      log('Error: Root element not found');
      return;
    }

    log('Initializing widget app');
    // Initialize the widget app
    window.initSweepstakesApp(rootElement, sweepstakesId);
  };
})();