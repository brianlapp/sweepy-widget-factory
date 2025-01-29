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

    // Create a simplified widget bundle
    const bundle = `
    (function() {
      const version = '${version}';
      console.log('[Widget] Initializing version:', version);
      
      function initializeWidget(sweepstakesId) {
        console.log('[Widget] Initializing for sweepstakes:', sweepstakesId);
        
        const container = document.getElementById('root');
        if (!container) {
          console.error('[Widget] Container not found');
          return;
        }

        // Create widget content
        const content = document.createElement('div');
        content.innerHTML = \`
          <div style="font-family: system-ui, sans-serif; padding: 1rem;">
            <h2 style="margin: 0 0 1rem;">Sweepstakes Widget</h2>
            <p>Version: \${version}</p>
            <p>Sweepstakes ID: \${sweepstakesId}</p>
          </div>
        \`;
        
        container.appendChild(content);
        
        // Handle height adjustments
        const height = content.offsetHeight;
        window.parent.postMessage({ type: 'setHeight', height }, '*');
        
        console.log('[Widget] Setup complete');
      }
      
      window.initializeWidget = initializeWidget;
    })();`;

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