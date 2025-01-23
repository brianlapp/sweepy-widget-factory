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
    // Helper function to fetch file content
    async function fetchFile(filename: string) {
      console.log(`[Widget Upload] Attempting to fetch ${filename}...`);
      try {
        const response = await fetch(`/public/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filename}`);
        }
        const content = await response.text();
        console.log(`[Widget Upload] Successfully fetched ${filename}, content length:`, content.length);
        return content;
      } catch (error) {
        console.error(`[Widget Upload] Error fetching ${filename}:`, error);
        throw error;
      }
    }

    // Fetch both widget.js and embed.html content
    console.log('[Widget Upload] Fetching widget files...');
    const [widgetContent, embedContent] = await Promise.all([
      fetchFile('widget.js'),
      fetchFile('embed.html')
    ]);
    
    // Generate bundle hash from both files
    console.log('[Widget Upload] Generating bundle hash...');
    const combinedContent = widgetContent + embedContent;
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(combinedContent))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing files first to ensure clean upload
    console.log('[Widget Upload] Removing existing widget files...');
    await supabase.storage
      .from('static')
      .remove(['widget.js', 'embed.html']);

    // Add a small delay to ensure files are properly removed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Upload both files with cache control headers
    console.log('[Widget Upload] Uploading widget files...');
    const uploads = await Promise.all([
      supabase.storage
        .from('static')
        .upload('widget.js', new Blob([widgetContent], { type: 'application/javascript' }), {
          contentType: 'application/javascript; charset=utf-8',
          cacheControl: 'no-cache',
          upsert: true,
        }),
      supabase.storage
        .from('static')
        .upload('embed.html', new Blob([embedContent], { type: 'text/html' }), {
          contentType: 'text/html; charset=utf-8',
          cacheControl: 'no-cache',
          upsert: true,
        })
    ]);

    const uploadErrors = uploads.filter(upload => upload.error);
    if (uploadErrors.length > 0) {
      console.error('[Widget Upload] Upload errors:', uploadErrors);
      throw new Error(`File upload failed: ${uploadErrors[0].error.message}`);
    }

    // Verify the files were uploaded
    const { data: files } = await supabase.storage
      .from('static')
      .list();
    
    console.log('[Widget Upload] Current files in storage:', files);
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