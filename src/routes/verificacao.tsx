import { createFileRoute } from "@tanstack/react-router";
import { HumanVerification } from "@/components/mega/HumanGate";
import { promotionImageUrl } from "@/components/mega/PromotionExperience";
import { safeStoreReturn } from "@/lib/human-challenge";

export const Route = createFileRoute("/verificacao")({
  validateSearch: (search: Record<string, unknown>) => ({ returnTo: safeStoreReturn(search.returnTo) }),
  head: () => ({ meta: [
    { title: "Black Friday e Roleta de Ofertas — Mega Capacetes" },
    { name: "description", content: "Acesse a Black Friday Mega Capacetes e libere as ofertas de capacetes com 75% já incluídos nos preços." },
    { property: "og:title", content: "Black Friday e Roleta de Ofertas — Mega Capacetes" },
    { property: "og:description", content: "Acesse a Black Friday Mega Capacetes e libere as ofertas de capacetes com 75% já incluídos nos preços." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: promotionImageUrl },
    { name: "twitter:image", content: promotionImageUrl },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: VerificationPage,
});

function VerificationPage() {
  const { returnTo } = Route.useSearch();
  return <HumanVerification returnTo={returnTo} />;
}
