const https = require('https');

https.get('https://roterizador.mgbase.com.br/assets/index-DJliwPPL.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("URL FOUND:", data.includes('https://supabase.mgbase.com.br'));
    console.log("KEY FOUND:", data.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
