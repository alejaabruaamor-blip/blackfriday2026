import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PixGateway = "freepay" | "bravopay";

export const getPixGateway = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("app_settings")
      .select("value")
      .eq("key", "pix_gateway")
      .maybeSingle();
    return { gateway: ((data?.value as PixGateway) ?? "freepay") as PixGateway };
  });

export const setPixGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { gateway: PixGateway }) => {
    if (input.gateway !== "freepay" && input.gateway !== "bravopay") throw new Error("gateway invalido");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "pix_gateway", value: data.gateway, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { gateway: data.gateway };
  });
