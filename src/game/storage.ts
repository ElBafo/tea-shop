import { LEVEL_COUNT, STORAGE_KEY, type Progress } from "./types";

function emptyProgress(): Progress {
  return {
    muted: false,
    bestStars: Array.from({ length: LEVEL_COUNT }, () => 0),
    bestMoves: Array.from({ length: LEVEL_COUNT }, () => 0),
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const fresh = emptyProgress();
    if (typeof parsed.muted === "boolean") fresh.muted = parsed.muted;
    if (Array.isArray(parsed.bestStars)) {
      for (let i = 0; i < LEVEL_COUNT; i += 1) {
        const value = parsed.bestStars[i];
        if (typeof value === "number" && value >= 0 && value <= 3) {
          fresh.bestStars[i] = value;
        }
      }
    }
    if (Array.isArray(parsed.bestMoves)) {
      for (let i = 0; i < LEVEL_COUNT; i += 1) {
        const value = parsed.bestMoves[i];
        if (typeof value === "number" && value >= 0) {
          fresh.bestMoves[i] = value;
        }
      }
    }
    return fresh;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function totalStars(progress: Progress): number {
  return progress.bestStars.reduce((sum, stars) => sum + stars, 0);
}

export function isLevelOpen(progress: Progress, index: number): boolean {
  if (index <= 0) return true;
  return progress.bestStars[index - 1] > 0;
}

export function recordWin(
  progress: Progress,
  index: number,
  stars: number,
  moves: number,
): Progress {
  const next: Progress = {
    muted: progress.muted,
    bestStars: progress.bestStars.slice(),
    bestMoves: progress.bestMoves.slice(),
  };
  next.bestStars[index] = Math.max(next.bestStars[index], stars);
  if (next.bestMoves[index] === 0 || moves < next.bestMoves[index]) {
    next.bestMoves[index] = moves;
  }
  saveProgress(next);
  return next;
}

export function setMuted(progress: Progress, muted: boolean): Progress {
  const next = { ...progress, muted };
  saveProgress(next);
  return next;
}
