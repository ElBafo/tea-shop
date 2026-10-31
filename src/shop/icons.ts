import type { UpgradeId } from "../game/types";

// Small collection illustrations share one visual language, including in night mode.
const shapes: Record<UpgradeId, string> = {
  counter: '<path d="M8 21h48v7H8zM12 28v25h40V28M18 34h12v13H18zM35 34h12v13H35z"/><path d="M23 21v-9h12v9M35 14h5v5h-5"/>',
  sign: '<path d="M18 15V9m28 6V9M9 15h46v33H9z"/><text x="32" y="36" text-anchor="middle" font-size="15" fill="currentColor" stroke="none">TEA</text>',
  paint: '<path d="M13 10h33v16H13zM46 17h7v16H32v9m-4 0h8v14h-8z"/>',
  shelves: '<path d="M9 10v46m46-46v46M9 29h46M9 53h46M15 14h10v15H15zM34 14h12v15H34zM17 38h11v15H17zM37 39h10v14H37z"/>',
  plant: '<path d="M19 39h26l-4 17H23zM32 39V17M32 30C9 31 12 12 17 13c13 0 15 17 15 17ZM32 24C51 26 53 7 47 8c-12 0-15 16-15 16Z"/>',
  rug: '<path d="m10 18 41-6 4 35-41 6zM17 23l27-4 3 22-27 4zM11 18l-4-4m12 3-3-5m11 4-2-5m11 4-2-5m10 4-1-5M16 53l1 5m8-6 1 5m8-6 1 5m8-6 1 5m8-6 2 4"/>',
  lamp: '<path d="m23 10-10 22h38L41 10zM32 32v22M21 56h22M30 10V6h4v4"/>',
  table: '<ellipse cx="32" cy="23" rx="23" ry="11"/><path d="M32 34v19m-12 3h24M9 42v14m46-14v14M5 42h11m32 0h11M27 22v-8h10v8z"/>',
  art: '<path d="M10 8h44v48H10zM16 14h32v36H16zM16 44l11-16 9 10 6-7 6 11"/><circle cx="39" cy="23" r="4"/>',
  clock: '<circle cx="32" cy="32" r="23"/><path d="M32 14v4m18 14h-4M32 50v-4M14 32h4M32 23v10l9 5"/>',
  basket: '<path d="M10 28h44l-5 26H15zM15 28C15 5 49 5 49 28M12 37h40M14 46h36M22 28l2 26M32 28v26M42 28l-2 26"/>',
};
export function decorationIcon(id: UpgradeId): string {
  return `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${shapes[id]}</svg>`;
}
