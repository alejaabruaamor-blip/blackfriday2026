import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { safeStoreReturn } from './human-challenge';
test('separate verification preserves the product and campaign', () => {
  assert.equal(safeStoreReturn('/produto/norisk-razor-black-edition?utm_source=tiktok'), '/produto/norisk-razor-black-edition?utm_source=tiktok');
});
test('verification never returns to another domain or itself', () => {
  for (const value of [undefined, 'https://example.com', '//example.com', '/\\example.com', '/verificacao?returnTo=/']) assert.equal(safeStoreReturn(value), '/');
});
