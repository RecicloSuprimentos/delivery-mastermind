const payload = {
  "title": "ENTREGA 503723",
  "code": "503723",
  "type": "delivery",
  "address": "AVENIDA DOM PEDRO II",
  "customer": {
    "name": "SORRIDEVA"
  }
};

fetch('https://roterizador.mgbase.com.br/webhook/crm-integration-d9f2a7/services', {
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
