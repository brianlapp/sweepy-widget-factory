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
    // Debug file system availability
    console.log('[Widget Upload] Environment check:', {
      windowFs: !!window.fs,
      readFile: window.fs?.readFile,
      availableApis: Object.keys(window),
      viteEnv: import.meta.env,
      mode: import.meta.env.MODE
    });

    // Get the widget bundle using window.fs
    const bundleContent = await window.fs.readFile('dist/widget/widget-bundle.js', { encoding: 'utf8' });
    await uploadFile('widget-bundle.js', bundleContent, 'application/javascript');
    
    // Get embed.html
    const embedHtmlContent = await window.fs.readFile('public/embed.html', { encoding: 'utf8' });
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