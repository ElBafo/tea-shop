import { canPour, isCompleteTube } from '../game/engine';
import { suggestedJar } from '../game/guide';
import type { Board } from '../game/types';
import './puzzle-guide.css';

const HAND = `<svg viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M14 26V8a4 4 0 0 1 8 0v12-5a3.5 3.5 0 0 1 7 0v7-3a3.5 3.5 0 0 1 7 0v12c0 8-5 13-12 13h-3c-4 0-7-2-9-5L4 28a4 4 0 0 1 6-5l4 3Z" fill="#fff7e5" stroke="#416250" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 29v-7m7 8v-8m7 8v-5" stroke="#d8c9a8" stroke-width="2" stroke-linecap="round"/></svg>`;

/** Visual instruction only: callers own guide progression and dispose on render. */
export function mountPuzzleGuide(root: HTMLElement, board: Board, selected: number | null): () => void {
  const shelf = root.querySelector<HTMLElement>('.shelves');
  if (!shelf) return () => {};
  const destination = (from: number) => board.tubes.findIndex((_, to) => canPour(board, from, to) > 0);
  const preferred = suggestedJar(board, null);
  const alternative = preferred !== null && destination(preferred) >= 0 ? preferred
    : board.tubes.findIndex((tube, from) => !isCompleteTube(tube, board.capacity) && destination(from) >= 0);
  const from = selected !== null && destination(selected) >= 0 ? selected : alternative;
  if (from === null || from < 0) return () => {};
  const to = destination(from);
  if (to < 0) return () => {};
  const tap = selected === from;
  const retry = selected !== null && selected !== from;
  const source = shelf.querySelector<HTMLElement>(`[data-jar="${from}"]`);
  const target = shelf.querySelector<HTMLElement>(`[data-jar="${to}"]`);
  if (!source || !target) return () => {};

  const overlay = document.createElement('div');
  overlay.className = `puzzle-hand-guide ${tap ? 'guide-tap' : 'guide-drag'}`;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.dataset.guideFrom = String(from);
  overlay.dataset.guideTo = String(to);
  overlay.innerHTML = `<svg class="puzzle-guide-route" aria-hidden="true"><path class="guide-route-line"/><path class="guide-route-arrow"/></svg><span class="puzzle-guide-start"></span><span class="puzzle-guide-end"></span><span class="puzzle-guide-bubble">${tap ? 'Tap here' : retry ? 'Try dragging these' : 'Drag these over'}</span><span class="puzzle-guide-hand">${HAND}</span>`;
  // Keep the layer outside the scrolling shelf. Fixed viewport coordinates
  // follow its client rectangle without enlarging the shelf's scroll area.
  root.append(overlay);
  const instruction = document.createElement('p');
  instruction.className = 'visually-hidden puzzle-guide-instruction';
  instruction.setAttribute('role', 'status');
  instruction.textContent = tap
    ? `Tap jar ${to + 1} to place the selected treats. You can also drag them there.`
    : `${retry ? 'Try another jar. ' : ''}Drag the top treats from jar ${from + 1} to jar ${to + 1}, or tap jar ${from + 1} and then jar ${to + 1}. Fill each jar with one kind.`;
  root.append(instruction);
  const hand = overlay.querySelector<HTMLElement>('.puzzle-guide-hand')!;
  const bubble = overlay.querySelector<HTMLElement>('.puzzle-guide-bubble')!;
  const startDot = overlay.querySelector<HTMLElement>('.puzzle-guide-start')!;
  const endDot = overlay.querySelector<HTMLElement>('.puzzle-guide-end')!;
  const route = overlay.querySelector<SVGPathElement>('.guide-route-line')!;
  const arrow = overlay.querySelector<SVGPathElement>('.guide-route-arrow')!;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  let animation: Animation | null = null;
  let frame = 0;
  let disposed = false;

  function position() {
    if (disposed || !source?.isConnected || !target?.isConnected || !shelf) return;
    animation?.cancel();
    animation = null;
    const bounds = shelf.getBoundingClientRect();
    const left = bounds.left + shelf.clientLeft, top = bounds.top + shelf.clientTop;
    const sourceRect = source.getBoundingClientRect(), targetRect = target.getBoundingClientRect();
    const pieces = source.querySelectorAll<HTMLElement>('.slot:not(.empty) .treat');
    const treat = pieces[pieces.length - 1]?.getBoundingClientRect();
    const targetGlass = target.querySelector<HTMLElement>('.jar-glass')!.getBoundingClientRect();
    const width = shelf.clientWidth, height = shelf.clientHeight;
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.borderRadius = getComputedStyle(shelf).borderRadius;
    overlay.hidden = sourceRect.bottom <= top || sourceRect.top >= top + height
      || targetRect.bottom <= top || targetRect.top >= top + height;
    const clampX = (x: number) => Math.max(22, Math.min(width - 22, x));
    const clampY = (y: number) => Math.max(23, Math.min(height - 50, y));
    const sx = clampX((treat ? treat.x + treat.width / 2 : sourceRect.x + sourceRect.width / 2) - left);
    const sy = clampY((treat ? treat.y + treat.height / 2 : sourceRect.y + 35) - top);
    const tx = clampX(targetRect.x + targetRect.width / 2 - left);
    const ty = clampY(targetGlass.y + Math.min(42, targetGlass.height / 3) - top);
    const roof = Math.max(27, Math.min(sourceRect.top, targetRect.top) - top - 12);
    const mx = (sx + tx) / 2;
    const bubbleWidth = bubble.offsetWidth;
    const bubbleAnchor = tap ? tx : (sx + tx) / 2;
    const bubbleLeft = Math.max(8, Math.min(width - bubbleWidth - 8, bubbleAnchor - bubbleWidth / 2));
    // Reserve the gap above the jars for the callout; on very short shelves,
    // clamp it inside the panel instead of creating overflow or covering buttons.
    const bubbleTop = Math.max(5, Math.min(height - 32, roof - 34));
    bubble.style.left = `${bubbleLeft}px`;
    bubble.style.top = `${bubbleTop}px`;
    startDot.style.cssText = `left:${sx}px;top:${sy}px`;
    endDot.style.cssText = `left:${tx}px;top:${ty}px`;
    if (tap) {
      route.setAttribute('d', `M ${tx} ${Math.min(ty - 13, bubbleTop + 30)} L ${tx} ${ty - 13}`);
      arrow.setAttribute('d', `M ${tx - 5} ${ty - 19} L ${tx} ${ty - 13} L ${tx + 5} ${ty - 19}`);
    } else {
      route.setAttribute('d', `M ${sx} ${sy - 13} C ${sx} ${roof}, ${tx} ${roof}, ${tx} ${ty - 13}`);
      arrow.setAttribute('d', `M ${tx - 5} ${ty - 19} L ${tx} ${ty - 13} L ${tx + 5} ${ty - 19}`);
    }
    const at = (x: number, y: number, scale = 1) => `translate(${x - 18}px,${y - 6}px) scale(${scale})`;
    hand.style.transform = at(tap ? tx : sx, tap ? ty : sy);
    if (media.matches || !Element.prototype.animate) return;
    animation = hand.animate(tap ? [
      { transform: at(tx, ty - 7), offset: 0 },
      { transform: at(tx, ty, .94), offset: .25 },
      { transform: at(tx, ty - 7), offset: .5 },
      { transform: at(tx, ty - 7), offset: 1 },
    ] : [
      { transform: at(sx, sy), opacity: 1, offset: 0 },
      { transform: at(sx, sy), opacity: 1, offset: .12 },
      { transform: at(sx, sy, .94), opacity: 1, offset: .23 },
      { transform: at(mx, roof), opacity: 1, offset: .48 },
      { transform: at(tx, ty), opacity: 1, offset: .71 },
      { transform: at(tx, ty), opacity: 1, offset: .84 },
      { transform: at(tx, ty), opacity: 0, offset: .94 },
      { transform: at(sx, sy), opacity: 0, offset: 1 },
    ], { duration: tap ? 1700 : 2600, iterations: Infinity, easing: 'ease-in-out' });
    if (document.hidden) animation.pause();
  }
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(position);
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(shelf);
  resize.observe(source);
  resize.observe(target);
  window.addEventListener('resize', schedule, { signal: controller.signal });
  window.addEventListener('scroll', schedule, { capture: true, passive: true, signal: controller.signal });
  media.addEventListener('change', schedule, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animation?.pause();
    else animation?.play();
  }, { signal: controller.signal });
  position();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    animation?.cancel();
    resize.disconnect();
    controller.abort();
    overlay.remove();
    instruction.remove();
  };
}
