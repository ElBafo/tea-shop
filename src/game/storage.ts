import { sanitizeShop } from "../shop/grid";
import { bakeryUnlocked, emptyShop, spentStars } from "../shop/upgrades";
import { LEVEL_COUNT, STORAGE_KEY, type Placement, type Progress, type ShopState, type UpgradeId, type WallFace } from "./types";

const UPGRADE_IDS: UpgradeId[] = [
  "counter",
  "sign",
  "paint",
  "shelves",
  "plant",
  "rug",
  "lamp",
  "table",
];

function emptyProgress(): Progress {
  return {
    muted: false,
    bestStars: Array.from({ length: LEVEL_COUNT }, () => 0),
    bestMoves: Array.from({ length: LEVEL_COUNT }, () => 0),
    shop: emptyShop(),
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
    fresh.shop = sanitizeShop(readShop(parsed.shop));
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

export function spendableStars(progress: Progress): number {
  return Math.max(0, totalStars(progress) - spentStars(progress.shop));
}

export function isBakeryOpen(progress: Progress): boolean {
  return bakeryUnlocked(progress.shop);
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
    shop: cloneShop(progress.shop),
  };
  next.bestStars[index] = Math.max(next.bestStars[index], stars);
  if (next.bestMoves[index] === 0 || moves < next.bestMoves[index]) {
    next.bestMoves[index] = moves;
  }
  saveProgress(next);
  return next;
}

export function setMuted(progress: Progress, muted: boolean): Progress {
  const next = { ...progress, shop: cloneShop(progress.shop), muted };
  saveProgress(next);
  return next;
}

export function saveShop(progress: Progress, shop: ShopState): Progress {
  const next = { ...progress, shop: sanitizeShop(shop) };
  saveProgress(next);
  return next;
}

export function cloneShop(shop: ShopState): ShopState {
  return {
    owned: shop.owned.slice(),
    style: { ...shop.style },
    place: Object.fromEntries(
      Object.entries(shop.place).map(([id, place]) => [id, { ...place }]),
    ),
    finaleSeen: shop.finaleSeen,
  };
}

function readShop(raw: unknown): ShopState {
  const shop = emptyShop();
  if (!raw || typeof raw !== "object") return shop;
  const parsed = raw as Partial<ShopState>;
  if (Array.isArray(parsed.owned)) {
    shop.owned = parsed.owned.filter((id): id is UpgradeId =>
      UPGRADE_IDS.includes(id as UpgradeId),
    );
  }
  if (parsed.style && typeof parsed.style === "object") {
    for (const id of UPGRADE_IDS) {
      const value = parsed.style[id];
      if (typeof value === "number" && Number.isFinite(value)) {
        shop.style[id] = Math.max(0, Math.floor(value));
      }
    }
  }
  if (parsed.place && typeof parsed.place === "object") {
    for (const id of UPGRADE_IDS) {
      const place = readPlacement(parsed.place[id]);
      if (place) shop.place[id] = place;
    }
  }
  if (typeof parsed.finaleSeen === "boolean") shop.finaleSeen = parsed.finaleSeen;
  return shop;
}

function readPlacement(raw: unknown): Placement | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Partial<Placement>;
  if (typeof parsed.x !== "number" || typeof parsed.z !== "number") return null;
  const rot = typeof parsed.rot === "number" ? ((Math.floor(parsed.rot) % 4) + 4) % 4 : 0;
  const wall: WallFace | undefined =
    parsed.wall === "back" || parsed.wall === "left" ? parsed.wall : undefined;
  return {
    x: Math.floor(parsed.x),
    z: Math.floor(parsed.z),
    rot,
    wall,
  };
}
