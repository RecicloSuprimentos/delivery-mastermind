import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processService } from './serviceProcessor.ts'
import type { ServiceData } from './types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  if (!path.endsWith('/services')) {
    console.error('Invalid endpoint:', path);
    return new Response(
      JSON.stringify({ 
        error: 'Invalid endpoint. Use /services for data analysis.',
        path: path 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
    
    let rawBody;
    try {
      rawBody = await req.text();
      console.log('Raw request body:', rawBody);
    } catch (e) {
      console.error('Error reading request body:', e);
      throw new Error('Error reading request body');
    }
    
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('Parsed request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON format in request body');
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Request body must be a valid JSON object or array');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store raw data in integration_data_analysis
    const { data: integrationData, error: integrationError } = await supabaseClient
      .from('integration_data_analysis')
      .insert({
        raw_data: body,
      })
      .select()
      .single()

    if (integrationError) {
      console.error('Integration data storage error:', integrationError);
      throw integrationError;
    }

    console.log('Integration data stored:', integrationData);

    // Process services data
    const servicesData: ServiceData[] = Array.isArray(body) ? body : [body];
    console.log('Services data before processing:', JSON.stringify(servicesData, null, 2));
    
    const processedServices = servicesData.map((service, index) => {
      console.log(`Processing service at index ${index}:`, service);
      try {
        return processService(service);
      } catch (error) {
        throw new Error(`Error processing service at index ${index}: ${error.message}`);
      }
    });

    console.log('All processed services:', JSON.stringify(processedServices, null, 2));

    // Store processed services
    const { data: services, error: servicesError } = await supabaseClient
      .from('services')
      .insert(processedServices)
      .select()

    if (servicesError) {
      console.error('Services data storage error:', servicesError);
      throw servicesError;
    }

    console.log('Services stored successfully:', services);

    return new Response(
      JSON.stringify({
        message: 'Data received and processed successfully',
        integration_id: integrationData.id,
        services: services
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})