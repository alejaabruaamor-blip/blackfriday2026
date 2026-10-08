import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Truck, ShieldCheck, ChevronRight, Home, Plus, Minus, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout, useStoreCart } from "@/components/mega/StoreLayout";
import { ProductCard } from "@/components/mega/ProductCard";
import { products, money } from "@/lib/mega-store";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => { const product = products.find(p => p.slug === params.slug); if (!product) throw notFound(); return { product }; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.product.name ?? "Capacete"} — Mega Capacetes` }, { name: "description", content: `${loaderData?.product.name ?? "Capacete"} por ${money(loaderData?.product.priceCents ?? 0)}. 10% de desconto no PIX e frete grátis.` }, { property: "og:title", content: `${loaderData?.product.name ?? "Capacete"} — Mega Capacetes` }, { property: "og:description", content: "Escolha seu capacete com frete grátis e desconto no PIX." }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ProductPage,
});
function ProductPage() { return <StoreLayout><ProductDetails key={Route.useParams().slug} /></StoreLayout>; }
function ProductDetails() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState("");
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const cart = useStoreCart();
  const sizes = ["56", "57", "58", "59", "60"];
  function addToCart() {
    if (!size) { setError(true); return; }
    cart.add({ slug: product.slug, size, quantity });
  }
  return <div className="product-reference">
    <div className="product-breadcrumb-band"><div className="store-container store-breadcrumb"><Link to="/"><Home size={16} /> Loja</Link><ChevronRight size={12} /><span>{product.name}</span></div></div>
    <section className="store-container product-page">
      <div className="product-detail-grid">
        <div className="product-gallery"><div className="product-main-image"><img src={product.image} alt={product.name} fetchPriority="high" /></div><div className="product-thumbnail" aria-hidden="true"><img src={product.image} alt="" /></div></div>
        <div className="product-details">
          {product.slug === "norisk-razor-black-edition" && <span className="product-featured-badge">MAIS VENDIDO</span>}
          <h1>{product.name}</h1>
          <div className="product-pricing"><strong>{money(product.priceCents)}</strong><div className="product-pix-price"><span><BadgePercent size={18} /> Preço no Pix:</span><div><b>{money(product.pixCents)}</b><small>10% de desconto</small></div></div></div>
          <div className="product-purchase">
            <div className="product-size-panel" id="product-size-options"><div className="product-size-label"><span className="field-label">Escolha o tamanho</span><span>Medida da cabeça em cm</span></div><div className="size-options">{sizes.map(value => <Button key={value} variant="outline" aria-pressed={size === value} className={size === value ? "size-selected" : ""} onClick={() => { setSize(value); setError(false); }}>{value}</Button>)}</div>{error && <p role="alert" className="store-form-error">Selecione o tamanho do capacete.</p>}<p>Passe a fita métrica ao redor da cabeça, cerca de 2 cm acima das sobrancelhas.</p></div>
            <div className="product-quantity"><span>Quantidade:</span><div><Button variant="ghost" size="icon" aria-label="Diminuir quantidade" disabled={quantity === 1} onClick={() => setQuantity(current => Math.max(1, current - 1))}><Minus /></Button><output aria-label="Quantidade">{quantity}</output><Button variant="ghost" size="icon" aria-label="Aumentar quantidade" onClick={() => setQuantity(current => current + 1)}><Plus /></Button></div></div>
            <Button className="product-buy-now" onClick={addToCart}>Comprar Agora</Button>
            <Button variant="outline" className="product-add-cart" onClick={addToCart}><ShoppingBag /> Adicionar ao Carrinho</Button>
          </div>
          <div className="product-benefits"><span><Truck /> Frete Grátis</span><span><ShieldCheck /> Compra Segura</span></div>
        </div>
      </div>
      <div className="product-description-section"><h2>Descrição do Produto</h2><p>{product.slug === "norisk-razor-black-edition" ? "NoRisk Razor Black Edition com viseira e aerofólio fumê. Visual agressivo, acabamento premium e ótimo conforto para o uso diário." : product.name}</p></div>
      <details className="product-description"><summary>Garantia e devolução</summary><p>Garantia legal de 90 dias para defeitos. Para compras pela internet, o direito de arrependimento é de 7 dias após o recebimento.</p></details>
    </section>
    <section className="store-container related-products"><h2>Você também pode gostar</h2><div className="helmet-grid">{products.filter(p => p.brand === product.brand && p.slug !== product.slug).slice(0, 4).map(p => <ProductCard key={p.slug} product={p} />)}</div></section>
  </div>;
}
