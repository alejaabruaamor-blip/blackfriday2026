/**
 * Envia pedidos para a UTMify (api-credentials/orders).
 * Um pedido "gerado" (waiting_payment) e, quando pago, "aprovado" (paid).
 */

export type UtmifyOrder = {
  orderId: string;
  status: "waiting_payment" | "paid";
  valueCents: number;
  productName?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
};

function fmt(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function sendUtmifyOrder(order: UtmifyOrder): Promise<boolean> {
  const token = process.env["UTMIFY_API_TOKEN"];
  if (!token) return false;

  const now = new Date();
  const paid = order.status === "paid";
  const value = Math.max(0, Math.round(order.valueCents));

  const payload = {
    orderId: order.orderId,
    platform: "RecargaJogo",
    paymentMethod: "pix",
    status: order.status,
    createdAt: fmt(new Date(now.getTime() - 60_000)),
    approvedDate: paid ? fmt(now) : null,
    refundedAt: null,
    customer: {
      name: order.customerName ?? "Cliente",
      email: order.customerEmail ?? "cliente@email.com",
      phone: order.customerPhone ?? null,
      document: null,
      country: "BR",
    },
    products: [
      {
        id: "ebook-design",
        name: order.productName ?? "Ebook Design",
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: value,
      },
    ],
    trackingParameters: {
      src: null,
      sck: null,
      utm_source: order.utmSource ?? null,
      utm_campaign: order.utmCampaign ?? null,
      utm_medium: order.utmMedium ?? null,
      utm_content: order.utmContent ?? null,
      utm_term: order.utmTerm ?? null,
    },
    commission: {
      totalPriceInCents: value,
      gatewayFeeInCents: 0,
      userCommissionInCents: value,
      currency: "BRL",
    },
    isTest: false,
  };

  try {
    const res = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": token,
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`utmify failed [${res.status}]: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("utmify error", error);
    return false;
  }
}
