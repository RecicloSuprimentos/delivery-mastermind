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

// ── Sanitização de datas da Lalamove ──────────────────────────────────────────
// A Lalamove às vezes envia datas com formato inválido ex: "2026-08-25T16:19.00Z"
// (ponto no lugar de ':' nos segundos). Isso quebra date-fns no frontend.
// Normalizamos para ISO 8601 válido antes de gravar no banco.
function sanitizeDate(rawDate) {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  // Tenta corrigir o padrão "HH:MM.SS" → "HH:MM:SS"
  const fixed = String(rawDate).replace(/(\d{2}:\d{2})\.(\d+)/, '$1:$2');
  const parsed2 = new Date(fixed);
  if (!isNaN(parsed2.getTime())) return parsed2.toISOString();
  console.warn(`[LALAMOVE] Data inválida ignorada: "${rawDate}"`);
  return new Date().toISOString();
}

// ── Cache de configuração: raw_capture_enabled ────────────────────────────────
// Evita consultar o banco em cada request — expira a cada 30 segundos.
// Para ativar: UPDATE webhook_settings SET value='true' WHERE key='raw_capture_enabled';
let rawCaptureCache = { enabled: false, fetchedAt: 0 };
const RAW_CAPTURE_TTL_MS = 30 * 1000;

