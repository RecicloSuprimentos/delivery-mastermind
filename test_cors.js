fetch('https://roterizador.mgbase.com.br/webhook/crm-integration-d9f2a7/services', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://192.168.0.199',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization, content-type'
  }
}).then(async r => {
  console.log('STATUS:', r.status);
  console.log('HEADERS:', Object.fromEntries(r.headers.entries()));
  console.log('BODY:', await r.text());
}).catch(console.error);
