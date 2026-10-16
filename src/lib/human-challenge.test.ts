import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { validHumanAnswer } from './human-challenge';
test('5 + 2 requires 7', () => {
  assert.equal(validHumanAnswer('7', 5, 2), true);
  assert.equal(validHumanAnswer('8', 5, 2), false);
});
test('empty and malformed answers cannot enter', () => {
  for (const value of ['', ' ', '7abc', '7.0', '-7']) assert.equal(validHumanAnswer(value, 5, 2), false);
});
