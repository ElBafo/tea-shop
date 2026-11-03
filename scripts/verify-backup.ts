import assert from 'node:assert/strict';
import { parseBackup, exportBackup } from '../src/game/backup';
import { loadProgress, saveProgress, totalStars, spendableStars } from '../src/game/storage';
import { readPuzzle, writePuzzle, validatePuzzle } from '../src/game/resume';
import { emptyShop, collectionUnlocked, DECORATIONS } from '../src/shop/upgrades';
import { STORAGE_KEY, type Progress } from '../src/game/types';
const values=new Map<string,string>();
Object.assign(globalThis,{localStorage:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v),removeItem:(k:string)=>values.delete(k)},window:new EventTarget()});
const p:Progress={muted:false,bestStars:Array(38).fill(0),bestMoves:Array(38).fill(0),shop:emptyShop()};
const puzzle={version:1 as const,levelId:1,actions:[[0,2]] as [number,number][]};
const round=parseBackup(exportBackup(p,puzzle));assert.deepEqual(round.progress,p);assert.deepEqual(round.puzzle,puzzle);
assert.equal(validatePuzzle(puzzle,p)?.history.length,1);
assert.equal(validatePuzzle({...puzzle,actions:[[0,0]]},p),null);
assert.equal(validatePuzzle({...puzzle,levelId:8},p),null,'cannot import a locked puzzle');
assert.throws(()=>parseBackup('{broken'));
assert.throws(()=>parseBackup(JSON.stringify({format:'decopu-save',version:99,progress:p,puzzle:null})));
assert.throws(()=>parseBackup(exportBackup({...p,shop:{...p.shop,owned:['cabinet']}},null)),'negative star balance rejected');
p.bestStars[0]=3;saveProgress(p);p.bestStars[1]=2;saveProgress(p);
assert.equal(loadProgress().bestStars[1],2);
values.set(STORAGE_KEY,'{damaged');assert.equal(loadProgress().bestStars[0],3,'damaged primary recovers previous save');assert.equal(loadProgress().bestStars[1],0);
writePuzzle(puzzle);assert.equal(readPuzzle(p)?.save.actions.length,1);writePuzzle(null);assert.equal(readPuzzle(p),null);
for(const [id,count] of [['terrarium',8],['botanical',16],['cabinet',24]] as const){assert.equal(collectionUnlocked(id,Array(count-1).fill(3)),false);assert.equal(collectionUnlocked(id,Array(count).fill(1)),true,'milestone needs completion, not perfect scores');}
let failed=false;window.addEventListener('decopu-save-failed',()=>failed=true);localStorage.setItem=()=>{throw Error('quota');};assert.equal(saveProgress(p),false);assert.equal(failed,true);
console.log('Backup round-trip, invalid import, recovery, resume replay, storage failure and milestone gates passed.');

const veteran={...p,bestStars:Array(38).fill(3),shop:{...emptyShop(),owned:DECORATIONS.filter(d=>!d.collection).map(d=>d.id)}};
assert.equal(totalStars(veteran),132,'114 puzzle stars plus 18 retroactive chapter stars');
assert.equal(spendableStars(veteran),20,'existing complete collectors can afford any new piece');
veteran.shop.owned.push('cabinet');assert.equal(parseBackup(exportBackup(veteran,null)).progress.shop.owned.includes('cabinet'),true);
for(const count of [7,8,15,16,23,24,38]){
 const scores=Array.from({length:38},(_,i)=>i<count?1:0);
 assert.equal(totalStars({...p,bestStars:scores}),count+(count>=8?4:0)+(count>=16?6:0)+(count>=24?8:0));
}
console.log('Retroactive chapter bonuses and veteran purchasing power passed.');
