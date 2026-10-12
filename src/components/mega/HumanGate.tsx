import { useEffect, useState, type ReactNode } from "react";

const KEY = "mega-human-ok";

declare global {
  interface Window { ttq?: { track: (event: string, data?: Record<string, unknown>) => void } }
}

function novaPergunta() {
  const a = 2 + Math.floor(Math.random() * 8); // 2 a 9
  const b = 2 + Math.floor(Math.random() * 8);
  return { a, b, resp: a + b };
}

export function HumanGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [pergunta, setPergunta] = useState(novaPergunta);
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState(false);

  useEffect(() => {
    try {
      setOk(localStorage.getItem(KEY) === "1");
    } catch {
      setOk(false);
    }
  }, []);

  if (ok === null) return null;
  if (ok) return <>{children}</>;

  function confirmar() {
    if (parseInt(resposta.trim(), 10) !== pergunta.resp) {
      setErro(true);
      setResposta("");
      setPergunta(novaPergunta());
      return;
    }
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
      <p style={{ fontSize: 15, color: "#b9b9c4", maxWidth: 380, margin: "0 0 22px", lineHeight: 1.5 }}>
        Para liberar as ofertas de até 70% OFF, responda a continha abaixo e confirme que você não é um robô.
      </p>
      <p style={{ fontSize: 24, fontWeight: 800, margin: "0 0 14px", letterSpacing: 1 }}>
        Quanto é {pergunta.a} + {pergunta.b}?
      </p>
      <input
        value={resposta}
        onChange={(e) => { setResposta(e.target.value.replace(/\D/g, "").slice(0, 2)); setErro(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") confirmar(); }}
        inputMode="numeric"
        autoComplete="off"
        placeholder="Sua resposta"
        style={{
          width: 160, textAlign: "center", fontSize: 22, fontWeight: 700,
          padding: "12px 10px", borderRadius: 12, marginBottom: 16,
          border: erro ? "2px solid #ff6b6b" : "2px solid #2a2a33",
          background: "#14141a", color: "#fff", outline: "none",
        }}
      />
      {erro && (
        <p style={{ color: "#ff6b6b", fontSize: 13, margin: "-8px 0 12px" }}>
          Resposta errada — tente de novo.
        </p>
      )}
      <button
        onClick={confirmar}
        disabled={!resposta}
        style={{
          background: "#f5c518", color: "#0b0b0f", border: "none", cursor: resposta ? "pointer" : "not-allowed",
          fontSize: 17, fontWeight: 800, padding: "16px 34px", borderRadius: 12,
          opacity: resposta ? 1 : 0.5,
          boxShadow: "0 8px 24px rgba(245,197,24,.35)",
        }}
      >
        Confirmar e ver as ofertas
      </button>
      <p style={{ fontSize: 12, color: "#6d6d7a", marginTop: 22 }}>
        Compra 100% segura · PIX com desconto
      </p>
    </div>
  );
}
