import { supabase } from "@/integrations/supabase/client";

// Event handler type for build completion
type BuildCompleteEvent = CustomEvent<{
  files: {
    'widget-bundle.js': string;
    'embed.html': string;
  };
}>;

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

export async function uploadWidget(): Promise<{ bundleHash: string }> {
  console.log('[Widget Upload] Starting widget files upload process...', {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    customEvents: window.customEvents,
    availableEvents: Object.keys(window).filter(key => key.startsWith('on')),
  });
  
  return new Promise((resolve, reject) => {
    // Add timeout handler
    const timeout = setTimeout(() => {
      console.error('[Widget Upload] Build timed out after 30 seconds');
      window.removeEventListener('lovable:build-complete', handleBuildComplete as EventListener);
      reject(new Error('Build timeout - No response received from build process'));
    }, 30000);

    const handleBuildComplete = async (event: BuildCompleteEvent) => {
      try {
        clearTimeout(timeout); // Clear timeout if build completes
        console.log('[Widget Upload] Build complete event received:', {
          timestamp: new Date().toISOString(),
          eventType: event.type,
          hasFiles: !!event.detail?.files,
          fileKeys: event.detail?.files ? Object.keys(event.detail.files) : [],
        });

        const { files } = event.detail;
        if (!files || !files['widget-bundle.js']) {
          throw new Error('Build completed but no widget bundle found in output');
        }

        // Upload widget bundle
        await uploadFile('widget-bundle.js', files['widget-bundle.js'], 'application/javascript');
        
        // Clean and upload embed.html
        const cleanedEmbedHtml = cleanEmbedHtml(files['embed.html']);
        await uploadFile('embed.html', cleanedEmbedHtml, 'text/html');
        
        // Generate bundle hash
        const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(files['widget-bundle.js']))
          .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        console.log('[Widget Upload] All files uploaded successfully', {
          timestamp: new Date().toISOString(),
          bundleHash: bundleHash.substring(0, 8) + '...',
        });
        
        window.removeEventListener('lovable:build-complete', handleBuildComplete as EventListener);
        resolve({ bundleHash });

      } catch (error) {
        clearTimeout(timeout);
        console.error('[Widget Upload] Error in upload process:', {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        window.removeEventListener('lovable:build-complete', handleBuildComplete as EventListener);
        reject(error);
      }
    };

    // Debug existing events
    console.log('[Widget Upload] Registering event handlers:', {
      timestamp: new Date().toISOString(),
      buildComplete: window.customEvents?.includes('lovable:build-complete'),
      buildWidget: window.customEvents?.includes('lovable:build-widget'),
    });

    // Add event listener for build completion
    window.addEventListener('lovable:build-complete', handleBuildComplete as EventListener);
    
    // Dispatch event to trigger build
    window.dispatchEvent(new CustomEvent('lovable:build-widget'));
    console.log('[Widget Upload] Build event triggered', {
      timestamp: new Date().toISOString(),
    });
  });
}