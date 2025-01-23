import { supabase } from '@/integrations/supabase/client';

export async function uploadWidgetFiles() {
  try {
    console.log('Starting widget files upload...');

    // Helper function to fetch file with fallback paths
    async function fetchFile(filename: string) {
      try {
        // Try dist directory first (production build)
        const response = await fetch(`/dist/${filename}`);
        if (response.ok) {
          console.log(`Found ${filename} in dist directory`);
          const content = await response.text();
          console.log(`Content preview for ${filename}:`, content.substring(0, 200));
          return response;
        }
        
        // Fallback to public directory (development)
        const devResponse = await fetch(`/${filename}`);
        if (devResponse.ok) {
          console.log(`Found ${filename} in public directory`);
          const content = await devResponse.text();
          console.log(`Content preview for ${filename}:`, content.substring(0, 200));
          return devResponse;
        }
        
        throw new Error(`Failed to fetch ${filename}`);
      } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        throw error;
      }
    }

    // First, delete existing files
    console.log('Removing existing files...');
    await supabase.storage
      .from('static')
      .remove(['embed.html', 'widget.js', 'widget.bundle.js']);

    // Upload embed.html
    const embedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sweepstakes Widget</title>
    <!-- Primary CDN -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" 
            crossorigin
            onerror="loadFallbackScript('react')">
    </script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" 
            crossorigin
            onerror="loadFallbackScript('react-dom')">
    </script>
    
    <script>
        // Fallback mechanism
        function loadFallbackScript(library) {
            const fallbackUrls = {
                'react': 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
                'react-dom': 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js'
            };
            
            const script = document.createElement('script');
            script.src = fallbackUrls[library];
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }

        // Get sweepstakes ID from URL
        const params = new URLSearchParams(window.location.search);
        const sweepstakesId = params.get('id');
        
        // Initialize widget when bundle loads
        window.addEventListener('load', () => {
            if (window.initializeWidget) {
                window.initializeWidget(sweepstakesId);
            }
        });
    </script>
    <script src="widget.bundle.js" defer></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

    const embedBlob = new Blob([embedHtml], { type: 'text/html' });
    const { error: embedError } = await supabase.storage
      .from('static')
      .upload('embed.html', embedBlob, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true,
      });
    
    if (embedError) {
      console.error('Error uploading embed.html:', embedError);
      throw embedError;
    }
    console.log('Successfully uploaded embed.html');

    // Upload widget.js
    const widgetJsResponse = await fetchFile('widget.js');
    const widgetJsContent = await widgetJsResponse.text();
    console.log('Widget.js content type:', widgetJsResponse.headers.get('content-type'));
    console.log('Widget.js content preview:', widgetJsContent.substring(0, 200));
    
    const widgetJsBlob = new Blob([widgetJsContent], { type: 'application/javascript' });
    const { error: widgetError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetJsBlob, {
        contentType: 'application/javascript',
        cacheControl: '3600',
        upsert: true,
      });

    if (widgetError) {
      console.error('Error uploading widget.js:', widgetError);
      throw widgetError;
    }
    console.log('Successfully uploaded widget.js');

    // Upload widget bundle
    const widgetBundleResponse = await fetchFile('widget.bundle.js');
    const widgetBundleContent = await widgetBundleResponse.text();
    console.log('Widget bundle content type:', widgetBundleResponse.headers.get('content-type'));
    console.log('Widget bundle content preview:', widgetBundleContent.substring(0, 200));
    
    const widgetBundleBlob = new Blob([widgetBundleContent], { type: 'application/javascript' });
    const { error: bundleError } = await supabase.storage
      .from('static')
      .upload('widget.bundle.js', widgetBundleBlob, {
        contentType: 'application/javascript',
        cacheControl: '3600',
        upsert: true,
      });

    if (bundleError) {
      console.error('Error uploading widget.bundle.js:', bundleError);
      throw bundleError;
    }
    console.log('Successfully uploaded widget.bundle.js');

  } catch (error) {
    console.error('Error uploading widget files:', error);
    throw error;
  }
}