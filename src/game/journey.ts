import { EDITION_ARCS, EDITION_MILESTONE_BONUSES } from "./edition-levels";
import { isSecondEdition } from "./mode";
import { readGoal } from "./goal";
import { DECORATIONS } from '../shop/upgrades';
import type { Progress } from './types';
export const CHAPTERS=isSecondEdition ? EDITION_ARCS : [
 {name:'First light',start:1,end:8,copy:'Open the shutters. Find your rhythm.'},
 {name:'Afternoon ritual',start:9,end:16,copy:'A few more colours. A place that feels like yours.'},
 {name:'The collector’s corner',start:17,end:24,copy:'Taller jars and something special to save for.'},
 {name:'A full house',start:25,end:32,copy:'Make room for your favourite pieces.'},
 {name:'Your signature shop',start:33,end:38,copy:'The final shelves. Your own little world.'},
];
export function nextReward(progress: Progress) {
 const done = progress.bestStars.filter(n => n > 0).length;
 if (isSecondEdition) {
   const pinned = readGoal(progress);
   const unowned = DECORATIONS.filter(item => !progress.shop.owned.includes(item.id));
   const item = DECORATIONS.find(item => item.id === pinned?.id)
     ?? unowned.find(item => !item.optional)
     ?? unowned.find(item => (item.unlockAfter ?? 0) <= done)
     ?? unowned[0];
   return item ? {item, done} : null;
 }
 const milestones = DECORATIONS.filter(item => item.unlockAfter);
 const item = milestones.find(item => item.unlockAfter! > done)
   ?? milestones.find(item => !progress.shop.owned.includes(item.id));
 return item ? {item, done} : null;
}
export function nextGoal(progress: Progress): string {
 const goal = nextReward(progress);
 if (!goal) return 'All special pieces collected. Try a new arrangement.';
 const remaining = Math.max(0, (goal.item.unlockAfter ?? 0) - goal.done);
 return `${goal.item.title} · ${remaining ? `${remaining} puzzles to unlock` : `Available to buy for ${goal.item.cost} ✦`}`;
}
export function milestoneAt(count:number):string|null {
 if (isSecondEdition) return count===3 ? '+4 stars · Bench and framed print now available to buy' : count===6 ? '+5 stars · Tea trolley and wall clock now available to buy' : count===10 ? '+7 stars · Planter and cozy basket now available to buy' : count===13 ? 'Glass garden unlocked · Available to buy for 10 ✦' : count===16 ? '+4 stars · Botanical triptych unlocked · Available to buy for 14 ✦' : null;
 const reward=DECORATIONS.find(d=>d.unlockAfter===count);
 if(reward)return `${reward.title} unlocked · Available to buy for ${reward.cost} ✦${bonusAt(count) ? ` · +${bonusAt(count)} milestone stars` : ""}`;
 if(count===32)return 'A full house complete · Your final shelves await';
 if(count===38)return 'All 38 puzzles complete. Your signature shop is ready to share.';
 return null;
}

// Derived from completed puzzles: retroactive for existing saves and never farmable.
export function chapterBonus(progress:Progress):number {
 const count=progress.bestStars.filter(n=>n>0).length;
 if (isSecondEdition) return EDITION_MILESTONE_BONUSES.reduce((sum,m)=>sum+(count>=m.after?m.stars:0),0);
 return (count>=8?4:0)+(count>=16?6:0)+(count>=24?8:0);
}
export function bonusAt(count:number):number {if(isSecondEdition)return EDITION_MILESTONE_BONUSES.find(m=>m.after===count)?.stars??0;return count===8?4:count===16?6:count===24?8:0;}
