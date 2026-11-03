import assert from 'node:assert/strict';
import { returnItem, returnValue } from '../src/shop/inventory';
import { emptyShop, DECORATIONS, UPGRADE_BY_ID, spentStars, shopComplete, collectionUnlocked, canPurchaseCopy } from '../src/shop/upgrades';
import { sanitizeShop } from '../src/shop/grid';
import { exportBackup, parseBackup } from '../src/game/backup';
import { spendableStars } from '../src/game/storage';
import type { Progress, ShopState } from '../src/game/types';

const core = DECORATIONS.filter(d => !d.optional).map(d => d.id);
const progress = (shop: ShopState): Progress => ({muted:false,bestStars:Array(38).fill(3),bestMoves:Array(38).fill(0),shop});
const complete = {...emptyShop(), owned:core, finaleSeen:true};
for (const id of core) {
  assert.equal(returnValue(complete,id),0);
  assert.equal(returnItem(complete,id),null,'core completion purchases cannot be returned');
}
for (const def of DECORATIONS.filter(d=>d.optional)) {
  const shop: ShopState = {...complete, owned:[...core,def.id], stored:[def.id], style:{[def.id]:2}, place:{[def.id]:{...def.defaultPlace}}};
  const before = structuredClone(shop);
  const next = returnItem(shop,def.id)!;
  assert.deepEqual(shop,before,'return must not mutate its input');
  assert.equal(returnValue(shop,def.id),def.cost);
  assert.equal(spendableStars(progress(next))-spendableStars(progress(shop)),def.cost,'exact full-value refund');
  assert.equal(spentStars(next),26);
  assert.equal(shopComplete(next),true);
  assert.equal(next.finaleSeen,true);
  assert.equal(next.stored!.includes(def.id),false);
  assert.equal(next.place[def.id],undefined);
  assert.equal(next.style[def.id],undefined);
  assert.equal(returnItem(next,def.id),null,'duplicate return gives no refund');
  const repurchased = {...next, owned:[...next.owned,def.id]};
  assert.equal(spendableStars(progress(repurchased)),spendableStars(progress(shop)),'buy-return cycle cannot earn stars');
  if(def.unlockAfter) assert.equal(collectionUnlocked(def.id,Array(def.unlockAfter-1).fill(1)),false,'return does not bypass milestone purchase gates');
}

// Returning one optional copy never silently exchanges, renames or moves another.
const copies:ShopState={...complete,owned:[...core,'art','art:2'],stored:['art:2'],style:{art:0,'art:2':2},place:{art:{x:4,z:0,rot:1,wall:'left'},'art:2':{x:5,z:0,rot:1,wall:'left'}}};
const remaining=returnItem(copies,'art')!;
assert.equal(remaining.owned.includes('art:2'),true);
assert.equal(remaining.style['art:2'],2);
assert.deepEqual(remaining.place['art:2'],copies.place['art:2']);
assert.deepEqual(remaining.stored,['art:2']);
assert.equal(canPurchaseCopy(remaining,'art'),true,'first copy can be bought again');
assert.equal(returnValue(remaining,'art:2'),UPGRADE_BY_ID['art:2'].cost);
assert.equal(sanitizeShop(remaining).owned.includes('art:2'),true);
const saved=parseBackup(exportBackup(progress(remaining),null)).progress;
assert.equal(saved.shop.owned.includes('art'),false);
assert.equal(saved.shop.owned.includes('art:2'),true,'backup round-trip keeps surviving independent copy');
assert.equal(saved.shop.style['art:2'],2);
assert.equal(spendableStars(saved),spendableStars(progress(remaining)));
assert.equal(returnItem(emptyShop(),'clock'),null);
console.log('Optional exchanges: exact refunds, no farming, core protection, stored cleanup, independent copies, milestone gates and backup persistence passed.');
