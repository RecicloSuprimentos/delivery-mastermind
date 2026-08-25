const { createClient } = require('@supabase/supabase-js');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODU3OTA5NDIsImV4cCI6MjEwMTE1MDk0Mn0.S1Ekf40QidE2JcrZun39WR7P8hsVNzK7PbMz_bBQSBE';
const SUPABASE_URL = 'https://supabase.mgbase.com.br';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const statuses = ['not-assigned', 'not_assigned', 'unassigned'];

async function test() {
  for (const s of statuses) {
    const { data, error } = await supabase.from('services').insert({
      service_id: 'CRM-TEST-U-' + s + Date.now(),
      customer_name: 'TEST',
      type: 'coleta',
      status: s,
      phone: '',
      address: 'RUA TESTE'
    });
    if (error) {
      console.log(`Status '${s}' falhou: ${error.message}`);
    } else {
      console.log(`Status '${s}' SUCESSO!`);
    }
  }
}
test();
