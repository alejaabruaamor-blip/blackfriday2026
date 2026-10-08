import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FunnelStep = {
  slug: string;
  name: string;
  url: string;
  amountCents: number;
};

export const FUNNEL_STEPS: FunnelStep[] = [
  { slug: "quiz", name: "Quiz", url: "https://recargajogoquiz.vercel.app/quizre/", amountCents: 0 },
  { slug: "recarga", name: "Recarga", url: "https://recargajogoquiz.vercel.app/recarga/", amountCents: 0 },
  { slug: "loja", name: "Loja", url: "https://recargajogoquiz.vercel.app/loja/", amountCents: 0 },
  { slug: "checkout", name: "Checkout", url: "https://recargajogoquiz.vercel.app/", amountCents: 1490 },
  { slug: "pix", name: "Pagamento PIX", url: "https://recargajogoquiz.vercel.app/ebookdesign/", amountCents: 1490 },
  { slug: "up1", name: "Oferta 1", url: "https://recargajogoquiz.vercel.app/rec/up1/", amountCents: 1484 },
  { slug: "up2", name: "Oferta 2 (Skins)", url: "https://recargajogoquiz.vercel.app/rec/up2/", amountCents: 1990 },
  { slug: "up3", name: "Oferta 3 (Itens)", url: "https://recargajogoquiz.vercel.app/rec/up3/", amountCents: 2990 },
  { slug: "roleta", name: "Roleta", url: "https://recargajogoquiz.vercel.app/roleta/", amountCents: 0 },
];

type Input = {
  stepSlug: string;
  amountCents: number;
  quantity: number;
  email: string;
  name?: string;
  approved: boolean;
  utmSource?: string;
  utmCampaign?: string;
};

export const sendFunnelToUtmify = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Input) => input)
  .handler(async ({ data }) => {
    if (!process.env["UTMIFY_API_TOKEN"]) {
      return { sent: 0, failed: 0, error: "Token da UTMify não configurado." };
    }

    const step = FUNNEL_STEPS.find((s) => s.slug === data.stepSlug) ?? FUNNEL_STEPS[3]!;
    const quantity = Math.min(200, Math.max(1, Math.round(data.quantity)));
    const amountCents = Math.max(0, Math.round(data.amountCents));
    const email = data.email.trim() || "cliente@email.com";

    const { sendUtmifyOrder } = await import("@/lib/utmify.server");

    let sent = 0;
    let failed = 0;
    const stamp = Date.now();

    for (let i = 0; i < quantity; i++) {
      const orderId = `${step.slug}-${stamp}-${i + 1}`;
      const base = {
        orderId,
        valueCents: amountCents,
        productName: `Ebook Design - ${step.name}`,
        customerName: data.name?.trim() || "Comprador",
        customerEmail: email,
        utmSource: data.utmSource?.trim() || "organic",
        utmCampaign: data.utmCampaign?.trim() || null,
      };

      const generated = await sendUtmifyOrder({ ...base, status: "waiting_payment" });
      let approved = true;
      if (data.approved) {
        approved = await sendUtmifyOrder({ ...base, status: "paid" });
      }
      if (generated && approved) sent++;
      else failed++;
    }

    return { sent, failed, error: null as string | null };
  });
