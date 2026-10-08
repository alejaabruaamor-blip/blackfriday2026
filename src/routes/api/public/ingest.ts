import { createFileRoute } from "@tanstack/react-router";

type Body = Record<string, unknown>;

function toCents(value: unknown): number {
  if (typeof value === "number") return Math.round(value > 1000 ? value : value * 100);
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed)) return Math.round(parsed * 100);
  }
  return 0;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export const Route = createFileRoute("/api/public/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tokens = [process.env["INGEST_TOKEN"], process.env["SITE_INGEST_TOKEN"]].filter(
          (t): t is string => typeof t === "string" && t !== "",
        );
        const provided =
          request.headers.get("x-ingest-token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (tokens.length === 0 || !tokens.includes(provided)) {
          return new Response("unauthorized", { status: 401 });
        }


        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        const txid = str(body["txid"]) ?? str(body["transaction_id"]) ?? str(body["id"]);
        if (!txid) return new Response("missing txid", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin
          .from("sales")
          .select("*")
          .eq("txid", txid)
          .maybeSingle();

        const incomingCents =
          body["amount_cents"] != null ? toCents(body["amount_cents"]) : toCents(body["amount"]);
        const keep = (key: string, prev: string | null | undefined) => str(body[key]) ?? prev ?? null;
        const statusIn = str(body["status"]) ?? existing?.status ?? "pending";
        const isPaidIn = ["paid", "approved", "completed"].includes(statusIn.toLowerCase());

        const row = {
          txid,
          stage: str(body["stage"]) ?? existing?.stage ?? "checkout",
          amount_cents: incomingCents > 0 ? incomingCents : (existing?.amount_cents ?? 0),
          status: statusIn,
          product_name: keep("product_name", existing?.product_name),
          utm_source: keep("utm_source", existing?.utm_source),
          utm_campaign: keep("utm_campaign", existing?.utm_campaign),
          utm_medium: keep("utm_medium", existing?.utm_medium),
          utm_content: keep("utm_content", existing?.utm_content),
          utm_term: keep("utm_term", existing?.utm_term),
          customer_name: keep("customer_name", existing?.customer_name),
          customer_email: keep("customer_email", existing?.customer_email),
          customer_phone: keep("customer_phone", existing?.customer_phone),
          paid_at: isPaidIn ? (existing?.paid_at ?? new Date().toISOString()) : (existing?.paid_at ?? null),
          raw: JSON.parse(JSON.stringify(existing?.raw ? { ...(existing.raw as object), ...body } : body)) as never,
        };

        const { error } = await supabaseAdmin.from("sales").upsert(row, { onConflict: "txid" });
        if (error) {
          console.error("ingest failed", error);
          return new Response("db error", { status: 500 });
        }

        const paid = ["paid", "approved", "completed"].includes(row.status.toLowerCase());
        const { sendMetaEvent } = await import("@/lib/meta-capi.server");
        await sendMetaEvent({
          eventName: paid ? "Purchase" : "InitiateCheckout",
          txid: row.txid,
          valueCents: row.amount_cents,
          productName: row.product_name,
        });

        const { sendUtmifyOrder } = await import("@/lib/utmify.server");
        await sendUtmifyOrder({
          orderId: row.txid,
          status: paid ? "paid" : "waiting_payment",
          valueCents: row.amount_cents,
          productName: row.product_name,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          utmSource: row.utm_source,
          utmCampaign: row.utm_campaign,
          utmMedium: row.utm_medium,
          utmContent: row.utm_content,
          utmTerm: row.utm_term,
        });

        return Response.json({ ok: true });
      },
    },
  },
});
