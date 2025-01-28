import { supabase } from "@/integrations/supabase/client";

export async function uploadWidget() {
  console.log('[Widget Upload] Starting widget files upload process...');
  
  const files = {
    loader: 'widget.js',
    bundle: 'widget-bundle.js'
  };

  const viteOutputDir = 'dist/widget';
  
  try {
    // Create the widget loader content with a timestamp
    const timestamp = new Date().toISOString();
    const widgetLoader = `
    (function() {
      const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
      const VERSION = '${process.env.VITE_APP_VERSION || '1.0.0'}';
      const BUNDLE_TIMESTAMP = '${timestamp}';
      
      console.log('[Widget] Starting initialization');
      console.log('[Widget] Bundle timestamp:', BUNDLE_TIMESTAMP);
      
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
        
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.minHeight = '400px';
        iframe.allow = 'clipboard-write';
        
        const embedUrl = \`\${STORAGE_URL}/embed.html?id=\${sweepstakesId}&v=\${VERSION}&t=\${BUNDLE_TIMESTAMP}\`;
        iframe.src = embedUrl;
        
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'setHeight') {
            iframe.style.height = event.data.height + 'px';
          }
          if (event.data && event.data.type === 'WIDGET_STATUS') {
            console.log('[Widget] Status:', event.data.status);
          }
          if (event.data && event.data.type === 'WIDGET_ERROR') {
            console.error('[Widget] Error:', event.data.error);
          }
        });

        container.appendChild(iframe);
        console.log('[Widget] Iframe created and added to container');
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
      } else {
        initialize();
      }

      window.initializeWidget = initialize;
    })();`;

    console.log('[Widget Upload] Generated loader content length:', widgetLoader.length);

    // Generate bundle hash from loader content
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetLoader))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    
    console.log('[Widget Upload] Bundle hash:', bundleHash);

    // Remove existing files
    console.log('[Widget Upload] Removing existing widget files...');
    const { error: removeError } = await supabase.storage
      .from('static')
      .remove([files.loader, files.bundle]);

    if (removeError) {
      console.warn('[Widget Upload] Error removing existing files:', removeError);
      // Continue as files might not exist
    }

    // Upload options
    const uploadOptions = {
      cacheControl: '0',
      upsert: true,
      contentType: 'application/javascript; charset=utf-8',
    };

    // Upload loader script
    console.log('[Widget Upload] Uploading loader script...');
    const loaderBlob = new Blob([widgetLoader], { 
      type: 'application/javascript; charset=utf-8'
    });

    const { error: loaderError } = await supabase.storage
      .from('static')
      .upload(files.loader, loaderBlob, uploadOptions);

    if (loaderError) {
      console.error('[Widget Upload] Error uploading loader:', loaderError);
      throw loaderError;
    }

    // Upload bundle file
    console.log('[Widget Upload] Uploading bundle...');
    try {
      const bundleResponse = await fetch(`/${viteOutputDir}/${files.bundle}`);
      if (!bundleResponse.ok) {
        throw new Error(`Failed to read bundle file: ${bundleResponse.statusText}`);
      }
      const bundleBlob = await bundleResponse.blob();
      
      const { error: bundleError } = await supabase.storage
        .from('static')
        .upload(files.bundle, bundleBlob, uploadOptions);

      if (bundleError) {
        console.error('[Widget Upload] Error uploading bundle:', bundleError);
        throw bundleError;
      }
    } catch (error) {
      console.error('[Widget Upload] Error processing bundle:', error);
      throw new Error(`Failed to process bundle: ${error.message}`);
    }

    console.log('[Widget Upload] All widget files uploaded successfully');
    return { bundleHash };

  } catch (error) {
    console.error('[Widget Upload] Error in upload process:', error);
    throw error;
  }
}