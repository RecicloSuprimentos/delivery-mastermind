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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end('ok');
    return;
  }

  // Aceitar qualquer path POST (o CRM pode adicionar /services no final)
  if (req.method !== 'POST') {
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      console.log(`[${new Date().toISOString()}] Webhook recebido:`, JSON.stringify(payload));

      // Mapear campos do CRM para a tabela 'services'
      const customer = payload.customer || {};
      const serviceType = payload.type === 'delivery' ? 'entrega' : 'coleta';

      const newService = {
        service_id: payload.code || `CRM-${Date.now()}`,
        customer_name: customer.name || 'Desconhecido',
        phone: (customer.phone_number || '').trim(),
        address: payload.address || '',
        complement: customer.address_complement || null,
        observations: payload.note || null,
        latitude: payload.latitude ? parseFloat(payload.latitude) : null,
        longitude: payload.longitude ? parseFloat(payload.longitude) : null,
        type: serviceType,
        status: 'accepted',
      };

      console.log(`[${new Date().toISOString()}] Inserindo no Supabase:`, JSON.stringify(newService));

      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();

      if (error) {
        console.error(`[${new Date().toISOString()}] Erro Supabase:`, error.message);
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ success: false, error: error.message }));
        return;
      }

      console.log(`[${new Date().toISOString()}] Inserido com sucesso! ID:`, data.id);
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({ success: true, message: 'Serviço importado com sucesso', id: data.id }));

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
