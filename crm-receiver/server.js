const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const PORT = 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase.mgbase.com.br';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY não definida!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end('ok');
    return;
  }

  const url = new URL(req.url, `http://localhost`);
  const isLalamoveWebhook = url.pathname === '/webhook/lalamove';

  // Lalamove valida o endpoint com GET — retornar 200 imediatamente
  if (isLalamoveWebhook && req.method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ status: 'ok', service: 'lalamove-webhook' }));
    return;
  }

  // Bloquear outros métodos que não sejam POST
  if (req.method !== 'POST') {
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');

      // ── Handler do Webhook da Lalamove ──────────────────────────────────
      if (isLalamoveWebhook) {
        // ⚠️ IMPORTANTE: No webhook V3 da Lalamove, eventType vem na RAIZ do payload,
        // não dentro de payload.data. O orderId e demais campos vêm em payload.data.
        const eventType = payload.eventType || (payload.data && payload.data.eventType) || payload.event;
        const data = payload.data || {};
        const orderId = data.orderId || payload.orderId;
        const status = data.status || payload.status;
        const stops = data.stops || payload.stops;
        // Lalamove usa 'driver' (não 'driverInfo') no DRIVER_ASSIGNED
        const driver = data.driver || data.driverInfo || payload.driver;
        const metadata = data.metadata || payload.metadata;

        console.log(`[${new Date().toISOString()}] [LALAMOVE] Evento: ${eventType || 'DESCONHECIDO'} | OrderId: ${orderId || 'N/A'} | Payload completo:`, JSON.stringify(payload));

        try {
          if (eventType === 'ORDER_STATUS_CHANGED' && orderId) {
            const { error } = await supabase.from('lalamove_orders')
              .update({ status, updated_at: new Date() })
              .eq('order_id', orderId);
            if (error) console.error(`[LALAMOVE] Erro ao atualizar status:`, error.message);
            else console.log(`[LALAMOVE] ORDER_STATUS_CHANGED: ${orderId} → ${status}`);
          }

          else if (eventType === 'DRIVER_ASSIGNED' && orderId && driver) {
            const { error } = await supabase.from('lalamove_orders')
              .update({
                driver_name: driver.name,
                driver_phone: driver.phone,
                driver_plate: driver.plateNumber,
                updated_at: new Date()
              })
              .eq('order_id', orderId);
            if (error) console.error(`[LALAMOVE] Erro ao salvar motorista:`, error.message);
            else console.log(`[LALAMOVE] DRIVER_ASSIGNED: ${orderId} → ${driver.name} / ${driver.plateNumber}`);
          }

          else if (eventType === 'POD_STATUS_CHANGED' && orderId) {
            const { data: orderRec } = await supabase.from('lalamove_orders')
              .select('id').eq('order_id', orderId).single();

            if (orderRec && stops && Array.isArray(stops)) {
              for (const stop of stops) {
                if (stop.stopId) {
                  const { error } = await supabase.from('lalamove_order_stops')
                    .update({
                      pod_status: stop.podStatus,
                      pod_photo_url: stop.photoUrl,
                      delivered_at: stop.deliveredAt,
                    })
                    .eq('lalamove_order_id', orderRec.id)
                    .eq('stop_id', stop.stopId);
                  if (error) console.error(`[LALAMOVE] Erro ao atualizar POD stopId=${stop.stopId}:`, error.message);
                  else console.log(`[LALAMOVE] POD_STATUS_CHANGED: stopId=${stop.stopId} → ${stop.podStatus}`);
                }
              }
            } else if (!orderRec) {
              console.warn(`[LALAMOVE] POD_STATUS_CHANGED: orderId=${orderId} não encontrado no banco!`);
            }
          }

          else if (eventType === 'POP_STATUS_CHANGED' && orderId) {
            // Proof-of-pickup: foto e horário da coleta
            const { error } = await supabase.from('lalamove_orders')
              .update({ pop_photo_url: data.photoUrl, picked_up_at: data.pickupDateTime, updated_at: new Date() })
              .eq('order_id', orderId);
            if (error) console.error(`[LALAMOVE] Erro ao salvar POP:`, error.message);
            else console.log(`[LALAMOVE] POP_STATUS_CHANGED: ${orderId}`);
          }

          else if (eventType === 'ORDER_AMOUNT_CHANGED' && orderId) {
            const newAmount = data.priceBreakdown?.total;
            const { error } = await supabase.from('lalamove_orders')
              .update({ total_price: newAmount, updated_at: new Date() })
              .eq('order_id', orderId);
            if (error) console.error(`[LALAMOVE] Erro ao atualizar valor:`, error.message);
            else console.log(`[LALAMOVE] ORDER_AMOUNT_CHANGED: ${orderId} → R$ ${newAmount}`);
          }

          else if (eventType === 'ORDER_REPLACED' && orderId) {
            const newOrderId = data.newOrderId;
            console.log(`[LALAMOVE] ORDER_REPLACED: ${orderId} foi substituído por ${newOrderId}`);
            if (newOrderId) {
              await supabase.from('lalamove_orders')
                .update({ status: 'REPLACED', replaced_by: newOrderId, updated_at: new Date() })
                .eq('order_id', orderId);
            }
          }

          else if (eventType === 'ORDER_CREATED' && orderId) {
            console.log(`[LALAMOVE] ORDER_CREATED recebido para orderId=${orderId} (salvo pelo frontend no momento da contratação)`);
          }

          else if (eventType === 'WALLET_BALANCE_CHANGED') {
            console.log(`[LALAMOVE] WALLET_BALANCE_CHANGED: novo saldo = ${JSON.stringify(data)}`);
          }

          else if (eventType === 'DELIVERY_CODE_STATUS_CHANGED' && orderId) {
            console.log(`[LALAMOVE] DELIVERY_CODE_STATUS_CHANGED: ${orderId} → ${JSON.stringify(data)}`);
          }

          else if (eventType === 'ORDER_EDITED' && orderId) {
            console.log(`[LALAMOVE] ORDER_EDITED: ${orderId} foi editado → ${JSON.stringify(data)}`);
          }

          else {
            console.warn(`[LALAMOVE] Evento não mapeado: ${eventType} | Dados:`, JSON.stringify(data));
          }

        } catch (lalamoveErr) {
          console.error(`[LALAMOVE] Erro ao processar evento ${eventType}:`, lalamoveErr.message);
        }

        // A Lalamove exige 200 sempre, mesmo em erros internos
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ status: 'ok', eventType }));
        return;
      }

      // ── Handler do Webhook do CRM (comportamento original) ──────────────
      console.log(`[${new Date().toISOString()}] Webhook recebido:`, JSON.stringify(payload));

      // Mapear campos do CRM para a tabela 'services'
      const customer = payload.customer || {};
      const serviceType = payload.type === 'delivery' ? 'entrega' : 'coleta';

      // ── Sanitização do telefone ──────────────────────────────────────────
      let rawPhone = (customer.phone_number || '').trim();

      // Corrige padrão invertido do CRM: "99150-2945(31)" → "(31) 99150-2945"
      const invertedPattern = /^([\d\s\-]+?)\s*\((\d{2})\)$/;
      const phoneMatch = rawPhone.match(invertedPattern);
      if (phoneMatch) {
        rawPhone = `(${phoneMatch[2]}) ${phoneMatch[1].trim()}`;
      }
      // Remove espaços extras e traços no início
      const phone = rawPhone.replace(/\s+/g, '').replace(/^-+/, '');

      // ── Sanitização das observações ─────────────────────────────────────
      let sanitizedNote = payload.note || null;
      if (sanitizedNote) {
        // 1. Compacta múltiplos espaços/tabs em um único espaço
        sanitizedNote = sanitizedNote.replace(/[ \t]{2,}/g, ' ');

        // 2. Converte decimais do CRM (.0000 / 360.0000) para R$ 0.00
        sanitizedNote = sanitizedNote.replace(/(:\s*|\s|^)(\d*\.\d{2,4})(?=\s|$|\n)/g, (m, prefix, numStr) => {
          const num = parseFloat(numStr) || 0;
          return `${prefix}R$ ${num.toFixed(2)}`;
        });

        // 3. Remove "Levar troco: R$ 0.00" (informação irrelevante)
        sanitizedNote = sanitizedNote.replace(/Levar troco:\s*R\$\s*0\.00/gi, '');

        // 4. Remove linha "F.PAGTO.:" que ficou vazia após remoções
        sanitizedNote = sanitizedNote.replace(/^F\.PAGTO\.:\s*$/gmi, '');

        // 5. Remove quebras de linha duplas geradas pelas remoções
        sanitizedNote = sanitizedNote.replace(/\n\s*\n/g, '\n');

        sanitizedNote = sanitizedNote.trim() || null;
      }

      const newService = {
        service_id: payload.code || `CRM-${Date.now()}`,
        customer_name: customer.name || 'Desconhecido',
        phone,
        address: payload.address || '',
        complement: customer.address_complement || null,
        observations: sanitizedNote,
        latitude: payload.latitude ? parseFloat(payload.latitude) : null,
        longitude: payload.longitude ? parseFloat(payload.longitude) : null,
        type: serviceType,
        status: 'not-assigned',
      };

      const originalServiceId = newService.service_id;
      const suffixes = [' A', ' B', ' C', ' D', ' E', ' F', ' G', ' H', ' I', ' J', ' K', ' L', ' M', ' N', ' O', ' P', ' Q', ' R', ' S', ' T', ' U', ' V', ' W', ' X', ' Y', ' Z'];
      let suffixIndex = -1; // -1 = sem sufixo
      
      let insertedData = null;
      let insertError = null;

      while (suffixIndex < suffixes.length) {
        if (suffixIndex >= 0) {
          newService.service_id = `${originalServiceId}${suffixes[suffixIndex]}`;
        }
        
        console.log(`[${new Date().toISOString()}] Tentando inserir no Supabase (ID: ${newService.service_id})...`);

        const { data, error } = await supabase
          .from('services')
          .insert([newService])
          .select()
          .single();

        if (error && error.code === '23505') {
          console.log(`[${new Date().toISOString()}] Serviço ${newService.service_id} já existe. Tentando próximo sufixo...`);
          suffixIndex++;
          continue;
        }

        insertedData = data;
        insertError = error;
        break; // Sucesso ou erro inesperado, sai do loop
      }

      if (insertError) {
        console.error(`[${new Date().toISOString()}] Erro Supabase:`, insertError.message);
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ success: false, error: insertError.message }));
        return;
      }

      console.log(`[${new Date().toISOString()}] Inserido com sucesso! ID no banco:`, insertedData.id);
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({ success: true, message: 'Serviço importado com sucesso', id: insertedData.id }));

    } catch (err) {
      console.error(`[${new Date().toISOString()}] Erro:`, err.message);
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] CRM Receiver rodando na porta ${PORT}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
});
