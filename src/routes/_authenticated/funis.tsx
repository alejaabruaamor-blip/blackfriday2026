import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { FUNNEL_STEPS, sendFunnelToUtmify } from "@/lib/funnels.functions";

export const Route = createFileRoute("/_authenticated/funis")({
  head: () => ({
    meta: [
      { title: "Meus funis | Painel RecargaJogo" },
      {
        name: "description",
        content: "Etapas do funil RecargaJogo e envio das vendas para a UTMify.",
      },
      { property: "og:title", content: "Meus funis | Painel RecargaJogo" },
      {
        property: "og:description",
        content: "Etapas do funil RecargaJogo e envio das vendas para a UTMify.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FunisPage,
});

function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FunisPage() {
  const send = useServerFn(sendFunnelToUtmify);

  const [stepSlug, setStepSlug] = useState("checkout");
  const [amount, setAmount] = useState("14,90");
  const [quantity, setQuantity] = useState("1");
  const [email, setEmail] = useState("mentoria@gmail.com");
  const [name, setName] = useState("Comprador");
  const [utmSource, setUtmSource] = useState("organic");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [approved, setApproved] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function parseAmount(value: string): number {
    const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }

  async function handleSend(slug?: string, presetCents?: number) {
    const chosen = slug ?? stepSlug;
    const cents = presetCents ?? parseAmount(amount);
    setBusy(true);
    setMessage(null);
    try {
      const result = await send({
        data: {
          stepSlug: chosen,
          amountCents: cents,
          quantity: Math.max(1, Number.parseInt(quantity, 10) || 1),
          email,
          name,
          approved,
          utmSource,
          utmCampaign,
        },
      });
      if (result.error) setMessage(result.error);
      else
        setMessage(
          `Enviado: ${result.sent} venda(s)${result.failed ? `, ${result.failed} com erro` : ""} de ${brl(cents)}.`,
        );
    } catch {
      setMessage("Não consegui enviar agora. Tente de novo.");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Meus funis</h1>
            <p className="text-sm text-muted-foreground">Etapas do funil e envio para a UTMify</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">Voltar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold text-foreground">Enviar venda para a UTMify</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm text-muted-foreground">
              Etapa
              <select
                value={stepSlug}
                onChange={(e) => setStepSlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                {FUNNEL_STEPS.map((step) => (
                  <option key={step.slug} value={step.slug}>
                    {step.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">
              Valor
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              Quantidade
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              E-mail do comprador
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              Nome do comprador
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              Origem (utm_source)
              <input
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              Campanha (utm_campaign)
              <input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="flex items-center gap-2 self-end text-sm text-foreground">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="h-4 w-4"
              />
              Enviar também como aprovado
            </label>
            <div className="self-end">
              <Button onClick={() => handleSend()} disabled={busy} className="w-full">
                {busy ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-base font-semibold text-foreground">
            Etapas do funil
          </h2>
          <ul className="divide-y divide-border">
            {FUNNEL_STEPS.map((step, index) => (
              <li key={step.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {index + 1}. {step.name}
                  </p>
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs text-muted-foreground underline"
                  >
                    {step.url}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">
                    {step.amountCents > 0 ? brl(step.amountCents) : "sem cobrança"}
                  </span>
                  {step.amountCents > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => handleSend(step.slug, step.amountCents)}
                    >
                      Enviar para UTMify
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
