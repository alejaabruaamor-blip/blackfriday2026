import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recoveryPayload } from './pixrecover';
import { recoveryToken, validRecoveryToken, sendRecoveryOrder } from './pixrecover.server';
const input = { txid: 'tx-test-123', items: [{ slug: 'norisk-razor-black-edition', size: '58', quantity: 2 }], customer: { name: 'Cliente Teste', email: 'cliente@example.com' }, communicationConsent: true, expiresAt: null };
test('pedido Black Friday envia nome, produto, foto, valor e identidade corretos', () => {
 const p = recoveryPayload(input, 'signed-token');
 assert.equal(p.store_key, 'blackfriday2026'); assert.equal(p.customer_email, 'cliente@example.com'); assert.equal(p.customer_name, 'Cliente Teste');
 assert.equal(p.amount, 102.60); assert.equal(p.product_name, 'Capacete NoRisk Razor Black Edition (58) x2');
 assert.equal(p.product_image_url, 'https://lojapromocao2026.vercel.app/img/norisk-razor-black-edition.webp');
 assert.equal(new URL(p.checkout_url).searchParams.get('tx'), 'tx-test-123');
});
test('sem consentimento não envia pedido à recuperação', async () => {
 assert.deepEqual(await sendRecoveryOrder({...input, communicationConsent: false}, 'test-only-secret'), {ok:true, skipped:true});
});
test('link assinado só reabre a transação correta', async () => {
 const token = await recoveryToken('tx-test-123', 'test-only-secret');
 assert.equal(await validRecoveryToken('tx-test-123', token, 'test-only-secret'), true);
 assert.equal(await validRecoveryToken('tx-other-123', token, 'test-only-secret'), false);
 assert.equal(await validRecoveryToken('tx-test-123', token, 'other-secret'), false);
});
test('envia o pedido apenas para a recuperação com a chave no servidor', async () => {
 const original = globalThis.fetch;
 globalThis.fetch = async (url, init) => {
  assert.equal(url, 'https://screenshot-inspired-screen-maker.lovable.app/api/public/orders/pix');
  assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-only-secret');
  assert.equal(JSON.parse(String(init?.body)).communication_consent, true);
  return new Response('{}', {status:201});
 };
 try { assert.deepEqual(await sendRecoveryOrder(input, 'test-only-secret'), {ok:true, skipped:false}); } finally { globalThis.fetch = original; }
});