async function isRawCaptureEnabled() {
  const now = Date.now();
  if (now - rawCaptureCache.fetchedAt > RAW_CAPTURE_TTL_MS) {
    const { data } = await supabase
      .from('webhook_settings')
      .select('value')
      .eq('key', 'raw_capture_enabled')
      .maybeSingle();
    rawCaptureCache.enabled = data?.value === 'true';
    rawCaptureCache.fetchedAt = now;
    if (rawCaptureCache.enabled) {
      console.log('[CONFIG] raw_capture_enabled = true');
    }
  }
  return rawCaptureCache.enabled;
}

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
        // No webhook V3 da Lalamove:
        // - eventType vem na RAIZ do payload
        // - todos os dados do pedido ficam em payload.data.order (não em payload.data direto)
        const eventType = payload.eventType || payload.event;
        const order = (payload.data && payload.data.order) || {};
        const orderId  = order.orderId;
        const status   = order.status;
        const stops    = order.stops || [];
        const driver   = order.driver || null;

        console.log(`[${new Date().toISOString()}] [LALAMOVE] Evento: ${eventType || 'DESCONHECIDO'} | OrderId: ${orderId || 'N/A'}`);

        // ── Raw Capture (controlado via webhook_settings.raw_capture_enabled) ──
        try {
          if (await isRawCaptureEnabled()) {
            await supabase.from('webhook_raw_captures').insert({
              source:     'lalamove',
              event_id:   payload.eventId  || null,
              event_type: payload.eventType || null,
              payload:    payload,
            });
            console.log(`[LALAMOVE] Raw capture salvo: ${payload.eventType} / ${payload.eventId}`);
          }
        } catch (captureErr) {
          // Captura nunca pode derrubar o processamento principal
          console.error('[LALAMOVE] Falha no raw capture (não crítico):', captureErr.message);
        }

        try {
          // ── ORDER_STATUS_CHANGED ─────────────────────────────────────────
          if (eventType === 'ORDER_STATUS_CHANGED' && orderId) {
            // Atualiza status do pedido Lalamove
            const { error, data: orderRec } = await supabase.from('lalamove_orders')
              .update({ status, updated_at: new Date() })
              .eq('order_id', orderId)
              .select('route_id')
              .single();
              
            if (error) console.error(`[LALAMOVE] Erro ao atualizar status:`, error.message);
            else console.log(`[LALAMOVE] ORDER_STATUS_CHANGED: ${orderId} → ${status}`);

            // Atualização em lote dos serviços internos atrelados a esta rota
            const STATUS_MAP = {
              'ASSIGNING_DRIVER': 'assigned',
              'ON_GOING':         'accepted',
              'PICKED_UP':        'in-transit',
            };

            const newServiceStatus = STATUS_MAP[status];
            if (newServiceStatus && orderRec?.route_id) {
              const { data: stops } = await supabase
                .from('route_stops')
                .select('service_id')
                .eq('route_id', orderRec.route_id);

              const serviceIds = (stops || []).map(s => s.service_id).filter(Boolean);

              if (serviceIds.length > 0) {
                const { error: batchErr } = await supabase.from('services')
                  .update({ status: newServiceStatus })
                  .in('id', serviceIds)
                  .not('status', 'in', '("completed","cancelled")');
                  
                if (batchErr) {
                  console.error(`[LALAMOVE] Erro no update em lote dos serviços:`, batchErr.message);
                } else {
                  console.log(`[LALAMOVE] Serviços da rota ${orderRec.route_id} atualizados para '${newServiceStatus}'`);
                }
              }
            }
          }

          // ── DRIVER_ASSIGNED ──────────────────────────────────────────────
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

          // ── POD_STATUS_CHANGED ────────────────────────────────────────────
          // Stops no webhook V3 são um array posicional SEM stopId:
          //   stops[0]  = coleta / pickup  → tem campo POP, não POD → ignoramos aqui
          //   stops[1+] = entregas          → têm campo POD com status/image/deliveredAt
          //
          // Estratégia de matching (dupla, da mais robusta para a menos):
          //   1. Primária  — extrai o service_id (ex: "504342") do campo `name` do stop
          //                  (#504342 | Nome | ...) e busca em lalamove_order_stops por service_id
          //   2. Fallback  — se name não tiver código #, usa posição (i-1) dentro do pedido
          else if (eventType === 'POD_STATUS_CHANGED' && orderId) {
            const { data: orderRec, error: orderErr } = await supabase
              .from('lalamove_orders')
              .select('id')
              .eq('order_id', orderId)
              .single();

            if (orderErr || !orderRec) {
              console.warn(`[LALAMOVE] POD_STATUS_CHANGED: orderId=${orderId} não encontrado no banco.`);
            } else {
              // Itera apenas sobre os stops de entrega (a partir do índice 1)
              const deliveryStops = stops.slice(1);

              for (let i = 0; i < deliveryStops.length; i++) {
                const stop = deliveryStops[i];
                const pod  = stop.POD; // campo correto é POD (maiúsculo) na V3

                if (!pod) {
                  console.log(`[LALAMOVE] Stop ${i} sem POD, ignorando.`);
                  continue;
                }

                console.log(`[LALAMOVE] Processando stop[${i+1}] name="${stop.name}" POD.status=${pod.status}`);

                // ── 1. Matching primário: service_id embutido no campo `name` ──
                // O frontend gera: "#504342 | Nome | ..." ou "#COLETA 504342 | Nome | ..."
                // Também suporta sufixos de duplicata: "#504282 B | Nome | ..."
                const nameMatch = stop.name && stop.name.match(/^#(?:COLETA )?(\w+(?:\s+[A-Z])?)/);
                const humanServiceId = nameMatch ? nameMatch[1] : null;

                let matchedByName = false;
                if (humanServiceId) {
                  // Busca o UUID do serviço pelo código legível (ex: "504342" ou "504282 B")
                  const { data: svcRec, error: svcErr } = await supabase
                    .from('services')
                    .select('id')
                    .eq('service_id', humanServiceId)
                    .maybeSingle();

                  if (svcErr) {
                    console.error(`[LALAMOVE] Erro ao buscar serviço ${humanServiceId}:`, svcErr.message);
                  } else if (svcRec) {
                    // Atualiza lalamove_order_stops pelo UUID do serviço
                    const { error: updErr } = await supabase
                      .from('lalamove_order_stops')
                      .update({
                        pod_status:    pod.status,
                        pod_photo_url: pod.image,
                        delivered_at:  sanitizeDate(pod.deliveredAt),
                      })
                      .eq('lalamove_order_id', orderRec.id)
                      .eq('service_id', svcRec.id);

                    if (updErr) {
                      console.error(`[LALAMOVE] Erro ao atualizar stop service=${humanServiceId}:`, updErr.message);
                    } else {
                      matchedByName = true;
                      console.log(`[LALAMOVE] POD atualizado via name: service=${humanServiceId} → ${pod.status}`);

                      // Atualiza o status + dados de conclusão do serviço
                      if (pod.status === 'DELIVERED') {
                        // Coleta a observação do motorista
                        const driverObservation = pod.comment || pod.note || pod.remark || pod.remarks || null;

                        const { error: svcUpdErr } = await supabase
                          .from('services')
                          .update({
                            status:      'completed',
                            completed_at: sanitizeDate(pod.deliveredAt),
                            completion_details: {
                              completedAt:  sanitizeDate(pod.deliveredAt),
                              podPhotoUrl:  pod.image || null,
                              observations: driverObservation,
                            },
                          })
                          .eq('id', svcRec.id);

                        if (svcUpdErr) console.error(`[LALAMOVE] Erro ao atualizar services (completed):`, svcUpdErr.message);
                        else console.log(`[LALAMOVE] services atualizado para 'completed' com comprovante: ${humanServiceId}`);
                      } else if (pod.status === 'REJECTED') {
                        const { error: svcUpdErr } = await supabase
                          .from('services')
                          .update({
                            status: 'cancelled',
                            failure_details: {
                              reason:      'Entrega não realizada pelo motorista Lalamove',
                              completedAt: new Date().toISOString(),
                            },
                          })
                          .eq('id', svcRec.id);

                        if (svcUpdErr) console.error(`[LALAMOVE] Erro ao atualizar services (cancelled):`, svcUpdErr.message);
                        else console.log(`[LALAMOVE] services.status atualizado para 'cancelled': ${humanServiceId}`);
                      }
                    }
                  } else {
                    console.warn(`[LALAMOVE] Serviço ${humanServiceId} não encontrado em services. Tentando fallback por posição.`);
                  }
                }

                // ── 2. Fallback: matching por posição ──
                if (!matchedByName) {
                  const { data: stopRec, error: updErr } = await supabase
                    .from('lalamove_order_stops')
                    .update({
                      pod_status:    pod.status,
                      pod_photo_url: pod.image,
                      delivered_at:  sanitizeDate(pod.deliveredAt),
                    })
                    .eq('lalamove_order_id', orderRec.id)
                    .eq('position', i)
                    .select('service_id')
                    .maybeSingle();

                  if (updErr) {
                    console.error(`[LALAMOVE] Erro ao atualizar stop position=${i} (fallback):`, updErr.message);
                  } else {
                    console.log(`[LALAMOVE] POD atualizado via posição: position=${i} → ${pod.status}`);

                    // Atualizar services.status via o service_id recuperado do stop
                    if (stopRec?.service_id) {
                      if (pod.status === 'DELIVERED') {
                        const driverObservation = pod.comment || pod.note || pod.remark || pod.remarks || null;
                        await supabase.from('services').update({
                          status:      'completed',
                          completed_at: sanitizeDate(pod.deliveredAt),
                          completion_details: {
                            completedAt:  sanitizeDate(pod.deliveredAt),
                            podPhotoUrl:  pod.image || null,
                            observations: driverObservation,
                          },
                        }).eq('id', stopRec.service_id);
                        console.log(`[LALAMOVE] services 'completed' via fallback posição=${i}`);
                      } else if (pod.status === 'REJECTED') {
                        await supabase.from('services').update({
                          status: 'cancelled',
                          failure_details: {
                            reason:      'Entrega não realizada pelo motorista Lalamove',
                            completedAt: new Date().toISOString(),
                          },
                        }).eq('id', stopRec.service_id);
                        console.log(`[LALAMOVE] services 'cancelled' via fallback posição=${i}`);
                      }
                    } else {
                      console.warn(`[LALAMOVE] Fallback: stop position=${i} sem service_id, services não atualizado.`);
                    }
                  }
                }
              }
            }
          }

          // ── POP_STATUS_CHANGED (prova de coleta) ─────────────────────────
          // Na V3, o POP vem dentro do stop[0] (pickup), não como evento separado.
          // Mas Lalamove também envia este evento — os dados estão em stops[0].POP
          else if (eventType === 'POP_STATUS_CHANGED' && orderId) {
            const pickupStop = stops[0];
            const pop = pickupStop && pickupStop.POP;
            if (pop) {
              const photoUrl   = Array.isArray(pop.imageUrls) ? pop.imageUrls[0] : pop.imageUrl;
              const pickedUpAt = pop.pickedUpAt;
              const { error } = await supabase.from('lalamove_orders')
                .update({ pop_photo_url: photoUrl, picked_up_at: pickedUpAt, updated_at: new Date() })
                .eq('order_id', orderId);
              if (error) console.error(`[LALAMOVE] Erro ao salvar POP:`, error.message);
              else console.log(`[LALAMOVE] POP_STATUS_CHANGED: ${orderId} | pickedUpAt=${pickedUpAt}`);
            } else {
              console.warn(`[LALAMOVE] POP_STATUS_CHANGED: sem dados POP no stops[0] para orderId=${orderId}`);
            }
          }

          // ── ORDER_AMOUNT_CHANGED ─────────────────────────────────────────
          else if (eventType === 'ORDER_AMOUNT_CHANGED' && orderId) {
            const newAmount = order.priceBreakdown && order.priceBreakdown.total;
            const { error } = await supabase.from('lalamove_orders')
              .update({ total_price: newAmount, updated_at: new Date() })
              .eq('order_id', orderId);
            if (error) console.error(`[LALAMOVE] Erro ao atualizar valor:`, error.message);
            else console.log(`[LALAMOVE] ORDER_AMOUNT_CHANGED: ${orderId} → R$ ${newAmount}`);
          }

          // ── ORDER_REPLACED ───────────────────────────────────────────────
          else if (eventType === 'ORDER_REPLACED' && orderId) {
            const newOrderId = order.newOrderId;
            console.log(`[LALAMOVE] ORDER_REPLACED: ${orderId} foi substituído por ${newOrderId}`);
            if (newOrderId) {
              await supabase.from('lalamove_orders')
                .update({ status: 'REPLACED', replaced_by: newOrderId, updated_at: new Date() })
                .eq('order_id', orderId);
            }
          }

          // ── Eventos informativos (sem persistência necessária) ───────────
          else if (eventType === 'ORDER_CREATED' && orderId) {
            console.log(`[LALAMOVE] ORDER_CREATED: orderId=${orderId} (já salvo pelo frontend)`);
          }
          else if (eventType === 'WALLET_BALANCE_CHANGED') {
            console.log(`[LALAMOVE] WALLET_BALANCE_CHANGED: ${JSON.stringify(payload.data)}`);
          }
          else if (eventType === 'DELIVERY_CODE_STATUS_CHANGED' && orderId) {
            console.log(`[LALAMOVE] DELIVERY_CODE_STATUS_CHANGED: ${orderId} → ${JSON.stringify(order)}`);
          }
          else if (eventType === 'ORDER_EDITED' && orderId) {
            console.log(`[LALAMOVE] ORDER_EDITED: ${orderId}`);
          }
          else {
            console.warn(`[LALAMOVE] Evento não mapeado: "${eventType}" | orderId=${orderId} | Payload:`, JSON.stringify(payload));
          }

        } catch (lalamoveErr) {
          console.error(`[LALAMOVE] Erro ao processar evento ${eventType}:`, lalamoveErr.message, lalamoveErr.stack);
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
