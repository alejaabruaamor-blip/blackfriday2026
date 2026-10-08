import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Search, RefreshCw, Package } from "lucide-react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { MEGA_STORE_EMAIL } from "@/lib/mega-store";

export const Route = createFileRoute("/fale-conosco")({
  head: () => ({ meta: [{ title: "Fale conosco — Mega Capacetes" }, { name: "description", content: "Fale com a Mega Capacetes pelo e-mail contato@megacapacetes.com.br." }, { property: "og:title", content: "Fale conosco — Mega Capacetes" }, { property: "og:description", content: "Nosso atendimento é pelo e-mail." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <StoreLayout><ContactPage /></StoreLayout>,
});

function ContactPage() {
  return <section className="store-container checkout-page"><span className="section-eyebrow">ATENDIMENTO</span><h1>Fale conosco</h1>
    <p>Todo o nosso atendimento é pelo e-mail. Conte o que aconteceu e, se tiver um pedido, mande o código de rastreio — é mais rápido para resolvermos.</p>
    <a className="contact-mail" href={`mailto:${MEGA_STORE_EMAIL}`}><Mail size={22} /> {MEGA_STORE_EMAIL}</a>
    <div className="contact-topics">
      <div><h3><Search size={15} /> Onde está meu pedido?</h3><p>Consulte pelo código de rastreio na página de acompanhar pedido. Se a situação não mudar no prazo previsto, mande e-mail com o código.</p><Link to="/acompanhar-pedido">Acompanhar pedido</Link></div>
      <div><h3><RefreshCw size={15} /> Trocas e devoluções</h3><p>Veja os prazos e como pedir a devolução na página de política de trocas.</p><Link to="/politica-de-trocas">Política de trocas</Link></div>
      <div><h3><Package size={15} /> Dúvida sobre tamanho ou produto</h3><p>Descreva o modelo que você quer e o seu tamanho de cabeça. A gente responde pelo e-mail.</p></div>
    </div>
  </section>;
}
