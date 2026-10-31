import type { Placement, ShopState, UpgradeId, WallFace } from "../game/types";
import { UPGRADE_BY_ID, placeOf } from "./upgrades";

export const ROOM = 6;

// Include a one-cell working aisle behind the counter in its placement footprint.
export function counterCells(place: Placement): { x: number; z: number }[] {
  const cells = floorCells(UPGRADE_BY_ID.counter.size, place);
  const dx = [0, -1, 0, 1][place.rot % 4];
  const dz = [-1, 0, 1, 0][place.rot % 4];
  return [...cells, ...cells.map(cell => ({ x: cell.x + dx, z: cell.z + dz }))];
}

export function rotatedSize(
  size: { w: number; d: number },
  rot: number,
): { w: number; d: number } {
  return rot % 2 === 0 ? { w: size.w, d: size.d } : { w: size.d, d: size.w };
}

export function floorCells(
  size: { w: number; d: number },
  place: Placement,
): { x: number; z: number }[] {
  const { w, d } = rotatedSize(size, place.rot);
  const cells: { x: number; z: number }[] = [];
  for (let i = 0; i < w; i += 1) {
    for (let j = 0; j < d; j += 1) {
      cells.push({ x: place.x + i, z: place.z + j });
    }
  }
  return cells;
}

export function inRoom(cell: { x: number; z: number }): boolean {
  return cell.x >= 0 && cell.z >= 0 && cell.x < ROOM && cell.z < ROOM;
}

export function cellsOverlap(
  a: { x: number; z: number }[],
  b: { x: number; z: number }[],
): boolean {
  return a.some((left) => b.some((right) => left.x === right.x && left.z === right.z));
}

export function wallSlots(place: Placement, width: number): number[] {
  return Array.from({ length: width }, (_, i) => place.x + i);
}

export function canPlace(
  id: UpgradeId,
  place: Placement,
  shop: ShopState,
): boolean {
  const def = UPGRADE_BY_ID[id];
  if (def.surface === "fixed") return true;
  if (def.surface === "wall") return canPlaceWall(id, place, shop);
  const cells = id === "counter" ? counterCells(place) : floorCells(def.size, place);
  if (cells.length === 0 || cells.some((cell) => !inRoom(cell))) return false;

  for (const otherId of shop.owned) {
    if (otherId === id) continue;
    const other = UPGRADE_BY_ID[otherId];
    if (other.surface !== "floor") continue;
    if (def.layer === "rug" && other.layer === "furn") continue;
    if (def.layer === "furn" && other.layer === "rug") continue;
    const otherCells = otherId === "counter" ? counterCells(placeOf(shop, otherId)) : floorCells(other.size, placeOf(shop, otherId));
    if (cellsOverlap(cells, otherCells)) return false;
  }
  return true;
}

export function canPlaceWall(
  id: UpgradeId,
  place: Placement,
  shop: ShopState,
): boolean {
  const def = UPGRADE_BY_ID[id];
  const wall = place.wall ?? "back";
  const slots = wallSlots(place, def.size.w);
  if (slots.some((slot) => slot < 0 || slot + 1 > ROOM)) return false;

  if (wall === "back" && slots.some((slot) => slot >= 3)) return false;

  for (const otherId of shop.owned) {
    if (otherId === id) continue;
    const other = UPGRADE_BY_ID[otherId];
    if (other.surface !== "wall") continue;
    const otherPlace = placeOf(shop, otherId);
    if ((otherPlace.wall ?? "back") !== wall) continue;
    const otherSlots = wallSlots(otherPlace, other.size.w);
    if (slots.some((slot) => otherSlots.includes(slot))) return false;
  }
  return true;
}

export function snapFloor(
  worldX: number,
  worldZ: number,
  size: { w: number; d: number },
  rot: number,
): Placement {
  const { w, d } = rotatedSize(size, rot);
  return {
    x: Math.round(worldX - w / 2),
    z: Math.round(worldZ - d / 2),
    rot,
  };
}

export function snapWall(worldX: number, worldZ: number, width: number): Placement {
  const distBack = Math.abs(worldZ);
  const distLeft = Math.abs(worldX);
  const wall: WallFace = distLeft < distBack ? "left" : "back";
  const along = wall === "left" ? worldZ : worldX;
  const x = Math.round(along - width / 2);
  return { x, z: 0, rot: wall === "left" ? 1 : 0, wall };
}

export function floorCenter(size: { w: number; d: number }, place: Placement): { x: number; z: number } {
  const { w, d } = rotatedSize(size, place.rot);
  return {
    x: place.x + w / 2,
    z: place.z + d / 2,
  };
}

export function wallCenter(place: Placement, width: number): { x: number; y: number; z: number } {
  const along = place.x + width / 2;
  const y = 2.48;
  if (place.wall === "left") {
    return { x: 0.08, y, z: along };
  }
  return { x: along, y, z: 0.08 };
}

export function findOpenPlacement(id: UpgradeId, shop: ShopState): Placement | null {
  const def = UPGRADE_BY_ID[id];
  if (canPlace(id, def.defaultPlace, shop)) return def.defaultPlace;
  if (def.surface === "wall") {
    for (const wall of ["back", "left"] as WallFace[]) {
      for (let x = 0; x <= ROOM - def.size.w; x += 1) {
        const place: Placement = { x, z: 0, rot: wall === "left" ? 1 : 0, wall };
        if (canPlace(id, place, shop)) return place;
      }
    }
    return null;
  }
  for (let rot = 0; rot < 4; rot += 1) {
    const { w, d } = rotatedSize(def.size, rot);
    for (let z = 0; z <= ROOM - d; z += 1) {
      for (let x = 0; x <= ROOM - w; x += 1) {
        const place: Placement = { x, z, rot };
        if (canPlace(id, place, shop)) return place;
      }
    }
  }
  return null;
}

export function nextRotation(id: UpgradeId, shop: ShopState): Placement | null {
  const current = placeOf(shop, id);
  if (UPGRADE_BY_ID[id].surface === "wall") {
    const wall = current.wall === "left" ? "back" : "left";
    for (const x of [current.x, ...Array.from({length: ROOM}, (_, i) => i)]) {
      const place: Placement = {x, z: 0, rot: wall === "left" ? 1 : 0, wall};
      if (canPlace(id, place, shop)) return place;
    }
    return null;
  }
  for (let step = 1; step <= 4; step += 1) {
    const place: Placement = { ...current, rot: (current.rot + step) % 4 };
    if (canPlace(id, place, shop)) return place;
  }
  return null;
}

export function sanitizeShop(shop: ShopState): ShopState {
  const next: ShopState = {
    owned: shop.owned.filter((id, index) => shop.owned.indexOf(id) === index),
    style: { ...shop.style },
    place: { ...shop.place },
    finaleSeen: shop.finaleSeen,
  };
  for (const id of next.owned) {
    const def = UPGRADE_BY_ID[id];
    const style = next.style[id] ?? 0;
    next.style[id] = ((style % def.variants.length) + def.variants.length) % def.variants.length;
    const place = next.place[id] ?? def.defaultPlace;
    if (!canPlace(id, place, { ...next, place: { ...next.place, [id]: place } })) {
      const open = findOpenPlacement(id, { ...next, owned: next.owned.filter((item) => item !== id) });
      next.place[id] = open ?? def.defaultPlace;
    } else {
      next.place[id] = place;
    }
  }
  return next;
}
