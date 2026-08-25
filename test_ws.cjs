const WebSocket = require('ws');

const url = 'wss://roterizador.mgbase.com.br/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg1NzkwOTQyLCJleHAiOjIxMDExNTA5NDJ9.Awu8A05hgWYgU0IhI68xtukeMXQN18FiiRL6F3tvnvo&vsn=1.0.0';

const ws = new WebSocket(url);

ws.on('open', function open() {
  console.log('roterizador: CONECTADO!');
  ws.close();
});

ws.on('error', function error(err) {
  console.error('roterizador ERRO:', err.message);
});

const url2 = 'wss://supabase.mgbase.com.br/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg1NzkwOTQyLCJleHAiOjIxMDExNTA5NDJ9.Awu8A05hgWYgU0IhI68xtukeMXQN18FiiRL6F3tvnvo&vsn=1.0.0';

const ws2 = new WebSocket(url2);

ws2.on('open', function open() {
  console.log('supabase: CONECTADO!');
  ws2.close();
});

ws2.on('error', function error(err) {
  console.error('supabase ERRO:', err.message);
});
