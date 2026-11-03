import assert from 'node:assert/strict';
import { nextReward, milestoneAt, chapterBonus, bonusAt } from '../src/game/journey';
import { DECORATIONS, emptyShop, spentStars, collectionUnlocked } from '../src/shop/upgrades';
import { spendableStars, totalStars } from '../src/game/storage';
import { returnItem } from '../src/shop/inventory';
import type { Progress, UpgradeId } from '../src/game/types';

const progress = (count:number):Progress => ({muted:false,bestStars:Array.from({length:38},(_,i)=>i<count?1:0),bestMoves:Array(38).fill(0),shop:emptyShop()});
const milestones: [UpgradeId,number,number][] = [['terrarium',8,10],['botanical',16,14],['cabinet',24,18],['armchair',32,16],['fountain',38,20]];
assert.deepEqual(DECORATIONS.filter(d=>d.unlockAfter).map(d=>[d.id,d.unlockAfter,d.cost]),milestones,'a purchasable reward at every chapter endpoint');
for (const [id,count,cost] of milestones) {
  const before=progress(count-1);
  const goal=nextReward(before)!;
  assert.equal(goal.item.id,id);
  assert.equal(goal.done,count-1);
  assert.equal(collectionUnlocked(id,before.bestStars),false);
  const at=progress(count);
  assert.equal(collectionUnlocked(id,at.bestStars),true,'one-star completions unlock collections');
  assert.ok(milestoneAt(count)?.includes(`Available to buy for ${cost}`),'unlock must not imply free ownership');
  assert.equal(at.shop.owned.includes(id),false,'unlocking never silently grants ownership');
}
for(const [count,id] of [[0,'terrarium'],[8,'botanical'],[16,'cabinet'],[24,'armchair'],[32,'fountain'],[38,'terrarium']] as const) {
  assert.equal(nextReward(progress(count))?.item.id,id,'progression moves to next milestone, then unowned choices');
}
const finished=progress(38);
for(const [id] of milestones) {
  assert.equal(nextReward(finished)?.item.id,id,'finished journey offers the first unowned milestone piece');
  finished.shop.owned.push(id);
}
assert.equal(nextReward(finished),null,'no misleading reward after collection is owned');
finished.shop=returnItem(finished.shop,'cabinet')!;
assert.equal(nextReward(finished)?.item.id,'cabinet','returned reward becomes a choice again');

assert.equal(bonusAt(32),0);
assert.equal(bonusAt(38),0);
assert.equal(chapterBonus(progress(38)),18,'late rewards do not inflate earned stars');
assert.equal(totalStars(progress(38)),56,'minimum journey budget is 38 finish stars plus 18 milestones');
const max={...progress(38),bestStars:Array(38).fill(3)};
assert.equal(totalStars(max),132);
const core=DECORATIONS.filter(d=>!d.optional).map(d=>d.id);
const base={...emptyShop(),owned:core};
assert.equal(spentStars(base),26);
assert.equal(spentStars({...emptyShop(),owned:DECORATIONS.map(d=>d.id)}),190);
const poorestFinisher={...progress(38),shop:base};
assert.ok(spendableStars(poorestFinisher)>=Math.max(...milestones.map(([, ,cost])=>cost)),'even minimum scores fund core room plus any one milestone reward');
const veteran={...max,shop:{...emptyShop(),owned:DECORATIONS.filter(d=>!d.collection).map(d=>d.id)}};
assert.equal(spendableStars(veteran),20,'legacy complete collectors can buy the 20-star finale without refunding anything');
console.log('Reward boundaries, paid unlocks, ownership fallback, exchange rediscovery, unchanged bonuses and minimum/veteran affordability passed.');
