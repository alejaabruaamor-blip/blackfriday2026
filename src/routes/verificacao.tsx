import { createFileRoute } from "@tanstack/react-router";
import { HumanVerification } from "@/components/mega/HumanGate";
import { safeStoreReturn } from "@/lib/human-challenge";

export const Route = createFileRoute("/verificacao")({
  validateSearch: (search: Record<string, unknown>) => ({ returnTo: safeStoreReturn(search.returnTo) }),
  head: () => ({ meta: [
    { title: "Verificação de segurança — Mega Capacetes" },
    { name: "description", content: "Verificação de acesso à loja Mega Capacetes." },
    { property: "og:title", content: "Verificação de segurança — Mega Capacetes" },
    { property: "og:description", content: "Verificação de acesso à loja Mega Capacetes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: VerificationPage,
});

function VerificationPage() {
  const { returnTo } = Route.useSearch();
  return <HumanVerification returnTo={returnTo} />;
}
