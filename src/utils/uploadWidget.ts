import { supabase } from "@/integrations/supabase/client";

export async function uploadWidget() {
  console.log('[Widget Upload] Starting widget files upload process...');
  
  try {
    // Create the widget bundle content
    const widgetBundle = `
    (function() {
      const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
      const VERSION = '${process.env.VITE_APP_VERSION || '1.0.0'}';
      
      console.log('[Widget] Starting initialization');
      
      function initialize() {
        const container = document.getElementById('sweepstakes-widget');
        if (!container) {
          console.error('[Widget] Container not found');
          return;
        }

        const sweepstakesId = container.getAttribute('data-sweepstakes-id');
        if (!sweepstakesId) {
          console.error('[Widget] No sweepstakes ID provided');
          return;
        }

        console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
        
        // Create and configure iframe
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.minHeight = '400px';
        iframe.allow = 'clipboard-write';
        
        // Set iframe source with sweepstakes ID using Supabase storage URL
        const embedUrl = \`\${STORAGE_URL}/embed.html?id=\${sweepstakesId}&v=\${VERSION}\`;
        iframe.src = embedUrl;
        
        // Handle iframe messages for height adjustments
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'setHeight') {
            iframe.style.height = event.data.height + 'px';
          }
          // Log widget status messages
          if (event.data && event.data.type === 'WIDGET_STATUS') {
            console.log('[Widget] Status:', event.data.status);
          }
          // Handle widget errors
          if (event.data && event.data.type === 'WIDGET_ERROR') {
            console.error('[Widget] Error:', event.data.error);
          }
        });

        container.appendChild(iframe);
        
        console.log('[Widget] Iframe created and added to container');
      }

      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
      } else {
        initialize();
      }

      // Expose initialize function globally
      window.initializeWidget = initialize;
    })();`;

    console.log('[Widget Upload] Generated bundle content length:', widgetBundle.length);

    // Generate bundle hash
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetBundle))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    
    console.log('[Widget Upload] Bundle hash:', bundleHash);

    // Remove existing widget files
    console.log('[Widget Upload] Removing existing widget files...');
    await supabase.storage
      .from('static')
      .remove(['widget.js']);

    // Create blob with proper content type
    const blob = new Blob([widgetBundle], { 
      type: 'application/javascript; charset=utf-8'
    });

    // Set proper CORS headers and cache control
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/javascript; charset=utf-8',
    };

    console.log('[Widget Upload] Uploading widget files...');
    const { error: uploadError } = await supabase.storage
      .from('static')
      .upload('widget.js', blob, uploadOptions);

    if (uploadError) {
      console.error('[Widget Upload] Error uploading widget:', uploadError);
      throw uploadError;
    }

    console.log('[Widget Upload] Widget files uploaded successfully');
    return { bundleHash };

  } catch (error) {
    console.error('[Widget Upload] Error in upload process:', error);
    throw error;
  }
}