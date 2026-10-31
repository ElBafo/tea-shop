export type ItemId =
  | "rose"
  | "jasmine"
  | "matcha"
  | "chai"
  | "lavender"
  | "earl"
  | "cup"
  | "macaron";

export type Tube = ItemId[];

export interface Board {
  tubes: Tube[];
  sealed: boolean[];
  capacity: number;
}

export interface LevelDef {
  id: number;
  name: string;
  blurb: string;
  capacity: number;
  tubes: Tube[];
  sealed?: boolean[];
  par: number;
}

export interface Move {
  from: number;
  to: number;
  count: number;
  item: ItemId;
  unsealed: boolean;
}

export interface Progress {
  muted: boolean;
  bestStars: number[];
  bestMoves: number[];
}

export const STORAGE_KEY = "tea-shop-progress-v1";
export const LEVEL_COUNT = 10;
