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
          console.log(`Content length for ${filename}:`, content.length);
          return { content, type: response.headers.get('content-type') };
        }
        
        // Try root directory (development)
        const rootResponse = await fetch(`/${filename}`);
        if (rootResponse.ok) {
          console.log(`Found ${filename} in root directory`);
          const content = await rootResponse.text();
          console.log(`Content length for ${filename}:`, content.length);
          return { content, type: rootResponse.headers.get('content-type') };
        }

        // Try src directory for widget bundle
        if (filename === 'widget.bundle.js') {
          const srcResponse = await fetch('/src/widget.tsx');
          if (srcResponse.ok) {
            console.log('Found widget.tsx in src directory');
            const content = await srcResponse.text();
            console.log('Content length for widget.tsx:', content.length);
            return { content, type: 'application/javascript' };
          }
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

    // Upload widget.js with explicit JavaScript MIME type
    const widgetJs = `
(function() {
  const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';
  
  function createIframe(sweepstakesId) {
    console.log('[Widget] Creating iframe with sweepstakes ID:', sweepstakesId);
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; border: none; min-height: 600px;';
    iframe.setAttribute('scrolling', 'no');
    
    // Add error handling for iframe load
    iframe.onerror = () => {
      console.error('[Widget] Failed to load iframe');
      showError('Failed to load widget content');
    };
    
    // Construct the full URL for the embed
    const embedUrl = \`\${STORAGE_URL}/embed.html?id=\${sweepstakesId}\`;
    console.log('[Widget] Setting iframe src to:', embedUrl);
    iframe.src = embedUrl;
    
    // Add message listener for iframe height adjustments and error handling
    window.addEventListener('message', (event) => {
      // Only accept messages from our own iframe
      if (event.origin !== new URL(STORAGE_URL).origin) return;
      
      if (event.data.type === 'setHeight') {
        iframe.style.height = \`\${event.data.height}px\`;
      } else if (event.data.type === 'error') {
        console.error('[Widget] Error from iframe:', event.data.message);
        showError(event.data.message);
      }
    });
    
    return iframe;
  }

  function showError(message) {
    const widgetContainer = document.getElementById('sweepstakes-widget');
    if (widgetContainer) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center;';
      const errorMessage = document.createElement('p');
      errorMessage.style.cssText = 'color: #666; margin: 0;';
      errorMessage.textContent = 'Unable to load sweepstakes widget: ' + message;
      errorDiv.appendChild(errorMessage);
      widgetContainer.innerHTML = '';
      widgetContainer.appendChild(errorDiv);
    }
  }

  function initializeWidget() {
    try {
      console.log('[Widget] Initializing widget...');
      const widgetContainer = document.getElementById('sweepstakes-widget');
      if (!widgetContainer) {
        throw new Error('Widget container not found');
      }

      const sweepstakesId = widgetContainer.getAttribute('data-sweepstakes-id');
      if (!sweepstakesId) {
        throw new Error('No sweepstakes ID provided');
      }

      // Validate that we have a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sweepstakesId)) {
        throw new Error('Invalid sweepstakes ID format');
      }

      console.log('[Widget] Creating iframe for sweepstakes:', sweepstakesId);
      const iframe = createIframe(sweepstakesId);
      widgetContainer.innerHTML = '';
      widgetContainer.appendChild(iframe);
      console.log('[Widget] Widget initialized successfully');
    } catch (error) {
      console.error('[Widget] Widget initialization failed:', error.message);
      showError(error.message);
    }
  }

  // Initialize when the script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }
})();`;

    console.log('Uploading widget.js...');
    const { error: widgetError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetJs, {
        contentType: 'application/javascript; charset=utf-8',
        cacheControl: '3600',
        upsert: true,
      });

    if (widgetError) {
      console.error('Error uploading widget.js:', widgetError);
      throw widgetError;
    }
    console.log('Successfully uploaded widget.js');

    // Upload embed.html with explicit HTML MIME type and CSP meta tag
    const embedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;">
    <title>Sweepstakes Widget</title>
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
    <style>
        body { margin: 0; padding: 0; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

    console.log('Uploading embed.html...');
    const { error: embedError } = await supabase.storage
      .from('static')
      .upload('embed.html', embedHtml, {
        contentType: 'text/html; charset=utf-8',
        cacheControl: '3600',
        upsert: true,
      });

    if (embedError) {
      console.error('Error uploading embed.html:', embedError);
      throw embedError;
    }
    console.log('Successfully uploaded embed.html');

    // Upload widget bundle with explicit JavaScript MIME type
    console.log('Fetching widget.bundle.js...');
    const { content: bundleContent } = await fetchFile('widget.bundle.js');
    
    // Ensure we're uploading JavaScript content
    if (!bundleContent.includes('window.initializeWidget')) {
      throw new Error('Invalid widget bundle content - missing initialization function');
    }
    
    console.log('Uploading widget.bundle.js...');
    const { error: bundleError } = await supabase.storage
      .from('static')
      .upload('widget.bundle.js', bundleContent, {
        contentType: 'application/javascript; charset=utf-8',
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