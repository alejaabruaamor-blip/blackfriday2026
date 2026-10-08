import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CalendarClock, Truck, Mail } from "lucide-react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { MEGA_STORE_EMAIL } from "@/lib/mega-store";

export const Route = createFileRoute("/politica-de-trocas")({
  head: () => ({ meta: [{ title: "Política de trocas — Mega Capacetes" }, { name: "description", content: "Prazos de troca, devolução e garantia da Mega Capacetes." }, { property: "og:title", content: "Política de trocas — Mega Capacetes" }, { property: "og:description", content: "14 dias de garantia, 7 dias de arrependimento e 90 dias de garantia legal." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <StoreLayout><PolicyPage /></StoreLayout>,
});

function PolicyPage() {
  return <section className="store-container checkout-page"><span className="section-eyebrow">PÓS-VENDA</span><h1>Política de trocas e devoluções</h1>
    <p>Leia com calma: são os prazos e os passos para trocar ou devolver um capacete comprado aqui.</p>
    <div className="legal-panel"><h3><ShieldCheck size={16} /> Garantia de 14 dias</h3><p>Se o capacete não serviu ou você não gostou, você tem 14 dias depois de receber para devolver e receber o dinheiro de volta.</p></div>
    <div className="legal-panel"><h3><CalendarClock size={16} /> 7 dias para desistir da compra</h3><p>Pela regra do comércio eletrônico, você pode desistir da compra em até 7 dias corridos depois de receber o produto, sem precisar explicar o motivo.</p></div>
    <div className="legal-panel"><h3><ShieldCheck size={16} /> 90 dias para defeito</h3><p>Defeito de fabricação tem garantia de 90 dias a partir da entrega, conforme a lei. Mande fotos e vídeos do problema pelo e-mail.</p></div>
    <div className="legal-panel"><h3><Truck size={16} /> Como pedir a devolução</h3><p>Envie um e-mail informando o código de rastreio, o motivo e o seu CPF. A gente combina com você o envio do capacete de volta. O produto deve voltar sem sinais de uso, com o forro e os acessórios que vieram junto.</p></div>
    <div className="legal-panel"><h3><Mail size={16} /> Atendimento</h3><p>Tudo é resolvido pelo e-mail <a href={`mailto:${MEGA_STORE_EMAIL}`}>{MEGA_STORE_EMAIL}</a>. Guarde o e-mail da confirmação do seu pedido.</p></div>
    <p className="tracking-help"><Link to="/acompanhar-pedido">Acompanhar pedido</Link> · <Link to="/fale-conosco">Fale conosco</Link></p>
  </section>;
}
