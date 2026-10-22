import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { postSaleCollections } from './post-sale-products';

describe('Produtos do pós-venda', () => {
  test('mostra todas as jaquetas e acessórios, sem capacetes', () => {
    assert.equal(postSaleCollections[0]?.products.length, 8);
    assert.equal(postSaleCollections[1]?.products.length, 5);
    for (const product of postSaleCollections.flatMap(collection => collection.products)) {
      assert.ok(product.kind === 'jaqueta' || product.kind === 'acessorio');
    }
  });
});
