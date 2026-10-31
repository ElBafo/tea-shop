import assert from 'node:assert/strict';
import { canPlace, sanitizeShop } from '../src/shop/grid';
import { emptyShop, placeOf } from '../src/shop/upgrades';
const shop = emptyShop();
assert.equal(placeOf(shop, 'counter').z, 1);
shop.owned = ['counter', 'lamp'];
shop.place.counter = {x:1,z:0,rot:0};
assert.equal(placeOf(shop, 'counter').z, 1, 'old fixed counter positions migrate to the new aisle layout');
for (const z of [0,1]) for (const x of [1,2,3]) {
  assert.equal(canPlace('lamp', {x,z,rot:0}, shop), false, 'counter and working aisle stay clear');
}
shop.place.lamp = {x:2,z:1,rot:0};
const sanitized = sanitizeShop(shop);
assert.equal(canPlace('lamp',placeOf(sanitized,'lamp'),sanitized),true,'existing furniture is moved to a legal position');
console.log('Counter aisle and existing-layout migration checks passed.');
