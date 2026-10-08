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

// Only these 3 models carry the 70% offer; every other model stays at 50%.
const SEVENTY = ["norisk-speed-max-rosa-roxo", "norisk-speed-max-branco-tiffany", "norisk-speed-max-vermelho-cinza"];

const discountOf = (slug: string, priceCents: number) => {
  const base = BASE_CENTS[slug];
  if (!base) throw new Error(`missing base price for ${slug}`);
  return priceCents / (base * 0.9);
};

describe("Mega Capacetes prices", () => {
  test("reference starting offer is R$ 89.06 (50% off the R$ 178.12 base)", () => {
    assert.equal(products.find(p => p.slug === "norisk-razor-black-edition")?.priceCents, 8906);
  });
  test("reference PIX offer has a 10 percent discount", () => {
    assert.equal(products.find(p => p.slug === "norisk-razor-black-edition")?.pixCents, 8015);
    for (const product of products) assert.equal(product.pixCents, Math.round(product.priceCents * 0.9));
  });
  test("only 3 models carry the 70% offer", () => {
    assert.equal(products.length, 22);
    const deep = products.filter(p => Math.abs(discountOf(p.slug, p.priceCents) - 0.3) < 0.005).map(p => p.slug).sort();
    assert.deepEqual(deep, [...SEVENTY].sort());
  });
  test("the other 19 models stay at the 50% offer", () => {
    const shallow = products.filter(p => !SEVENTY.includes(p.slug));
    assert.equal(shallow.length, 19);
    for (const product of shallow) assert.ok(Math.abs(discountOf(product.slug, product.priceCents) - 0.5) < 0.005, `${product.slug} is not 50% off`);
  });
  test("the 70% models cost exactly what the store shows", () => {
    assert.equal(products.find(p => p.slug === "norisk-speed-max-rosa-roxo")?.priceCents, 6478);
    assert.equal(products.find(p => p.slug === "norisk-speed-max-branco-tiffany")?.priceCents, 6370);
    assert.equal(products.find(p => p.slug === "norisk-speed-max-vermelho-cinza")?.priceCents, 6694);
  });
  test("cart total uses the actual discounted price and quantity", () => {
    assert.equal(cartTotal([{ slug: "norisk-razor-black-edition", size: "58", quantity: 2 }]), 16030);
  });
  test("same product and size merge without mixing different sizes", () => {
    const original = [{ slug: "norisk-razor-black-edition", size: "58", quantity: 1 }];
    assert.deepEqual(addCartItem(original, { slug: "norisk-razor-black-edition", size: "58", quantity: 1 }), [{ slug: "norisk-razor-black-edition", size: "58", quantity: 2 }]);
    assert.equal(addCartItem(original, { slug: "norisk-razor-black-edition", size: "60", quantity: 1 }).length, 2);
  });
});
