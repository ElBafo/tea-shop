import { isSecondEdition } from "../game/mode";
import { readGoal } from "../game/goal";
import { spendableStars } from "../game/storage";
import { nextReward } from '../game/journey';
import type { Progress } from '../game/types';
import { styleThumbnail } from '../shop/icons';

export function rewardCard(progress: Progress): string {
  const goal = nextReward(progress);
  if (!goal) return `<p class="journey-goal">${isSecondEdition ? 'Your little shop is ready. Make it feel like you.' : 'All special pieces collected. Try a new arrangement.'}</p>`;
  const { item, done } = goal;
  if (isSecondEdition) {
    const pinned = readGoal(progress), stars = spendableStars(progress);
    const remaining = Math.max(0, item.cost - stars);
    const puzzles = Math.max(0, (item.unlockAfter ?? 0) - done);
    const allComplete = progress.bestStars.every(value => value > 0);
    const maxed = progress.bestStars.every(value => value === 3);
    const status = puzzles ? `${puzzles} more ${puzzles === 1 ? 'puzzle' : 'puzzles'} to unlock`
      : !remaining ? 'Ready to make it yours'
      : maxed ? 'Return an optional piece to free up stars'
      : allComplete ? `${remaining} more stars · Improve scores or return a piece`
      : `${remaining} more stars to make it yours`;
    const meter = puzzles
      ? `<progress max="${item.unlockAfter}" value="${done}" aria-label="Puzzles toward this decoration’s unlock"></progress>`
      : `<progress max="${item.cost}" value="${Math.min(stars,item.cost)}" aria-label="Stars saved toward this decoration"></progress>`;
    return `<button class="reward-card personal-goal" data-reward="${item.id}" type="button" aria-label="Preview ${item.moveName}. ${status}. Costs ${item.cost} stars."><span class="reward-art" aria-hidden="true">${styleThumbnail(item.id,pinned?.style??0)}</span><span class="reward-copy"><small>${pinned ? 'Your next piece' : 'A little inspiration'}</small><strong>${item.moveName[0].toUpperCase()+item.moveName.slice(1)}</strong><small>${status}</small>${meter}</span><span class="reward-price">${item.cost} ✦<small>Try it →</small></span></button>`;
  }
  const remaining = Math.max(0, item.unlockAfter! - done);
  return `<button class="reward-card" data-reward="${item.id}" type="button" aria-label="Preview ${item.moveName}. ${remaining ? `${remaining} puzzles to unlock` : 'Unlocked, available to buy'}. ${item.cost} stars.">
    <span class="reward-art" aria-hidden="true">${styleThumbnail(item.id, 0)}</span>
    <span class="reward-copy"><strong>${item.title}</strong><small>${remaining ? `${remaining} ${remaining === 1 ? 'puzzle' : 'puzzles'} to unlock` : 'Unlocked · Available to buy'}</small><progress max="${item.unlockAfter}" value="${Math.min(done,item.unlockAfter!)}" aria-label="Puzzles toward unlock"></progress></span>
    <span class="reward-price">${item.cost} ✦<small>Preview →</small></span>
  </button>`;
}
