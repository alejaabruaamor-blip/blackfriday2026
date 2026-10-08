import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type MetaCampaign = { id?: string; name?: string };

type RpcClient = { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => Promise<{ data: boolean | null }> };

async function assertAdmin(supabase: unknown, userId: string) {
  const { data: isAdmin } = await (supabase as RpcClient).rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}


async function findMetaCampaignId(campaign: string): Promise<string | null> {
  const token = process.env["META_ACCESS_TOKEN"];
  const accountRaw = process.env["META_AD_ACCOUNT_ID"];
  if (!token || !accountRaw) return null;
  const account = accountRaw.startsWith("act_") ? accountRaw : `act_${accountRaw}`;
  const url = new URL(`https://graph.facebook.com/v21.0/${account}/campaigns`);
  url.searchParams.set("fields", "id,name");
  url.searchParams.set("limit", "500");
  url.searchParams.set("access_token", token);
  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error("meta campaigns failed", response.status, await response.text());
    return null;
  }
  const json = (await response.json()) as { data?: MetaCampaign[] };
  const match = (json.data ?? []).find(
    (item) => (item.name ?? "").trim().toLowerCase() === campaign.trim().toLowerCase(),
  );
  return match?.id ?? null;
}

export const setCampaignActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { campaign: string; active: boolean }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const campaign = data.campaign.trim();
    if (!campaign) throw new Error("campanha invalida");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("campaign_settings")
      .select("meta_campaign_id")
      .eq("campaign_name", campaign)
      .maybeSingle();

    let metaId = existing?.meta_campaign_id ?? null;
    let facebook: "changed" | "no_credentials" | "not_found" | "error" = "no_credentials";

    const token = process.env["META_ACCESS_TOKEN"];
    if (token) {
      if (!metaId) metaId = await findMetaCampaignId(campaign);
      if (!metaId) {
        facebook = "not_found";
      } else {
        const response = await fetch(`https://graph.facebook.com/v21.0/${metaId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: data.active ? "ACTIVE" : "PAUSED",
            access_token: token,
          }),
        });
        if (response.ok) {
          facebook = "changed";
        } else {
          console.error("meta status change failed", response.status, await response.text());
          facebook = "error";
        }
      }
    }

    const { error } = await supabaseAdmin.from("campaign_settings").upsert(
      {
        campaign_name: campaign,
        is_active: data.active,
        meta_campaign_id: metaId,
        last_action: facebook,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campaign_name" },
    );
    if (error) throw new Error(error.message);

    return { ok: true, active: data.active, facebook };
  });

export const saveManualSpend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { campaign: string; date: string; amount: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const campaign = data.campaign.trim();
    if (!campaign) throw new Error("campanha invalida");

    const normalized = data.amount.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    const cents = Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ad_spend").upsert(
      {
        spend_date: data.date,
        platform: "facebook",
        campaign_name: campaign,
        spend_cents: cents,
        source: "manual",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "spend_date,platform,campaign_name" },
    );
    if (error) throw new Error(error.message);

    return { ok: true, spend_cents: cents };
  });
