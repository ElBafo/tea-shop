import { isSecondEdition } from './mode';
import { isGuidePreview, isShowroom } from './preview';
import { STORAGE_KEY, type Progress, type UpgradeId } from './types';
import { DECORATIONS } from '../shop/upgrades';
export interface DecorationGoal { id: UpgradeId; style: number }
let temporaryGoal: DecorationGoal | null = null;
export function readGoal(progress: Progress): DecorationGoal | null {
  if (!isSecondEdition) return null;
  try {
    const value = isGuidePreview || isShowroom ? temporaryGoal : JSON.parse(localStorage.getItem(STORAGE_KEY + ':goal-v1') ?? 'null');
    const item = DECORATIONS.find(item => item.id === value?.id);
    return item && !progress.shop.owned.includes(item.id) && Number.isInteger(value.style) && value.style >= 0 && value.style < item.variants.length ? value : null;
  } catch { return null; }
}
export function saveGoal(goal: DecorationGoal | null): void {
  if (!isSecondEdition) return;
  if (isGuidePreview || isShowroom) { temporaryGoal = goal; return; }
  try { if (goal) localStorage.setItem(STORAGE_KEY + ':goal-v1', JSON.stringify(goal)); else localStorage.removeItem(STORAGE_KEY + ':goal-v1'); } catch { /* A wishlist is optional when storage is unavailable. */ }
}
