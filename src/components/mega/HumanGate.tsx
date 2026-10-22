import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PromotionExperience } from "./PromotionExperience";
import { STORE_ACCESS_KEY } from "@/lib/promotion";

const KEY = STORE_ACCESS_KEY;
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
  return <PromotionExperience returnTo={returnTo} />;
}
