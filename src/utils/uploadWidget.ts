import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  success: boolean;
  bundleHash: string | null;
  error?: string;
  details?: any;
}

export async function uploadWidgetFiles(): Promise<UploadResult> {
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
        
        // Set iframe source with sweepstakes ID
        const embedUrl = new URL('/embed.html', window.location.href);
        embedUrl.searchParams.set('id', sweepstakesId);
        iframe.src = embedUrl.toString();
        
        // Handle iframe messages for height adjustments
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'setHeight') {
            iframe.style.height = event.data.height + 'px';
          }
        });

        container.appendChild(iframe);
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
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing files first
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
      console.error('[Widget Upload] Upload error:', uploadError);
      throw uploadError;
    }

    // Get and log public URL
    const widgetUrl = supabase.storage
      .from('static')
      .getPublicUrl('widget.js').data.publicUrl;

    console.log('[Widget Upload] Public URL:', widgetUrl);
    console.log('[Widget Upload] Upload completed successfully');
    
    return { success: true, bundleHash };

  } catch (error) {
    console.error('[Widget Upload] Upload process failed:', error);
    return {
      success: false,
      bundleHash: null,
      error: error.message,
      details: error
    };
  }
}