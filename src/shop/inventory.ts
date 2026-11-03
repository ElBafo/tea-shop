import type { ShopState, UpgradeId } from '../game/types';
import { canPlace, findOpenPlacement } from './grid';
import { isOwned, isStored, placeOf, UPGRADE_BY_ID } from './upgrades';

export function cloneInventory(shop: ShopState): ShopState {
  return {
    owned: [...shop.owned], stored: [...(shop.stored ?? [])],
    style: {...shop.style},
    place: Object.fromEntries(Object.entries(shop.place).map(([id, place]) => [id, {...place}])),
    finaleSeen: shop.finaleSeen,
  };
}

export function storeItem(shop: ShopState, id: UpgradeId): ShopState | null {
  if (!isOwned(shop, id) || !UPGRADE_BY_ID[id].movable || isStored(shop, id)) return null;
  const next = cloneInventory(shop);
  next.stored!.push(id);
  return next;
}

export function placeItem(shop: ShopState, id: UpgradeId): ShopState | null {
  if (!isOwned(shop, id) || !isStored(shop, id)) return null;
  const previous = placeOf(shop, id);
  const place = canPlace(id, previous, shop) ? previous : findOpenPlacement(id, shop);
  if (!place) return null;
  const next = cloneInventory(shop);
  next.place[id] = {...place};
  next.stored = next.stored!.filter(item => item !== id);
  return next;
}

// Stars are derived from current ownership. Returning an optional item removes
// its cost from spentStars; no separate refund balance can be replayed or farmed.
export function returnValue(shop: ShopState, id: UpgradeId): number {
  const def = UPGRADE_BY_ID[id];
  return def?.optional && isOwned(shop, id) ? def.cost : 0;
}

export function returnItem(shop: ShopState, id: UpgradeId): ShopState | null {
  if (!returnValue(shop, id)) return null;
  const next = cloneInventory(shop);
  next.owned = next.owned.filter(item => item !== id);
  next.stored = next.stored!.filter(item => item !== id);
  delete next.style[id];
  delete next.place[id];
  // Copies keep their stable IDs, positions and styles, even when copy one is
  // returned. Buying it again is still allowed through the usual purchase path.
  return next;
}
