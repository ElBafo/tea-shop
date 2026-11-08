import type { Board } from '../game/types';
import type { Puzzle3DView } from './puzzle-3d';
import './normal-puzzle-3d.css';

/** One scene per play session, independent of DOM repainting and persistence. */
export function normalPuzzle3D(root: HTMLElement) {
  let canvas: HTMLCanvasElement | null = null;
  let view: Puzzle3DView | null = null;
  let shelf: HTMLElement | null = null;
  let board: Board | null = null;
  let selected: number | null = null;
  let dragging: number | null = null;
  let generation = 0, timer = 0;
  let failed = false, ready = false;

  function fallback() {
    if (failed) return;
    failed = true; ready = false; generation++;
    window.clearTimeout(timer);
    root.classList.remove('puzzle-in-3d');
    shelf?.classList.remove('normal-puzzle-3d');
    // Restore any in-flight native ghost when WebGL disappears mid-gesture.
    document.querySelectorAll('.puzzle-drag-ghost.is-3d').forEach(e => e.classList.remove('is-3d'));
    view?.dispose(); view = null;
    canvas?.remove(); canvas = null;
    if (shelf && !shelf.querySelector('.renderer-recovery')) {
      const note = document.createElement('span');
      note.className = 'renderer-recovery'; note.setAttribute('role', 'status');
      note.textContent = '3D is unavailable. You can keep playing here.';
      shelf.append(note);
    }
  }

  function paint() {
    if (!view || !board) return;
    try { view.resize(); view.sync(board, selected); }
    catch { fallback(); }
  }

  return {
    get active() { return ready && !!view; },
    sync(next: Board, selection: number | null) {
      board = next; selected = selection; dragging = null;
      const nextShelf = root.querySelector<HTMLElement>('.shelves');
      if (!nextShelf || failed) return;
      // Keep the observed shelf and scene alive across native-button repaints.
      if (shelf && shelf !== nextShelf) {
        shelf.replaceChildren(...nextShelf.childNodes);
        nextShelf.replaceWith(shelf);
        shelf.setAttribute('aria-busy', nextShelf.getAttribute('aria-busy') ?? 'false');
        shelf.dataset.count = nextShelf.dataset.count;
        shelf.dataset.capacity = nextShelf.dataset.capacity;
      } else shelf = nextShelf;
      if (canvas) shelf.prepend(canvas);
      if (ready) shelf.classList.add('normal-puzzle-3d');
      if (view) { paint(); return; }
      if (canvas) return; // Module/first-frame initialization is already pending.
      canvas = document.createElement('canvas');
      canvas.className = 'normal-puzzle-canvas'; canvas.setAttribute('aria-hidden', 'true');
      canvas.addEventListener('puzzle3d-unavailable', fallback);
      shelf.prepend(canvas);
      const token = ++generation;
      timer = window.setTimeout(fallback, 8000);
      void import('./puzzle-3d').then(({createPuzzle3D}) => {
        if (token !== generation || !canvas || !shelf) return;
        view = createPuzzle3D(canvas, shelf);
        paint();
        return view?.ready.then(() => {
          if (token !== generation || !shelf || !view) return;
          window.clearTimeout(timer);
          const reveal = () => {
            if (token !== generation || !shelf || !view) return;
            // Never switch artwork in the middle of a native drag or flight.
            if (root.classList.contains('puzzle-dragging') || shelf.getAttribute('aria-busy') === 'true') {
              timer = window.setTimeout(reveal, 50); return;
            }
            ready = true;
            shelf.classList.add('normal-puzzle-3d');
            root.classList.add('puzzle-in-3d');
          };
          reveal();
        });
      }).catch(() => { if (token === generation) fallback(); });
    },
    move(from: number, point: {x: number; y: number}) {
      if (!ready || !view || !board) return;
      try {
        if (dragging !== from) { view.sync(board, from); dragging = from; }
        view.lift(from, point);
      } catch { fallback(); }
    },
    release() {
      if (!view || dragging === null) return;
      dragging = null;
      try { view.lift(null); if (board) view.sync(board, selected); }
      catch { fallback(); }
    },
    settle(from: number, to: number) { return view?.settle(from, to) ?? Promise.resolve(); },
    dispose() {
      generation++; window.clearTimeout(timer);
      root.classList.remove('puzzle-in-3d');
      view?.dispose(); view = null;
      canvas?.remove(); canvas = null; shelf = null; board = null;
      failed = false; ready = false; dragging = null;
    },
  };
}
