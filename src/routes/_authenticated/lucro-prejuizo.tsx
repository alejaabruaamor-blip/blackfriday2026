import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calculator, Check, Plus, RotateCcw, Save, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/lucro-prejuizo")({
  head: () => ({
    meta: [
      { title: "Lucro e prejuízo — Painel de Vendas" },
      {
        name: "description",
        content: "Calculadora editável de faturamento, custos, lucro, prejuízo e margem.",
      },
      { property: "og:title", content: "Lucro e prejuízo — Painel de Vendas" },
      {
        property: "og:description",
        content: "Calcule o resultado do negócio com valores editáveis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfitLossPage,
});

type Values = {
  revenue: string;
  sales: string;
  ads: string;
  fees: string;
};

type SavedCost = {
  id: string;
  name: string;
  amount: number;
  type: "product" | "other";
};

const EMPTY_VALUES: Values = {
  revenue: "",
  sales: "",
  ads: "",
  fees: "",
};

const STORAGE_KEY = "painel-lucro-prejuizo-v2";

function numberFrom(value: string) {
  if (!value.trim()) return 0;
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function MoneyField({
  id,
  label,
  value,
  onChange,
}: {
  id: keyof Values;
  label: string;
  value: string;
  onChange: (id: keyof Values, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
        <span className="pl-3 text-sm text-muted-foreground">R$</span>
        <Input
          id={id}
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(event) => onChange(id, event.target.value)}
          className="h-10 border-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function ResultCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ProfitLossPage() {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [savedCosts, setSavedCosts] = useState<SavedCost[]>([]);
  const [productDraft, setProductDraft] = useState("0");
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("0");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          values?: Partial<Values>;
          costs?: SavedCost[];
          other?: string;
        } & Partial<Values>;
        setValues({ ...EMPTY_VALUES, ...(parsed.values ?? parsed) });
        if (Array.isArray(parsed.costs)) {
          setSavedCosts(parsed.costs);
        } else if (parsed.other) {
          setSavedCosts([{ id: "expense-1", name: "Outros", amount: numberFrom(parsed.other), type: "other" }]);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const result = useMemo(() => {
    const revenue = numberFrom(values.revenue);
    const sales = numberFrom(values.sales);
    const ads = numberFrom(values.ads);
    const productCosts = savedCosts
      .filter((cost) => cost.type === "product")
      .reduce((total, cost) => total + cost.amount, 0);
    const fees = numberFrom(values.fees);
    const otherCosts = savedCosts
      .filter((cost) => cost.type === "other")
      .reduce((total, cost) => total + cost.amount, 0);
    const costs = ads + productCosts + fees + otherCosts;
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const cpa = sales > 0 ? ads / sales : 0;
    const averageTicket = sales > 0 ? revenue / sales : 0;
    return { revenue, costs, profit, margin, cpa, averageTicket, productCosts, otherCosts };
  }, [savedCosts, values]);

  function updateValue(id: keyof Values, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
    setSaved(false);
  }

  function saveValues() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, costs: savedCosts }));
    setSaved(true);
  }

  function saveCost(type: "product" | "other") {
    const amount = numberFrom(type === "product" ? productDraft : expenseAmount);
    if (amount <= 0) return;
    const nextCosts = [
      ...savedCosts,
      {
        id: `cost-${Date.now()}`,
        name: type === "product" ? "Custo do produto" : expenseName.trim() || "Outro gasto",
        amount,
        type,
      },
    ];
    setSavedCosts(nextCosts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, costs: nextCosts }));
    if (type === "product") setProductDraft("0");
    else {
      setExpenseName("");
      setExpenseAmount("0");
    }
    setSaved(true);
  }

  function removeCost(id: string) {
    const nextCosts = savedCosts.filter((cost) => cost.id !== id);
    setSavedCosts(nextCosts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, costs: nextCosts }));
  }

  function resetValues() {
    setValues(EMPTY_VALUES);
    setSavedCosts([]);
    setProductDraft("0");
    setExpenseName("");
    setExpenseAmount("0");
    window.localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  }

  const profitable = result.profit >= 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Lucro e prejuízo</h1>
            <p className="text-sm text-muted-foreground">Edite os valores para ver o resultado na hora</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="text-muted-foreground" size={20} />
              <h2 className="font-semibold text-foreground">Valores do período</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={resetValues}>
                <RotateCcw />
                Limpar
              </Button>
              <Button type="button" size="sm" onClick={saveValues}>
                {saved ? <Check /> : <Save />}
                {saved ? "Salvo" : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <MoneyField id="revenue" label="Faturamento total" value={values.revenue} onChange={updateValue} />
            <div className="space-y-2">
              <Label htmlFor="sales">Vendas pagas</Label>
              <Input
                id="sales"
                inputMode="numeric"
                min="0"
                type="number"
                placeholder="0"
                value={values.sales}
                onChange={(event) => updateValue("sales", event.target.value)}
                className="h-11"
              />
            </div>
            <MoneyField id="ads" label="Gasto com anúncios" value={values.ads} onChange={updateValue} />
            <MoneyField id="fees" label="Taxas" value={values.fees} onChange={updateValue} />
          </div>

          <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="product-cost">Custo do produto</Label>
              <div className="flex gap-2">
                <div className="flex h-11 min-w-0 flex-1 items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                  <span className="pl-3 text-sm text-muted-foreground">R$</span>
                  <Input id="product-cost" inputMode="decimal" value={productDraft} onChange={(event) => setProductDraft(event.target.value)} className="h-10 border-0 shadow-none focus-visible:ring-0" />
                </div>
                <Button type="button" onClick={() => saveCost("product")}>
                  <Save /> Salvar
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="expense-name">Outros gastos</Label>
              <Input id="expense-name" placeholder="Nome do gasto" value={expenseName} onChange={(event) => setExpenseName(event.target.value)} className="h-11" />
              <div className="flex gap-2">
                <div className="flex h-11 min-w-0 flex-1 items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                  <span className="pl-3 text-sm text-muted-foreground">R$</span>
                  <Input inputMode="decimal" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} className="h-10 border-0 shadow-none focus-visible:ring-0" />
                </div>
                <Button type="button" onClick={() => saveCost("other")}>
                  <Plus /> Salvar
                </Button>
              </div>
            </div>
          </div>

          {savedCosts.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Custos salvos</p>
              {savedCosts.map((cost) => (
                <div key={cost.id} className="flex items-center justify-between gap-3 rounded-md bg-background px-3 py-2">
                  <span className="min-w-0 truncate text-sm text-foreground">{cost.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-medium text-foreground">{brl(cost.amount)}</span>
                    <Button type="button" variant="ghost" size="icon" aria-label="Excluir custo" title="Excluir custo" onClick={() => removeCost(cost.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            Ao salvar um custo, o campo volta para zero e o valor permanece somado no resultado.
          </p>
        </section>

        <section className="space-y-4" aria-live="polite">
          <div
            className={`rounded-lg border p-6 ${
              profitable ? "border-chart-2/40 bg-chart-2/10" : "border-destructive/40 bg-destructive/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-md p-2 ${profitable ? "bg-chart-2/15 text-chart-2" : "bg-destructive/15 text-destructive"}`}>
                {profitable ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Resultado</p>
                <p className={`text-3xl font-bold ${profitable ? "text-chart-2" : "text-destructive"}`}>
                  {brl(result.profit)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground">
              {profitable ? "Você está no lucro neste período." : "Você está no prejuízo neste período."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <ResultCard title="Custos totais" value={brl(result.costs)} hint="Soma de todos os gastos" />
            <ResultCard title="Custo dos produtos" value={brl(result.productCosts)} hint="Total dos custos salvos" />
            <ResultCard title="Outros gastos" value={brl(result.otherCosts)} hint="Soma dos gastos adicionados" />
            <ResultCard title="Margem" value={`${result.margin.toFixed(1)}%`} hint="Percentual que sobra" />
            <ResultCard title="CPA médio" value={values.sales ? brl(result.cpa) : "—"} hint="Anúncio por venda" />
            <ResultCard title="Ticket médio" value={values.sales ? brl(result.averageTicket) : "—"} hint="Faturamento por venda" />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Ponto de equilíbrio</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{brl(result.costs)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Faturamento mínimo para cobrir os gastos informados</p>
          </div>
        </section>
      </main>
    </div>
  );
}