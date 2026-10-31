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

export type UpgradeId =
  | "counter"
  | "sign"
  | "paint"
  | "shelves"
  | "plant"
  | "rug"
  | "lamp"
  | "table";

export type ShopSurface = "floor" | "wall" | "fixed";
export type ShopLayer = "rug" | "furn" | "wall" | "fixed";
export type WallFace = "back" | "left";

export interface Placement {
  x: number;
  z: number;
  rot: number;
  wall?: WallFace;
}

export interface UpgradeVariant {
  name: string;
  blurb: string;
}

export interface UpgradeDef {
  id: UpgradeId;
  title: string;
  moveName: string;
  blurb: string;
  cost: number;
  movable: boolean;
  surface: ShopSurface;
  layer: ShopLayer;
  size: { w: number; d: number };
  defaultPlace: Placement;
  variants: UpgradeVariant[];
}

export interface ShopState {
  owned: UpgradeId[];
  style: Partial<Record<UpgradeId, number>>;
  place: Partial<Record<UpgradeId, Placement>>;
  finaleSeen: boolean;
}

export interface Progress {
  muted: boolean;
  bestStars: number[];
  bestMoves: number[];
  shop: ShopState;
}

export const STORAGE_KEY = "tea-shop-progress-v1";
export const LEVEL_COUNT = 20;
