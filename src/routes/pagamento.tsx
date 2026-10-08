import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import QRCode from "qrcode";
import { CheckCircle2, Copy, ShieldCheck, Clock, Truck, LockKeyhole } from "lucide-react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { CustomerReviews } from "@/components/mega/CustomerReviews";
import { FeedbackVideos } from "@/components/mega/ReferenceContent";
import { Button } from "@/components/ui/button";
import { products, money, trackingCode, type CartItem } from "@/lib/mega-store";
import { checkMegaPix } from "@/lib/mega-pix.functions";

export const Route = createFileRoute("/pagamento")({
  head: () => ({ meta: [{ title: "Pague com PIX — Mega Capacetes" }, { name: "description", content: "Escaneie o QR Code PIX para concluir seu pedido na Mega Capacetes." }, { property: "og:title", content: "Pague com PIX — Mega Capacetes" }, { property: "og:description", content: "QR Code PIX, resumo do pedido e 14 dias de garantia." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: () => <StoreLayout><PaymentPage /></StoreLayout>,
});

export type MegaOrder = { txid: string; copyPaste: string; amountCents: number; items: CartItem[]; customerName: string; address: string; createdAt: number };

function PaymentPage() {
  const [order, setOrder] = useState<MegaOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [left, setLeft] = useState(15 * 60);
  const check = useServerFn(checkMegaPix);

  useEffect(() => {
    try { const o = JSON.parse(localStorage.getItem("mega-order") ?? "null") as MegaOrder | null; if (o?.txid && o.copyPaste) setOrder(o); } catch { /* sem pedido */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (order) QRCode.toDataURL(order.copyPaste, { width: 280, margin: 1 }).then(setQr); }, [order]);
  useEffect(() => {
    if (!order) return;
    const tick = setInterval(() => setLeft(Math.max(0, 15 * 60 - Math.floor((Date.now() - order.createdAt) / 1000))), 1000);
    const poll = setInterval(async () => { try { const r = await check({ data: { txid: order.txid } }); if (r.status === "PAID") { setPaid(true); localStorage.removeItem("mega-cart"); } } catch { /* tenta de novo */ } }, 5000);
    return () => { clearInterval(tick); clearInterval(poll); };
  }, [order, check]);

  if (!loaded) return <section className="store-container checkout-page" />;
  if (!order) return <section className="store-container checkout-page"><h1>Nenhum pedido encontrado</h1><Button asChild><Link to="/">Voltar para a loja</Link></Button></section>;

  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return <div className="mega-checkout">
    <div className="checkout-security"><LockKeyhole size={14} /> Ambiente 100% Seguro e Criptografado</div>
    <section className="store-container checkout-grid">
      <div className="checkout-sections">
        <section className="checkout-panel pix-pay-panel">
          {paid ? <div className="pix-paid"><CheckCircle2 size={56} /><h1>Pagamento confirmado!</h1><p>Obrigado, {order.customerName.split(" ")[0]}! Seu pedido já está sendo separado para envio.</p><p>Seu código de rastreio: <strong>{trackingCode(order.txid)}</strong></p><Link to="/acompanhar-pedido" search={{ codigo: trackingCode(order.txid) }}>Acompanhar meu pedido</Link></div> : <>
            <h2><span>✓</span> Pedido realizado! Agora é só pagar</h2>
            <div className="pix-pay-body">
              <p className="pix-timer"><Clock size={16} /> O PIX expira em <strong>{mm}:{ss}</strong></p>
              {qr ? <img className="pix-qr" src={qr} alt="QR Code PIX" /> : <div className="pix-qr" />}
              <p className="pix-amount">{money(order.amountCents)}</p>
              <label className="pix-copy-label">PIX copia e cola<input readOnly value={order.copyPaste} onFocus={e => e.currentTarget.select()} /></label>
              <Button className="product-buy-now" onClick={async () => { await navigator.clipboard.writeText(order.copyPaste); setCopied(true); setTimeout(() => setCopied(false), 2500); }}><Copy /> {copied ? "Código copiado!" : "Copiar código PIX"}</Button>
              <ol className="pix-steps"><li>Abra o app do seu banco e escolha pagar com PIX.</li><li>Escaneie o QR Code ou cole o código copiado.</li><li>Confirme o pagamento — a confirmação aparece aqui na hora.</li></ol>
              <p className="pix-waiting">Aguardando pagamento…</p>
            </div></>}
        </section>
        <section className="checkout-panel guarantee-panel"><ShieldCheck size={44} /><div><h2>Garantia de 14 dias</h2><p>Se o capacete não servir ou você não gostar, tem 14 dias após o recebimento para devolver e receber seu dinheiro de volta.</p></div></section>
      </div>
      <aside className="checkout-panel checkout-order"><h2>Seu Pedido</h2><div className="checkout-order-body">
        <p className="pix-order-id">Pedido nº {order.txid.slice(-8).toUpperCase()}</p>
        <div className="checkout-list">{order.items.map(item => { const p = products.find(x => x.slug === item.slug); if (!p) return null; return <div className="checkout-item" key={`${item.slug}-${item.size}`}><img src={p.image} alt={p.name} /><div><h3>{p.name}</h3><p>Tamanho: {item.size} · Qtd: {item.quantity}</p></div><strong>{money(p.pixCents * item.quantity)}</strong></div>; })}</div>
        <div className="checkout-breakdown"><div className="checkout-saving"><span><Truck size={14} /> Frete</span><strong>Grátis</strong></div>{order.address && <div><span>Entrega</span><span className="pix-address">{order.address}</span></div>}</div>
        <div className="checkout-total"><span>Total PIX</span><strong>{money(order.amountCents)}</strong></div>
      </div></aside>
    </section>
    <CustomerReviews />
    <section className="store-container store-feedback-section"><span className="section-eyebrow">📦 CHEGOU CERTINHO!</span><h2>Clientes que receberam e aprovaram</h2><div className="feedback-grid"><FeedbackVideos /></div></section>
  </div>;
}
