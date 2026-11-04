import { LEVEL_COUNT } from "./types";
import { normalizeProgress, totalStars } from './storage';
import { DECORATIONS, spentStars } from '../shop/upgrades';
import { validatePuzzle, type PuzzleSave } from './resume';
import type { Progress } from './types';
export interface Backup {format:'decopu-save';version:1;exportedAt:string;progress:Progress;puzzle:PuzzleSave|null}
export function exportBackup(progress:Progress,puzzle:PuzzleSave|null):string {
 return JSON.stringify({format:'decopu-save',version:1,exportedAt:new Date().toISOString(),progress,puzzle},null,2);
}
export function parseBackup(text:string):Backup {
 if(text.length>2_000_000)throw new Error('This file is too large. Choose a Decopu backup.');
 let b:Backup;try {b=JSON.parse(text);} catch {throw new Error('This file is not a readable backup.');}
 if(b?.format!=='decopu-save'||b.version!==1)throw new Error('Choose a supported Decopu backup (version 1).');
 const p=b.progress;
 if(!p||!Array.isArray(p.bestStars)||p.bestStars.length!==LEVEL_COUNT||!p.bestStars.every(n=>Number.isInteger(n)&&n>=0&&n<=3)||!Array.isArray(p.bestMoves)||p.bestMoves.length!==LEVEL_COUNT||!p.bestMoves.every(n=>Number.isSafeInteger(n)&&n>=0)||!p.shop||!Array.isArray(p.shop.owned)||p.shop.owned.some(id=>!DECORATIONS.some(d=>d.id===id))||new Set(p.shop.owned).size!==p.shop.owned.length)throw new Error('The backup contains invalid progress. Nothing was changed.');
 if(spentStars(p.shop)>totalStars(p))throw new Error('The backup has an invalid star balance. Nothing was changed.');
 const progress=normalizeProgress(p), puzzle=b.puzzle===null?null:validatePuzzle(b.puzzle,progress);
 if(b.puzzle!==null&&!puzzle)throw new Error('The saved puzzle is invalid. Nothing was changed.');
 return {...b,progress,puzzle:puzzle?.save??null};
}
