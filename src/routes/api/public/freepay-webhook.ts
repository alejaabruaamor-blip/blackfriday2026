import { createFileRoute } from "@tanstack/react-router";

const PAID = ["paid", "approved", "completed", "confirmed", "pago", "success"];

function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
}

export const Route = createFileRoute("/api/public/freepay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const nested = (payload["data"] ?? payload["transaction"] ?? payload["payment"]) as
          | Record<string, unknown>
          | undefined;
        const source = { ...(nested ?? {}), ...payload };

        const txid = pick(source, ["id", "txid", "transaction_id", "transactionId", "external_id"]);
        const statusRaw = pick(source, ["status", "payment_status", "transaction_status"]) ?? "pending";
        if (!txid) return Response.json({ ok: true, ignored: "missing txid" });

        const status = statusRaw.toLowerCase();
        const isPaid = PAID.includes(status);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin
          .from("sales")
          .select("id")
          .eq("txid", txid)
          .maybeSingle();

        if (existing) {
          await supabaseAdmin
            .from("sales")
            .update({
              status,
              paid_at: isPaid ? new Date().toISOString() : null,
              raw: JSON.parse(JSON.stringify(payload)) as never,
            })
            .eq("txid", txid);
        } else {
          await supabaseAdmin.from("sales").insert({
            txid,
            status,
            stage: "checkout",
            paid_at: isPaid ? new Date().toISOString() : null,
            raw: JSON.parse(JSON.stringify(payload)) as never,
          });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
