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
    console.log('Recebido Webhook do CRM:', payload)

    // Conectar ao Supabase usando a Service Role Key que o Nginx injetou automaticamente no header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Nginx não injetou o Authorization header')
    }
    
    const supabaseUrl = 'https://supabase.mgbase.com.br'
    const supabaseKey = authHeader.replace('Bearer ', '')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extrair os campos do payload do CRM e mapear para a nossa tabela 'services'
    const serviceType = payload.type === 'delivery' ? 'entrega' : 'coleta'
    
    // Garantir parsing correto de latitude/longitude
    let lat = payload.latitude ? parseFloat(payload.latitude) : null
    let lng = payload.longitude ? parseFloat(payload.longitude) : null

    // O cliente pode vir aninhado no payload.customer
    const customer = payload.customer || {}
    const customerName = customer.name || 'Desconhecido'
    
    // Pega o telefone e aplica uma sanitização básica (remove espaços extras e caracteres estranhos do começo)
    let rawPhone = customer.phone_number || ''
    // Substitui múltiplos espaços por nenhum espaço, apenas para juntar o número
    let phone = rawPhone.replace(/\s+/g, '').replace(/^-+/, '')
    
    const complement = customer.address_complement || null

    const newService = {
      service_id: payload.code || `CRM-${Date.now()}`,
      customer_name: customerName,
      phone: phone,
      address: payload.address || '',
      complement: complement,
      observations: payload.note || null,
      latitude: lat,
      longitude: lng,
      type: serviceType,
      status: 'pendente'
    }

    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('services')
      .insert([newService])
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir no Supabase:', error)
      throw new Error(error.message)
    }

    // Retorna a resposta de sucesso para o CRM
    return new Response(
      JSON.stringify({ success: true, message: 'Serviço importado com sucesso', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )

  } catch (error: any) {
    console.error('Erro na Edge Function crm-webhook:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
