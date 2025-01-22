(function() {
  // Create container div
  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  document.currentScript.parentNode.insertBefore(div, document.currentScript);

  // Load required React and ReactDOM scripts
  const scripts = [
    { src: 'https://unpkg.com/react@18/umd/react.production.min.js', global: 'React' },
    { src: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', global: 'ReactDOM' }
  ];

  let loadedScripts = 0;

  // Function to load app script after React is loaded
  function loadAppScript() {
    const script = document.createElement('script');
    script.src = document.currentScript.src.replace('widget.js', 'widget-app.js');
    script.onload = initializeWidget;
    document.head.appendChild(script);
  }

  // Load React scripts sequentially
  function loadNextScript() {
    if (loadedScripts < scripts.length) {
      const script = document.createElement('script');
      script.src = scripts[loadedScripts].src;
      script.onload = () => {
        loadedScripts++;
        if (loadedScripts === scripts.length) {
          loadAppScript();
        } else {
          loadNextScript();
        }
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
        console.log('Initializing sweepstakes widget with ID:', sweepstakesId);
        window.initSweepstakesWidget(sweepstakesId);
      }
    }
  }

  // Load required styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = document.currentScript.src.replace('widget.js', 'widget.css');
  document.head.appendChild(styles);

  // Start loading scripts
  loadNextScript();

  // Expose initialization function globally
  window.initSweepstakesWidget = function(sweepstakesId) {
    if (!sweepstakesId) {
      console.error('Sweepstakes ID is required');
      return;
    }
    
    if (!window.React || !window.ReactDOM) {
      console.error('React is not loaded yet');
      return;
    }

    const rootElement = document.getElementById('sweepstakes-widget-root');
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    // Initialize the widget app
    window.initSweepstakesApp(rootElement, sweepstakesId);
  };
})();