import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, ShoppingCart, Menu, X, ShieldCheck, Truck, ArrowRight, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCartItem, cartTotal, products, money, MEGA_STORE_EMAIL, type CartItem } from "@/lib/mega-store";
const logo = { url: "/img/mega-capacetes-logo.webp" };

const CartContext = createContext<{ items: CartItem[]; add: (item: CartItem) => void; open: () => void }>({ items: [], add: () => {}, open: () => {} });
export const useStoreCart = () => useContext(CartContext);

export function StoreLayout({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    try { const stored: unknown = JSON.parse(localStorage.getItem("mega-cart") ?? "[]");
      if (Array.isArray(stored)) setItems(stored.filter((i): i is CartItem => i && typeof i.slug === "string" && typeof i.size === "string" && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99 && products.some(p => p.slug === i.slug)));
    } catch { /* An invalid saved cart starts empty. */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("mega-cart", JSON.stringify(items)); }, [items, loaded]);
  useEffect(() => { if (!cartOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; const close = (e: KeyboardEvent) => { if (e.key === "Escape") setCartOpen(false); }; window.addEventListener("keydown", close); return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); }; }, [cartOpen]);
  function update(index: number, delta: number) { setItems(current => current.flatMap((item, i) => i !== index ? [item] : item.quantity + delta > 0 ? [{ ...item, quantity: Math.min(99, item.quantity + delta) }] : [])); }
  return <CartContext.Provider value={{ items, add: item => { setItems(current => addCartItem(current, item)); setCartOpen(true); }, open: () => setCartOpen(true) }}>
    <div className="mega-store">
      <header className="store-header">
        <div className="store-header-inner">
          <Link to="/" className="store-brand" aria-label="Mega Capacetes — início"><img className="brand-emblem" src={logo.url} alt="" /><span><strong>MEGA</strong><small>CAPACETES</small></span></Link>
          <nav className={menuOpen ? "store-nav mobile-open" : "store-nav"} aria-label="Loja">
            <Link to="/" onClick={() => setMenuOpen(false)}>Loja</Link>
            <Link to="/colecao/$brand" params={{ brand: "norisk" }} onClick={() => setMenuOpen(false)}>NoRisk</Link>
            <Link to="/colecao/$brand" params={{ brand: "ls2" }} onClick={() => setMenuOpen(false)}>LS2</Link>
            <Link to="/produto/$slug" params={{ slug: products[0]?.slug ?? "norisk-razor-black-edition" }} onClick={() => setMenuOpen(false)}>Mais Vendido</Link>
          </nav>
          <div className="store-header-actions"><Button variant="ghost" size="icon" aria-label={`Abrir sacola, ${items.reduce((n, i) => n + i.quantity, 0)} itens`} onClick={() => setCartOpen(true)}><ShoppingCart />{items.length > 0 && <span className="cart-count">{items.reduce((n, i) => n + i.quantity, 0)}</span>}</Button><Button variant="ghost" size="icon" className="store-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</Button></div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="store-footer"><div className="store-container footer-inner"><Link to="/" className="store-brand"><img className="brand-emblem" src={logo.url} alt="" /><span><strong>MEGA</strong><small>CAPACETES</small></span></Link><p>NoRisk e LS2. O capacete certo para a sua próxima estrada.</p><p className="footer-contact">Fale conosco: <a href={`mailto:${MEGA_STORE_EMAIL}`}>{MEGA_STORE_EMAIL}</a></p><div><span><ShieldCheck size={16} /> Compra segura</span><span><Truck size={16} /> Frete grátis</span></div><div className="footer-links"><Link to="/acompanhar-pedido">Acompanhar pedido</Link><Link to="/politica-de-trocas">Trocas e devoluções</Link><Link to="/fale-conosco">Fale conosco</Link><Link to="/auth">Área administrativa</Link></div></div></footer>
      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}><section className="cart-drawer" role="dialog" aria-modal="true" aria-label="Sua sacola" onClick={e => e.stopPropagation()}><div className="cart-heading"><h2>Sua sacola</h2><Button variant="ghost" size="icon" autoFocus aria-label="Fechar sacola" onClick={() => setCartOpen(false)}><X /></Button></div>{items.length === 0 ? <div className="cart-empty"><ShoppingBag size={44} /><h3>Sua próxima aventura começa aqui</h3><p>Sua sacola ainda está vazia.</p><Button onClick={() => setCartOpen(false)}>Ver capacetes <ArrowRight /></Button></div> : <><div className="cart-items">{items.map((item, index) => { const product = products.find(p => p.slug === item.slug); if (!product) return null; return <div className="cart-item" key={`${item.slug}-${item.size}`}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>Tamanho {item.size}</p><strong>{money(product.pixCents)}</strong><div className="quantity-control"><Button variant="ghost" size="icon" aria-label={`Diminuir quantidade de ${product.name}`} onClick={() => update(index, -1)}><Minus /></Button><span>{item.quantity}</span><Button variant="ghost" size="icon" aria-label={`Aumentar quantidade de ${product.name}`} onClick={() => update(index, 1)}><Plus /></Button><Button variant="ghost" size="icon" aria-label={`Remover ${product.name}`} onClick={() => setItems(current => current.filter((_, i) => i !== index))}><Trash2 /></Button></div></div></div>; })}</div><div className="cart-summary"><div><span>Frete</span><strong>Grátis</strong></div><div><span>Total no PIX</span><strong>{money(cartTotal(items))}</strong></div><p>10% de desconto no PIX já aplicado.</p><Button asChild className="store-buy"><Link to="/checkout" onClick={() => setCartOpen(false)}>Continuar para pagamento <ArrowRight /></Link></Button><Button variant="ghost" className="w-full" onClick={() => setCartOpen(false)}>Continuar comprando</Button></div></>}</section></div>}
    </div>
  </CartContext.Provider>;
}