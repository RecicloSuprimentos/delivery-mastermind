// Diagnóstico completo do roteamento das Edge Functions

// TESTE 1: Chamar crm-webhook diretamente no Supabase sem passar pelo Nginx
fetch('https://supabase.mgbase.com.br/functions/v1/crm-webhook', {
  method: 'POST',
  body: JSON.stringify({ test: true }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(async r => {
  console.log('[SUPABASE DIRETO] STATUS:', r.status);
  console.log('[SUPABASE DIRETO] BODY:', await r.text());
}).catch(e => console.log('[SUPABASE DIRETO] ERRO:', e.message));

// TESTE 2: Chamar lalamove-proxy diretamente para ver se o roteamento está fixo
fetch('https://supabase.mgbase.com.br/functions/v1/lalamove-proxy', {
  method: 'POST',
  body: JSON.stringify({ test: true }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(async r => {
  console.log('[LALAMOVE DIRETO] STATUS:', r.status);
  console.log('[LALAMOVE DIRETO] BODY:', await r.text());
}).catch(e => console.log('[LALAMOVE DIRETO] ERRO:', e.message));

// TESTE 3: Chamar main diretamente para entender como o roteador está respondendo
fetch('https://supabase.mgbase.com.br/functions/v1/main', {
  method: 'POST',
  body: JSON.stringify({ test: true }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(async r => {
  console.log('[MAIN DIRETO] STATUS:', r.status);
  console.log('[MAIN DIRETO] BODY:', await r.text());
}).catch(e => console.log('[MAIN DIRETO] ERRO:', e.message));
