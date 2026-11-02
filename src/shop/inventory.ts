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
