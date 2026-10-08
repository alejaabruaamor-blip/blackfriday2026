import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getPixGateway, setPixGateway, type PixGateway } from "@/lib/gateway.functions";

const OPTIONS: { id: PixGateway; label: string }[] = [
  { id: "freepay", label: "FreePay" },
  { id: "bravopay", label: "BravoPay" },
];

export function GatewaySwitch() {
  const fetchGw = useServerFn(getPixGateway);
  const saveGw = useServerFn(setPixGateway);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({ queryKey: ["pix-gateway"], queryFn: () => fetchGw() });
  const current = data?.gateway ?? "freepay";

  async function choose(id: PixGateway) {
    if (id === current || busy) return;
    setBusy(true);
    try {
      await saveGw({ data: { gateway: id } });
      await qc.invalidateQueries({ queryKey: ["pix-gateway"] });
    } catch {
      alert("Não foi possível trocar o gateway.");
    }
    setBusy(false);
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Gateway de PIX ativo</h2>
          <p className="text-xs text-zinc-500">Escolha qual empresa gera os PIX do site. Troca na hora.</p>
        </div>
        <div className="flex gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={busy}
              className={
                o.id === current
                  ? "rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-black"
                  : "rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-60"
              }
            >
              {o.id === current ? "● " : ""}
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
