import { LEVEL_COUNT, type Progress } from "./types";
import { UPGRADES } from "../shop/upgrades";

export const isPreview = import.meta.env.BASE_URL === "/tea-shop/preview/";
export const isShowroom = isPreview && new URLSearchParams(location.search).get("showroom") === "1";

export function showroomProgress(): Progress {
  return {
    muted: false,
    bestStars: Array(LEVEL_COUNT).fill(3),
    bestMoves: Array(LEVEL_COUNT).fill(0),
    shop: {
      owned: UPGRADES.map((item) => item.id),
      style: { counter: 2, paint: 1, rug: 1, lamp: 1, table: 2, plant: 2, sign: 2 },
      place: Object.fromEntries(UPGRADES.map((item) => [item.id, { ...item.defaultPlace }])),
      finaleSeen: true,
    },
  };
}
