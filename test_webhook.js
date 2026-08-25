const payload = {"title":"COLETA 328170","code":"328170","type":"pickup","started_at":"2026-08-07 09:39:55.207","address":"RUA NOVA SERRANA, 17 - SANTA INÊS - BELO HORIZONTE - MG - BRASIL","duration_prevision_time":5,"note":"F.PAGTO.:  Coletar entre 03/08/2026 15:30 e 03/08/2026 18:30\n  Dinheiro: 70.0000\nLevar troco: .0000\n","address_location_type":"geocomplete","latitude":"-19.8838138","longitude":"-43.9120248","customer":{"name":"ANA LUIZA AMBRÓSIO DE CARVALHO","code":"183688","address_complement":"APTO 101","address":"RUA NOVA SERRANA, 17 - SANTA INÊS - BELO HORIZONTE - MG - BRASIL","phone_number":"98531-3778(31)"}};

fetch('https://roterizador.mgbase.com.br/webhook/crm-integration-d9f2a7/services', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...'
  }
}).then(async r => {
  console.log('STATUS:', r.status);
  console.log('BODY:', await r.text());
}).catch(console.error);
