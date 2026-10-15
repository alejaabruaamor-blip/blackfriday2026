import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { StoreLayout } from "@/components/mega/StoreLayout";
import { ProductCard } from "@/components/mega/ProductCard";
import { products, isHelmet, type Product } from "@/lib/mega-store";

const COLLECTIONS: Record<string, { title: string; label: string; filter: (p: Product) => boolean }> = {
  norisk: { title: "Capacetes NoRisk", label: "NoRisk", filter: p => p.brand === "NoRisk" && isHelmet(p) },
  ls2: { title: "Capacetes LS2", label: "LS2", filter: p => p.brand === "LS2" && isHelmet(p) },
  abertos: { title: "Capacetes Abertos", label: "Abertos", filter: p => p.kind === "aberto" },
  jaquetas: { title: "Jaquetas", label: "Jaquetas", filter: p => p.kind === "jaqueta" },
  acessorios: { title: "Acessórios", label: "Acessórios", filter: p => p.kind === "acessorio" },
};

export const Route = createFileRoute("/colecao/$brand")({
  loader: ({ params }) => { const c = COLLECTIONS[params.brand]; if (!c) throw notFound(); return { key: params.brand, brand: c.label, title: c.title }; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Coleção"} — Mega Capacetes` }, { name: "description", content: `${loaderData?.title ?? "Produtos"} da Mega Capacetes, com 10% de desconto no PIX.` }, { property: "og:title", content: `Coleção ${loaderData?.brand ?? ""} — Mega Capacetes` }, { property: "og:description", content: "Frete grátis e 10% OFF no PIX." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Collection,
});
function Collection() {
  const { key, brand, title } = Route.useLoaderData();
  const [sort, setSort] = useState("original");
  const filtered = products.filter(COLLECTIONS[key]!.filter).sort((a, b) => sort === "low" ? a.priceCents - b.priceCents : sort === "high" ? b.priceCents - a.priceCents : 0);
  return <StoreLayout><section className="store-container collection-page"><div className="store-breadcrumb"><Link to="/">Loja</Link><span>/</span><span>{brand}</span></div><div className="catalog-heading"><div><span className="section-eyebrow">COLEÇÃO COMPLETA</span><h1>{title}</h1><p>{filtered.length} modelos · Frete grátis · 10% OFF no PIX</p></div><select aria-label="Ordenar produtos" value={sort} onChange={e => setSort(e.target.value)}><option value="original">Destaques</option><option value="low">Menor preço</option><option value="high">Maior preço</option></select></div><div className="helmet-grid">{filtered.map(product => <ProductCard product={product} key={product.slug} />)}</div></section></StoreLayout>;
}