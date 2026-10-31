import assert from 'node:assert/strict';
import { canPlace, sanitizeShop, counterCells, inRoom } from '../src/shop/grid';
import { emptyShop, placeOf } from '../src/shop/upgrades';
const shop = emptyShop();
shop.owned = ['counter', 'lamp'];
shop.place.counter = {x:1,z:1,rot:0};
for (const z of [0,1]) for (const x of [1,2,3]) {
  assert.equal(canPlace('lamp', {x,z,rot:0}, shop), false, 'counter and working aisle stay clear');
}
shop.place.counter={x:2,z:3,rot:0};
assert.equal(canPlace('lamp',{x:1,z:0,rot:0},shop),true,'old counter area is freed');
assert.equal(canPlace('lamp',{x:3,z:2,rot:0},shop),false,'working aisle follows moved counter');
for(let rot=0;rot<4;rot++) {
  const place={x:2,z:2,rot};
  assert.equal(counterCells(place).length,6);
  assert.ok(counterCells(place).every(inRoom));
  assert.equal(canPlace('counter',place,{...shop,owned:['counter']}),true);
}
assert.equal(canPlace('counter',{x:1,z:0,rot:0},shop),false,'cannot put owner outside room');
shop.place.counter={x:1,z:0,rot:0};
const clean=sanitizeShop(shop);
assert.equal(canPlace('counter',placeOf(clean,'counter'),clean),true,'legacy placement receives a valid aisle');
const wallShop=emptyShop();wallShop.owned=['shelves','clock'];
assert.equal(canPlace('shelves',{x:1,z:0,wall:'left',rot:1},wallShop),true);
wallShop.place.shelves={x:1,z:0,wall:'left',rot:1};
assert.equal(canPlace('clock',{x:1,z:0,wall:'left',rot:1},wallShop),false);
assert.equal(canPlace('clock',{x:1,z:0,wall:'back',rot:0},wallShop),true);
console.log('Movable counter/aisle, legacy saves, shelf walls and collision checks passed.');
