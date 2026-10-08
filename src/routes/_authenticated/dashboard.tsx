import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncFacebookSpend } from "@/lib/ads.functions";
import { saveManualSpend, setCampaignActive } from "@/lib/campaigns.functions";
import { Button } from "@/components/ui/button";
import { GatewaySwitch } from "@/components/GatewaySwitch";
import { ReceiptsPanel } from "@/components/ReceiptsPanel";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel de Vendas — Resultados por campanha" },
      {
        name: "description",
        content: "Custo por venda, lucro, vendas por etapa do funil e pagamentos em tempo real.",
      },
      { property: "og:title", content: "Painel de Vendas — Resultados por campanha" },
      {
        property: "og:description",
        content: "Custo por venda, lucro, vendas por etapa do funil e pagamentos em tempo real.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const PAID = ["paid", "approved", "completed", "confirmed", "pago", "success"];
const STAGE_LABEL: Record<string, string> = {
  checkout: "Checkout (pedido principal)",
  up1: "Oferta 1",
  up2: "Oferta 2 — skins",
  up3: "Oferta 3 — itens",
  iof: "Oferta 1",
  upsell: "Oferta (upsell)",
};

const RANGES = [
  { key: "today", label: "Hoje", days: 0 },
  { key: "7d", label: "7 dias", days: 6 },
  { key: "30d", label: "30 dias", days: 29 },
  { key: "all", label: "Tudo", days: 3650 },
] as const;

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function startOf(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function isPaid(status: string | null) {
  return status != null && PAID.includes(status.toLowerCase());
}

function Card({
  title,
  value,
  hint,
  accent,
}: {
  title: string;
  value: string;
  hint?: string;
  accent?: "green" | "red";
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-1 text-xs text-zinc-500">{title}</p>
      <h3
        className={`text-xl font-bold ${
          accent === "green" ? "text-emerald-500" : accent === "red" ? "text-red-500" : "text-zinc-50"
        }`}
      >
        {value}
      </h3>
      {hint && <span className="text-[10px] text-zinc-500">{hint}</span>}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const runSync = useServerFn(syncFacebookSpend);
  const toggleCampaign = useServerFn(setCampaignActive);
  const saveSpend = useServerFn(saveManualSpend);
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("7d");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busyCampaign, setBusyCampaign] = useState<string | null>(null);
  const [spendInput, setSpendInput] = useState<Record<string, string>>({});


  const range = RANGES.find((item) => item.key === rangeKey)!;
  const since = useMemo(() => startOf(range.days), [range.days]);

  const salesQuery = useQuery({
    queryKey: ["sales", rangeKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 20000,
  });

  const spendQuery = useQuery({
    queryKey: ["ad_spend", rangeKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_spend")
        .select("*")
        .gte("spend_date", since.toISOString().slice(0, 10));
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  const pixelQuery = useQuery({
    queryKey: ["pixel_7d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("status,created_at")
        .gte("created_at", startOf(6).toISOString())
        .limit(5000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  const liveQuery = useQuery({
    queryKey: ["live_presence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_presence")
        .select("step")
        .gte("last_seen", new Date(Date.now() - 60000).toISOString())
        .limit(5000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });
  const liveSteps = [
    ["recarga", "Recarga"],
    ["quiz", "Quiz"],
    ["roleta", "Roleta"],
    ["loja", "Loja"],
    ["checkout", "Checkout"],
    ["pix", "PIX"],
    ["up1", "Oferta 1"],
    ["up2", "Oferta 2"],
    ["up3", "Oferta 3"],
  ] as const;
  const liveRows = liveQuery.data ?? [];

  const [dropDays, setDropDays] = useState(1);
  const dropQuery = useQuery({
    queryKey: ["drop_presence", dropDays],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_presence")
        .select("step,first_seen,last_seen")
        .gte("last_seen", new Date(Date.now() - dropDays * 86400000).toISOString())
        .limit(20000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
  const dropRows = dropQuery.data ?? [];
  const stepOrder = liveSteps.map(([s]) => s as string);
  const inactiveCut = Date.now() - 120000;
  const dropStats = liveSteps.map(([slug, label], i) => {
    const reached = dropRows.filter((r) => stepOrder.indexOf(r.step) >= i).length;
    const left = dropRows.filter(
      (r) => r.step === slug && new Date(r.last_seen).getTime() < inactiveCut,
    ).length;
    const durations = dropRows
      .filter((r) => r.step === slug)
      .map((r) => (new Date(r.last_seen).getTime() - new Date(r.first_seen).getTime()) / 1000)
      .filter((d) => d >= 0 && d <= 3600);
    const avgSec = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    return { slug, label, reached, left, pct: reached ? (left / reached) * 100 : 0, avgSec };
  });
  const worstDrop = dropStats
    .filter((s) => s.slug !== "up3" && s.reached >= 5)
    .sort((a, b) => b.pct - a.pct)[0];
  const fmtDuration = (sec: number) => {
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s ? `${m}min ${s}s` : `${m}min`;
  };

  const settingsQuery = useQuery({
    queryKey: ["campaign_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaign_settings").select("*");
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  const sales = salesQuery.data ?? [];
  const spend = spendQuery.data ?? [];
  const settings = settingsQuery.data ?? [];
  const activeMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const row of settings) map.set(row.campaign_name, row.is_active);
    return map;
  }, [settings]);



  const paidSales = sales.filter((sale) => isPaid(sale.status));
  const revenue = paidSales.reduce((sum, sale) => sum + (sale.amount_cents ?? 0), 0);
  const totalSpend = spend.reduce((sum, row) => sum + (row.spend_cents ?? 0), 0);
  const cpa = paidSales.length > 0 ? Math.round(totalSpend / paidSales.length) : 0;
  const profit = revenue - totalSpend;
  const conversion = sales.length > 0 ? (paidSales.length / sales.length) * 100 : 0;

  const byCampaign = useMemo(() => {
    const map = new Map<
      string,
      { campaign: string; generated: number; paid: number; revenue: number; spend: number }
    >();
    const get = (name: string) => {
      const key = name || "(sem campanha)";
      if (!map.has(key)) {
        map.set(key, { campaign: key, generated: 0, paid: 0, revenue: 0, spend: 0 });
      }
      return map.get(key)!;
    };
    for (const sale of sales) {
      const entry = get(sale.utm_campaign ?? sale.utm_source ?? "");
      entry.generated += 1;
      if (isPaid(sale.status)) {
        entry.paid += 1;
        entry.revenue += sale.amount_cents ?? 0;
      }
    }
    for (const row of spend) {
      get(row.campaign_name).spend += row.spend_cents ?? 0;
    }
    return [...map.values()]
      .filter((row) => row.paid > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, spend]);

  const byStage = useMemo(() => {
    const map = new Map<string, { stage: string; generated: number; paid: number; revenue: number }>();
    for (const sale of sales) {
      const stage = sale.stage ?? "checkout";
      if (!map.has(stage)) map.set(stage, { stage, generated: 0, paid: 0, revenue: 0 });
      const entry = map.get(stage)!;
      entry.generated += 1;
      if (isPaid(sale.status)) {
        entry.paid += 1;
        entry.revenue += sale.amount_cents ?? 0;
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const losing = useMemo(
    () => byCampaign.filter((row) => row.spend > 0 && row.revenue - row.spend < 0),
    [byCampaign],
  );

  const pixel = useMemo(() => {
    const rows = pixelQuery.data ?? [];
    const purchases = rows.filter((row) => isPaid(row.status)).length;
    const dayStart = startOf(0).getTime();
    const today = rows.filter(
      (row) => isPaid(row.status) && new Date(row.created_at as string).getTime() >= dayStart,
    ).length;
    const goal = 50;
    const percent = Math.min(100, Math.round((purchases / goal) * 100));
    const level =
      purchases >= goal
        ? { label: "Pixel aquecido 🔥", color: "text-emerald-400", bar: "bg-emerald-500" }
        : purchases >= 25
          ? { label: "Quase aquecido 🌡️", color: "text-yellow-400", bar: "bg-yellow-500" }
          : purchases >= 10
            ? { label: "Esquentando ♨️", color: "text-orange-400", bar: "bg-orange-500" }
            : { label: "Pixel frio ❄️", color: "text-sky-400", bar: "bg-sky-500" };
    return { purchases, today, goal, percent, level, missing: Math.max(0, goal - purchases) };
  }, [pixelQuery.data]);




  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await runSync({ data: undefined });
      if (result.ok) {
        setSyncMessage(`Gasto atualizado: ${result.rows} registros do Facebook.`);
        await queryClient.invalidateQueries({ queryKey: ["ad_spend"] });
      } else if (result.reason === "missing_credentials") {
        setSyncMessage("Falta ligar a conta de anúncios do Facebook.");
      } else {
        setSyncMessage("Não consegui falar com o Facebook agora. Tente de novo.");
      }
    } catch {
      setSyncMessage("Não consegui atualizar o gasto agora.");
    }
    setSyncing(false);
  }

  async function handleToggle(campaign: string, active: boolean) {
    setBusyCampaign(campaign);
    setSyncMessage(null);
    try {
      const result = await toggleCampaign({ data: { campaign, active } });
      await queryClient.invalidateQueries({ queryKey: ["campaign_settings"] });
      if (result.facebook === "changed") {
        setSyncMessage(
          active
            ? `Campanha "${campaign}" ativada também no Facebook.`
            : `Campanha "${campaign}" pausada também no Facebook.`,
        );
      } else if (result.facebook === "no_credentials") {
        setSyncMessage(
          `Marquei "${campaign}" como ${active ? "ativa" : "pausada"} aqui no painel. Para pausar direto no Facebook, falta ligar a conta de anúncios.`,
        );
      } else if (result.facebook === "not_found") {
        setSyncMessage("Não achei uma campanha com esse nome no Facebook. Marquei só aqui no painel.");
      } else {
        setSyncMessage("O Facebook não aceitou a mudança agora. Marquei só aqui no painel.");
      }
    } catch {
      setSyncMessage("Não consegui mudar essa campanha agora.");
    }
    setBusyCampaign(null);
  }

  async function handleSaveSpend(campaign: string) {
    const value = spendInput[campaign];
    if (!value) return;
    setBusyCampaign(campaign);
    setSyncMessage(null);
    try {
      await saveSpend({
        data: { campaign, date: new Date().toISOString().slice(0, 10), amount: value },
      });
      setSpendInput((prev) => ({ ...prev, [campaign]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["ad_spend"] });
      setSyncMessage(`Gasto de hoje salvo para "${campaign}".`);
    } catch {
      setSyncMessage("Não consegui salvar esse gasto agora.");
    }
    setBusyCampaign(null);
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-xl font-bold italic text-black">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Painel de Vendas</h1>
            <p className="text-xs text-zinc-500">Tempo real • Resultado das campanhas e do funil</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Pixel Ativo</span>
          </div>
          <Button asChild variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-50">
            <Link to="/funis">Meus funis</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-50">
            <Link to="/lucro-prejuizo">Lucro e prejuízo</Link>
          </Button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 disabled:opacity-60"
          >
            {syncing ? "Atualizando..." : "Atualizar gasto do Facebook"}
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="space-y-6">
        <GatewaySwitch />
        <ReceiptsPanel />
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Clientes no funil agora
            </h2>
            <span className="text-2xl font-bold">{liveRows.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {liveSteps.map(([slug, label]) => (
              <div key={slug} className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-center">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-lg font-bold">
                  {liveRows.filter((r) => r.step === slug).length}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Onde as pessoas mais saem</h2>
            <div className="flex gap-2">
              {[
                [1, "Hoje (24h)"],
                [7, "7 dias"],
                [30, "30 dias"],
              ].map(([d, l]) => (
                <button
                  key={d}
                  onClick={() => setDropDays(d as number)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    dropDays === d
                      ? "bg-emerald-500 text-black"
                      : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {worstDrop && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
              Maior saída: <b>{worstDrop.label}</b> — {worstDrop.pct.toFixed(0)}% das pessoas que chegam
              ali vão embora.
            </p>
          )}
          <div className="space-y-3">
            {dropStats.map((s) => (
              <div key={s.slug} className="grid grid-cols-[90px_1fr_auto] items-center gap-3 text-sm">
                <span className="text-xs text-zinc-400">{s.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${s.pct >= 50 ? "bg-red-500/70" : "bg-blue-500/70"}`}
                    style={{ width: `${Math.min(100, s.pct)}%` }}
                  />
                </div>
                <span className="w-44 text-right text-xs text-zinc-300">
                  {s.reached} chegaram · {s.left} saíram ({s.pct.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Conta como "saiu" quem parou na página e ficou mais de 2 minutos sem avançar.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold">
            Tempo médio em cada página
          </h2>
          <div className="space-y-3">
            {dropStats.map((s) => (
              <div key={s.slug} className="grid grid-cols-[90px_1fr_auto] items-center gap-3 text-sm">
                <span className="text-xs text-zinc-400">{s.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500/70 transition-all"
                    style={{
                      width: `${Math.min(100, (s.avgSec / Math.max(1, ...dropStats.map((d) => d.avgSec))) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-28 text-right text-xs font-medium text-zinc-300">
                  {s.reached ? fmtDuration(s.avgSec) : "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Mostra quanto tempo, em média, cada pessoa fica parada em cada etapa (mesmo período
            escolhido acima).
          </p>
        </section>

        {syncMessage && (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
            {syncMessage}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {RANGES.map((item) => (
            <button
              key={item.key}
              onClick={() => setRangeKey(item.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                rangeKey === item.key
                  ? "bg-emerald-500 text-black"
                  : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card title="Faturamento" value={brl(revenue)} hint={`${paidSales.length} vendas pagas`} />
          <Card title="Gasto (Ads)" value={brl(totalSpend)} hint="Facebook" />
          <Card title="CPA médio" value={paidSales.length ? brl(cpa) : "—"} hint="Custo por venda paga" />
          <Card
            title="Lucro Líquido"
            value={brl(profit)}
            hint={profit >= 0 ? "Faturamento menos anúncio" : "No vermelho"}
            accent={profit >= 0 ? "green" : "red"}
          />
          <Card
            title="PIX Gerados"
            value={`${sales.length} / ${paidSales.length}`}
            hint={`Pagos: ${conversion.toFixed(0)}%`}
          />
          <Card title="Conversão" value={`${conversion.toFixed(1)}%`} hint="Gerado x pago" />
        </section>

        <section className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Aquecimento do Pixel</h2>
              <p className="mt-1 text-xs text-zinc-500">Últimos 7 dias</p>
            </div>
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray="364"
                  strokeDashoffset={364 - (364 * pixel.percent) / 100}
                  strokeLinecap="round"
                  className={`${pixel.level.color} transition-all duration-1000`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{pixel.percent}%</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${pixel.level.color}`}>
                  {pixel.percent >= 100 ? "Hot" : pixel.percent >= 50 ? "Warm" : "Cold"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${pixel.level.color}`}>{pixel.level.label}</p>
              <p className="text-xs text-zinc-500">
                <span className="font-bold text-zinc-200">{pixel.purchases}</span> de {pixel.goal} vendas pagas · {pixel.today} hoje
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            {pixel.missing > 0
              ? `Faltam ${pixel.missing} vendas pagas em 7 dias para o pixel sair do aprendizado.`
              : "O pixel já tem vendas suficientes na semana: está otimizando no melhor ponto."}
          </p>
        </section>



        {losing.length > 0 && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <h2 className="text-sm font-bold text-red-400">
              ⚠️ {losing.length === 1 ? "1 campanha no prejuízo" : `${losing.length} campanhas no prejuízo`}
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-200">
              {losing.map((row) => (
                <li key={row.campaign} className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{row.campaign}</span>
                  <span className="text-zinc-400">
                    gastou {brl(row.spend)}, faturou {brl(row.revenue)} — perda de{" "}
                    {brl(row.spend - row.revenue)}
                  </span>
                  <button
                    onClick={() => handleToggle(row.campaign, false)}
                    disabled={busyCampaign === row.campaign}
                    className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    Desativar agora
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <h2 className="border-b border-zinc-800 px-5 py-4 text-sm font-semibold">
            Resultado por campanha
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr className="bg-zinc-800/30">
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Campanha</th>
                  <th className="px-5 py-3">Gerados</th>
                  <th className="px-5 py-3">Pagos</th>
                  <th className="px-5 py-3">Faturou</th>
                  <th className="px-5 py-3">Gastou</th>
                  <th className="px-5 py-3">CPA</th>
                  <th className="px-5 py-3">Lucro</th>
                  <th className="px-5 py-3">Gasto de hoje</th>
                  <th className="px-5 py-3">Campanha ligada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {byCampaign.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-6 text-center text-zinc-500">
                      Nenhuma campanha com venda paga nesse período ainda.
                    </td>
                  </tr>
                )}
                {byCampaign.map((row) => {
                  const rowCpa = row.paid > 0 ? row.spend / row.paid : 0;
                  const rowProfit = row.revenue - row.spend;
                  const active = activeMap.get(row.campaign) ?? true;
                  const busy = busyCampaign === row.campaign;
                  return (
                    <tr key={row.campaign} className="transition-colors hover:bg-zinc-800/20">
                      <td className="px-5 py-3">
                        <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-yellow-500"}`} />
                      </td>
                      <td className="px-5 py-3 text-xs font-medium">{row.campaign}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{row.generated}</td>
                      <td className="px-5 py-3 text-xs">{row.paid}</td>
                      <td className="px-5 py-3 text-xs">{brl(row.revenue)}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{brl(row.spend)}</td>
                      <td className="px-5 py-3 text-xs">{row.paid ? brl(rowCpa) : "—"}</td>
                      <td
                        className={`px-5 py-3 text-xs font-bold ${
                          rowProfit >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {brl(rowProfit)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            value={spendInput[row.campaign] ?? ""}
                            onChange={(event) =>
                              setSpendInput((prev) => ({ ...prev, [row.campaign]: event.target.value }))
                            }
                            placeholder="R$ 0,00"
                            className="w-24 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
                          />
                          <button
                            onClick={() => handleSaveSpend(row.campaign)}
                            disabled={busy}
                            className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-60"
                          >
                            Salvar
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggle(row.campaign, !active)}
                          disabled={busy}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                            active
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {busy ? "..." : active ? "Ativa — desativar" : "Pausada — ativar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>


        <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <h2 className="border-b border-zinc-800 px-5 py-4 text-sm font-semibold">
            Vendas por etapa do funil
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr className="bg-zinc-800/30">
                  <th className="px-5 py-3">Etapa</th>
                  <th className="px-5 py-3">PIX gerados</th>
                  <th className="px-5 py-3">Pagos</th>
                  <th className="px-5 py-3">Faturou</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {byStage.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-zinc-500">
                      Sem dados nesse período ainda.
                    </td>
                  </tr>
                )}
                {byStage.map((row) => (
                  <tr key={row.stage} className="transition-colors hover:bg-zinc-800/20">
                    <td className="px-5 py-3 text-xs font-medium">
                      {STAGE_LABEL[row.stage] ?? row.stage}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{row.generated}</td>
                    <td className="px-5 py-3 text-xs">{row.paid}</td>
                    <td className="px-5 py-3 text-xs">{brl(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <h2 className="border-b border-zinc-800 px-5 py-4 text-sm font-semibold">
            Vendas em tempo real
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr className="bg-zinc-800/30">
                  <th className="px-5 py-3">Hora</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Etapa</th>
                  <th className="px-5 py-3">Situação</th>
                  <th className="px-5 py-3">Campanha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-zinc-500">
                      Nenhum PIX registrado nesse período.
                    </td>
                  </tr>
                )}
                {sales.slice(0, 50).map((sale) => (
                  <tr key={sale.id} className="transition-colors hover:bg-zinc-800/20">
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {new Date(sale.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-xs font-medium">{brl(sale.amount_cents ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {STAGE_LABEL[sale.stage ?? "checkout"] ?? sale.stage}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          isPaid(sale.status)
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {isPaid(sale.status) ? "PAGO" : "AGUARDANDO"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {sale.utm_campaign ?? sale.utm_source ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}
