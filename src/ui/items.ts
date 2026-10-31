import { ITEMS } from "../game/items";
import type { ItemId } from "../game/types";

export function treatMarkup(item: ItemId, hidden: boolean): string {
  if (hidden) {
    return `<div class="treat mystery" aria-hidden="true"><span class="fog"></span></div>`;
  }
  const look = ITEMS[item];
  if (look.kind === "cup") {
    return `
      <div class="treat cup" style="--fill:${look.fill};--deep:${look.deep};--ink:${look.ink}" aria-hidden="true">
        <span class="cup-steam"></span>
        <span class="cup-bowl"></span>
        <span class="cup-handle"></span>
        <span class="cup-saucer"></span>
      </div>`;
  }
  if (look.kind === "macaron") {
    return `
      <div class="treat macaron" style="--fill:${look.fill};--deep:${look.deep};--ink:${look.ink}" aria-hidden="true">
        <span class="mac-top"></span>
        <span class="mac-fill"></span>
        <span class="mac-bot"></span>
      </div>`;
  }
  const letter = look.label[0];
  return `
    <div class="treat tin ${item}" style="--fill:${look.fill};--deep:${look.deep};--ink:${look.ink}" aria-hidden="true">
      <span class="tin-cap"></span>
      <span class="tin-body">
        <span class="tin-band"></span>
        <span class="tin-letter">${letter}</span>
      </span>
    </div>`;
}
