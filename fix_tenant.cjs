const { Client } = require('pg');

const client = new Client({
  host: '137.131.212.71',
  port: 5432,
  user: 'supabase_admin',
  password: 'kF8RnWJ732Tn7CD',
  database: 'postgres',
});

client.connect()
  .then(() => {
    console.log('Conectado ao Postgres com sucesso!');
    return client.query(`
      INSERT INTO realtime.tenants (id, name)
      VALUES ('supabase.mgbase.com.br', 'supabase.mgbase.com.br'), ('roterizador.mgbase.com.br', 'roterizador.mgbase.com.br')
      ON CONFLICT DO NOTHING;
    `);
  })
  .then((res) => {
    console.log('SQL executado:', res.rowCount);
    return client.end();
  })
  .catch(err => console.error('Erro de conexão:', err.message));
