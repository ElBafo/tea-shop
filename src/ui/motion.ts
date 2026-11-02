import type { ItemId } from '../game/types';
import { treatMarkup } from './items';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function pourOrigins(root: HTMLElement, from: number, count: number): DOMRect[] {
  return [...root.querySelectorAll<HTMLElement>(`[data-jar="${from}"] .slot:not(.empty) .treat`)]
    .slice(-count).map(treat=>treat.getBoundingClientRect());
}

export function animatePour(root: HTMLElement, to: number, item: ItemId, origins: DOMRect[]): {finished: Promise<void>; cancel(): void} {
  if (reducedMotion() || !Element.prototype.animate) return {finished:Promise.resolve(), cancel() {}};
  const destination = root.querySelector<HTMLElement>(`[data-jar="${to}"]`);
  const targets = [...root.querySelectorAll<HTMLElement>(`[data-jar="${to}"] .slot.landed .treat`)];
  const flyers: HTMLElement[] = [];
  const animations: Animation[] = [];
  destination?.classList.add('receiving');
  const motions = targets.map((target,index) => {
    const start = origins[index];
    if (!start) return Promise.resolve();
    // Suppress the landing animation while measuring the actual final slot.
    target.classList.add('in-flight');
    const end = target.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'flying-treat';
    flyer.setAttribute('aria-hidden','true');
    flyer.style.cssText = `left:${start.x}px;top:${start.y}px;width:${end.width}px;height:${end.height}px`;
    flyer.innerHTML = treatMarkup(item,false);
    document.body.append(flyer);flyers.push(flyer);
    const dx=end.x-start.x,dy=end.y-start.y;
    const animation=flyer.animate([
      {transform:'translate(0,0) rotate(-4deg) scale(1.04)'},
      {offset:.48,transform:`translate(${dx*.5}px,${Math.min(-30,dy*.5-24)}px) rotate(5deg) scale(1.08)`},
      {transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(1)`},
    ],{duration:260,delay:index*28,easing:'cubic-bezier(.3,.65,.3,1)',fill:'both'});
    animations.push(animation);
    return animation.finished.catch(()=>{}).then(()=> { target.classList.remove('in-flight');flyer.remove(); });
  });
  const cleanup=()=>{destination?.classList.remove('receiving');targets.forEach(t=>t.classList.remove('in-flight'));flyers.forEach(f=>f.remove());};
  return {
    finished:Promise.all(motions).then(cleanup),
    cancel() { animations.forEach(animation=>animation.cancel());cleanup(); },
  };
}
