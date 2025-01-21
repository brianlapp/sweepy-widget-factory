import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const BEEHIIV_API_KEY = Deno.env.get("BEEHIIV_API_KEY");
const BEEHIIV_PUBLICATION_ID = "pub_"; // TODO: Get this from the request or env

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BeehiivSubscriber {
  email: string;
  first_name?: string;
  last_name?: string;
  utm_source?: string;
  reactivate?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, last_name, utm_source } = await req.json();

    console.log('Syncing subscriber to BeehiiV:', { email, first_name, last_name, utm_source });

    const subscriber: BeehiivSubscriber = {
      email,
      first_name,
      last_name,
      utm_source: utm_source || 'sweepstakes',
      reactivate: true
    };

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email: subscriber.email,
          first_name: subscriber.first_name,
          last_name: subscriber.last_name,
          utm_source: subscriber.utm_source,
          reactivate: subscriber.reactivate,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('BeehiiV API error:', data);
      throw new Error(data.message || 'Failed to sync with BeehiiV');
    }

    console.log('Successfully synced with BeehiiV:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in beehiiv-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};

serve(handler);