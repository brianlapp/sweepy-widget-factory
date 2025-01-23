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
      // Only accept messages from our own iframe
      if (event.origin !== new URL(STORAGE_URL).origin) return;
      
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

      // Validate that we have a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sweepstakesId)) {
        throw new Error('Invalid sweepstakes ID format');
      }

      console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
      const iframe = createIframe(sweepstakesId);
      widgetContainer.appendChild(iframe);
      console.log('[Widget] Widget initialized successfully');
    } catch (error) {
      console.error('[Widget] Widget initialization failed:', error.message);
      // Display a user-friendly error message in the widget container
      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = `
          <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">Unable to load sweepstakes widget. Please try again later.</p>
          </div>
        `;
      }
    }
  }

  // Initialize when the script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }
})();