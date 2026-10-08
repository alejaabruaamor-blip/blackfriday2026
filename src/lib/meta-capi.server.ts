/**
 * Envia eventos de conversao para o Meta (Conversions API).
 *
 * Nao enviamos dados pessoais do cliente (nome, e-mail, telefone) porque nao ha
 * registro de consentimento publicitario para uso desses identificadores.
 * Usamos apenas um identificador pseudonimo derivado do codigo da transacao,
 * o que permite ao Meta deduplicar o evento com o pixel do navegador.
 *
 * Os pagamentos sao feitos por PIX, meio de pagamento exclusivo do Brasil, que
 * nao exige consentimento previo para medicao publicitaria.
 */

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type MetaEvent = {
  eventName: 'InitiateCheckout' | 'Purchase';
  txid: string;
  valueCents: number;
  productName?: string | null;
  eventTimeMs?: number;
};

export async function sendMetaEvent(event: MetaEvent): Promise<void> {
  const pixelId = process.env['META_PIXEL_ID'];
  const token = process.env['META_ACCESS_TOKEN'];
  if (!pixelId || !token) return;

  const externalId = await sha256Hex(`recargajogo:${event.txid}`);

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor((event.eventTimeMs ?? Date.now()) / 1000),
        event_id: `${event.eventName}:${event.txid}`,
        action_source: 'website',
        event_source_url: 'https://recargajogoquiz.vercel.app/',
        user_data: { external_id: [externalId] },
        custom_data: {
          currency: 'BRL',
          value: Number((event.valueCents / 100).toFixed(2)),
          ...(event.productName ? { content_name: event.productName } : {}),
        },
      },
    ],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`meta capi failed [${res.status}]: ${await res.text()}`);
    }
  } catch (error) {
    console.error('meta capi error', error);
  }
}
