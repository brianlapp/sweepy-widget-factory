import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
const BEEHIIV_PUBLICATION_ID = "pub_4b47c3db-7b59-4c82-a18b-16cf10fc2d23";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BeehiivSubscriber {
  email: string;
  first_name?: string;
  last_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  tags: string[];
  reactivate?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, last_name, utm_source, customTag } = await req.json();

    console.log('BeehiiV Sync - Input:', { 
      email, 
      first_name, 
      last_name, 
      utm_source, 
      customTag 
    });

    // Prepare the subscriber data
    const subscriberData: BeehiivSubscriber = {
      email,
      first_name,
      last_name,
      utm_source: 'sweepstakes',
      utm_medium: customTag || 'organic',
      utm_campaign: customTag || undefined,
      tags: ['sweeps'],
      reactivate: true,
    };

    // Add custom tag if provided
    if (customTag) {
      subscriberData.tags.push(customTag);
    }

    console.log('BeehiiV Sync - Sending data:', subscriberData);

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify(subscriberData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('BeehiiV API error:', data);
      throw new Error(data.message || 'Failed to sync with BeehiiV');
    }

    console.log('BeehiiV Sync - Success:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('BeehiiV Sync - Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});