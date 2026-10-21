import { recoveryPayload, type RecoveryInput } from './pixrecover';
async function sign(txid: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`blackfriday2026:${txid}`)));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
export async function recoveryToken(txid: string, secret: string) { return sign(txid, secret); }
export async function validRecoveryToken(txid: string, token: string, secret: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const expected = await sign(txid, secret);
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return mismatch === 0;
}
export async function sendRecoveryOrder(input: RecoveryInput, apiKey: string) {
  const token = await recoveryToken(input.txid, apiKey);
  const response = await fetch('https://screenshot-inspired-screen-maker.lovable.app/api/public/orders/pix', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(recoveryPayload(input, token)), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    // Never log customer details or the capability URL.
    console.error('PixRecover recusou o pedido', response.status);
    return { ok: false, status: response.status };
  }
  return { ok: true, skipped: false };
}
