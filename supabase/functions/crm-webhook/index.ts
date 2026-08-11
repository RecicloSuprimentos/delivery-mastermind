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
    
    // Pega o telefone
    let rawPhone = customer.phone_number || ''
    
    // Corrige padrão invertido do CRM onde o DDD vem no final: ex "99150-2945(31)" -> "(31) 99150-2945"
    const invertedPattern = /^([\d\s\-]+?)\s*\((\d{2})\)$/
    const match = rawPhone.trim().match(invertedPattern)
    if (match) {
      rawPhone = `(${match[2]}) ${match[1].trim()}`
    }

    // Aplica uma sanitização básica (remove espaços e caracteres estranhos do começo)
    let phone = rawPhone.replace(/\s+/g, '').replace(/^-+/, '')
    
    const complement = customer.address_complement || null

    // Higieniza as observações (trata espaços duplicados e converte decimais (.0000) para formato moeda R$)
    let sanitizedNote = payload.note || null
    if (sanitizedNote) {
      sanitizedNote = sanitizedNote.replace(/[ \t]{2,}/g, ' ')
      sanitizedNote = sanitizedNote.replace(/(:\s*|\s|^)(\d*\.\d{2,4})(?=\s|$|\n)/g, (match: string, prefix: string, numStr: string) => {
        const num = parseFloat(numStr) || 0
        return `${prefix}R$ ${num.toFixed(2)}`
      })
      
      // Filtros de poluição visual
      sanitizedNote = sanitizedNote.replace(/Levar troco:\s*R\$\s*0\.00/gi, '')
      sanitizedNote = sanitizedNote.replace(/^F\.PAGTO\.:\s*$/gmi, '')
      sanitizedNote = sanitizedNote.replace(/\n\s*\n/g, '\n')
      
      sanitizedNote = sanitizedNote.trim()
    }

    const newService = {
      service_id: payload.code || `CRM-${Date.now()}`,
      customer_name: customerName,
      phone: phone,
      address: payload.address || '',
      complement: complement,
      observations: sanitizedNote,
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
