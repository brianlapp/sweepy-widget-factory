import { supabase } from "@/integrations/supabase/client";
import path from 'path';
import fs from 'fs/promises';

async function uploadFile(filename: string, content: string | Buffer) {
  console.log(`[Widget Upload] Uploading ${filename}...`);
  
  // Remove existing file
  const { error: removeError } = await supabase.storage
    .from('static')
    .remove([filename]);
    
  if (removeError) {
    console.warn(`[Widget Upload] Error removing existing ${filename}:`, removeError);
    // Continue as file might not exist
  }

  // Create blob with proper content type
  const blob = new Blob([content], { 
    type: 'application/javascript; charset=utf-8'
  });

  // Upload with proper options
  const uploadOptions = {
    cacheControl: '0',
    upsert: true,
    contentType: 'application/javascript; charset=utf-8',
  };

  const { error: uploadError } = await supabase.storage
    .from('static')
    .upload(filename, blob, uploadOptions);

  if (uploadError) {
    console.error(`[Widget Upload] Error uploading ${filename}:`, uploadError);
    throw uploadError;
  }

  console.log(`[Widget Upload] ${filename} uploaded successfully`);
}

export async function uploadWidget() {
  console.log('[Widget Upload] Starting widget files upload process...');
  
  try {
    // Create the loader content with timestamp
    const timestamp = new Date().toISOString();
    const loaderScript = `
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

    // 1. Upload the loader script (widget.js)
    await uploadFile('widget.js', loaderScript);

    // 2. Upload the React bundle (widget-bundle.js)
    try {
      const bundlePath = path.join(process.cwd(), 'dist/widget/widget-bundle.js');
      const bundleContent = await fs.readFile(bundlePath, 'utf-8');
      await uploadFile('widget-bundle.js', bundleContent);
    } catch (error) {
      console.error('[Widget Upload] Error reading bundle file:', error);
      throw new Error('Widget bundle not found. Did you run the build command?');
    }

    console.log('[Widget Upload] All files uploaded successfully');
    return { success: true };

  } catch (error) {
    console.error('[Widget Upload] Error in upload process:', error);
    throw error;
  }
}