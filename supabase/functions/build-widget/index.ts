import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating widget bundle...');
    
    // This will be replaced with actual bundled code
    const widgetBundle = `
    (function() {
      window.initializeWidget = function(sweepstakesId) {
        const root = document.getElementById('root');
        if (!root || !sweepstakesId) return;
        
        // Initialize widget here
        console.log('Initializing widget with ID:', sweepstakesId);
        
        // Create widget element
        const widget = document.createElement('div');
        widget.className = 'sweepstakes-widget';
        root.appendChild(widget);
        
        // Load widget styles
        const style = document.createElement('style');
        style.textContent = \`
          .sweepstakes-widget {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
        \`;
        document.head.appendChild(style);
      };
    })();
    `;

    console.log('Bundle generated successfully');
    
    return new Response(
      JSON.stringify({ bundle: widgetBundle }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        } 
      }
    )
  } catch (error) {
    console.error('Error generating bundle:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})