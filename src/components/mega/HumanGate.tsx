import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeStoreReturn } from "@/lib/human-challenge";

const KEY = "mega-human-verified-v2";
const FIX_CSS = "html,body{max-width:100%;overflow-x:hidden}.mega-store{overflow-x:hidden}.footer-links{flex-wrap:wrap;gap:10px 16px;justify-content:center}.footer-links>*{white-space:normal}";
const DB_URL = "https://tavvstmzvlsepyavfoik.supabase.co";
const DB_KEY = "sb_publishable_eDX3ju6kRhVod7Erm4OLpA_qkvbbOxD";

declare global {
  interface Window { ttq?: { track: (event: string, data?: Record<string, unknown>) => void } }
}

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
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    trackVisit();
    let verified = false;
    try { verified = sessionStorage.getItem(KEY) === "1"; } catch { /* verificação necessária */ }
    if (verified) { setOk(true); return; }
    void navigate({ to: "/verificacao", search: { returnTo: window.location.pathname + window.location.search + window.location.hash }, replace: true });
  }, [navigate]);
  return ok ? <><style>{FIX_CSS}</style>{children}</> : null;
}

export function HumanVerification({ returnTo }: { returnTo: string }) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checked) {
      setError("Marque a caixinha para confirmar que você é humano.");
      return;
    }
    try { sessionStorage.setItem(KEY, "1"); } catch { /* segue sem salvar */ }
    window.location.replace(safeStoreReturn(returnTo));
  }

  return <>
    <style>{`${FIX_CSS}
      .mg-gate{--mg-bg:#f5f5f5;--mg-fg:#1a1a1a;--mg-muted:#666;--mg-accent:#2563eb;--mg-border:#d4d4d4;--mg-surface:#fff;--mg-error:#dc2626;min-height:100dvh;background:var(--mg-bg);color:var(--mg-fg);display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto;text-align:center;font-family:system-ui,sans-serif}
      .mg-content{width:100%;max-width:360px;margin:auto;display:flex;flex-direction:column;align-items:center;background:var(--mg-surface);border:1px solid var(--mg-border);border-radius:12px;padding:32px 24px}
      .mg-shield{width:32px;height:32px;color:var(--mg-accent)}
      .mg-gate h1{font-size:20px;font-weight:700;margin:14px 0 6px;line-height:1.2}
      .mg-gate p{font-size:14px;color:var(--mg-muted);line-height:1.5;margin:0 0 18px}
      .mg-form{width:100%}
      .mg-check{display:flex;align-items:center;gap:12px;border:1px solid var(--mg-border);border-radius:8px;padding:14px;margin-bottom:12px;cursor:pointer;text-align:left;user-select:none}
      .mg-check input{width:22px;height:22px;accent-color:var(--mg-accent);cursor:pointer;flex-shrink:0}
      .mg-check span{font-size:15px;font-weight:600}
      .mg-enter{width:100%;height:48px;background:var(--mg-accent);color:#fff;font-size:15px;font-weight:700;border-radius:8px}
      .mg-enter:hover{background:var(--mg-accent);color:#fff;filter:brightness(.94)}
      .mg-gate .mg-error{color:var(--mg-error);font-size:13px;margin-bottom:12px}
    `}</style>
    <div className="mg-gate"><div className="mg-content">
      <ShieldCheck className="mg-shield" aria-hidden="true" />
      <h1>Verificação de segurança</h1>
      <p>Confirme que você é humano para continuar.</p>
      <form onSubmit={entrar} className="mg-form">
        <label className="mg-check" htmlFor="mg-human">
          <input id="mg-human" type="checkbox" checked={checked} onChange={event => { setChecked(event.target.checked); setError(""); }} aria-describedby={error ? "mg-error" : undefined} aria-invalid={Boolean(error)} />
          <span>Não sou um robô</span>
        </label>
        {error && <p id="mg-error" role="alert" className="mg-error">{error}</p>}
        <Button type="submit" className="mg-enter">Confirmar</Button>
      </form>
    </div></div>
  </>;
}
