import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        // Try dist directory first (production build)
        const response = await fetch(`/dist/${filename}`);
        if (response.ok) {
          console.log(`[Widget Upload] Found ${filename} in dist directory`);
          const content = await response.text();
          console.log(`[Widget Upload] Content length for ${filename}:`, content.length);
          return { 
            content, 
            type: filename.endsWith('.js') ? 'application/javascript' : 'text/html'
          };
        }
        
        // Try root directory (development)
        const rootResponse = await fetch(`/${filename}`);
        if (rootResponse.ok) {
          console.log(`[Widget Upload] Found ${filename} in root directory`);
          const content = await rootResponse.text();
          console.log(`[Widget Upload] Content length for ${filename}:`, content.length);
          return { 
            content, 
            type: filename.endsWith('.js') ? 'application/javascript' : 'text/html'
          };
        }

        throw new Error(`Failed to fetch ${filename} from any location`);
      } catch (error) {
        console.error(`[Widget Upload] Error fetching ${filename}:`, error);
        throw error;
      }
    }

    // First, verify we can fetch all required files before starting upload
    console.log('[Widget Upload] Verifying all required files...');
    const [widgetJs, embedHtml] = await Promise.all([
      fetchFile('widget.js'),
      fetchFile('embed.html')
    ]).catch(error => {
      throw new Error(`File verification failed: ${error.message}`);
    });

    // Generate bundle hash before upload
    console.log('[Widget Upload] Generating bundle hash...');
    const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(widgetJs.content))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    console.log('[Widget Upload] Generated bundle hash:', bundleHash);

    // Delete existing files first
    console.log('[Widget Upload] Removing existing files...');
    const { error: deleteError } = await supabase.storage
      .from('static')
      .remove(['embed.html', 'widget.js']);

    if (deleteError) {
      console.error('[Widget Upload] Error deleting existing files:', deleteError);
      throw new Error(`Failed to delete existing files: ${deleteError.message}`);
    }

    // Upload all files in parallel with explicit content types
    console.log('[Widget Upload] Uploading new files...');
    const uploads = await Promise.all([
      supabase.storage
        .from('static')
        .upload('widget.js', widgetJs.content, {
          contentType: 'application/javascript; charset=utf-8',
          cacheControl: '3600',
          upsert: true,
        }),
      supabase.storage
        .from('static')
        .upload('embed.html', embedHtml.content, {
          contentType: 'text/html; charset=utf-8',
          cacheControl: '3600',
          upsert: true,
        })
    ]);

    // Check if any uploads failed
    const uploadErrors = uploads
      .filter(({ error }) => error)
      .map(({ error }) => error.message);

    if (uploadErrors.length > 0) {
      throw new Error(`File upload failed: ${uploadErrors.join(', ')}`);
    }

    console.log('[Widget Upload] All files uploaded successfully');
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