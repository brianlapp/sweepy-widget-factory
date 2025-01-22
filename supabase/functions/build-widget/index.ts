import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This is a simplified version of the widget bundle
    // You would typically want to generate this dynamically based on your needs
    const widgetBundle = `
    (function() {
      window.SweepstakesWidget = {
        init: function(containerId, config) {
          const container = document.getElementById(containerId);
          if (!container) {
            console.error('Container element not found');
            return;
          }

          // Create React root and render widget
          const root = ReactDOM.createRoot(container);
          root.render(
            React.createElement(window.SweepstakesWidgetApp, config)
          );
        }
      };
    })();
    `

    return new Response(
      widgetBundle,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/javascript',
        } 
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})