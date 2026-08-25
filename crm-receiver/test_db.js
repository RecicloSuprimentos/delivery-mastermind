const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:kF8RnWJ732Tn7CD@supabase.mgbase.com.br:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT pg_get_constraintdef(c.oid) AS constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'services' AND c.conname = 'services_status_check';
  `);
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
