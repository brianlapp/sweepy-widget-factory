import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { exec } from 'https://deno.land/x/exec@0.0.5/mod.ts'

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

    // Set environment variables
    Deno.env.set('BUILD_TARGET', 'widget')
    Deno.env.set('VITE_APP_VERSION', version)

    // Run the build command
    const buildResult = await exec('vite build')
    console.log('[Build Widget] Build output:', buildResult)

    // Read the bundle file
    const bundle = await Deno.readTextFile('dist/widget/widget-bundle.js')

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