import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_SPINS, promotionDiscount, spinOutcome, WHEEL_LABELS } from './promotion';
import { cartTotal, products } from './mega-store';
describe('Promoção Black Friday', () => {
 test('primeira tentativa para em tente novamente', () => { const result = spinOutcome(0); assert.equal(result?.discount, null); assert.equal(WHEEL_LABELS[result?.sector ?? -1], 'Tente novamente'); });
 test('segunda tentativa para em 75%', () => { const result = spinOutcome(1); assert.equal(result?.discount, 75); assert.equal(WHEEL_LABELS[result?.sector ?? -1], '75%'); assert.equal(result?.rotation, 3667.5); });
 test('limite de duas tentativas', () => { assert.equal(MAX_SPINS, 2); assert.equal(spinOutcome(2), null); assert.equal(spinOutcome(3), null); });
 test('75% em todos os 31 capacetes, não em acessórios e jaquetas', () => { const eligible = products.filter(p => promotionDiscount(p) === 75); assert.equal(eligible.length, 31); assert.equal(products.filter(p => promotionDiscount(p) === null).length, 13); });
 test('preço atual e total Pix não recebem desconto adicional', () => { assert.equal(products[0]?.priceCents, 5700); assert.equal(products[0]?.pixCents, 5130); assert.equal(cartTotal([{ slug:'norisk-razor-black-edition', size:'58', quantity:2 }]), 10260); });
});
