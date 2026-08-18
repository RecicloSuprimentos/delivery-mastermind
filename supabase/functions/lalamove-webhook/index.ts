import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Lidar com o CORS preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Recebido Webhook da Lalamove:', payload)

    // A Lalamove sempre envia eventType dentro do payload.data
    const data = payload.data || payload;
    const { eventType, orderId, metadata, stops, status, driverInfo } = data

    // Conectar ao Supabase usando a Service Role Key para ignorar RLS
    // Se estiver rodando no próprio Supabase Hosted
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Fallback: tentar extrair do cabeçalho se via Nginx proxy (como no crm-webhook)
    const authHeader = req.headers.get('Authorization')
    let finalKey = supabaseKey;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      finalKey = authHeader.replace('Bearer ', '')
    }

    if (!supabaseUrl || !finalKey) {
      console.error("Credenciais do Supabase ausentes.")
      return new Response('Credenciais ausentes', { status: 500, headers: corsHeaders })
    }

    const supabase = createClient(supabaseUrl, finalKey)

    if (eventType === 'ORDER_STATUS_CHANGED' && orderId) {
      console.log(`Atualizando status do pedido ${orderId} para ${status}`)
      await supabase.from('lalamove_orders')
        .update({ status: status, updated_at: new Date() })
        .eq('order_id', orderId)
    }

    if (eventType === 'POD_STATUS_CHANGED' && metadata?.stopServiceMap) {
      let stopServiceMap: Record<string, string> = {}
      try {
        stopServiceMap = typeof metadata.stopServiceMap === 'string' ? JSON.parse(metadata.stopServiceMap) : metadata.stopServiceMap
      } catch (e) {
        console.error("Erro ao fazer parse do stopServiceMap", e)
      }

      if (stops && Array.isArray(stops)) {
        for (const stop of stops) {
          const serviceId = stopServiceMap[stop.stopId]
          if (serviceId) {
            console.log(`Atualizando POD do service_id ${serviceId} (stop_id ${stop.stopId}) para ${stop.podStatus}`)
            await supabase.from('lalamove_order_stops')
              .update({
                pod_status: stop.podStatus,
                pod_photo_url: stop.photoUrl,
                delivered_at: stop.deliveredAt,
              })
              .eq('service_id', serviceId)
              .eq('stop_id', stop.stopId)
          }
        }
      }
    }

    if (eventType === 'DRIVER_ASSIGNED' && orderId && driverInfo) {
      console.log(`Atualizando motorista do pedido ${orderId}`)
      await supabase.from('lalamove_orders')
        .update({
          driver_name: driverInfo.name,
          driver_phone: driverInfo.phone,
          driver_plate: driverInfo.plateNumber,
          updated_at: new Date()
        })
        .eq('order_id', orderId)
    }

    // A Lalamove exige um retorno 200 para webhooks
    return new Response(JSON.stringify({ message: "Webhook processado" }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    // Retornamos 200 mesmo em caso de erro de parse para a Lalamove não ficar refazendo a mesma requisição infinitamente
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
