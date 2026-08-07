const payload = { "title": "test" };

fetch('https://supabase.mgbase.com.br/functions/v1/crm-webhook', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test'
  }
}).then(async r => {
  console.log('STATUS:', r.status);
  console.log('BODY:', await r.text());
}).catch(console.error);
