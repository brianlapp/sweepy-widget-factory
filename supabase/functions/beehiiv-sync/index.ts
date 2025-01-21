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

    // Prepare the subscriber data with base tag
    const tags = ['sweeps'];
    if (customTag) {
      tags.push(customTag);
    }

    // Prepare the subscriber data
    const subscriberData: BeehiivSubscriber = {
      email,
      first_name,
      last_name,
      utm_source: 'sweepstakes',
      utm_medium: customTag || 'organic',
      utm_campaign: customTag || undefined,
      tags,
      reactivate: true,
    };

    console.log('BeehiiV Sync - Sending data:', subscriberData);

    // First create/update the subscription
    const subscribeResponse = await fetch(
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

    const subscribeData = await subscribeResponse.json();

    if (!subscribeResponse.ok) {
      console.error('BeehiiV API error (subscribe):', subscribeData);
      throw new Error(subscribeData.message || 'Failed to sync with BeehiiV');
    }

    console.log('BeehiiV Sync - Subscribe Success:', subscribeData);

    // Then explicitly add tags to the subscription
    if (subscribeData.data?.id) {
      const tagResponse = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscribeData.data.id}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({ tags }),
        }
      );

      const tagData = await tagResponse.json();
      
      if (!tagResponse.ok) {
        console.error('BeehiiV API error (tags):', tagData);
        // Don't throw here as the subscription was successful
        console.warn('Failed to add tags but subscription was created');
      } else {
        console.log('BeehiiV Sync - Tags Success:', tagData);
      }
    }

    return new Response(JSON.stringify(subscribeData), {
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