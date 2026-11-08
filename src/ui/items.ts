import { isSecondEdition } from "../game/mode";
import { ITEMS } from "../game/items";
import type { ItemId } from "../game/types";

// Small, distinct silhouettes supplement each flavour's colour and letter.
const TEA_MOTIFS: Partial<Record<ItemId,string>> = {
  rose: '<path d="M12 8C4 1 1 12 8 14C4 22 15 24 16 16C24 19 25 8 17 8C20 0 9-1 12 8Z"/><circle cx="13" cy="12" r="3" fill="var(--paper-label)"/>',
  jasmine: '<path d="m12 1 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/><circle cx="12" cy="12" r="2" fill="var(--paper-label)"/>',
  matcha: '<path d="M3 20C0 10 5 3 16 3c2 9-2 17-13 17Zm4-1C9 9 14 6 23 9c-1 9-7 14-16 10Z"/>',
  chai: '<path d="m4 3 5-1 8 19-5 2Zm15-1 4 3-14 17-4-3Z"/>',
  lavender: '<path d="M11 4h2v19h-2Z"/><ellipse cx="8" cy="7" rx="4" ry="2.5"/><ellipse cx="16" cy="11" rx="4" ry="2.5"/><ellipse cx="8" cy="15" rx="4" ry="2.5"/><ellipse cx="13" cy="3" rx="3" ry="3"/>',
  earl: '<path d="M2 12a10 10 0 0 0 20 0H2Z"/><path d="m12 13-6 5m6-5v7m0-7 6 5" fill="none" stroke="var(--paper-label)" stroke-width="1.8"/>',
};

export function treatMarkup(item: ItemId, hidden: boolean): string {
  if (hidden) {
    return `<div class="treat mystery ${isSecondEdition ? "sachet-mystery" : ""}" aria-hidden="true"><span class="fog"></span></div>`;
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
  if (isSecondEdition) return `<div class="treat sachet ${item}" style="--fill:${look.fill};--deep:${look.deep};--ink:${look.ink}" aria-hidden="true"><span class="sachet-paper"><span class="sachet-seam"></span><span class="sachet-label"><svg viewBox="0 0 26 26" focusable="false" aria-hidden="true">${TEA_MOTIFS[item] ?? ''}</svg><span class="sachet-letter">${letter}</span></span></span></div>`;
  return `
    <div class="treat tin ${item}" style="--fill:${look.fill};--deep:${look.deep};--ink:${look.ink}" aria-hidden="true">
      <span class="tin-cap"></span>
      <span class="tin-body">
        <span class="tin-band"></span>
        <span class="tin-letter">${letter}</span>
      </span>
    </div>`;
}
