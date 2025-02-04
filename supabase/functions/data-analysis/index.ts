
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    console.log('Received request:', req.method)

    // Get the request body
    const body = await req.json()
    console.log('Received data:', JSON.stringify(body))

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the raw data in integration_data_analysis table
    const { data: integrationData, error: integrationError } = await supabaseClient
      .from('integration_data_analysis')
      .insert({
        raw_data: body,
      })
      .select()
      .single()

    if (integrationError) {
      console.error('Integration data storage error:', integrationError)
      throw integrationError
    }

    // Process and store the services data
    let servicesData = Array.isArray(body) ? body : [body]
    const processedServices = servicesData.map(service => ({
      type: service.type || 'coleta',
      service_id: service.service_id || `SRV-${Date.now()}`,
      customer_name: service.customer_name,
      phone: service.phone,
      email: service.email,
      address: service.address,
      complement: service.complement,
      time_window: service.time_window,
      observations: service.observations,
      latitude: service.latitude,
      longitude: service.longitude,
    }))

    // Insert into services_copia table
    const { data: services, error: servicesError } = await supabaseClient
      .from('services_copia')
      .insert(processedServices)
      .select()

    if (servicesError) {
      console.error('Services data storage error:', servicesError)
      throw servicesError
    }

    console.log('Data stored successfully:', {
      integration_id: integrationData.id,
      services_count: services.length
    })

    // Return success response
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
    console.error('Error processing request:', error)
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
