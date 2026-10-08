import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, CheckCircle2, Circle, Copy, Mail } from "lucide-react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { Button } from "@/components/ui/button";
import { findMegaTracking } from "@/lib/mega-pix.functions";
import { trackingSteps, reachedSteps, MEGA_STORE_EMAIL } from "@/lib/mega-store";

export const Route = createFileRoute("/acompanhar-pedido")({
  validateSearch: (s: Record<string, unknown>): { codigo?: string } => (typeof s["codigo"] === "string" ? { codigo: s["codigo"] } : {}),
  head: () => ({ meta: [{ title: "Acompanhar pedido — Mega Capacetes" }, { name: "description", content: "Acompanhe a entrega do seu capacete Mega Capacetes." }, { property: "og:title", content: "Acompanhar pedido — Mega Capacetes" }, { property: "og:description", content: "Consulte o rastreamento do seu pedido." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: TrackingPage,
});

type Found = { code: string; paidAt: number; name: string };

function TrackingPage() {
  const { codigo } = Route.useSearch();
  const find = useServerFn(findMegaTracking);
  const [code, setCode] = useState(codigo ?? "");
  const [message, setMessage] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [copied, setCopied] = useState(false);
  const search = async (c: string) => {
    setMessage(""); setFound(null);
    try { const r = await find({ data: { code: c } }); if (r.found) setFound({ code: r.code, paidAt: r.paidAt, name: r.name }); else setMessage("Pedido não encontrado. Confira o código."); }
    catch { setMessage("Código inválido. Ele começa com MC."); }
  };
  useEffect(() => { if (codigo) void search(codigo); }, [codigo]);
  const reached = found ? reachedSteps(found.paidAt, Date.now()) : 0;
  const copy = async () => { if (!found) return; try { await navigator.clipboard.writeText(found.code); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* navegador sem permissão de copiar */ } };
  return <StoreLayout><section className="store-container checkout-page"><span className="section-eyebrow">PÓS-VENDA</span><h1>Acompanhar pedido</h1><p>Informe o código de rastreio que apareceu após o pagamento.</p>
    <form className="tracking-form" onSubmit={e => { e.preventDefault(); void search(code); }}><label className="field-label" htmlFor="tracking-code">Código de rastreio</label><input id="tracking-code" value={code} onChange={e => setCode(e.target.value)} placeholder="Ex.: MC1A2B3C4D5E" required maxLength={20} /><Button type="submit"><Search /> Rastrear</Button>{message && <p role="status">{message}</p>}</form>
    {found && <>
      <section className="tracking-code" aria-live="polite">
        <div><span>Código de rastreio</span><strong>{found.code}</strong>{found.name && <p>Pedido de {found.name.split(" ")[0]}</p>}</div>
        <Button variant="ghost" size="sm" onClick={() => void copy()}><Copy /> {copied ? "Copiado!" : "Copiar"}</Button>
      </section>
      <ol className="tracking-steps">{trackingSteps.map((s, i) => { const done = i < reached; const date = new Date(found.paidAt + s.day * 86_400_000).toLocaleDateString("pt-BR"); return <li key={s.title} className={done ? "done" : "next"}>{done ? <CheckCircle2 size={20} /> : <Circle size={20} />}<div><strong>{s.title}</strong> · {done ? date : `previsto ${date}`}<p>{s.text}</p></div></li>; })}</ol>
    </>}
    <p className="tracking-help"><Mail size={14} /> Precisa de ajuda? Fale com a gente: <a href={`mailto:${MEGA_STORE_EMAIL}`}>{MEGA_STORE_EMAIL}</a> — <Link to="/politica-de-trocas">trocas e devoluções</Link></p>
  </section></StoreLayout>;
}
