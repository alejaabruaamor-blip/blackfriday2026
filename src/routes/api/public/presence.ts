import { createFileRoute } from "@tanstack/react-router";

const STEPS = ["recarga", "quiz", "roleta", "loja", "checkout", "pix", "up1", "up2", "up3"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export const Route = createFileRoute("/api/public/presence")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: { sid?: unknown; step?: unknown; c?: unknown };
        try {
          body = JSON.parse(await request.text());
        } catch {
          return new Response("bad", { status: 400, headers: CORS });
        }
        const sid = typeof body.sid === "string" ? body.sid : "";
        const step = typeof body.step === "string" ? body.step : "";
        if (!/^[a-z0-9-]{8,64}$/i.test(sid) || !STEPS.includes(step)) {
          return new Response("bad", { status: 400, headers: CORS });
        }
        const camp = typeof body.c === "string" ? body.c.slice(0, 120) : null;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();
        const { data: existing } = await supabaseAdmin
          .from("visitor_presence")
          .select("first_seen")
          .eq("session_id", sid)
          .eq("step", step)
          .maybeSingle();
        await supabaseAdmin.from("visitor_presence").upsert({
          session_id: sid,
          step,
          utm_campaign: camp || null,
          first_seen: existing?.first_seen ?? now,
          last_seen: now,
        });
        return new Response("ok", { headers: CORS });
      },
    },
  },
});
