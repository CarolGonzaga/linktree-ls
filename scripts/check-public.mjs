// Somente projeto autorizado. Não cria usuários, não envia emails e não grava dados.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const local = await readFile('.env.local', 'utf8').catch(() => '');
const env = { ...Object.fromEntries(local.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => { const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1)]; })), ...process.env };
const base = env.VITE_SUPABASE_URL;
assert.equal(base, 'https://djwrzvxzxsbrymhfpomg.supabase.co', 'Projeto Supabase incorreto.');
assert.ok(env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'), 'Configure a publishable key.');
const headers = { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' };
async function request(path, options) {
  const response = await fetch(base + path, { ...options, headers, signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json() };
}
const publicPage = await request('/rest/v1/ls_published?select=document,revision');
assert.equal(publicPage.status, 200);
assert.ok(Array.isArray(publicPage.body));
console.log('PASS: leitura pública; publicações:', publicPage.body.length);
for (const table of ['ls_draft', 'admin_users']) {
  const result = await request(`/rest/v1/${table}?select=*`);
  assert.ok([401,403].includes(result.status));
  assert.equal(result.body.code, '42501');
  console.log(`PASS: leitura anônima bloqueada em ${table}`);
}
// Parâmetros inválidos garantem que não haverá escrita mesmo se um grant regredir.
for (const [name, payload] of [['ls_save_draft', { p_document: null, p_revision: -1 }], ['ls_publish', { p_revision: -1 }]]) {
  const result = await request(`/rest/v1/rpc/${name}`, { method: 'POST', body: JSON.stringify(payload) });
  assert.ok([401,403].includes(result.status));
  assert.equal(result.body.code, '42501');
  console.log(`PASS: execução anônima bloqueada em ${name}`);
}
const auth = await request('/auth/v1/settings');
assert.equal(auth.status, 200);
assert.equal(auth.body.disable_signup, true, 'Desative o cadastro público no Supabase Auth.');
console.log('PASS: cadastro público desativado');
const after = await request('/rest/v1/ls_published?select=document,revision');
assert.deepEqual(after.body, publicPage.body, 'A publicação mudou durante a verificação.');
console.log('PASS: publicação preservada durante as tentativas negadas');
