import { supabase } from '@/integrations/supabase/client';

export async function uploadWidgetFiles() {
  try {
    // Helper function to fetch file with fallback paths
    async function fetchFile(filename: string) {
      try {
        // Try dist directory first (production build)
        const response = await fetch(`/dist/${filename}`);
        if (response.ok) return response;
        
        // Fallback to public directory (development)
        const devResponse = await fetch(`/${filename}`);
        if (devResponse.ok) return devResponse;
        
        throw new Error(`Failed to fetch ${filename}`);
      } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        throw error;
      }
    }

    // Upload embed.html
    const embedHtmlResponse = await fetchFile('embed.html');
    const embedHtmlBlob = await embedHtmlResponse.blob();
    const { error: embedError } = await supabase.storage
      .from('static')
      .upload('embed.html', embedHtmlBlob, {
        contentType: 'text/html',
        upsert: true
      });
    
    if (embedError) throw embedError;
    console.log('Successfully uploaded embed.html');

    // Upload widget.js
    const widgetJsResponse = await fetchFile('widget.js');
    const widgetJsBlob = await widgetJsResponse.blob();
    const { error: widgetError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetJsBlob, {
        contentType: 'application/javascript',
        upsert: true
      });

    if (widgetError) throw widgetError;
    console.log('Successfully uploaded widget.js');

    // Upload widget bundle
    const widgetBundleResponse = await fetchFile('widget.bundle.js');
    const widgetBundleBlob = await widgetBundleResponse.blob();
    const { error: bundleError } = await supabase.storage
      .from('static')
      .upload('widget.bundle.js', widgetBundleBlob, {
        contentType: 'application/javascript',
        upsert: true
      });

    if (bundleError) throw bundleError;
    console.log('Successfully uploaded widget.bundle.js');

  } catch (error) {
    console.error('Error uploading widget files:', error);
    throw error;
  }
}