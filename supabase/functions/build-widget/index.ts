import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating widget bundle...');
    
    // This is a simplified version of the widget bundle
    const widgetBundle = `
    (function() {
      window.SweepstakesWidget = function(props) {
        return React.createElement('div', {
          className: 'sweepstakes-widget',
          style: { fontFamily: 'system-ui, sans-serif' }
        }, [
          React.createElement('h2', { key: 'title' }, props.title || 'Enter to Win!'),
          React.createElement('p', { key: 'description' }, props.description || 'Complete the form below to enter.')
        ]);
      };
    })();
    `;

    console.log('Bundle generated successfully');
    
    return new Response(
      JSON.stringify(widgetBundle),
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