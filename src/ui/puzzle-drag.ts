import { canPour, topRun } from '../game/engine';
import type { Board } from '../game/types';
import { reducedMotion } from './motion';
import './puzzle-drag.css';

interface DragOptions {
  board(): Board | null;
  lift(): void;
  reject?(from: number, to: number): void;
  drop(from: number, to: number, origins: DOMRect[]): void;
}

interface Gesture {
  pointer: number;
  from: number;
  board: Board;
  startX: number;
  startY: number;
  touch: boolean;
  dragging: boolean;
  jars: HTMLButtonElement[];
  capture: HTMLElement;
  sources: HTMLElement[];
  ghost: HTMLElement | null;
  pieces: HTMLElement[];
  target: number | null;
}

/** Pointer presentation only. The app's normal transfer path owns every move. */
export function bindPuzzleDrag(root: HTMLElement, options: DragOptions) {
  let gesture: Gesture | null = null;
  const pointers = new Set<number>();
  let suppressClick = false;
  let frame = 0;
  let nextX = 0, nextY = 0;
  let stopReturn = () => {};
  const events = new AbortController();
  const signal = events.signal;

  function release(g: Gesture) {
    // Clear first: releasing capture can synchronously dispatch lost capture.
    gesture = null;
    cancelAnimationFrame(frame);
    frame = 0;
    // The browser releases capture after pointerup itself. Only an interruption
    // while the contact is still down needs an explicit release.
    if (pointers.has(g.pointer) && g.capture.hasPointerCapture(g.pointer)) g.capture.releasePointerCapture(g.pointer);
    root.classList.remove('puzzle-dragging');
    g.jars.forEach(jar => jar.classList.remove('drag-source', 'drag-valid', 'drag-over'));
  }

  function removeGhost(g: Gesture) {
    g.sources.forEach(source => source.classList.remove('drag-held'));
    g.ghost?.remove();
  }

  function returnHome(g: Gesture) {
    if (!g.ghost || reducedMotion() || !Element.prototype.animate) {
      removeGhost(g);
      return;
    }
    const animations = g.pieces.map((piece, i) => {
      const current = piece.getBoundingClientRect(), home = g.sources[i].getBoundingClientRect();
      return piece.animate([
        { transform: 'translate(0,0)' },
        { transform: `translate(${home.x - current.x}px,${home.y - current.y}px)` },
      ], { duration: 150, easing: 'ease-out', fill: 'forwards' });
    });
    const cleanup = () => { animations.forEach(animation => animation.cancel()); removeGhost(g); };
    stopReturn = cleanup;
    void Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      cleanup();
      if (stopReturn === cleanup) stopReturn = () => {};
    });
  }

  function cancel(animate = false) {
    stopReturn();
    stopReturn = () => {};
    const g = gesture;
    if (!g) return;
    suppressClick = true;
    release(g);
    if (animate && g.dragging) returnHome(g);
    else removeGhost(g);
  }

  function position(g: Gesture, x: number, y: number) {
    if (!g.ghost) return;
    const width = g.ghost.offsetWidth, height = g.ghost.offsetHeight;
    const left = Math.max(4, Math.min(window.innerWidth - width - 4, x - width / 2));
    const top = Math.max(4, y - height - (g.touch ? 24 : 12));
    g.ghost.style.transform = `translate3d(${left}px,${top}px,0)`;
    // A destination follows the finger, not the raised piece. Jar bounds are
    // stable throughout the gesture; don't infer a target from swipe velocity.
    g.target = null;
    g.jars.forEach(jar => {
      const index = Number(jar.dataset.jar), rect = jar.getBoundingClientRect();
      const over = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      const valid = over && canPour(g.board, g.from, index) > 0;
      jar.classList.toggle('drag-over', valid);
      if (valid) g.target = index;
    });
  }

  function begin(g: Gesture) {
    const run = topRun(g.board.tubes[g.from]);
    if (!run) return;
    // Clone rendered, known pieces only. A sealed jar must never leak colours,
    // the hidden run length or a coloured inline style through its drag ghost.
    g.sources = [...g.jars[g.from].querySelectorAll<HTMLElement>('.slot:not(.empty) .treat')]
      .slice(-run.count).filter(source => !source.classList.contains('mystery'));
    if (!g.sources.length) return;
    const size = g.sources[g.sources.length - 1].getBoundingClientRect();
    const step = size.height * .44;
    const ghost = document.createElement('div');
    ghost.className = 'puzzle-drag-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = `${size.width}px`;
    ghost.style.height = `${size.height + (g.sources.length - 1) * step}px`;
    g.sources.forEach((source, index) => {
      const piece = document.createElement('div');
      piece.className = 'drag-piece';
      piece.style.cssText = `width:${size.width}px;height:${size.height}px;top:${(g.sources.length - 1 - index) * step}px`;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.classList.remove('in-flight', 'drag-held');
      piece.append(clone);
      ghost.append(piece);
      g.pieces.push(piece);
      source.classList.add('drag-held');
    });
    document.body.append(ghost);
    g.ghost = ghost;
    g.dragging = true;
    suppressClick = true;
    root.classList.add('puzzle-dragging');
    g.jars.forEach(jar => {
      const index = Number(jar.dataset.jar);
      jar.classList.toggle('drag-source', index === g.from);
      jar.classList.toggle('drag-valid', canPour(g.board, g.from, index) > 0);
    });
    // Keep capture on the source jar, whose touch-action owns this gesture.
    // Its DOM stays stable until after the native pointerup completes.
    // Capture only after crossing the movement threshold;
    // a normal tap still delivers its click to the original jar button.
    g.capture.setPointerCapture(g.pointer);
    options.lift();
  }

  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Navigation may remove a cancelled touch's original DOM target before its
    // pointerup bubbles. A new primary contact starts a fresh pointer sequence.
    if (event.isPrimary && !gesture) pointers.clear();
    pointers.add(event.pointerId);
    if (pointers.size > 1) { cancel(true); return; }
    suppressClick = false;
    stopReturn();
    stopReturn = () => {};
    const jar = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-jar]');
    const board = options.board();
    if (!jar || !root.contains(jar) || root.inert || !board || !event.isPrimary) return;
    const from = Number(jar.dataset.jar);
    if (!board.tubes[from]?.length) return;
    gesture = {
      pointer: event.pointerId, from, board, startX: event.clientX, startY: event.clientY,
      touch: event.pointerType === 'touch', dragging: false,
      jars: [...root.querySelectorAll<HTMLButtonElement>('[data-jar]')],
      capture: jar,
      sources: [], pieces: [], ghost: null, target: null,
    };
  }, { capture: true, signal });

  document.addEventListener('pointermove', event => {
    const g = gesture;
    if (!g || g.pointer !== event.pointerId) return;
    if (options.board() !== g.board) { cancel(); return; }
    if (!g.dragging && Math.hypot(event.clientX - g.startX, event.clientY - g.startY) < 8) return;
    if (!g.dragging) begin(g);
    if (!g.dragging) return;
    nextX = event.clientX; nextY = event.clientY;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      if (gesture === g) position(g, nextX, nextY);
    });
  }, { capture: true, passive: true, signal });

  document.addEventListener('pointerup', event => {
    pointers.delete(event.pointerId);
    const g = gesture;
    if (!g || g.pointer !== event.pointerId) return;
    if (!g.dragging) { release(g); return; }
    // Suppress only this drag's click in the capture listener below. Cancelling
    // pointerup can interfere with the browser's next native touch activation.
    position(g, event.clientX, event.clientY);
    const to = g.target;
    const valid = options.board() === g.board && to !== null && canPour(g.board, g.from, to) > 0;
    const origins = g.pieces.map(piece => piece.getBoundingClientRect());
    release(g);
    if (valid && to !== null) {
      // A sealed jar displays only its known top piece while being dragged.
      // After committing, all transferred pieces may animate from that point.
      const count = canPour(g.board, g.from, to);
      const starts = Array.from({ length: count }, (_, i) => origins[Math.min(i, origins.length - 1)]);
      removeGhost(g);
      options.drop(g.from, to, starts);
    } else {
      returnHome(g);
      if (options.board() === g.board) {
        const target = g.jars.find(jar => { const r=jar.getBoundingClientRect(); return event.clientX>=r.left && event.clientX<=r.right && event.clientY>=r.top && event.clientY<=r.bottom; });
        const index = target ? Number(target.dataset.jar) : null;
        if (index !== null && index !== g.from) options.reject?.(g.from,index);
      }
    }
  }, { capture: true, passive: true, signal });

  document.addEventListener('pointercancel', event => {
    pointers.delete(event.pointerId);
    if (gesture?.pointer === event.pointerId) cancel();
  }, { capture: true, signal });
  root.addEventListener('lostpointercapture', event => {
    // Touch starts with implicit capture on an inner piece. Only losing the
    // explicit jar capture interrupts the gesture.
    if (gesture && event.target === gesture.capture && gesture.pointer === event.pointerId) cancel();
  }, { signal });
  root.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, { capture: true, signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') cancel(true);
    // Keyboard activation remains a separate, accessible control path.
    if (!gesture && pointers.size === 0) suppressClick = false;
  }, { capture: true, signal });
  window.addEventListener('blur', () => { cancel(); pointers.clear(); }, { signal });
  window.addEventListener('resize', () => cancel(), { signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancel(); pointers.clear(); }
  }, { signal });

  return {
    cancel: () => cancel(),
    dispose() { cancel(); events.abort(); pointers.clear(); },
  };
}
