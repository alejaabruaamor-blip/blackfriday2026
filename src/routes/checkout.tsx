import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ShieldCheck, LockKeyhole, Truck, QrCode, CreditCard, Check, Loader2 } from "lucide-react";
import { StoreLayout, useStoreCart } from "@/components/mega/StoreLayout";
import { Button } from "@/components/ui/button";
import { products, cartTotal, money } from "@/lib/mega-store";
import { createMegaPix } from "@/lib/mega-pix.functions";
import { ttTrack, ttIdentify } from "@/lib/tiktok";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Pagamento — Mega Capacetes" }, { name: "description", content: "Confira sua sacola e finalize seu pedido na Mega Capacetes." }, { property: "og:title", content: "Pagamento — Mega Capacetes" }, { property: "og:description", content: "Resumo do pedido com desconto de 10% no PIX." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});
function CheckoutPage() { return <StoreLayout><CheckoutDetails /></StoreLayout>; }

const FIELDS = ["name", "email", "phone", "cpf", "cep", "number", "street", "district", "complement", "city", "state"] as const;
type Form = Record<(typeof FIELDS)[number], string>;

const UTM_KEYS = ["utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"] as const;
function getUtms() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k) || localStorage.getItem(`mega-${k}`) || localStorage.getItem(k) || "";
    if (v) { localStorage.setItem(`mega-${k}`, v); utm[k.replace("utm_", "")] = v; }
  }
  return utm;
}

