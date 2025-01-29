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
  console.log('[Widget Upload] Starting widget files upload process...');
  
  return new Promise((resolve, reject) => {
    // Listen for the build complete event
    const handleBuildComplete = async (event: BuildCompleteEvent) => {
      try {
        const { files } = event.detail;
        console.log('[Widget Upload] Build complete, files received:', Object.keys(files));

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

        console.log('[Widget Upload] All files uploaded successfully');
        window.removeEventListener('lovable:build-complete', handleBuildComplete as EventListener);
        resolve({ bundleHash });

      } catch (error) {
        console.error('[Widget Upload] Error in upload process:', error);
        window.removeEventListener('lovable:build-complete', handleBuildComplete as EventListener);
        reject(error);
      }
    };

    // Add event listener for build completion
    window.addEventListener('lovable:build-complete', handleBuildComplete as EventListener);
    
    // Dispatch event to trigger build
    window.dispatchEvent(new CustomEvent('lovable:build-widget'));
    console.log('[Widget Upload] Triggered widget build...');
  });
}