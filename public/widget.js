(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  
  function initializeWidget(sweepstakesId) {
    console.log('[Widget] Starting widget initialization with ID:', sweepstakesId);
    
    try {
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.minHeight = '600px';
      iframe.setAttribute('scrolling', 'no');
      
      // Add error handling for iframe load
      iframe.onload = () => {
        console.log('[Widget] Iframe loaded successfully');
        
        // Initialize the widget in the iframe
        iframe.contentWindow.postMessage({
          type: 'INIT_WIDGET',
          sweepstakesId: sweepstakesId
        }, '*');
      };
      
      iframe.onerror = () => {
        console.error('[Widget] Failed to load iframe');
        showError('Failed to load widget content');
      };
      
      // Set iframe source to embed.html from storage
      iframe.src = `${STORAGE_URL}/embed.html`;
      
      return iframe;
    } catch (error) {
      console.error('[Widget] Initialization error:', error);
      showError(error.message);
      return null;
    }
  }

  function showError(message) {
    console.error('[Widget] Showing error message:', message);
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (widgetContainer) {
      widgetContainer.innerHTML = `
        <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0;">Unable to load sweepstakes widget: ${message}</p>
        </div>
      `;
    }
  }

  // Initialize when the script loads
  if (document.readyState === 'loading') {
    console.log('[Widget] Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('sweepstakes-widget');
      if (!container) {
        console.error('[Widget] Widget container not found');
        return;
      }

      const sweepstakesId = container.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        console.error('[Widget] No sweepstakes ID provided');
        showError('No sweepstakes ID provided');
        return;
      }

      console.log('[Widget] Found sweepstakes ID:', sweepstakesId);
      const iframe = initializeWidget(sweepstakesId);
      if (iframe) {
        container.appendChild(iframe);
      }
    });
  } else {
    console.log('[Widget] Document already loaded, initializing immediately');
    const container = document.getElementById('sweepstakes-widget');
    if (!container) {
      console.error('[Widget] Widget container not found');
      return;
    }

    const sweepstakesId = container.getAttribute('data-sweepstakes-id');
    if (!sweepstakesId) {
      console.error('[Widget] No sweepstakes ID provided');
      showError('No sweepstakes ID provided');
      return;
    }

    console.log('[Widget] Found sweepstakes ID:', sweepstakesId);
    const iframe = initializeWidget(sweepstakesId);
    if (iframe) {
      container.appendChild(iframe);
    }
  }
})();