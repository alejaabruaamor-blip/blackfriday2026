export type ProductKind = "capacete" | "aberto" | "jaqueta" | "acessorio";
export type Product = { name: string; image: string; priceCents: number; pixCents: number; slug: string; brand: string; kind?: ProductKind; sizes?: string[] };
export const HELMET_SIZES = ["56", "57", "58", "59", "60"];
export const isHelmet = (p: Product) => !p.kind || p.kind === "capacete" || p.kind === "aberto";
const asset0 = { url: "/img/norisk-razor-black-edition.webp" };
const asset1 = { url: "/img/norisk-darth-preto-fosco.webp" };
const asset2 = { url: "/img/norisk-ff302-preto-fosco.webp" };
const asset3 = { url: "/img/norisk-manty-rosa.webp" };
const asset4 = { url: "/img/grand-prix-italy.webp" };
const asset5 = { url: "/img/grand-prix-argentina.webp" };
const asset6 = { url: "/img/grand-prix-brazil.webp" };
const asset7 = { url: "/img/grand-prix-japan.webp" };
const asset8 = { url: "/img/grand-prix-france.webp" };
const asset9 = { url: "/img/grand-prix-south-africa.webp" };
const asset10 = { url: "/img/grand-prix-uk.webp" };
const asset11 = { url: "/img/grand-prix-usa.webp" };
const asset12 = { url: "/img/soul-manty-cinza.webp" };
const asset13 = { url: "/img/norisk-speedmax-rosa-roxo-produto.webp" };
const asset14 = { url: "/img/norisk-speedmax-branco-tiffany-produto.webp" };
const asset15 = { url: "/img/norisk-speedmax-vermelho-cinza-produto.webp" };
const asset16 = { url: "/img/ff358-speed-race-preto-vermelho.webp" };
const asset17 = { url: "/img/ls2-classic-tank-preto.webp" };
const asset18 = { url: "/img/ff358-speed-race-preto-branco.webp" };
const asset19 = { url: "/img/ff358-speed-race-italia.webp" };
const asset20 = { url: "/img/ls2-classic-tank-vermelho.webp" };
const asset21 = { url: "/img/ls2-gray-tank.webp" };
const heroAsset = "/img/hero-capacetes-promocional-v4.webp";
export const hero = heroAsset;
export const products: Product[] = [
{"name": "Capacete NoRisk Razor Black Edition", "priceCents": 3562, "pixCents": 3206, "slug": "norisk-razor-black-edition", "brand": "NoRisk", "image": asset0.url},
{"name": "Capacete NoRisk Darth II Preto Fosco", "priceCents": 5362, "pixCents": 4826, "slug": "norisk-darth-ii-preto-fosco", "brand": "NoRisk", "image": asset1.url},
{"name": "Capacete NoRisk FF302 Preto Fosco", "priceCents": 5020, "pixCents": 4518, "slug": "norisk-ff302-preto-fosco", "brand": "NoRisk", "image": asset2.url},
{"name": "Capacete NoRisk Soul II Manty Rosa Fosco", "priceCents": 3778, "pixCents": 3400, "slug": "norisk-soul-ii-manty-rosa", "brand": "NoRisk", "image": asset3.url},
{"name": "Capacete NoRisk Soul II Grand Prix Italy", "priceCents": 3850, "pixCents": 3465, "slug": "norisk-soul-ii-grand-prix-italy", "brand": "NoRisk", "image": asset4.url},
{"name": "Capacete NoRisk Soul II Grand Prix Argentina", "priceCents": 4948, "pixCents": 4453, "slug": "norisk-soul-ii-grand-prix-argentina", "brand": "NoRisk", "image": asset5.url},
{"name": "Capacete NoRisk Soul II Grand Prix Brasil", "priceCents": 4732, "pixCents": 4259, "slug": "norisk-soul-ii-grand-prix-brazil", "brand": "NoRisk", "image": asset6.url},
{"name": "Capacete NoRisk Soul II Grand Prix Japan", "priceCents": 4804, "pixCents": 4324, "slug": "norisk-soul-ii-grand-prix-japan", "brand": "NoRisk", "image": asset7.url},
{"name": "Capacete NoRisk Soul II Grand Prix France", "priceCents": 4876, "pixCents": 4388, "slug": "norisk-soul-ii-grand-prix-france", "brand": "NoRisk", "image": asset8.url},
{"name": "Capacete NoRisk Soul II Grand Prix South Africa", "priceCents": 4588, "pixCents": 4129, "slug": "norisk-soul-ii-grand-prix-south-africa", "brand": "NoRisk", "image": asset9.url},
{"name": "Capacete NoRisk Soul II Grand Prix UK", "priceCents": 4660, "pixCents": 4194, "slug": "norisk-soul-ii-grand-prix-uk", "brand": "NoRisk", "image": asset10.url},
{"name": "Capacete NoRisk Soul II Grand Prix USA", "priceCents": 4516, "pixCents": 4064, "slug": "norisk-soul-ii-grand-prix-usa", "brand": "NoRisk", "image": asset11.url},
{"name": "Capacete NoRisk Soul II Manty Cinza", "priceCents": 3706, "pixCents": 3335, "slug": "norisk-soul-ii-manty-cinza", "brand": "NoRisk", "image": asset12.url},
{"name": "Capacete NoRisk Speed Max Rosa e Roxo", "priceCents": 4318, "pixCents": 3886, "slug": "norisk-speed-max-rosa-roxo", "brand": "NoRisk", "image": asset13.url},
{"name": "Capacete NoRisk Speed Max Branco e Tiffany", "priceCents": 4246, "pixCents": 3821, "slug": "norisk-speed-max-branco-tiffany", "brand": "NoRisk", "image": asset14.url},
{"name": "Capacete NoRisk Speed Max Vermelho e Cinza", "priceCents": 4462, "pixCents": 4016, "slug": "norisk-speed-max-vermelho-cinza", "brand": "NoRisk", "image": asset15.url},
{"name": "Capacete LS2 Classic Draze Preto e Vermelho", "priceCents": 4138, "pixCents": 3724, "slug": "ls2-classic-draze-preto-vermelho", "brand": "LS2", "image": asset16.url},
{"name": "Capacete LS2 Classic Tank Preto", "priceCents": 4534, "pixCents": 4081, "slug": "ls2-classic-tank-preto", "brand": "LS2", "image": asset17.url},
{"name": "Capacete LS2 FF358 Speed Race Preto e Branco", "priceCents": 4084, "pixCents": 3676, "slug": "ls2-ff358-speed-race-preto-branco", "brand": "LS2", "image": asset18.url},
{"name": "Capacete LS2 FF358 Speed Race Itália", "priceCents": 4372, "pixCents": 3935, "slug": "ls2-ff358-speed-race-italia", "brand": "LS2", "image": asset19.url},
{"name": "Capacete LS2 Classic Tank Vermelho", "priceCents": 4138, "pixCents": 3724, "slug": "ls2-classic-tank-vermelho", "brand": "LS2", "image": asset20.url},
{"name": "Capacete LS2 Gray Tank", "priceCents": 4426, "pixCents": 3983, "slug": "ls2-gray-tank", "brand": "LS2", "image": asset21.url},
{"name": "Jaqueta NoRisk Trip Air Feminina Rosa", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-trip-air-feminina-rosa", "brand": "NoRisk", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/norisk-trip-air-feminina-rosa.webp"},
{"name": "Jaqueta NoRisk Tornado Feminina Branco", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-tornado-feminina-branco", "brand": "NoRisk", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/norisk-tornado-feminina-branco.webp"},
{"name": "Jaqueta NoRisk Tornado Preto", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-tornado-preto", "brand": "NoRisk", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/norisk-tornado-preto.webp"},
{"name": "Jaqueta NoRisk Tornado Cinza", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-tornado-cinza", "brand": "NoRisk", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/norisk-tornado-cinza.webp"},
{"name": "Jaqueta Alpinestars Alux WP 100% Impermeável", "priceCents": 1993, "pixCents": 1794, "slug": "alpinestars-alux-wp", "brand": "Alpinestars", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/alpinestars-alux-wp.webp"},
{"name": "Jaqueta Alpinestars T-SPS V2 WP Preto", "priceCents": 4861, "pixCents": 4375, "slug": "alpinestars-t-sps-v2-wp-preto", "brand": "Alpinestars", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/alpinestars-t-sps-v2-wp-preto.webp"},
{"name": "Jaqueta Alpinestars T-SPS WP Preto", "priceCents": 4079, "pixCents": 3671, "slug": "alpinestars-t-sps-wp-preto", "brand": "Alpinestars", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/alpinestars-t-sps-wp-preto.webp"},
{"name": "Jaqueta LS2 Throttle Black", "priceCents": 4160, "pixCents": 3744, "slug": "ls2-throttle-black", "brand": "LS2", "kind": "jaqueta", "sizes": ["PP", "P", "M", "G", "GG"], "image": "/img/ls2-throttle-black.webp"},
{"name": "Luva Alpinestars Reef V2", "priceCents": 4982, "pixCents": 4484, "slug": "luva-alpinestars-reef-v2", "brand": "Alpinestars", "kind": "acessorio", "sizes": ["P", "M", "G", "GG"], "image": "/img/luva-alpinestars-reef-v2.webp"},
{"name": "Fone Bluetooth para Capacete Kateluo RGB", "priceCents": 2290, "pixCents": 2061, "slug": "fone-bluetooth-capacete-kateluo", "brand": "Kateluo", "kind": "acessorio", "sizes": ["Único"], "image": "/img/fone-bluetooth-capacete-kateluo.webp"},
{"name": "Viseira NoRisk FF302 Fotocromática Transition", "priceCents": 6413, "pixCents": 5772, "slug": "viseira-norisk-ff302-fotocromatica", "brand": "NoRisk", "kind": "acessorio", "sizes": ["Único"], "image": "/img/viseira-norisk-ff302-fotocromatica.webp"},
{"name": "Viseira NoRisk Flow Fumê", "priceCents": 2796, "pixCents": 2516, "slug": "viseira-norisk-flow-fume", "brand": "NoRisk", "kind": "acessorio", "sizes": ["Único"], "image": "/img/viseira-norisk-flow-fume.webp"},
{"name": "Narigueira Alta Universal para Capacete LS2 e NoRisk", "priceCents": 1860, "pixCents": 1674, "slug": "narigueira-alta-universal", "brand": "NoRisk", "kind": "acessorio", "sizes": ["Único"], "image": "/img/narigueira-alta-universal.webp"},
{"name": "Capacete Aberto NoRisk Orion SV Free Branco/Laranja", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-orion-sv-free-branco-laranja", "brand": "NoRisk", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/norisk-orion-sv-free-branco-laranja.webp"},
{"name": "Capacete Aberto NoRisk City Branco", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-city-branco", "brand": "NoRisk", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/norisk-city-branco.webp"},
{"name": "Capacete Aberto NoRisk City Cinza Fosco", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-city-cinza-fosco", "brand": "NoRisk", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/norisk-city-cinza-fosco.webp"},
{"name": "Capacete Aberto NoRisk City Preto Fosco", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-city-preto-fosco", "brand": "NoRisk", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/norisk-city-preto-fosco.webp"},
{"name": "Capacete Aberto NoRisk Rock Nardo Cinza", "priceCents": 2747, "pixCents": 2472, "slug": "norisk-rock-nardo-cinza", "brand": "NoRisk", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/norisk-rock-nardo-cinza.webp"},
{"name": "Capacete Aberto LS2 OF616 Airflow II Draze", "priceCents": 2747, "pixCents": 2472, "slug": "ls2-of616-airflow-ii-draze", "brand": "LS2", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/ls2-of616-airflow-ii-draze.webp"},
{"name": "Capacete Aberto AGV Blade Tab Italy Branco", "priceCents": 2836, "pixCents": 2552, "slug": "agv-blade-tab-italy-branco", "brand": "AGV", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/agv-blade-tab-italy-branco.webp"},
{"name": "Capacete Aberto AGV Blade Valentino Heart", "priceCents": 2864, "pixCents": 2578, "slug": "agv-blade-valentino-heart", "brand": "AGV", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/agv-blade-valentino-heart.webp"},
{"name": "Capacete Aberto AGV Blade Zoo", "priceCents": 2747, "pixCents": 2472, "slug": "agv-blade-zoo", "brand": "AGV", "kind": "aberto", "sizes": ["54", "56", "58", "60", "62"], "image": "/img/agv-blade-zoo.webp"},
];
export const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
export type CartItem = { slug: string; size: string; quantity: number };
export function cartTotal(items: CartItem[]) { return items.reduce((sum, item) => sum + (products.find(p => p.slug === item.slug)?.pixCents ?? 0) * item.quantity, 0); }
export function addCartItem(items: CartItem[], incoming: CartItem): CartItem[] { const existing = items.find(i => i.slug === incoming.slug && i.size === incoming.size); return existing ? items.map(i => i === existing ? {...i, quantity: i.quantity + incoming.quantity} : i) : [...items, incoming]; }

/** Código de acompanhamento do pedido, derivado do txid (não é código dos Correios). */
export const MEGA_STORE_EMAIL = "contato@megacapacetes.com.br";

export function trackingCode(txid: string): string {
  return "MC" + txid.replace(/[^A-Za-z0-9]/g, "").slice(-10).toUpperCase();
}

export const trackingSteps = [
  { day: 0, title: "Pagamento aprovado", text: "Recebemos seu pagamento." },
  { day: 1, title: "Embalando", text: "Seu capacete está sendo embalado." },
  { day: 3, title: "Coleta", text: "Pedido coletado pela transportadora." },
  { day: 4, title: "Em trânsito", text: "Seu pedido está a caminho." },
  { day: 8, title: "Saiu para entrega", text: "Seu pedido saiu para entrega." },
  { day: 10, title: "Entregue", text: "Previsão de entrega concluída." },
] as const;

/** Etapas já alcançadas, contando os dias desde a aprovação do pagamento. */
export function reachedSteps(paidAtMs: number, nowMs: number): number {
  const days = Math.floor((nowMs - paidAtMs) / 86_400_000);
  return trackingSteps.filter((s) => days >= s.day).length;
}
