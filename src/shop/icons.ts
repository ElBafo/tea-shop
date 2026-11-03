import { kindOf } from "./upgrades";
import type { UpgradeId, UpgradeKind } from "../game/types";

// Small collection illustrations share one visual language, including in night mode.
const shapes: Record<UpgradeKind, string> = {
  armchair: '<path d="M16 35V20a16 16 0 0 1 32 0v15M12 31h8v15h24V31h8v23H12zM17 54v5m30-5v5M24 22h16v16H24z"/>',
  fountain: '<path d="M10 39h44q-2 12-22 12T10 39ZM19 22h26q-2 10-13 10T19 22ZM32 11v11m0 10v7m0 12v7M23 58h18"/><circle cx="32" cy="9" r="4"/>',
  terrarium: '<path d="M12 26l20-17 20 17v29H12zM12 26h40M32 9v46M20 47V34m0 5-5-5m5 8 5-6M41 47V32"/>',
  botanical: '<path d="M5 15h16v35H5zM24 9h16v47H24zM43 15h16v35H43zM13 42V25m19 22V20m19 22V25"/><path d="m8 29 5 6 5-6m9-3 5 7 5-7m9 3 5 6 5-6"/>',
  cabinet: '<path d="M12 55V25a20 20 0 0 1 40 0v30zM17 29h30M17 42h30M20 55v4m24-4v4M23 29v-8h7v8m7 13V32h7v10"/>',
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
  bench: '<path d="M9 20h46v19H9zM7 39h50v7H7zM13 46v10m38-10v10M17 25h12v10H17zM35 25h12v10H35z"/>',
  trolley: '<path d="M14 13v37m36-37v37M14 28h36M14 46h36M50 13h8M22 28V17h13v11m0-9h5v6h-5"/><circle cx="18" cy="54" r="4"/><circle cx="46" cy="54" r="4"/>',
  planter: '<path d="M20 42h24l-4 15H24zM32 42V19"/><path d="M32 31C8 37 8 14 21 13c-4-14 25-14 24 0 17 9 8 26-13 18Z"/>',
  basket: '<path d="M10 28h44l-5 26H15zM15 28C15 5 49 5 49 28M12 37h40M14 46h36M22 28l2 26M32 28v26M42 28l-2 26"/>',
};
export function decorationIcon(id: UpgradeId): string {
  return `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${shapes[kindOf(id)]}</svg>`;
}