function CheckoutDetails() {
  const { items, open } = useStoreCart();
  const navigate = useNavigate();
  const createPix = useServerFn(createMegaPix);
  const [form, setForm] = useState<Form>(() => Object.fromEntries(FIELDS.map(f => [f, ""])) as Form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = cartTotal(items);
  const subtotal = items.reduce((sum, item) => sum + (products.find(p => p.slug === item.slug)?.priceCents ?? 0) * item.quantity, 0);
  useEffect(() => { if (items.length) ttTrack("InitiateCheckout", total, items.map(i => i.slug).join(","), undefined, items.reduce((n, i) => n + i.quantity, 0)); }, []);
  const field = (k: keyof Form) => ({ name: k, "data-field": k, value: form[k], onInput: (e: React.FormEvent<HTMLInputElement>) => { const v = e.currentTarget.value; setForm(f => ({ ...f, [k]: v })); }, onBlur: (e: React.FocusEvent<HTMLInputElement>) => { const v = e.currentTarget.value; setForm(f => (f[k] === v ? f : { ...f, [k]: v })); }, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value })) });

  async function confirm() {
    setError("");
    // Lê o que está escrito na tela (inclui preenchimento automático do celular)
    const live = { ...form } as Form;
    for (const k of FIELDS) { const el = document.querySelector<HTMLInputElement>(`[data-field="${k}"]`); if (el) live[k] = el.value.trim(); }
    setForm(live);
    const form2 = live;
    const digits = (v: string) => v.replace(/\D/g, "");
    if (form2.name.trim().length < 3) return setError("Informe seu nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(form2.email.replace(/\s/g, ""))) return setError("Informe um e-mail válido.");
    if (digits(form2.phone).length < 10) return setError("Informe um telefone com DDD.");
    if (digits(form2.cpf).length !== 11) return setError("Informe um CPF válido.");
    if (digits(form2.cep).length !== 8) return setError("Informe um CEP válido (8 números).");
    if (!form2.number) return setError("Informe o número da casa.");
    if (!form2.street) return setError("Informe a rua.");
    if (!form2.city) return setError("Informe a cidade.");
    if (form2.state.replace(/[^a-zA-Z]/g, "").length < 2) return setError("Informe o estado (UF), ex: SP.");
    const address = `${form2.street}, ${form2.number}${form2.complement ? ` - ${form2.complement}` : ""}${form2.district ? `, ${form2.district}` : ""} — ${form2.city}/${form2.state.toUpperCase()} — CEP ${form2.cep}`;
    setBusy(true);
    try {
      await ttIdentify(form2.email, form2.phone);
      ttTrack("AddPaymentInfo", total, items.map(i => i.slug).join(","));
      const r = await createPix({ data: { items, customer: { name: form2.name, email: form2.email.replace(/\s/g, ""), phone: form2.phone, cpf: form2.cpf }, address, utm: getUtms() } });
      localStorage.setItem("mega-order", JSON.stringify({ txid: r.txid, copyPaste: r.copyPaste, amountCents: r.amountCents, items, customerName: form2.name, address, createdAt: Date.now() }));
      await navigate({ to: "/pagamento" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o PIX.");
      setBusy(false);
    }
  }

  if (!items.length) return <section className="store-container checkout-page"><h1>Resumo do pedido</h1><p>Sua sacola está vazia.</p><Button asChild><Link to="/">Escolher capacete <ArrowLeft /></Link></Button></section>;
  return <div className="mega-checkout"><div className="checkout-security"><LockKeyhole size={14} /> Ambiente 100% Seguro e Criptografado</div><section className="store-container checkout-grid" aria-label="Finalizar pedido"><div className="checkout-sections">
    <section className="checkout-panel"><h2><span>1</span> Seus Dados</h2><div className="checkout-fields"><label className="checkout-wide">Nome completo *<input autoComplete="name" placeholder="Seu nome completo" {...field("name")} /></label><label>E-mail *<input type="email" autoComplete="email" placeholder="seu@email.com" {...field("email")} /></label><label>Telefone / WhatsApp *<input type="tel" autoComplete="tel" placeholder="(11) 99999-9999" {...field("phone")} /></label><label className="checkout-wide">CPF *<input inputMode="numeric" placeholder="000.000.000-00" maxLength={14} {...field("cpf")} /></label></div></section>
    <section className="checkout-panel"><h2><span>2</span> Endereço de Entrega</h2><div className="checkout-fields"><label>CEP *<input autoComplete="postal-code" placeholder="00000-000" {...field("cep")} /></label><label>Número *<input placeholder="Ex: 123" {...field("number")} /></label><label className="checkout-wide">Rua / Logradouro *<input autoComplete="address-line1" placeholder="Sua rua" {...field("street")} /></label><label>Bairro<input placeholder="Seu bairro" {...field("district")} /></label><label>Complemento<input autoComplete="address-line2" placeholder="Apto, Bloco..." {...field("complement")} /></label><label>Cidade *<input autoComplete="address-level2" placeholder="Sua cidade" {...field("city")} /></label><label>Estado *<input autoComplete="address-level1" placeholder="UF" maxLength={2} {...field("state")} /></label></div></section>
    <section className="checkout-panel"><h2><span>3</span> Forma de Pagamento</h2><div className="checkout-methods"><Button variant="outline" className="checkout-pix-option" aria-pressed="true"><QrCode /><span><strong>Pix <em>10% OFF</em></strong><small>Aprovação na hora</small></span><Check /></Button><Button variant="outline" className="checkout-card-option" disabled><CreditCard /><span><strong>Cartão de Crédito</strong><small>Indisponível nesta loja</small></span></Button></div></section>
    <div className="checkout-trust"><span><ShieldCheck /> Compra Segura</span><span><LockKeyhole /> Dados Protegidos</span><span><Truck /> Frete Grátis</span></div>
  </div><aside className="checkout-panel checkout-order"><h2>Resumo da Compra</h2><div className="checkout-order-body"><div className="checkout-list">{items.map(item => { const product = products.find(p => p.slug === item.slug); if (!product) return null; return <div className="checkout-item" key={`${item.slug}-${item.size}`}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>Tamanho: {item.size} · Qtd: {item.quantity}</p></div><strong>{money(product.pixCents * item.quantity)}</strong></div>; })}</div><div className="checkout-breakdown"><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="checkout-saving"><span><Truck size={14} /> Frete</span><strong>Grátis</strong></div><div className="checkout-saving"><span>Desconto Pix (10%)</span><strong>- {money(subtotal - total)}</strong></div></div><div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div><Button className="checkout-confirm" disabled={busy} onClick={confirm}>{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />} {busy ? "Gerando PIX..." : "Confirmar Pagamento"}</Button>{error && <p className="checkout-error" role="alert">{error}</p>}<Button variant="ghost" className="w-full" onClick={open}>Editar sacola</Button><div className="checkout-trust"><span><ShieldCheck /> Seus dados estão protegidos com SSL</span></div></div></aside></section></div>;
}
