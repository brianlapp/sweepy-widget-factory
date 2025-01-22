(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  
  function createIframe(sweepstakesId) {
    console.log('[Widget] Creating iframe with sweepstakes ID:', sweepstakesId);
    
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    iframe.setAttribute('scrolling', 'no');
    
    // Construct the full URL for the embed
    const embedUrl = `${STORAGE_URL}/embed.html?id=${sweepstakesId}`;
    console.log('[Widget] Setting iframe src to:', embedUrl);
    iframe.src = embedUrl;
    
    // Add message listener for iframe height adjustments
    window.addEventListener('message', (event) => {
      if (event.data.type === 'setHeight') {
        iframe.style.height = `${event.data.height}px`;
      }
    });
    
    return iframe;
  }

  function initializeWidget() {
    try {
      console.log('[Widget] Initializing widget...');
      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (!widgetContainer) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
      const iframe = createIframe(sweepstakesId);
      widgetContainer.appendChild(iframe);
      console.log('[Widget] Widget initialized successfully');
    } catch (error) {
      console.error('[Widget] Widget initialization failed:', error.message);
    }
  }

  // Initialize when the script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }
})();