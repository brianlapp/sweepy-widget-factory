(function() {
  // Load required scripts
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  document.head.appendChild(script);

  // Create container div
  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  document.currentScript.parentNode.insertBefore(div, document.currentScript);

  // Initialize widget when data attribute is present
  const widgetContainer = document.getElementById('sweepstakes-widget');
  if (widgetContainer) {
    const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
    if (sweepstakesId) {
      const widget = document.createElement('div');
      widget.id = 'root';
      div.appendChild(widget);
      
      // Initialize widget with sweepstakes ID
      window.initSweepstakesWidget(sweepstakesId);
    }
  }

  // Expose initialization function globally
  window.initSweepstakesWidget = function(sweepstakesId) {
    if (!sweepstakesId) {
      console.error('Sweepstakes ID is required');
      return;
    }
    
    console.log('Initializing sweepstakes widget with ID:', sweepstakesId);
    
    // The actual initialization will be handled by the React app
    // This function exists as a public API for manual initialization
  };
})();