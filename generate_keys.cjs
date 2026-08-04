const crypto = require('crypto');
const secret = '7a9b8c2d4e6f1a3b5c7d9e2f4a6b8c0d1e3f5a7b9c2d4e6f8a0b2c4d6e8f1a3b';
function createJwt(role) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role: role, iss: 'supabase', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('base64url');
  return header + '.' + payload + '.' + signature;
}
console.log('ANON_KEY=', createJwt('anon'));
console.log('SERVICE_ROLE_KEY=', createJwt('service_role'));
