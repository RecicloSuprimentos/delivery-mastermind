import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    let body;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      
      try {
        body = JSON.parse(rawBody);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON format in request body');
      }
      
      console.log('Parsed request body:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('Error reading/parsing request body:', e);
      throw new Error('Error processing request body');
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Request body must be a valid JSON object or array');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    let servicesData = Array.isArray(body) ? body : [body];
    
    console.log('Services data before processing:', JSON.stringify(servicesData, null, 2));
    
    const processedServices = servicesData.map((service, index) => {
      console.log(`Processing service at index ${index}:`, service);
      
      const customerName = service.customer?.name || service.customer_name;
      const customerPhone = service.customer?.phone_number || service.phone;
      const addressComplement = service.customer?.address_complement || service.complement;
      
      if (!customerName) {
        console.error(`Missing customer name in service:`, service);
        throw new Error(`Service at index ${index} is missing required field: customer name`);
      }
      if (!customerPhone) {
        console.error(`Missing phone in service:`, service);
        throw new Error(`Service at index ${index} is missing required field: phone`);
      }
      if (!service.address) {
        console.error(`Missing address in service:`, service);
        throw new Error(`Service at index ${index} is missing required field: address`);
      }

      let formattedPhone = customerPhone.trim();
      const dddMatch = formattedPhone.match(/(\d+)-(\d+)\((\d+)\)/);
      if (dddMatch) {
        formattedPhone = `(${dddMatch[3]})${dddMatch[1]}-${dddMatch[2]}`;
      }

      let timeWindow = null;
      if (service.duration_prevision_time) {
        timeWindow = `${service.duration_prevision_time} minutos`;
      } else if (service.time_window) {
        if (/^\d{2}:\d{2} às \d{2}:\d{2}$/.test(service.time_window)) {
          timeWindow = service.time_window;
        }
      }
      
      let observations = service.note || service.observations || '';
      if (service.time_window && !timeWindow) {
        observations = observations ? `${observations}\n${service.time_window}` : service.time_window;
      }

      return {
        type: service.type === 'pickup' ? 'coleta' : 
              service.type === 'delivery' ? 'entrega' : 
              service.type || 'coleta',
        service_id: service.code || 
                   service.service_id || 
                   `${Date.now()}`,
        customer_name: customerName.trim(),
        phone: formattedPhone,
        email: service.customer?.email || service.email,
        address: service.address,
        complement: addressComplement,
        time_window: timeWindow,
        observations: observations,
        latitude: service.latitude ? Number(service.latitude) : null,
        longitude: service.longitude ? Number(service.longitude) : null,
      };
    });

    console.log('All processed services:', JSON.stringify(processedServices, null, 2));

    // Alterado de services_copia para services
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