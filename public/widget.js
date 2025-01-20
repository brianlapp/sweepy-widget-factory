(function() {
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  document.head.appendChild(script);

  const div = document.createElement('div');
  div.id = 'sweepstakes-widget-root';
  document.currentScript.parentNode.insertBefore(div, document.currentScript);

  window.initSweepstakesWidget = function(sweepstakesId) {
    const widget = document.createElement('div');
    widget.id = 'root';
    div.appendChild(widget);
  };
})();