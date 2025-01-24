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
    async function fetchFile(filename: string) {
      console.log(`[Widget Upload] Attempting to fetch ${filename}...`);
      try {
        const response = await fetch(`/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filename} with status ${response.status}`);
        }
        const content = await response.text();
        console.log(`[Widget Upload] Successfully fetched ${filename}, content length:`, content.length);
        return content;
      } catch (error) {
        console.error(`[Widget Upload] Error fetching ${filename}:`, error);
        throw new Error(`Failed to fetch ${filename}: ${error.message}`);
      }
    }

    console.log('[Widget Upload] Fetching widget files...');
    const [widgetContent, embedContent] = await Promise.all([
      fetchFile('widget.js'),
      fetchFile('embed.html')
    ]);
    
    console.log('[Widget Upload] Generating bundle hash...');
    const combinedContent = widgetContent + embedContent;
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(combinedContent))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing files first
    console.log('[Widget Upload] Removing existing widget files...');
    await supabase.storage
      .from('static')
      .remove(['widget.js', 'embed.html']);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Set proper CORS headers and cache control
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true,
      contentType: 'text/html; charset=utf-8',
      duplex: 'half',
    };

    console.log('[Widget Upload] Uploading widget files with CORS headers...');
    const uploads = await Promise.all([
      supabase.storage
        .from('static')
        .upload('widget.js', new Blob([widgetContent], { 
          type: 'application/javascript' 
        }), {
          ...uploadOptions,
          contentType: 'application/javascript; charset=utf-8',
        }),
      supabase.storage
        .from('static')
        .upload('embed.html', new Blob([embedContent], { 
          type: 'text/html' 
        }), uploadOptions)
    ]);

    const uploadErrors = uploads.filter(upload => upload.error);
    if (uploadErrors.length > 0) {
      console.error('[Widget Upload] Upload errors:', uploadErrors);
      const errorMessages = uploadErrors.map(upload => upload.error?.message).join(', ');
      throw new Error(`File upload failed: ${errorMessages}`);
    }

    // Verify uploads and get public URLs
    const { data: files, error: listError } = await supabase.storage
      .from('static')
      .list();
    
    if (listError) {
      console.error('[Widget Upload] Error listing files:', listError);
      throw new Error(`Failed to verify uploads: ${listError.message}`);
    }

    // Get and log public URLs
    const widgetUrl = supabase.storage
      .from('static')
      .getPublicUrl('widget.js').data.publicUrl;
    
    const embedUrl = supabase.storage
      .from('static')
      .getPublicUrl('embed.html').data.publicUrl;

    console.log('[Widget Upload] Public URLs:', {
      widget: widgetUrl,
      embed: embedUrl
    });

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