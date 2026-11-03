import { LEVELS } from './levels';
import { applyMove, boardFromLevel, cloneBoard, isWon } from './engine';
import { isGuidePreview, isShowroom } from './preview';
import { STORAGE_KEY, type Board, type Progress } from './types';
export interface PuzzleSave { version: 1; levelId: number; actions: [number,number][] }
const key=STORAGE_KEY+':puzzle-v1';
let session: PuzzleSave | null | undefined;
export function validatePuzzle(raw: unknown, progress: Progress): {save:PuzzleSave;board:Board;history:Board[]} | null {
  if(!raw || typeof raw!=='object')return null;
  const s=raw as PuzzleSave, level=LEVELS[s.levelId-1];
  if(s.version!==1 || !level || !Number.isInteger(s.levelId) || (s.levelId>1&&!progress.bestStars[s.levelId-2]) || !Array.isArray(s.actions) || s.actions.length>5000)return null;
  const board=boardFromLevel(level), history:Board[]=[];
  for(const a of s.actions) {
    if(!Array.isArray(a)||a.length!==2||!a.every(n=>Number.isInteger(n)&&n>=0&&n<board.tubes.length)||isWon(board))return null;
    history.push(cloneBoard(board));if(!applyMove(board,a[0],a[1]))return null;
  }
  if(isWon(board))return null;
  return {save:{version:1,levelId:s.levelId,actions:s.actions.map(a=>[...a])},board,history};
}
export function readPuzzle(progress:Progress) {
  if(isGuidePreview||isShowroom)return null;
  try {return validatePuzzle(session===undefined?JSON.parse(localStorage.getItem(key)??'null'):session,progress);} catch{return null;}
}
export function writePuzzle(save:PuzzleSave|null):void {
  if(isGuidePreview||isShowroom)return;
  session=save?structuredClone(save):null;
  try {if(save)localStorage.setItem(key,JSON.stringify(save));else localStorage.removeItem(key);}catch{window.dispatchEvent(new Event('decopu-save-failed'));}
}
