import { useEffect, useState, type ReactNode } from "react";

const KEY = "mega-human-ok";
// Celular: nada passa da largura da tela (o rodapé empurrava a página para o lado)
const FIX_CSS = "html,body{max-width:100%;overflow-x:hidden}.mega-store{overflow-x:hidden}.footer-links{flex-wrap:wrap;gap:10px 16px;justify-content:center}.footer-links>*{white-space:normal}";
const DB_URL = "https://tavvstmzvlsepyavfoik.supabase.co";
const DB_KEY = "sb_publishable_eDX3ju6kRhVod7Erm4OLpA_qkvbbOxD";

declare global {
  interface Window { ttq?: { track: (event: string, data?: Record<string, unknown>) => void } }
}

// Contador de visitas do painel: anota em qual etapa cada visitante está.
function trackVisit() {
  try {
    let sid = localStorage.getItem("mega-sid");
    if (!sid) { sid = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem("mega-sid", sid); }
    const path = window.location.pathname;
    const step = path.startsWith("/pagamento") ? "pix" : path.startsWith("/checkout") ? "checkout" : "loja";
    const camp = new URLSearchParams(window.location.search).get("utm_campaign") || localStorage.getItem("mega-utm_campaign") || null;
    fetch(`${DB_URL}/rest/v1/rpc/track_visit`, {
      method: "POST", keepalive: true,
      headers: { "content-type": "application/json", apikey: DB_KEY },
      body: JSON.stringify({ _sid: sid, _step: step, _camp: camp }),
    }).catch(() => {});
  } catch { /* contador é opcional */ }
}

export function HumanGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    trackVisit();
    try { setOk(localStorage.getItem(KEY) === "1"); } catch { setOk(true); }
  }, []);

  if (ok === null) return null;
  if (ok) return <><style>{FIX_CSS}</style>{children}</>;

  function entrar() {
    setSaindo(true);
    try { localStorage.setItem(KEY, "1"); } catch { /* segue */ }
    setTimeout(() => setOk(true), 250);
  }

  return (
    <>
      <style>{`@keyframes mgPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}@keyframes mgIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "radial-gradient(circle at 50% 20%, #23232c 0%, #0b0b0f 70%)", color: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24, textAlign: "center", fontFamily: "Inter, system-ui, sans-serif",
        opacity: saindo ? 0 : 1, transition: "opacity .25s",
      }}>
        <div style={{ animation: "mgIn .4s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/img/mega-capacetes-logo.webp" alt="Mega Capacetes" style={{ width: 84, height: 84, borderRadius: 18, marginBottom: 18 }} />
          <span style={{ background: "#e11d2a", color: "#fff", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 999, letterSpacing: 1 }}>
            🔥 PROMOÇÃO ATIVA HOJE
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "16px 0 8px", maxWidth: 420, lineHeight: 1.15 }}>
            Capacetes NoRisk e LS2 com até <span style={{ color: "#f5c518" }}>70% OFF</span>
          </h1>
          <p style={{ fontSize: 15, color: "#b9b9c4", maxWidth: 360, margin: "0 0 26px", lineHeight: 1.5 }}>
            Frete grátis para todo o Brasil e +10% de desconto no PIX.
          </p>
          <button
            onClick={entrar}
            style={{
              background: "#f5c518", color: "#0b0b0f", border: "none", cursor: "pointer",
              fontSize: 18, fontWeight: 900, padding: "18px 36px", borderRadius: 14, width: "100%", maxWidth: 340,
              boxShadow: "0 10px 28px rgba(245,197,24,.4)", animation: "mgPulse 1.6s ease-in-out infinite",
            }}
          >
            VER AS OFERTAS →
          </button>
          <p style={{ fontSize: 12, color: "#8a8a96", marginTop: 18 }}>
            🔒 Compra 100% segura · Frete grátis · PIX com desconto
          </p>
        </div>
      </div>
    </>
  );
}
