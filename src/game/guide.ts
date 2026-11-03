import { STORAGE_KEY, type Board } from './types';
import { isGuidePreview, isShowroom } from './preview';
import { canPour, isCompleteTube } from './engine';
export type GuideStage = 'welcome' | 'puzzle' | 'decorate' | 'arrange' | 'done';
const key = STORAGE_KEY + ':guide-v1';
let stage: GuideStage = 'done';
export function initGuide(): void {
  if (isGuidePreview) { stage = 'welcome'; return; }
  if (isShowroom) { stage = 'done'; return; }
  try {
    const saved = localStorage.getItem(key);
    const hasSave = localStorage.getItem(STORAGE_KEY) !== null;
    if (['welcome','puzzle','decorate','arrange','done'].includes(saved ?? '')) stage = saved as GuideStage;
    else stage = hasSave ? 'done' : 'welcome';
    // A legacy save or imported fixture must not receive a first-time modal.
    if (stage === 'welcome' && hasSave) stage = 'done';
    setGuide(stage);
  } catch { stage = 'welcome'; }
}
export function guideStage(): GuideStage { return stage; }
export function setGuide(next: GuideStage): void {
  stage = next;
  if (isGuidePreview || isShowroom) return;
  try { localStorage.setItem(key, next); } catch { /* Session guidance still works. */ }
}
export function suggestedJar(board: Board, selected: number | null): number | null {
  if (selected !== null) return board.tubes.findIndex((_,i)=>i!==selected && canPour(board,selected,i)>0);
  const mixed = board.tubes.findIndex(t=>t.length>0 && !t.every(item=>item===t[0]));
  if (mixed >= 0) return mixed;
  const partial = board.tubes.findIndex(t=>t.length>0 && !isCompleteTube(t,board.capacity));
  return partial >= 0 ? partial : null;
}
export function guideCard(title: string, copy: string, action = ''): string {
  return `<aside class="guide-card" aria-label="Getting started"><div><strong>${title}</strong><p>${copy}</p>${action}</div><button type="button" data-guide-skip aria-label="Skip the getting-started guide">Skip</button></aside>`;
}
