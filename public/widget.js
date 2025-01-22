(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  
  function createIframe(sweepstakesId) {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    iframe.setAttribute('scrolling', 'no');
    
    // Always use HTTPS for the iframe source
    const protocol = 'https:';
    const hostname = window.location.hostname;
    iframe.src = `${protocol}//${hostname}/embed/${sweepstakesId}`;
    
    // Add message listener for iframe height adjustments
    window.addEventListener('message', (event) => {
      if (event.data.type === 'setHeight') {
        iframe.style.height = `${event.data.height}px`;
      }
    });
    
    return iframe;
  }

  function initializeWidget() {
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (!widgetContainer) {
      console.error('[Widget] Widget container not found');
      return;
    }

    const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      console.error('[Widget] No sweepstakes ID provided');
      return;
    }

    const iframe = createIframe(sweepstakesId);
    widgetContainer.appendChild(iframe);
  }

  // Initialize when the script loads
  initializeWidget();
})();