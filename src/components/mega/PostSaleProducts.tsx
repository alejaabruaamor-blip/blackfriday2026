import { ProductCard } from '@/components/mega/ProductCard';
import { postSaleCollections } from '@/lib/post-sale-products';

export function PostSaleProducts() {
  return <section className="mt-10 border-t border-border pt-8" aria-labelledby="post-sale-title">
    <span className="section-eyebrow">MEGA CAPACETES</span>
    <h2 id="post-sale-title" className="mb-8 text-2xl font-bold">Complete seu equipamento</h2>
    {postSaleCollections.map(collection => <section key={collection.title} className="mb-10" aria-label={collection.title}>
      <h3 className="mb-4 text-xl font-semibold">{collection.title}</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {collection.products.map(product => <ProductCard key={product.slug} product={product} />)}
      </div>
    </section>)}
  </section>;
}
