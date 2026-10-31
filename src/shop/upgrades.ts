import type { Placement, ShopState, UpgradeDef, UpgradeId } from "../game/types";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "counter",
    title: "Fix the counter",
    moveName: "counter",
    blurb: "Sand the dusty top and give the shop a proper place to pour.",
    cost: 2,
    movable: false,
    surface: "fixed",
    layer: "furn",
    size: { w: 3, d: 1 },
    defaultPlace: { x: 1, z: 1, rot: 0 },
    variants: [
      { name: "Wood", blurb: "Warm oak with a worn teapot already waiting." },
      { name: "Marble", blurb: "A cream slab with soft grey veins." },
      { name: "Painted", blurb: "Blush panels and a pale worktop." },
    ],
  },
  {
    id: "sign",
    title: "Hang a shop sign",
    moveName: "shop sign",
    blurb: "A little sign so guests can find the tea.",
    cost: 2,
    movable: true,
    surface: "wall",
    layer: "wall",
    size: { w: 2, d: 1 },
    defaultPlace: { x: 2, z: 0, rot: 1, wall: "left" },
    variants: [
      { name: "Carved wood", blurb: "Dark timber with letters cut in." },
      { name: "Painted", blurb: "A blush board and cream letters." },
      { name: "Floral", blurb: "Sage paint with tiny dotted flowers." },
    ],
  },
  {
    id: "paint",
    title: "Paint the walls",
    moveName: "walls",
    blurb: "Cover the bare plaster with a warm wash of colour.",
    cost: 3,
    movable: false,
    surface: "fixed",
    layer: "fixed",
    size: { w: 0, d: 0 },
    defaultPlace: { x: 0, z: 0, rot: 0 },
    variants: [
      { name: "Cream blush", blurb: "The colour of a first cup in the morning." },
      { name: "Sage", blurb: "A quiet green, like a tin of matcha." },
      { name: "Dusty rose", blurb: "Soft pink, like the rose blend." },
    ],
  },
  {
    id: "shelves",
    title: "Put up tea shelves",
    moveName: "shelves",
    blurb: "Rows of tins for the blends you have already sorted.",
    cost: 3,
    movable: false,
    surface: "fixed",
    layer: "wall",
    size: { w: 3, d: 1 },
    defaultPlace: { x: 0, z: 0, rot: 0, wall: "back" },
    variants: [
      { name: "Oak", blurb: "Honey shelves with colourful tins." },
      { name: "White", blurb: "Pale boards and a tidy row of tins." },
      { name: "Walnut", blurb: "Dark wood and bright lids." },
    ],
  },
  {
    id: "plant",
    title: "A window plant",
    moveName: "window plant",
    blurb: "Something living in the light by the window.",
    cost: 3,
    movable: true,
    surface: "floor",
    layer: "furn",
    size: { w: 1, d: 1 },
    defaultPlace: { x: 5, z: 0, rot: 0 },
    variants: [
      { name: "Fern", blurb: "A spray of green fronds." },
      { name: "Succulent", blurb: "A plump little rosette in a pot." },
      { name: "Flowering", blurb: "Pink blossoms over glossy leaves." },
    ],
  },
  {
    id: "rug",
    title: "Lay a rug",
    moveName: "rug",
    blurb: "A soft path across the boards.",
    cost: 4,
    movable: true,
    surface: "floor",
    layer: "rug",
    size: { w: 3, d: 2 },
    defaultPlace: { x: 1, z: 2, rot: 0 },
    variants: [
      { name: "Woven", blurb: "Concentric cream and rust." },
      { name: "Floral", blurb: "Blush cloth with dotted flowers." },
      { name: "Striped", blurb: "Sage and cream stripes." },
    ],
  },
  {
    id: "lamp",
    title: "Light a lamp",
    moveName: "lamp",
    blurb: "A warm pool of light for late shelves.",
    cost: 4,
    movable: true,
    surface: "floor",
    layer: "furn",
    size: { w: 1, d: 1 },
    defaultPlace: { x: 0, z: 5, rot: 0 },
    variants: [
      { name: "Paper", blurb: "A square lantern on a slim pole." },
      { name: "Brass", blurb: "A cone shade with a thin brass stem." },
      { name: "Ceramic", blurb: "A round base and a fabric shade." },
    ],
  },
  {
    id: "table",
    title: "A table and chairs",
    moveName: "table",
    blurb: "A place for a guest to sit with a cup.",
    cost: 5,
    movable: true,
    surface: "floor",
    layer: "furn",
    size: { w: 2, d: 2 },
    defaultPlace: { x: 3, z: 3, rot: 0 },
    variants: [
      { name: "Round wood", blurb: "A pedestal table and two stools." },
      { name: "Bistro", blurb: "A square top and two slat chairs." },
      { name: "Painted", blurb: "Mint table, blush chairs." },
    ],
  },
];

export const UPGRADE_BY_ID: Record<UpgradeId, UpgradeDef> = Object.fromEntries(
  UPGRADES.map((upgrade) => [upgrade.id, upgrade]),
) as Record<UpgradeId, UpgradeDef>;

export const UPGRADE_IDS = UPGRADES.map((upgrade) => upgrade.id);

export function emptyShop(): ShopState {
  return {
    owned: [],
    style: {},
    place: {},
    finaleSeen: false,
  };
}

export function isOwned(shop: ShopState, id: UpgradeId): boolean {
  return shop.owned.includes(id);
}

export function styleOf(shop: ShopState, id: UpgradeId): number {
  const value = shop.style[id];
  if (typeof value === "number" && value >= 0) return value;
  return 0;
}

export function placeOf(shop: ShopState, id: UpgradeId): Placement {
  if (id === "counter") return UPGRADE_BY_ID.counter.defaultPlace;
  return shop.place[id] ?? UPGRADE_BY_ID[id].defaultPlace;
}

export function shopComplete(shop: ShopState): boolean {
  return UPGRADES.every((upgrade) => shop.owned.includes(upgrade.id));
}

export function spentStars(shop: ShopState): number {
  return shop.owned.reduce((sum, id) => sum + UPGRADE_BY_ID[id].cost, 0);
}

export function bakeryUnlocked(shop: ShopState): boolean {
  return shopComplete(shop);
}
