import { useEffect, useState, type ReactNode } from "react";

const KEY = "mega-human-ok";

declare global {
  interface Window { ttq?: { track: (event: string, data?: Record<string, unknown>) => void } }
}

export function HumanGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setOk(localStorage.getItem(KEY) === "1");
    } catch {
      setOk(false);
    }
  }, []);

  if (ok === null) return null;
  if (ok) return <>{children}</>;

  function confirm() {
    try { localStorage.setItem(KEY, "1"); } catch { /* sem storage, segue assim mesmo */ }
    try { window.ttq?.track("ViewContent", { content_name: "Verificacao humana" }); } catch { /* pixel opcional */ }
    setOk(true);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0b0b0f", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center", fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <img src="/img/mega-capacetes-logo.webp" alt="Mega Capacetes" style={{ width: 88, height: 88, borderRadius: 16, marginBottom: 20 }} />
      <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#f5c518", fontWeight: 700 }}>
        Mega Capacetes
      </span>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "14px 0 8px", maxWidth: 420 }}>
        Confirmação rápida
      </h1>
      <p style={{ fontSize: 15, color: "#b9b9c4", maxWidth: 380, margin: "0 0 26px", lineHeight: 1.5 }}>
        Para liberar as ofertas de até 70% OFF, confirme que você não é um robô.
      </p>
      <button
        onClick={confirm}
        style={{
          background: "#f5c518", color: "#0b0b0f", border: "none", cursor: "pointer",
          fontSize: 17, fontWeight: 800, padding: "16px 34px", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(245,197,24,.35)",
        }}
      >
        Sou humano — quero ver as ofertas
      </button>
      <p style={{ fontSize: 12, color: "#6d6d7a", marginTop: 22 }}>
        Compra 100% segura · PIX com desconto
      </p>
    </div>
  );
}
