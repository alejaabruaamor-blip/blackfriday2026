import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, PRODUCT_RATING, type Product } from "@/lib/mega-store";

export function ProductStars() {
  return <div className="product-stars" aria-label={`Avaliação ${PRODUCT_RATING} de 5 estrelas`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}<span>({PRODUCT_RATING.toFixed(1)})</span></div>;
}

import { promotionDiscount } from "@/lib/promotion";

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  return <article className={featured ? "helmet-card helmet-featured" : "helmet-card"}>
    <Link to="/produto/$slug" params={{ slug: product.slug }} className="helmet-image"><img src={product.image} alt={product.name} loading="lazy" />{promotionDiscount(product) === 75 ? <span className="helmet-badge">75% OFF</span> : featured && <span className="helmet-badge">Mais vendido</span>}</Link>
    <div className="helmet-card-info"><Link to="/produto/$slug" params={{ slug: product.slug }}><h3>{product.name}</h3></Link><ProductStars /><strong className="helmet-price">{money(product.priceCents)}</strong>{promotionDiscount(product) === 75 && <p className="helmet-discount-note">75% de desconto já incluído</p>}<p className="helmet-pix">Pix: <b>{money(product.pixCents)}</b></p><Button asChild className="helmet-link"><Link to="/produto/$slug" params={{ slug: product.slug }}>{product.kind === "jaqueta" || product.kind === "acessorio" ? "VER PRODUTO" : "VER CAPACETE"} <ArrowRight /></Link></Button></div>
  </article>;
}