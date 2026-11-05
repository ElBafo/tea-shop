import { isSecondEdition } from "./mode";
import { LEVEL_COUNT, STORAGE_KEY, type Progress, type ShopState } from "./types";
import { DECORATIONS, EDITION_DECORATIONS } from "../shop/upgrades";

export const isPreview = import.meta.env?.BASE_URL === "/tea-shop/preview/"
  && location.pathname.startsWith("/tea-shop/preview/");
export const isGuidePreview = isPreview && new URLSearchParams(location.search).get("tour") === "1";
export const isShowroom = isPreview && new URLSearchParams(location.search).get("showroom") === "1";

// The finished-shop demo is temporary and may display the whole catalogue;
// this is not a purchasable player save or a source of extra stars.
export function editionShowroomShop(): ShopState {
  return {
    owned: EDITION_DECORATIONS.map(item => item.id),
    stored: [],
    style: {counter:2, paint:1, shelves:0, sign:2, plant:2, rug:1, lamp:1, table:2, bench:2, art:1, trolley:1, clock:0, planter:2, basket:0, terrarium:0, botanical:1, cabinet:0, armchair:1},
    place: {
      ...Object.fromEntries(EDITION_DECORATIONS.map(item => [item.id, {...item.defaultPlace}])),
      rug: {x:2,z:3,rot:0},
      lamp: {x:5,z:3,rot:0},
      bench: {x:1,z:5,rot:0},
      trolley: {x:1,z:3,rot:0},
      art: {x:0,z:0,rot:1,wall:"left"},
      botanical: {x:1,z:0,rot:1,wall:"left"},
      clock: {x:3,z:0,rot:1,wall:"left"},
      sign: {x:4,z:0,rot:1,wall:"left"},
      cabinet: {x:0,z:3,rot:1},
      armchair: {x:4,z:5,rot:3},
    },
    finaleSeen: true,
  };
}

export function showroomProgress(): Progress {
  return {
    muted: false,
    bestStars: Array(LEVEL_COUNT).fill(3),
    bestMoves: Array(LEVEL_COUNT).fill(0),
    shop: isSecondEdition ? editionShowroomShop() : {
      owned: DECORATIONS.map((item) => item.id),
      stored: ["art", "clock", "basket", "table", "plant:2", "lamp:2", "table:2", "art:2", "basket:2"],
      style: { counter: 2, paint: 1, rug: 1, lamp: 1, table: 2, plant: 2, sign: 2, bench: 2, trolley: 1, planter: 2, "plant:2": 0, "lamp:2": 2, "table:2": 0, "art:2": 1, "basket:2": 1 },
      place: {...Object.fromEntries(DECORATIONS.map((item) => [item.id, { ...item.defaultPlace }])), bench: {x:3,z:5,rot:0}, trolley: {x:2,z:4,rot:0}, cabinet:{x:0,z:3,rot:1}, botanical:{x:4,z:0,rot:1,wall:"left"}},
      finaleSeen: true,
    },
  };
}

// Explicit allowlist: never clear origin storage or touch the released game's keys.
export function resetPreviewProgress(): void {
  if (!isPreview || !['tea-shop-preview-progress-v1', 'tea-shop-preview-edition2-progress-v1'].includes(STORAGE_KEY)) throw new Error('Preview reset unavailable');
  for (const key of [STORAGE_KEY, STORAGE_KEY + ':recovery', STORAGE_KEY + ':puzzle-v1', STORAGE_KEY + ':guide-v1', STORAGE_KEY + ':goal-v1', isSecondEdition ? 'tea-shop-preview-edition2-appearance-v1' : 'tea-shop-preview-appearance-v1']) {
    localStorage.removeItem(key);
  }
}
