import { exportBackup, parseBackup, type Backup } from '../game/backup';
import { readPuzzle, writePuzzle } from '../game/resume';
import { saveProgress } from '../game/storage';
import { isGuidePreview, isShowroom } from '../game/preview';
import type { Progress } from '../game/types';
export function openBackups(progress:Progress,onImport:(p:Progress)=>void):void {
 if(isGuidePreview||isShowroom)return;
 const dialog=document.createElement('dialog');dialog.className='backup-dialog';dialog.setAttribute('aria-labelledby','backup-title');
 dialog.innerHTML=`<form method="dialog"><button class="icon-btn backup-close" aria-label="Close backups">×</button></form><h2 id="backup-title">Your progress</h2><p>Save a backup to Files or iCloud Drive. Import it on another device to continue. Backups are manual; there is no account sync.</p><button type="button" data-export>Save backup file</button><label class="backup-picker">Choose backup to restore<input type="file" accept="application/json,.json" data-import></label><p role="status" data-status></p><section class="hidden" data-confirm><p data-summary></p><p>Restoring replaces this device’s progress. A copy of your current progress will be offered for download first.</p><button type="button" data-restore>Save current backup & restore</button><button type="button" data-cancel>Cancel restore</button></section>`;
 document.body.append(dialog);dialog.showModal();let candidate:Backup|null=null;
 const status=dialog.querySelector<HTMLElement>('[data-status]')!;
 const download=()=>{
  const blob=new Blob([exportBackup(progress,readPuzzle(progress)?.save??null)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Decopu-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
 };
 dialog.querySelector('[data-export]')!.addEventListener('click',()=>{download();status.textContent='Backup download requested. Keep the file somewhere you can find again.';});
 dialog.querySelector('[data-import]')!.addEventListener('change',async event=>{
  candidate=null;dialog.querySelector('[data-confirm]')!.classList.add('hidden');
  const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;
  try {if(file.size>2_000_000)throw Error('This file is too large.');candidate=parseBackup(await file.text());status.textContent='Backup checked.';dialog.querySelector('[data-summary]')!.textContent=`Restore ${candidate.progress.bestStars.filter(n=>n>0).length} completed puzzles and ${candidate.progress.shop.owned.length} owned decorations${candidate.puzzle?' plus an unfinished puzzle':''}?`;dialog.querySelector('[data-confirm]')!.classList.remove('hidden');}
  catch(e){status.textContent=e instanceof Error?e.message:'Could not read this file.';}
 });
 dialog.querySelector('[data-cancel]')!.addEventListener('click',()=>{candidate=null;dialog.querySelector('[data-confirm]')!.classList.add('hidden');});
 dialog.querySelector('[data-restore]')!.addEventListener('click',()=>{
  if(!candidate)return;download();if(!saveProgress(candidate.progress)){status.textContent="This device cannot save. Nothing was restored. Keep your backup file and try again when storage is available.";return;}writePuzzle(candidate.puzzle);onImport(candidate.progress);dialog.close();
 });
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
}
