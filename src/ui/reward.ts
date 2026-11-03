import { nextReward } from '../game/journey';
import type { Progress } from '../game/types';
import { styleThumbnail } from '../shop/icons';

export function rewardCard(progress: Progress): string {
  const goal = nextReward(progress);
  if (!goal) return '<p class="journey-goal">All special pieces collected. Try a new arrangement.</p>';
  const { item, done } = goal;
  const remaining = Math.max(0, item.unlockAfter! - done);
  return `<button class="reward-card" data-reward="${item.id}" type="button" aria-label="Preview ${item.moveName}. ${remaining ? `${remaining} puzzles to unlock` : 'Unlocked, available to buy'}. ${item.cost} stars.">
    <span class="reward-art" aria-hidden="true">${styleThumbnail(item.id, 0)}</span>
    <span class="reward-copy"><strong>${item.title}</strong><small>${remaining ? `${remaining} ${remaining === 1 ? 'puzzle' : 'puzzles'} to unlock` : 'Unlocked · Available to buy'}</small><progress max="${item.unlockAfter}" value="${Math.min(done,item.unlockAfter!)}" aria-label="Puzzles toward unlock"></progress></span>
    <span class="reward-price">${item.cost} ✦<small>Preview →</small></span>
  </button>`;
}
