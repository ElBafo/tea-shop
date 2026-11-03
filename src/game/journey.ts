import { LEVELS } from './levels';
import { DECORATIONS } from '../shop/upgrades';
import type { Progress } from './types';
export const CHAPTERS=[
 {name:'First light',start:1,end:8,copy:'Open the shutters. Find your rhythm.'},
 {name:'Afternoon ritual',start:9,end:16,copy:'A few more colours. A place that feels like yours.'},
 {name:'The collector’s corner',start:17,end:24,copy:'Taller jars and something special to save for.'},
 {name:'A full house',start:25,end:32,copy:'Make room for your favourite pieces.'},
 {name:'Your signature shop',start:33,end:38,copy:'The final shelves. Your own little world.'},
];
export function nextGoal(progress:Progress):string {
 const done=progress.bestStars.filter(n=>n>0).length;
 const reward=DECORATIONS.find(d=>d.unlockAfter && d.unlockAfter>done);
 if(reward)return `${reward.unlockAfter!-done} more puzzles · +${bonusAt(reward.unlockAfter!)} chapter stars & ${reward.moveName} unlock (${reward.cost} ✦ to buy)`;
 if(done<LEVELS.length)return `${LEVELS.length-done} puzzles to complete your tea shop journey`;
 return 'Journey complete · Improve your stars or create a new room arrangement';
}
export function milestoneAt(count:number):string|null {
 const reward=DECORATIONS.find(d=>d.unlockAfter===count);
 if(reward)return `${reward.title} unlocked · ${bonusAt(count)} chapter stars included in your reward · ${reward.cost} ✦ to buy`;
 if(count===32)return 'A full house complete · Your final chapter awaits';
 if(count===38)return 'All 38 puzzles complete. Your signature shop is ready to share.';
 return null;
}

// Derived from completed puzzles: retroactive for existing saves and never farmable.
export function chapterBonus(progress:Progress):number {
 const count=progress.bestStars.filter(n=>n>0).length;
 return (count>=8?4:0)+(count>=16?6:0)+(count>=24?8:0);
}
export function bonusAt(count:number):number {return count===8?4:count===16?6:count===24?8:0;}
