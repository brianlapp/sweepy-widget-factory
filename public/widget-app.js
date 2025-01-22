(function() {
  // This file will be auto-generated during build with the bundled React application
  window.initSweepstakesApp = function(rootElement, sweepstakesId) {
    const SweepstakesWidget = window.SweepstakesWidget;
    
    if (!SweepstakesWidget) {
      console.error('SweepstakesWidget component not found');
      return;
    }

    ReactDOM.createRoot(rootElement).render(
      React.createElement(SweepstakesWidget, { 
        sweepstakesId: sweepstakesId 
      })
    );
  };
})();