import { LEVEL_COUNT } from "./types";
import { isSecondEdition } from './mode';
import { normalizeProgress, totalStars } from './storage';
import { collectionUnlocked, DECORATIONS, spentStars } from '../shop/upgrades';
import { validatePuzzle, type PuzzleSave } from './resume';
import type { Progress } from './types';
// The optional discriminator keeps version-one files readable while preventing
// future sequences of the same length from being mistaken for each other.
export interface Backup {format:'decopu-save';version:1;edition?:'classic'|'second-edition';exportedAt:string;progress:Progress;puzzle:PuzzleSave|null}
export function exportBackup(progress:Progress,puzzle:PuzzleSave|null):string {
 return JSON.stringify({format:'decopu-save',version:1,edition:isSecondEdition?'second-edition':'classic',exportedAt:new Date().toISOString(),progress,puzzle},null,2);
}
export function parseBackup(text:string):Backup {
 if(text.length>2_000_000)throw new Error('This file is too large. Choose a Decopu backup.');
 let b:Backup;try {b=JSON.parse(text);} catch {throw new Error('This file is not a readable backup.');}
 if(b?.format!=='decopu-save'||b.version!==1)throw new Error('Choose a supported Decopu backup (version 1).');
 const edition=isSecondEdition?'second-edition':'classic';
 if(b.edition!==undefined&&b.edition!==edition)throw new Error('Choose a backup for this edition of Decopu. Nothing was changed.');
 const p=b.progress;
 // Preview.1–4 had ten boards; preview.5–6 had sixteen. Only known historical
 // sequence lengths may be padded; arbitrary short files remain invalid.
 const count=Array.isArray(p?.bestStars)?p.bestStars.length:0;
 const legacy=isSecondEdition&&[10,16].includes(count)&&count<LEVEL_COUNT;
 if(!p||!Array.isArray(p.bestStars)||(count!==LEVEL_COUNT&&!legacy)||!p.bestStars.every(n=>Number.isInteger(n)&&n>=0&&n<=3)||!Array.isArray(p.bestMoves)||p.bestMoves.length!==count||!p.bestMoves.every(n=>Number.isSafeInteger(n)&&n>=0)||!p.shop||!Array.isArray(p.shop.owned)||p.shop.owned.some(id=>!DECORATIONS.some(d=>d.id===id&&(!legacy||(d.unlockAfter??0)<=count)))||new Set(p.shop.owned).size!==p.shop.owned.length)throw new Error('The backup contains invalid progress. Nothing was changed.');
 if(legacy&&b.puzzle!==null&&(!b.puzzle||b.puzzle.levelId>count))throw new Error('The saved puzzle is invalid. Nothing was changed.');
 if(isSecondEdition&&p.shop.owned.some(id=>!collectionUnlocked(id,p.bestStars)))throw new Error('The backup contains a decoration that is still locked. Nothing was changed.');
 if(spentStars(p.shop)>totalStars(p))throw new Error('The backup has an invalid star balance. Nothing was changed.');
 const progress=normalizeProgress(p), puzzle=b.puzzle===null?null:validatePuzzle(b.puzzle,progress);
 if(b.puzzle!==null&&!puzzle)throw new Error('The saved puzzle is invalid. Nothing was changed.');
 return {...b,progress,puzzle:puzzle?.save??null};
}
