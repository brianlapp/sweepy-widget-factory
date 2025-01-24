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
    const widgetContent = await fetchFile('widget-bundle.js');
    
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetContent))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing files first
    console.log('[Widget Upload] Removing existing widget files...');
    await supabase.storage
      .from('static')
      .remove(['widget.js']);

    // Set proper CORS headers and cache control
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/javascript; charset=utf-8',
    };

    console.log('[Widget Upload] Uploading widget files with CORS headers...');
    const { error: uploadError } = await supabase.storage
      .from('static')
      .upload('widget.js', new Blob([widgetContent], { 
        type: 'application/javascript' 
      }), uploadOptions);

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