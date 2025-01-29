import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const { version } = await req.json()
    console.log('[Build Widget] Starting build for version:', version)

    // Instead of building, we'll return the widget bundle content directly
    // This is a simplified version that loads the widget and its dependencies
    const bundle = `
    (function() {
      const version = '${version}';
      console.log('[Widget] Initializing version:', version);
      
      // Core widget functionality
      function initializeWidget(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error('[Widget] Container not found:', containerId);
          return;
        }
        
        console.log('[Widget] Initializing in container:', containerId, 'with config:', config);
        
        // Create iframe for widget content
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.minHeight = '400px';
        
        // Set source with configuration
        const params = new URLSearchParams(config);
        iframe.src = \`\${window.location.origin}/embed?\${params.toString()}&v=\${version}\`;
        
        // Handle iframe messages
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'setHeight') {
            iframe.style.height = event.data.height + 'px';
          }
        });
        
        container.appendChild(iframe);
        console.log('[Widget] Setup complete');
      }
      
      // Expose widget initialization function
      window.initializeWidget = initializeWidget;
      
      console.log('[Widget] Ready to initialize');
    })();
    `;

    return new Response(
      JSON.stringify({ 
        success: true,
        bundle
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Build Widget] Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})