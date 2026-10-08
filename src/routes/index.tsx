import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { ProductCard } from "@/components/mega/ProductCard";
import { hero, money, products } from "@/lib/mega-store";
import { StoreVideo, FeedbackVideos, StoreFaq } from "@/components/mega/ReferenceContent";
import { CustomerReviews } from "@/components/mega/CustomerReviews";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Mega Capacetes — Ofertas NoRisk e LS2" },
    { name: "description", content: "Confira os capacetes NoRisk e LS2 da Mega Capacetes. Queima de estoque a partir de R$ 63,70, frete grátis e 10% de desconto no PIX." },
    { property: "og:title", content: "Mega Capacetes — Ofertas NoRisk e LS2" },
    { property: "og:description", content: "Capacetes NoRisk e LS2 a partir de R$ 63,70. Frete grátis e 10% OFF no PIX." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

function Home() {
  const featuredSlug = products[0]?.slug ?? "norisk-razor-black-edition";
  return <StoreLayout>
    <section className="store-hero store-container"><Link to="/produto/$slug" params={{ slug: featuredSlug }}><img src={hero} alt="Mega Capacetes — Queima de estoque! Capacetes originais NoRisk e LS2 a partir de R$ 63,70. Frete grátis e 10% OFF no PIX." fetchPriority="high" /></Link></section>
    <section className="store-video-section"><div className="store-container"><span className="section-eyebrow">▶ ASSISTA ANTES DE COMPRAR</span><h1>Por que o preço está tão baixo?</h1><p>Entenda como conseguimos oferecer o menor preço do mercado</p><div className="store-video-slot"><StoreVideo /></div></div></section>
    {["NoRisk", "LS2"].map(brand => <section className="store-catalog store-container" key={brand}><div className="catalog-heading"><div><span className="section-eyebrow">COLEÇÃO {brand.toUpperCase()}</span><h2>Os {brand} Mais Vendidos</h2></div><span className="catalog-promo">{brand === "NoRisk" ? "🔥 Oferta Relâmpago" : "Seleção LS2"}</span></div><div className="helmet-grid">{products.filter(p => p.brand === brand).map((product, i) => <ProductCard key={product.slug} product={product} featured={i === 0} />)}</div><Button variant="outline" asChild className="collection-link"><Link to="/colecao/$brand" params={{ brand: brand.toLowerCase() }}>VER TODOS OS CAPACETES {brand.toUpperCase()} <ArrowRight /></Link></Button></section>)}
    <section className="store-pix-band"><div className="store-container"><BadgePercent size={40} /><span className="section-eyebrow">DESCONTO EXCLUSIVO</span><h2>10% OFF PAGANDO NO PIX</h2><p>Aprovação instantânea. Sem taxas. Frete grátis.</p><Button asChild><Link to="/produto/$slug" params={{ slug: featuredSlug }}>QUERO O DESCONTO PIX <ArrowRight /></Link></Button></div></section>
    <CustomerReviews />
    <section className="store-container store-feedback-section"><span className="section-eyebrow">📦 CHEGOU CERTINHO!</span><h2>Clientes que receberam e aprovaram</h2><p>Veja quem já garantiu o capacete e recebeu em casa</p><div className="feedback-grid"><FeedbackVideos /></div></section>
    <section className="store-guarantee"><div className="store-container"><ShieldCheck size={42} /><span className="section-eyebrow">GARANTIA TOTAL</span><h2>Garantia de 90 Dias</h2><p>Garantia legal de 90 dias para defeitos. Nas compras pela internet, o direito de arrependimento pode ser solicitado em até 7 dias após o recebimento.</p><div className="guarantee-features"><span><ShieldCheck /> Compra 100% segura</span><span>Reembolso conforme a política de devolução</span><span>Capacete original</span></div></div></section>
    <section className="store-container store-faq"><span className="section-eyebrow">TIRE SUAS DÚVIDAS</span><h2>Perguntas Frequentes</h2><StoreFaq /></section>
    <section className="store-final"><div className="store-container"><h2>Sua segurança começa com o capacete certo.</h2><p>Estoque limitado. Capacetes originais e frete grátis.</p><Button asChild><Link to="/produto/$slug" params={{ slug: featuredSlug }}>VER OFERTA NORISK — {money(products[0]?.priceCents ?? 0)} <ArrowRight /></Link></Button><div><ShieldCheck size={16} /> Compra segura <Truck size={16} /> Frete grátis</div></div></section>
  </StoreLayout>;
}
