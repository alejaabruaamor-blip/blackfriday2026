import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Insight = {
  campaign_name?: string;
  spend?: string;
  clicks?: string;
  impressions?: string;
  date_start?: string;
};

export const syncFacebookSpend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const token = process.env["META_ACCESS_TOKEN"];
    const accountRaw = process.env["META_AD_ACCOUNT_ID"];
    if (!token || !accountRaw) {
      return { ok: false, reason: "missing_credentials" as const, rows: 0 };
    }
    const account = accountRaw.startsWith("act_") ? accountRaw : `act_${accountRaw}`;

    const url = new URL(`https://graph.facebook.com/v21.0/${account}/insights`);
    url.searchParams.set("level", "campaign");
    url.searchParams.set("fields", "campaign_name,spend,clicks,impressions");
    url.searchParams.set("time_increment", "1");
    url.searchParams.set("date_preset", "last_30d");
    url.searchParams.set("limit", "500");
    url.searchParams.set("access_token", token);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      console.error("meta insights failed", response.status, text);
      return { ok: false, reason: "api_error" as const, rows: 0 };
    }
    const json = (await response.json()) as { data?: Insight[] };
    const insights = json.data ?? [];

    const rows = insights
      .filter((item) => item.date_start && item.campaign_name)
      .map((item) => ({
        spend_date: item.date_start!,
        platform: "facebook",
        campaign_name: item.campaign_name!,
        spend_cents: Math.round(Number.parseFloat(item.spend ?? "0") * 100) || 0,
        clicks: Number.parseInt(item.clicks ?? "0", 10) || 0,
        impressions: Number.parseInt(item.impressions ?? "0", 10) || 0,
        source: "facebook",
        updated_at: new Date().toISOString(),
      }));

    if (rows.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("ad_spend")
        .upsert(rows, { onConflict: "spend_date,platform,campaign_name" });
      if (error) {
        console.error("ad_spend upsert failed", error);
        return { ok: false, reason: "db_error" as const, rows: 0 };
      }
    }

    return { ok: true, reason: "synced" as const, rows: rows.length };
  });
