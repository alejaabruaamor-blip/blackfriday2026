import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { addCartItem, cartTotal, products } from "./mega-store";

// Pre-promotion prices from the reference store (integer cents).
const BASE_CENTS: Record<string, number> = {
  "norisk-razor-black-edition": 19790,
  "norisk-darth-ii-preto-fosco": 29790,
  "norisk-ff302-preto-fosco": 27890,
  "norisk-soul-ii-manty-rosa": 20990,
  "norisk-soul-ii-grand-prix-italy": 21390,
  "norisk-soul-ii-grand-prix-argentina": 27490,
  "norisk-soul-ii-grand-prix-brazil": 26290,
  "norisk-soul-ii-grand-prix-japan": 26690,
  "norisk-soul-ii-grand-prix-france": 27090,
  "norisk-soul-ii-grand-prix-south-africa": 25490,
  "norisk-soul-ii-grand-prix-uk": 25890,
  "norisk-soul-ii-grand-prix-usa": 25090,
  "norisk-soul-ii-manty-cinza": 20590,
  "norisk-speed-max-rosa-roxo": 23990,
  "norisk-speed-max-branco-tiffany": 23590,
  "norisk-speed-max-vermelho-cinza": 24790,
  "ls2-classic-draze-preto-vermelho": 22990,
  "ls2-classic-tank-preto": 25190,
  "ls2-ff358-speed-race-preto-branco": 22690,
  "ls2-ff358-speed-race-italia": 24290,
  "ls2-classic-tank-vermelho": 22990,
  "ls2-gray-tank": 24590,
};

const discountOf = (slug: string, priceCents: number) => {
  const base = BASE_CENTS[slug];
  if (!base) throw new Error(`missing base price for ${slug}`);
  return priceCents / (base * 0.9);
};

const helmets = products.filter(p => !p.kind);

describe("Mega Capacetes prices", () => {
  test("reference starting offer is R$ 35,62 (80% off)", () => {
    assert.equal(products.find(p => p.slug === "norisk-razor-black-edition")?.priceCents, 3562);
  });
  test("PIX has a 10 percent discount", () => {
    for (const product of products) assert.equal(product.pixCents, Math.round(product.priceCents * 0.9));
  });
  test("every helmet is 80% off", () => {
    assert.equal(helmets.length, 22);
    for (const p of helmets) assert.ok(Math.abs(discountOf(p.slug, p.priceCents) - 0.2) < 0.005, `${p.slug} is not 80% off`);
  });
  test("new collections: 8 jackets, 5 accessories, 9 open helmets", () => {
    assert.equal(products.filter(p => p.kind === "jaqueta").length, 8);
    assert.equal(products.filter(p => p.kind === "acessorio").length, 5);
    assert.equal(products.filter(p => p.kind === "aberto").length, 9);
    assert.equal(products.find(p => p.slug === "norisk-tornado-preto")?.priceCents, 2747);
    assert.equal(products.find(p => p.slug === "narigueira-alta-universal")?.pixCents, 670);
  });
  test("cart total uses the actual discounted price and quantity", () => {
    assert.equal(cartTotal([{ slug: "norisk-razor-black-edition", size: "58", quantity: 2 }]), 6412);
  });
  test("same product and size merge without mixing different sizes", () => {
    const original = [{ slug: "norisk-razor-black-edition", size: "58", quantity: 1 }];
    assert.deepEqual(addCartItem(original, { slug: "norisk-razor-black-edition", size: "58", quantity: 1 }), [{ slug: "norisk-razor-black-edition", size: "58", quantity: 2 }]);
    assert.equal(addCartItem(original, { slug: "norisk-razor-black-edition", size: "60", quantity: 1 }).length, 2);
  });
});
