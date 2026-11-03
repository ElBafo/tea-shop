import { LEVEL_COUNT, type Progress } from "./types";
import { DECORATIONS } from "../shop/upgrades";

export const isPreview = import.meta.env.BASE_URL === "/tea-shop/preview/";
export const isGuidePreview = isPreview && new URLSearchParams(location.search).get("tour") === "1";
export const isShowroom = isPreview && new URLSearchParams(location.search).get("showroom") === "1";

export function showroomProgress(): Progress {
  return {
    muted: false,
    bestStars: Array(LEVEL_COUNT).fill(3),
    bestMoves: Array(LEVEL_COUNT).fill(0),
    shop: {
      owned: DECORATIONS.map((item) => item.id),
      stored: ["plant:2", "lamp:2", "table:2", "art:2", "basket:2"],
      style: { counter: 2, paint: 1, rug: 1, lamp: 1, table: 2, plant: 2, sign: 2, bench: 2, trolley: 1, planter: 2, "plant:2": 0, "lamp:2": 2, "table:2": 0, "art:2": 1, "basket:2": 1 },
      place: {...Object.fromEntries(DECORATIONS.map((item) => [item.id, { ...item.defaultPlace }])), bench: {x:0,z:3,rot:1}, trolley: {x:2,z:4,rot:0}},
      finaleSeen: true,
    },
  };
}
