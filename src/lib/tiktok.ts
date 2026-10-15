// Pixel do TikTok (DB7553BC77UA99RA7O60): envia eventos de interesse e compra.
type Ttq = { track: (e: string, d?: object) => void; identify: (d: object) => void };
const ttq = () => (typeof window === "undefined" ? undefined : (window as unknown as { ttq?: Ttq }).ttq);

async function sha256(v: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function ttTrack(event: string, valueCents: number, id: string, name?: string, quantity = 1) {
  const names: Record<string,string> = {ViewContent:'ViewContent',AddToCart:'AddToCart',InitiateCheckout:'InitiateCheckout',AddPaymentInfo:'AddPaymentInfo'};
  if (typeof window !== 'undefined' && names[event]) window.dispatchEvent(new CustomEvent('mega-meta-event', {detail:{name:names[event],data:{value:valueCents/100,currency:'BRL',content_type:'product',content_ids:[id],num_items:quantity}}}));
  try {
    ttq()?.track(event, { value: valueCents / 100, currency: "BRL", content_type: "product", content_id: id, contents: [{ content_id: id, content_name: name, quantity, price: valueCents / 100 / quantity }] });
  } catch { /* sem pixel */ }
}

export async function ttIdentify(email: string, phone: string) {
  try {
    const d = phone.replace(/\D/g, "");
    ttq()?.identify({ email: await sha256(email), phone_number: await sha256(d.startsWith("55") ? `+${d}` : `+55${d}`) });
  } catch { /* sem pixel */ }
}
