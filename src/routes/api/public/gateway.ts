import { createFileRoute } from "@tanstack/react-router";

// Public read-only: tells the sites' PIX API which gateway is active.
export const Route = createFileRoute("/api/public/gateway")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", "pix_gateway")
          .maybeSingle();
        return new Response(JSON.stringify({ gateway: data?.value ?? "freepay" }), {
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
