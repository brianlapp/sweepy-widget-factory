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
    // Helper function to fetch file with proper content type handling
    async function fetchFile(filename: string) {
      console.log(`[Widget Upload] Attempting to fetch ${filename}...`);
      try {
        // Always try dist directory first (production build)
        const response = await fetch(`/dist/${filename}`);
        if (response.ok) {
          console.log(`[Widget Upload] Found ${filename} in dist directory`);
          const content = await response.text();
          console.log(`[Widget Upload] Content length for ${filename}:`, content.length);
          console.log(`[Widget Upload] Content type for ${filename}:`, response.headers.get('content-type'));
          return { 
            content, 
            type: filename.endsWith('.js') ? 'application/javascript' : 'text/html'
          };
        }

        throw new Error(`Failed to fetch ${filename} from dist directory`);
      } catch (error) {
        console.error(`[Widget Upload] Error fetching ${filename}:`, error);
        throw error;
      }
    }

    // First, verify we can fetch the widget.js file
    console.log('[Widget Upload] Verifying widget.js file...');
    const widgetJs = await fetchFile('widget.js');
    console.log('[Widget Upload] Widget.js file verified:', widgetJs.type);

    // Generate bundle hash
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetJs.content))
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
      console.error('[Widget Upload] Error deleting existing file:', deleteError);
      // Continue even if delete fails - it might not exist
    }

    // Upload widget.js with explicit content type
    console.log('[Widget Upload] Uploading widget.js...');
    const { error: uploadError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetJs.content, {
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