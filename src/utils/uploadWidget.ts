import { supabase } from "@/integrations/supabase/client";

function cleanEmbedHtml(content: string): string {
  return content.replace(
    /<script type="module">[\s\S]*?<\/script>\s*<script type="module" src="\/@vite\/client"><\/script>/,
    ''
  ).trim();
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

    // Get the widget bundle from the build function response
    const bundleContent = buildResult.bundle;
    if (!bundleContent) {
      throw new Error('Widget bundle not found in build response');
    }

    // Upload the widget bundle (widget-bundle.js)
    await uploadFile('widget-bundle.js', bundleContent, 'application/javascript');
    
    // Upload embed.html
    const embedHtmlResponse = await fetch('/public/embed.html');
    if (!embedHtmlResponse.ok) {
      throw new Error('Embed HTML not found');
    }
    const embedHtmlContent = await embedHtmlResponse.text();
    const cleanedEmbedHtml = cleanEmbedHtml(embedHtmlContent);
    await uploadFile('embed.html', cleanedEmbedHtml, 'text/html');
    
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