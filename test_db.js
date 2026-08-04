import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres:SuaSenhaSeguraBanco123!@137.131.212.71:5432/postgres'
});

async function test() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in public schema:");
    console.log(res.rows.map(r => r.table_name));
    
    const countRes = await client.query('SELECT count(*) FROM auth.users');
    console.log("Users in auth schema: ", countRes.rows[0].count);
    
  } catch (err) {
    console.error("Connection or query error:", err);
  } finally {
    await client.end();
  }
}

test();
