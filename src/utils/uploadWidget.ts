import { supabase } from "@/integrations/supabase/client";

function cleanEmbedHtml(content: string): string {
  return content.replace(
    /<script type="module">[\s\S]*?<\/script>\s*<script type="module" src="\/@vite\/client"><\/script>/,
    ''
  ).trim();
}

async function uploadFile(filename: string, content: string | Buffer, contentType?: string) {
  console.log(`[Widget Upload] Uploading ${filename}...`);
  
  // Remove existing file
  const { error: removeError } = await supabase.storage
    .from('static')
    .remove([filename]);
    
  if (removeError) {
    console.warn(`[Widget Upload] Error removing existing ${filename}:`, removeError);
  }

  // Create blob with proper content type
  const type = contentType || (filename.endsWith('.html') ? 'text/html' : 
                              filename.endsWith('.js') ? 'application/javascript' : 
                              'text/plain');
  
  const blob = new Blob([content], { 
    type: `${type}; charset=utf-8`
  });

  const uploadOptions = {
    cacheControl: '0',
    upsert: true,
    contentType: `${type}; charset=utf-8`,
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
    // Call the build edge function
    const { data: buildResult, error: buildError } = await supabase.functions.invoke('build-widget', {
      body: { version: process.env.VITE_APP_VERSION }
    });

    if (buildError) {
      console.error('[Widget Build] Error:', buildError);
      throw buildError;
    }

    console.log('[Widget Build] Build completed:', buildResult);

    // Create the loader content with timestamp
    const timestamp = new Date().toISOString();
    const loaderScript = `
    (function() {
      const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
      const VERSION = '${process.env.VITE_APP_VERSION || '1.0.0'}';
      const BUNDLE_TIMESTAMP = '${timestamp}';
      
      console.log('[Widget] Starting initialization');
      console.log('[Widget] Bundle timestamp:', BUNDLE_TIMESTAMP);
      
      function loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      async function initialize() {
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

    // Upload the loader script (widget.js)
    await uploadFile('widget.js', loaderScript, 'application/javascript');

    // Upload embed.html
    const embedHtmlResponse = await fetch('/public/embed.html');
    if (!embedHtmlResponse.ok) {
      throw new Error('Embed HTML not found');
    }
    const embedHtmlContent = await embedHtmlResponse.text();
    const cleanedEmbedHtml = cleanEmbedHtml(embedHtmlContent);
    await uploadFile('embed.html', cleanedEmbedHtml, 'text/html');

    // Get the widget bundle from the build function response
    const bundleContent = buildResult.bundle;
    if (!bundleContent) {
      throw new Error('Widget bundle not found in build response');
    }

    // Upload the React bundle (widget-bundle.js)
    await uploadFile('widget-bundle.js', bundleContent, 'application/javascript');
    
    // Generate bundle hash
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bundleContent))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    
    console.log('[Widget Upload] All files uploaded successfully');
    return { bundleHash };

  } catch (error) {
    console.error('[Widget Upload] Error in upload process:', error);
    throw error;
  }
}