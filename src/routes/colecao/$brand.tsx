import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { ProductCard } from "@/components/mega/ProductCard";
import { products } from "@/lib/mega-store";

export const Route = createFileRoute("/colecao/$brand")({
  loader: ({ params }) => { if (!["norisk", "ls2"].includes(params.brand)) throw notFound(); return { brand: params.brand === "norisk" ? "NoRisk" : "LS2" }; },
  head: ({ loaderData }) => ({ meta: [{ title: `Capacetes ${loaderData?.brand ?? "Coleção"} — Mega Capacetes` }, { name: "description", content: `Todos os capacetes ${loaderData?.brand ?? ""} da Mega Capacetes, com 10% de desconto no PIX.` }, { property: "og:title", content: `Coleção ${loaderData?.brand ?? ""} — Mega Capacetes` }, { property: "og:description", content: "Escolha seu capacete. Frete grátis e 10% OFF no PIX." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Collection,
});
function Collection() {
  const { brand } = Route.useLoaderData();
  const [sort, setSort] = useState("original");
  const filtered = products.filter(p => p.brand === brand).sort((a, b) => sort === "low" ? a.priceCents - b.priceCents : sort === "high" ? b.priceCents - a.priceCents : 0);
  return <StoreLayout><section className="store-container collection-page"><div className="store-breadcrumb"><Link to="/">Loja</Link><span>/</span><span>{brand}</span></div><div className="catalog-heading"><div><span className="section-eyebrow">COLEÇÃO COMPLETA</span><h1>Capacetes {brand}</h1><p>{filtered.length} modelos · Frete grátis · 10% OFF no PIX</p></div><select aria-label="Ordenar capacetes" value={sort} onChange={e => setSort(e.target.value)}><option value="original">Destaques</option><option value="low">Menor preço</option><option value="high">Maior preço</option></select></div><div className="helmet-grid">{filtered.map(product => <ProductCard product={product} key={product.slug} />)}</div></section></StoreLayout>;
}