// Lightweight, variant-specific illustrations. The in-room preview remains the
// exact 3D representation; no extra WebGL scenes are needed for the picker.
export function styleThumbnail(id: UpgradeId, variant: number): string {
  const kind = kindOf(id);
  const palettes: Record<UpgradeKind, string[]> = {
    armchair:['#9caf92','#617d91','#d2b07e'], fountain:['#e7dcc5','#9faeaa','#d3aaa7'],
    terrarium:['#bda061','#eee3c9','#dba7aa'], botanical:['#c4a35b','#e9e1cc','#d89ea6'], cabinet:['#3f7164','#3a5771','#b77d89'],
    counter:['#ba8959','#e5e0d4','#d8aaa5'], sign:['#947052','#d8aaa5','#a9bc96'],
    paint:['#ead8bd','#acbba1','#d6aaa7'], shelves:['#bd925d','#eee9db','#816047'],
    plant:['#b27858','#d5c4a7','#b7c9a1'], rug:['#ba8868','#d6aaa7','#a8b99b'],
    lamp:['#f1dfb1','#c5a36b','#d9b3a1'], table:['#bb9065','#dfd3b8','#a9c5b3'],
    art:['#afbd97','#a5bbc5','#d6aaa7'], clock:['#bc9368','#a5b99c','#d5aaa6'],
    basket:['#adc19f','#d8a7ac','#b49b77'], bench:['#b79369','#a5b99c','#ce9ca3'],
    trolley:['#c4a468','#a8c3b0','#866448'], planter:['#bd8968','#e7dec7','#9ebcc7'],
  };
  const color = palettes[kind][variant] ?? palettes[kind][0];
  let drawing = shapes[kind];
  if (kind === 'terrarium') drawing = '<path d="M10 25 32 7l22 18v30H10zM10 25h44M32 7v18" fill="none"/>' + [
    '<path d="M25 50V24m14 26V28M25 31 14 26m11 14L13 35m12 11L14 43m25-9 11-7m-11 14 12-6m-12 11 12-4" stroke="#62814b" stroke-width="4" fill="none"/>',
    '<path d="M25 49V29m0 12H17V34m8 4h9V26" stroke="#71998a" stroke-width="7" fill="none"/><circle cx="43" cy="45" r="8" fill="#71998a"/><circle cx="43" cy="36" r="3" fill="#d6a5aa"/>',
    '<path d="M22 50V34m19 16V29" stroke="#63814b" stroke-width="4"/><g fill="#e7a6b4"><circle cx="21" cy="32" r="9"/><circle cx="40" cy="29" r="9"/></g><path d="m15 46 7-6 4 9m9-8 6 5 5-6" fill="#63814b"/>',
  ][variant] + '<path d="M9 52h46v7H9z"/>';
  if (kind === 'botanical') drawing = '<path d="M4 15h17v37H4zM23 8h18v49H23zM43 15h17v37H43z" fill="'+(['#365e4e','#334f6b','#f4d4ca'][variant])+'"/>' + [
    '<g fill="#c6a464"><path d="M7 29q6-12 12 0l-6 6zM25 24q7-15 14 0l-7 7zM46 29q6-12 12 0l-6 6z"/></g><path d="M13 35v10m19-14v18m20-14v10" stroke="#c6a464"/>',
    '<g fill="#f4e7c8"><ellipse cx="13" cy="31" rx="6" ry="11"/><ellipse cx="32" cy="29" rx="7" ry="14"/><ellipse cx="52" cy="31" rx="6" ry="11"/></g><path d="M7 32h12M25 29h14M46 32h12" stroke="#c6a464"/>',
    '<g fill="#c57e91"><circle cx="12" cy="28" r="6"/><circle cx="16" cy="41" r="4"/><circle cx="31" cy="23" r="7"/><circle cx="34" cy="42" r="5"/><circle cx="52" cy="33" r="7"/></g>',
  ][variant];
  if (kind === 'armchair') drawing = [
    '<path d="M13 38V24a19 19 0 0 1 38 0v14M10 33h10v12h24V33h10v22H10z"/><rect x="23" y="24" width="19" height="17" rx="6" fill="#d6a5aa"/>',
    '<path d="M17 39V8h30v31M12 12h8v25h-8zM44 12h8v25h-8zM12 35h40v20H12z"/><rect x="23" y="25" width="18" height="16" rx="3" fill="#eee3cb"/>',
    '<path d="M13 12v42h38V12M13 17h38M13 25h38M13 33h38M23 12v25m18-25v25" fill="none" stroke-width="4"/><rect x="16" y="39" width="32" height="11" rx="4" fill="#eee3cb"/><path d="M36 38h10v15H36z" fill="#b57f8d"/>',
  ][variant] + '<path d="M17 54v6m30-6v6" stroke-width="3"/>';
  if (kind === 'fountain') drawing = [
    '<path d="M29 23h6v34h-6zM9 39h46q-3 14-23 14T9 39ZM18 21h28q-2 10-14 10T18 21Z"/><ellipse cx="32" cy="39" rx="20" ry="3" fill="#8bbdc2"/><ellipse cx="32" cy="21" rx="12" ry="2" fill="#8bbdc2"/><circle cx="32" cy="12" r="5" fill="#c6a464"/>',
    '<path d="M8 46h48q-3 12-24 12T8 46Z"/><ellipse cx="32" cy="46" rx="20" ry="4" fill="#8bbdc2"/><ellipse cx="31" cy="37" rx="16" ry="7"/><ellipse cx="35" cy="25" rx="13" ry="7"/><ellipse cx="29" cy="14" rx="10" ry="6"/>',
    '<path d="M28 40h8v17h-8zM8 32h48q-2 15-24 15T8 32Z"/><ellipse cx="32" cy="32" rx="21" ry="4" fill="#8bbdc2"/><path d="M20 32q-6-13 8-9 4-17 10 0 14-3 5 10z" fill="#eee3cb"/><circle cx="32" cy="29" r="4" fill="#c6a464"/>',
  ][variant];
  if (kind === 'paint') drawing = '<rect x="9" y="10" width="46" height="44" rx="3"/><path d="M9 39h46M21 10v29M43 10v29" fill="none" opacity=".25"/>';
  if (kind === 'lamp') drawing = [
    '<path d="M31 28v27M20 56h24" fill="none"/><rect x="19" y="9" width="26" height="25" rx="2"/>',
    '<path d="M32 30v25M20 56h24" fill="none"/><path d="M24 9h16l13 24H11z"/>',
    '<ellipse cx="32" cy="48" rx="10" ry="9"/><path d="M32 30v12"/><path d="M21 10h22l8 23H13z"/>',
  ][variant];
  if (kind === 'plant') drawing = `<path d="M21 38h22l-4 18H25z"/>` + [
    '<path d="M32 39V13m0 10L18 15m14 16L13 24m19-1 14-8M32 31l19-7" stroke="#688451" fill="none"/>',
    '<g fill="#91ac7e"><ellipse cx="23" cy="31" rx="10" ry="5" transform="rotate(30 23 31)"/><ellipse cx="41" cy="31" rx="10" ry="5" transform="rotate(-30 41 31)"/><ellipse cx="32" cy="25" rx="6" ry="12"/></g>',
    '<path d="M32 39V19m0 13-13-5m13 5 13-5" stroke="#688451"/><g fill="#d99ba9"><circle cx="22" cy="22" r="7"/><circle cx="42" cy="20" r="7"/><circle cx="32" cy="12" r="6"/></g>',
  ][variant];
  if (kind === 'table') drawing = '<path d="M32 32v22M21 56h22M9 41v14M55 41v14" fill="none"/>' + (variant === 1 ? '<path d="m12 15 32-5 10 20-32 5z"/>' : '<ellipse cx="32" cy="23" rx="24" ry="12"/>') + (variant===2?'<g fill="#d7a6a5"><rect x="3" y="37" width="13" height="7" rx="3"/><rect x="48" y="37" width="13" height="7" rx="3"/></g>':'');
  if (kind === 'art') drawing = '<rect x="10" y="7" width="44" height="50" rx="2"/><rect x="15" y="12" width="34" height="40" fill="#faf0df"/>' + [
    '<path d="M30 45V21m0 9-9-7m9 14 12-9" stroke="#688451" fill="none"/>',
    '<path d="m16 46 12-23 10 15 7-9 4 17z" fill="#8eafb8"/><circle cx="39" cy="21" r="5" fill="#dfb590"/>',
    '<path d="M23 29h16v12H23zM39 30h5v8h-5" fill="#d6aaa7"/><path d="M21 45h23"/>',
  ][variant];
  if (kind === 'rug') drawing = '<rect x="10" y="11" width="44" height="43" rx="3"/>' + [
    '<rect x="16" y="17" width="32" height="31" fill="#f0dfb9"/><rect x="22" y="23" width="20" height="19"/>',
    '<g fill="#f3e6ce"><circle cx="22" cy="24" r="5"/><circle cx="42" cy="24" r="5"/><circle cx="32" cy="42" r="5"/></g>',
    '<path d="M12 20h40M12 31h40M12 42h40" stroke="#eee5cd" stroke-width="5"/>',
  ][variant];
  if (kind === 'basket') drawing = [
    '<rect x="17" y="18" width="29" height="10" rx="3" fill="#a7bc96"/><rect x="20" y="10" width="25" height="9" rx="3" fill="#d6aaa7"/>',
    '<circle cx="22" cy="22" r="9" fill="#d6aaa7"/><circle cx="40" cy="21" r="11" fill="#b3c5a3"/>',
    '<path d="m18 9 12-2 4 24-12 2z" fill="#a7bc96"/><path d="m33 11 12 2-4 21-12-2z" fill="#d6aaa7"/>',
  ][variant] + '<path d="M12 29h40l-5 26H17z" fill="#c3a16d"/><path d="M14 39h36M16 47h32" fill="none"/>';
  if (kind === 'planter') drawing = variant===1 ? '<rect x="21" y="39" width="24" height="18"/><path d="M27 39V10m10 29V7m0 13 13-8M27 24 14 16" stroke="#7b975d" fill="none"/>' : `<path d="M21 41h22l-4 16H25z"/><path d="M32 42V20"/><ellipse cx="32" cy="21" rx="20" ry="17" fill="#8fa775"/>${variant===2?'<g fill="#e8ba54"><circle cx="22" cy="18" r="4"/><circle cx="42" cy="22" r="4"/><circle cx="31" cy="30" r="4"/></g>':''}`;
  if (kind === 'trolley') drawing += [
    '<circle cx="29" cy="21" r="6" fill="#e9dfc6"/>',
    '<path d="M21 16h20M24 10h14" stroke="#e3a8ae" stroke-width="5"/>',
    '<path d="M20 34v10m7-10v10m7-10v10m7-10v10" stroke="#c4ad85" stroke-width="5"/>',
  ][variant];
  if (kind === 'bench' && variant===1) drawing += '<path d="M15 24h34M15 30h34M15 36h34" fill="none"/>';
  if (kind === 'sign' && variant===2) drawing += '<g fill="#e7c1bc" stroke="none"><circle cx="14" cy="19" r="3"/><circle cx="50" cy="44" r="3"/></g>';
  return `<span class="style-thumbnail" aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64" fill="${color}" stroke="#6e5947" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">${drawing}</svg></span>`;
}
