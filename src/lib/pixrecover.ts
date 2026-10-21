import { products, cartTotal, type CartItem } from './mega-store';
export const STORE_ORIGIN = 'https://lojapromocao2026.vercel.app';
export type RecoveryInput = { txid: string; items: CartItem[]; customer: { name: string; email: string }; communicationConsent: boolean; expiresAt: string | null };
export function recoveryPayload(input: RecoveryInput, recoveryToken: string) {
  const first = products.find(p => p.slug === input.items[0]?.slug);
  return {
    store_key: 'blackfriday2026', external_order_id: `blackfriday2026:${input.txid}`,
    customer_name: input.customer.name, customer_email: input.customer.email,
    product_name: input.items.map(i => `${products.find(p => p.slug === i.slug)?.name ?? ''} (${i.size}) x${i.quantity}`).join(', ').slice(0, 300),
    product_image_url: first ? new URL(first.image, STORE_ORIGIN).href : null,
    amount: cartTotal(input.items) / 100, payment_id: input.txid, payment_status: 'pending', gateway: 'bravopay',
    payment_expires_at: input.expiresAt,
    checkout_url: `${STORE_ORIGIN}/pagamento?tx=${encodeURIComponent(input.txid)}&rec=${encodeURIComponent(recoveryToken)}`,
    communication_consent: input.communicationConsent,
    legal_basis: input.communicationConsent ? 'Consentimento explícito para lembretes de Pix no checkout — v1' : 'legitimate_interest_order_reminder_v1',
  };
}
