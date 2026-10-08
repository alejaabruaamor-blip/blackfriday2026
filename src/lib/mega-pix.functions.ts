import { createServerFn } from "@tanstack/react-start";
import { cartTotal, products, type CartItem } from "@/lib/mega-store";

type Customer = { name: string; email: string; phone: string; cpf: string };
type Input = { items: CartItem[]; customer: Customer; address: string };

function validate(input: Input): Input {
  if (!input || !Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) throw new Error("Sacola vazia");
  const items = input.items.map((i) => {
    if (!products.some((p) => p.slug === i.slug) || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99) throw new Error("Item inválido");
    return { slug: String(i.slug), size: String(i.size).slice(0, 4), quantity: i.quantity };
  });
  const c = input.customer ?? ({} as Customer);
  const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const customer = { name: clean(c.name, 100), email: clean(c.email, 120), phone: clean(c.phone, 20).replace(/\D/g, ""), cpf: clean(c.cpf, 18).replace(/\D/g, "") };
  if (customer.name.length < 3 || !/^\S+@\S+\.\S+$/.test(customer.email) || customer.phone.length < 10 || customer.cpf.length !== 11) throw new Error("Dados do cliente inválidos");
  return { items, customer, address: clean(input.address, 300) };
}

export const createMegaPix = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const key = process.env["BRAVOPAY_API_KEY"];
    if (!key) throw new Error("PIX indisponível no momento. Tente novamente em instantes.");
    const amount = cartTotal(data.items);
    const description = data.items.map((i) => `${products.find((p) => p.slug === i.slug)!.name} (${i.size}) x${i.quantity}`).join(", ").slice(0, 250);
    const res = await fetch("https://bravopay.club/api/v1/transactions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 MegaCapacetes" },
      body: JSON.stringify({ amount_cents: amount, method: "pix", customer: data.customer, description }),
    });
    const j = (await res.json().catch(() => ({}))) as { id?: string; pix?: { copy_paste?: string; expires_at?: string }; error?: { message?: string } };
    if (!res.ok || !j.id || !j.pix?.copy_paste) {
      console.error("bravopay error", res.status, JSON.stringify(j).slice(0, 300));
      throw new Error("Não foi possível gerar o PIX. Tente novamente.");
    }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("sales").upsert({
        txid: j.id, stage: "mega-capacetes", amount_cents: amount, status: "pending",
        product_name: description, customer_name: data.customer.name, customer_email: data.customer.email, customer_phone: data.customer.phone,
        raw: { items: data.items, address: data.address } as never,
      }, { onConflict: "txid" });
    } catch (e) { console.error("sale log failed", e); }
    return { txid: j.id, copyPaste: j.pix.copy_paste, expiresAt: j.pix.expires_at ?? null, amountCents: amount };
  });

export const checkMegaPix = createServerFn({ method: "GET" })
  .inputValidator((input: { txid: string }) => {
    if (!/^[\w-]{6,64}$/.test(String(input?.txid))) throw new Error("txid inválido");
    return { txid: input.txid };
  })
  .handler(async ({ data }) => {
    const key = process.env["BRAVOPAY_API_KEY"];
    if (!key) return { status: "PENDING" };
    const res = await fetch(`https://bravopay.club/api/v1/transactions/${data.txid}`, { headers: { Authorization: `Bearer ${key}`, "User-Agent": "Mozilla/5.0 MegaCapacetes" } });
    const j = (await res.json().catch(() => ({}))) as { status?: string };
    const status = String(j.status ?? "PENDING").toUpperCase();
    if (status === "PAID") {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("sales").update({ status: "paid", paid_at: new Date().toISOString() }).eq("txid", data.txid).neq("status", "paid");
      } catch (e) { console.error(e); }
    }
    return { status };
  });

export const findMegaTracking = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => {
    const code = String(input?.code ?? "").trim().toUpperCase();
    if (!/^MC[A-Z0-9]{6,10}$/.test(code)) throw new Error("Código inválido");
    return { code };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("sales").select("txid, paid_at, status, customer_name").eq("stage", "mega-capacetes").eq("status", "paid").order("paid_at", { ascending: false }).limit(1000);
    const { trackingCode } = await import("@/lib/mega-store");
    const row = (rows ?? []).find((r) => trackingCode(r.txid) === data.code);
    if (!row?.paid_at) return { found: false as const };
    return { found: true as const, paidAt: new Date(row.paid_at).getTime(), code: data.code, name: String(row.customer_name ?? "") };
  });
