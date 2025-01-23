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
      console.log(`[Widget Upload] Attempting to fetch ${filename} from public directory...`);
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

    // Fetch the widget.js content
    console.log('[Widget Upload] Fetching widget.js...');
    const widgetContent = await fetchFile('widget.js');
    
    // Generate bundle hash
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetContent))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing file first
    console.log('[Widget Upload] Removing existing widget.js...');
    const { error: deleteError } = await supabase.storage
      .from('static')
      .remove(['widget.js']);

    if (deleteError) {
      console.log('[Widget Upload] Note: Delete operation returned error (file might not exist):', deleteError);
      // Continue even if delete fails - it might not exist
    }

    // Upload widget.js with explicit content type
    console.log('[Widget Upload] Uploading widget.js...');
    const { error: uploadError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetContent, {
        contentType: 'application/javascript; charset=utf-8',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Widget Upload] Upload error:', uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

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