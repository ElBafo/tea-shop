import assert from 'node:assert/strict';
import { catalogueForMode, EDITION_DECORATIONS, UPGRADES, shopComplete, spentStars, emptyShop } from '../src/shop/upgrades';
import { EDITION_LEVELS, EDITION_MILESTONE_BONUSES } from '../src/game/edition-levels';
import { editionShowroomShop } from '../src/game/preview';
import { canPlace, sanitizeShop } from '../src/shop/grid';
import { returnItem, returnValue } from '../src/shop/inventory';
import type { ShopState, UpgradeId } from '../src/game/types';

const classic = catalogueForMode(false), edition = catalogueForMode(true);
assert.equal(classic.decorations.length, 24);
assert.equal(edition.decorations.length, 16);
assert.equal(new Set(edition.decorations.map(d => d.id)).size,16);
assert.ok(edition.decorations.every(d => !d.id.includes(':')), 'No second copies added to the prototype');
assert.equal(edition.decorations.reduce((sum,d) => sum+d.cost,0),104);
const extras: [UpgradeId, number, number][] = [
  ['bench',6,3], ['art',8,3], ['trolley',8,6], ['clock',10,6], ['planter',10,10], ['basket',12,10],
  ['terrarium',10,13], ['botanical',14,16],
];
for (const [id,cost,after] of extras) {
  const item=edition.byId[id];
  assert.equal(item,edition.decorations.find(d=>d.id===id),'Registry and displayed item must use the same override');
  assert.equal(item.cost,cost);
  assert.equal(item.unlockAfter,after);
  assert.equal(item.optional,true);
  assert.equal(item.variants.length,3);
  assert.equal(classic.byId[id].unlockAfter,id==='terrarium'?8:id==='botanical'?16:undefined,'Classic gates remain unchanged');
  assert.equal(classic.byId[id],UPGRADES.find(d=>d.id===id),'Mode selection must not mutate original definitions');
  assert.notEqual(item,classic.byId[id],'Edition gates belong to a clone');
}
for (const id of ['cabinet','armchair','fountain'] as UpgradeId[]) {
  assert.equal(edition.decorations.some(item=>item.id===id),false,'Later collections remain outside this preview');
  assert.equal(classic.byId[id],edition.byId[id],'Registry retains shared definitions without exposing them for purchase');
}
const core=edition.decorations.filter(d=>!d.optional);
assert.equal(core.length,8);
assert.equal(core.reduce((sum,d)=>sum+d.cost,0),26);
assert.deepEqual(core,UPGRADES.filter(d=>!d.optional),'Preview.1 core definitions/prices/placements unchanged');
const bonus=EDITION_MILESTONE_BONUSES.reduce((sum,m)=>sum+m.stars,0);
const minimum=EDITION_LEVELS.length+bonus, maximum=EDITION_LEVELS.length*3+bonus;
assert.equal(minimum,36);assert.equal(maximum,68);
assert.equal(minimum-26,10,'All one-star finishes fund the core and Glass garden');
assert.equal(maximum-26,42,'Optional collection is still a choice within earnings');
assert.equal(extras.reduce((sum,entry)=>sum+entry[1],0),78);
assert.ok(maximum<edition.decorations.reduce((sum,d)=>sum+d.cost,0),'Collecting everything simultaneously is outside the budget');
for(const [id,cost] of extras) {
  assert.ok(cost<=maximum-26,`${id} can be earned alongside the complete core room`);
  const onlyExtra:ShopState={...emptyShop(),owned:[id],style:{[id]:2},place:{[id]:{...edition.byId[id].defaultPlace}}};
  assert.equal(returnValue(onlyExtra,id),cost);
  const returned=returnItem(onlyExtra,id)!;
  assert.equal(spentStars(returned),0,'Optional spending can be reclaimed to finish the core');
  assert.deepEqual(returned.owned,[]);
  assert.equal(returnItem(returned,id),null,'A returned piece cannot refund twice');
}
// A saved preview.1 core collection retains ownership, styles and valid layout.
const old:ShopState={...emptyShop(),owned:core.map(d=>d.id),style:Object.fromEntries(core.map((d,i)=>[d.id,i%3])),place:Object.fromEntries(core.map(d=>[d.id,{...d.defaultPlace}])),finaleSeen:true};
const snapshot=JSON.stringify(old), normalized=sanitizeShop(old);
assert.equal(JSON.stringify(old),snapshot,'Sanitization cannot mutate saved input');
assert.deepEqual(normalized,old);
assert.equal(shopComplete(normalized),true);
assert.equal(spentStars(normalized),26);
assert.equal(returnValue(normalized,'counter'),0,'Core purchases remain permanent');
const showroom=editionShowroomShop();
assert.equal(showroom.owned.length,16);
assert.deepEqual(showroom.stored,[]);
for(const id of showroom.owned) assert.equal(canPlace(id,showroom.place[id]!,showroom),true,`${id} showroom placement is legal`);
assert.deepEqual(sanitizeShop(showroom),showroom,'The demo must not silently move or store pieces');
assert.equal(EDITION_DECORATIONS,edition.decorations);
console.log('PASS: 16-piece edition catalogue, unchanged classic definitions, 3/6/10/13/16 unlocks, 36–68-star budget, optional full returns, preview.1 core compatibility and legal full showroom.');
