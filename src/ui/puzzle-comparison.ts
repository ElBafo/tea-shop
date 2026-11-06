import { EDITION_LEVELS } from '../game/edition-levels';
import { applyMove, boardFromLevel, canPour, cloneBoard, isCompleteTube, isWon, starsForMoves, topRun } from '../game/engine';
import { ITEMS } from '../game/items';
import type { Board } from '../game/types';
import { APP_VERSION } from '../game/version';
import { treatMarkup } from './items';
import { animatePour, pourOrigins } from './motion';
import { bindPuzzleDrag } from './puzzle-drag';
import { mountPuzzleGuide } from './puzzle-guide';
import { createPuzzle3D, type Puzzle3DView } from './puzzle-3d';
import './puzzle-comparison.css';

type Presentation = 'current' | '3d';
const SAMPLES = [{id:1,name:'Standard'}, {id:18,name:'Tall'}, {id:5,name:'Hidden'}];

/** Preview-only experiment. The controller deliberately has no storage or reward API. */
export async function mountPuzzleComparison(root: HTMLElement): Promise<void> {
  let sample = 0;
  let level = EDITION_LEVELS.find(item => item.id === SAMPLES[sample].id)!;
  let board = boardFromLevel(level);
  let history: Board[] = [];
  let selected: number | null = null;
  let mode: Presentation = '3d';
  let view: Puzzle3DView | null = null;
  let busy = false, disposed = false, guide = true;
  let generation = 0, suppress3DClick = false;
  let stopGuide = () => {};
  let stopMotion = () => {};
  let message = '';
  const controller = new AbortController();
  const signal = controller.signal;
  const back = new URL(location.href);
  ['puzzle3d','tour','showroom'].forEach(name => back.searchParams.delete(name));

  root.innerHTML = `<section class="frame play puzzle-comparison" aria-label="Puzzle presentation comparison">
    <header class="comparison-header"><a class="comparison-back" href="${back.pathname + back.search}">← Shop</a><h2>Tea shelf</h2><small>v${APP_VERSION}</small></header>
    <div class="comparison-controls"><div class="comparison-switch" role="group" aria-label="Presentation"><button type="button" data-renderer="current" data-comparison-renderer="current">Current</button><button type="button" data-renderer="3d" data-comparison-renderer="3d">3D</button></div><label class="comparison-sample-label">Sample <select id="comparison-sample">${SAMPLES.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}</select></label></div>
    <div class="comparison-meta"><p class="comparison-moves">0 moves</p><strong class="comparison-name"></strong><button id="comparison-guide" type="button" aria-pressed="true">Hide guide</button></div>
    <div class="comparison-shelf shelves" aria-busy="false"><canvas class="comparison-canvas" aria-hidden="true"></canvas><div class="shelf-row"></div><div class="plank" aria-hidden="true"></div></div>
    <p class="comparison-status" role="status" aria-live="polite"></p>
    <div class="comparison-result" hidden><strong>All tidy</strong><span class="comparison-score"></span><button type="button" data-next-sample>Try another sample →</button></div>
    <div class="play-bar"><button id="comparison-undo" type="button">Undo</button><button id="comparison-restart" type="button">Restart</button></div>
    <p class="comparison-note">Sample play · progress not saved</p>
  </section>`;
  const frame = root.querySelector<HTMLElement>('.puzzle-comparison')!;
  const shelf = root.querySelector<HTMLElement>('.comparison-shelf')!;
  const row = root.querySelector<HTMLElement>('.shelf-row')!;
  const canvas = root.querySelector<HTMLCanvasElement>('.comparison-canvas')!;
  const status = root.querySelector<HTMLElement>('.comparison-status')!;
  const sampleSelect = root.querySelector<HTMLSelectElement>('#comparison-sample')!;
  const undo = root.querySelector<HTMLButtonElement>('#comparison-undo')!;
  const restart = root.querySelector<HTMLButtonElement>('#comparison-restart')!;
  const guideButton = root.querySelector<HTMLButtonElement>('#comparison-guide')!;

  function jarsMarkup() {
    return board.tubes.map((tube, index) => {
      const held = selected === index;
      const run = held ? topRun(tube) : null;
      const hiddenStart = board.sealed[index] ? Math.max(0, tube.length - 1) : -1;
      const labels = tube.map((item, slot) => hiddenStart >= 0 && slot < hiddenStart ? 'hidden' : ITEMS[item].label);
      const slots = Array.from({length:board.capacity}, (_,slot) => {
        const item = tube[slot];
        if (!item) return '<div class="slot empty"></div>';
        const concealed = hiddenStart >= 0 && slot < hiddenStart;
        return `<div class="slot ${run && slot >= tube.length - (board.sealed[index] ? 1 : run.count) ? 'held' : ''}">${treatMarkup(item,concealed)}${board.sealed[index] && slot === tube.length - 2 ? '<span class="lid" aria-hidden="true"></span>' : ''}</div>`;
      }).join('');
      const done = isCompleteTube(tube, board.capacity);
      const valid = selected !== null && canPour(board,selected,index) > 0;
      return `<button type="button" class="jar ${held ? 'selected' : ''} ${done ? 'done' : ''} ${valid ? 'valid-target' : ''}" data-jar="${index}" aria-pressed="${held}" aria-label="Jar ${index+1}, ${tube.length} of ${board.capacity}${done ? ', complete' : ''}${labels.length ? ', bottom to top: '+labels.join(', ') : ', empty'}"><span class="jar-neck"></span><span class="jar-glass"><span class="stack" style="--slots:${board.capacity}">${slots}</span></span>${done ? '<span class="jar-check" aria-hidden="true">✓</span>' : ''}<span class="jar-capacity" aria-hidden="true">${done ? "Full ✓" : `${tube.length} / ${board.capacity}`}</span></button>`;
    }).join('');
  }

  function updateGuide() {
    stopGuide(); stopGuide = () => {};
    guideButton.textContent = guide ? 'Hide guide' : 'Show guide';
    guideButton.setAttribute('aria-pressed',String(guide));
    if (guide && !busy && !isWon(board) && !root.classList.contains('puzzle-dragging')) stopGuide = mountPuzzleGuide(root,board,selected);
  }

  function renderBoard(landed?: {jar:number;count:number}) {
    if (disposed) return;
    stopGuide(); stopGuide = () => {};
    const focusJar = (document.activeElement as HTMLElement | null)?.dataset.jar;
    row.innerHTML = jarsMarkup();
    if (landed) [...row.querySelectorAll<HTMLElement>(`[data-jar="${landed.jar}"] .slot:not(.empty)`)].slice(-landed.count).forEach(slot => slot.classList.add('landed'));
    frame.dataset.renderer = mode;
    frame.dataset.sample = String(level.id);
    frame.dataset.moves = String(history.length);
    frame.dataset.won = String(isWon(board));
    frame.classList.toggle('comparison-3d',mode === '3d');
    shelf.dataset.count = String(board.tubes.length);
    shelf.dataset.capacity = String(board.capacity);
    shelf.setAttribute('aria-busy',String(busy));
    root.querySelector<HTMLElement>('.comparison-name')!.textContent = level.name;
    root.querySelector<HTMLElement>('.comparison-moves')!.textContent = `${history.length} ${history.length === 1 ? 'move' : 'moves'}`;
    sampleSelect.value = String(level.id);
    root.querySelectorAll<HTMLButtonElement>('button[data-renderer]').forEach(button => {
      button.setAttribute('aria-pressed',String(button.dataset.renderer === mode));
      button.disabled = busy;
    });
    sampleSelect.disabled = busy;
    undo.disabled = !history.length || busy;
    restart.disabled = busy;
    status.textContent = message;
    const won = isWon(board);
    root.querySelector<HTMLElement>('.comparison-result')!.hidden = !won;
    root.querySelector<HTMLElement>('.comparison-score')!.textContent = won ? `${'✦'.repeat(starsForMoves(history.length,level.par))} · ${history.length} moves` : '';
    canvas.hidden = mode !== '3d';
    view?.sync(board,selected);
    if (focusJar !== undefined) row.querySelector<HTMLButtonElement>(`[data-jar="${focusJar}"]`)?.focus({preventScroll:true});
    updateGuide();
  }

  function invalidMove(from:number,to:number) {
    const run = topRun(board.tubes[from]);
    const destination = board.tubes[to];
    if (run && destination && board.capacity - destination.length < run.count) message = board.sealed[from] ? 'This group needs more room.' : `Jar ${to+1} needs room for all ${run.count} matching pieces.`;
    else message = 'Choose an empty jar or the same flavour on top.';
    status.textContent = message;
  }

  function transfer(from:number,to:number,origins?:DOMRect[]) {
    if (busy || disposed || isWon(board)) return;
    const count = canPour(board,from,to);
    if (!count) { invalidMove(from,to); return; }
    const start = mode === 'current' ? origins ?? pourOrigins(root,from,count) : [];
    const previous = cloneBoard(board);
    const move = applyMove(board,from,to);
    if (!move) return;
    history.push(previous);
    selected = null;
    busy = true;
    message = isWon(board) ? 'Sample complete. Switch views to compare, or try another sample.' : '';
    const token = ++generation;
    shelf.setAttribute('aria-busy','true');
    stopGuide(); stopGuide = () => {};
    // Leave the pointerup target mounted until native gesture completion.
    window.setTimeout(() => {
      if (disposed || token !== generation) return;
      renderBoard({jar:to,count});
      let finished:Promise<void>;
      if (mode === '3d' && view) finished = view.settle(from,to);
      else {
        const animation = animatePour(root,to,move.item,start,Boolean(origins));
        stopMotion = animation.cancel;
        finished = animation.finished;
      }
      void finished.catch(() => {}).then(() => {
        if (disposed || token !== generation) return;
        stopMotion(); stopMotion = () => {};
        busy = false;
        renderBoard();
      });
    },0);
  }

  const currentDrag = bindPuzzleDrag(root,{
    board:() => mode === 'current' && !busy && !isWon(board) ? board : null,
    lift:() => { stopGuide(); stopGuide = () => {}; },
    drop:transfer,
  });
  // The existing Current-view controller removes its dragging class on return.
  const guideObserver = new MutationObserver(() => { if (!root.classList.contains('puzzle-dragging') && guide) updateGuide(); });
  guideObserver.observe(root,{attributes:true,attributeFilter:['class']});

  interface Gesture {id:number;from:number;x:number;y:number;active:boolean;capture:HTMLButtonElement;board:Board;priorSelected:number|null;}
  let gesture:Gesture|null = null;
  const pointers = new Set<number>();
  function clear3D(interrupted=false) {
    const active = gesture;gesture = null;
    if (interrupted && active?.active) selected = active.priorSelected;
    if (active?.active || interrupted) suppress3DClick = true;
    if (active && pointers.has(active.id) && active.capture.hasPointerCapture(active.id)) {
      try {active.capture.releasePointerCapture(active.id);} catch { /* Capture can already be gone. */ }
    }
    root.classList.remove('puzzle-dragging');
    view?.lift(null);
    row.querySelectorAll('.drag-over').forEach(jar=>jar.classList.remove('drag-over'));
    if (interrupted && active) {
      // Restore scene and accessible button state after native capture unwinds.
      // Navigation/reset may supersede this task, and must never redraw an old board.
      const token = generation;
      window.setTimeout(() => {
        if (!disposed && token === generation && !gesture && !busy) renderBoard();
      },0);
    }
  }
  function targetAt(x:number,y:number):number|null {
    const hit = document.elementFromPoint(x,y)?.closest<HTMLButtonElement>('[data-jar]');
    return hit && row.contains(hit) ? Number(hit.dataset.jar) : null;
  }
  document.addEventListener('pointerdown',event=>{
    if (mode !== '3d' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (event.isPrimary && !gesture) pointers.clear();
    pointers.add(event.pointerId);
    if (pointers.size > 1) {clear3D(true);updateGuide();return;}
    suppress3DClick = false;
    const jar = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-jar]');
    if (!jar || !row.contains(jar) || busy || root.inert || !event.isPrimary || isWon(board)) return;
    const from = Number(jar.dataset.jar);
    if (!board.tubes[from]?.length) return;
    gesture = {id:event.pointerId,from,x:event.clientX,y:event.clientY,active:false,capture:jar,board,priorSelected:selected};
  },{capture:true,signal});
  document.addEventListener('pointermove',event=>{
    const g = gesture;
    if (!g || g.id !== event.pointerId || mode !== '3d') return;
    if (g.board !== board) {clear3D(true);return;}
    if (!g.active && Math.hypot(event.clientX-g.x,event.clientY-g.y)<8) return;
    if (!g.active) {
      g.active = true;suppress3DClick = true;selected = g.from;
      row.querySelectorAll<HTMLButtonElement>('[data-jar]').forEach(jar=>jar.setAttribute('aria-pressed',String(Number(jar.dataset.jar)===selected)));
      root.classList.add('puzzle-dragging');stopGuide();stopGuide=()=>{};
      view?.sync(board,selected);
      try {g.capture.setPointerCapture(g.id);} catch {clear3D(true);return;}
    }
    view?.lift(g.from,{x:event.clientX,y:event.clientY});
    const target = targetAt(event.clientX,event.clientY);
    row.querySelectorAll<HTMLButtonElement>('[data-jar]').forEach(jar=>jar.classList.toggle('drag-over',Number(jar.dataset.jar)===target&&target!==null&&canPour(board,g.from,target)>0));
  },{capture:true,passive:true,signal});
  document.addEventListener('pointerup',event=>{
    pointers.delete(event.pointerId);
    const g = gesture;if (!g || g.id !== event.pointerId) return;
    const target = targetAt(event.clientX,event.clientY);
    const dragging = g.active;
    clear3D();
    if (!dragging) return;
    if (target !== null && canPour(board,g.from,target)>0) transfer(g.from,target);
    else {
      if(target!==null)invalidMove(g.from,target);
      else message='Drop over an empty or matching jar.';
      window.setTimeout(()=>{if(!disposed&&!busy)renderBoard();},0);
    }
  },{capture:true,passive:true,signal});
  document.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);if(gesture?.id===event.pointerId){clear3D(true);updateGuide();}},{capture:true,signal});
  root.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId&&event.target===gesture.capture){clear3D(true);updateGuide();}},{signal});
  root.addEventListener('click',event=>{if(mode==='3d'&&suppress3DClick&&event.detail!==0){event.preventDefault();event.stopImmediatePropagation();}},{capture:true,signal});
  root.addEventListener('click',event=>{
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-jar]');
    if(!button||!row.contains(button)||busy||isWon(board))return;
    const index=Number(button.dataset.jar);
    if(selected===index){selected=null;renderBoard();return;}
    if(selected===null){if(board.tubes[index].length){selected=index;message='Choose an empty or matching jar.';renderBoard();}return;}
    if(canPour(board,selected,index)>0)transfer(selected,index);
    else {invalidMove(selected,index);if(board.tubes[index].length)selected=index;renderBoard();}
  },{signal});

  function cancelTransient() {
    currentDrag.cancel();clear3D(true);pointers.clear();
    stopMotion();stopMotion=()=>{};generation++;busy=false;
  }
  function setMode(next:Presentation) {
    if(disposed)return;
    cancelTransient();view?.dispose();view=null;
    mode=next;renderBoard();
    if(mode==='3d') {
      try {
        const created=createPuzzle3D(canvas,shelf);
        if(mode==='3d'&&!disposed){view=created;view.sync(board,selected);}else created.dispose();
      } catch {fallback();}
    }
  }
  function fallback() {
    if(disposed||mode!=='3d')return;
    message='3D is unavailable here. Current view keeps this sample playable.';
    setMode('current');
  }
  canvas.addEventListener('puzzle3d-unavailable',fallback,{signal});
  root.querySelectorAll<HTMLButtonElement>('button[data-renderer]').forEach(button=>button.addEventListener('click',()=>{if(!busy)setMode(button.dataset.renderer as Presentation);},{signal}));
  function reset(nextSample=sample) {
    cancelTransient();sample=nextSample;level=EDITION_LEVELS.find(item=>item.id===SAMPLES[sample].id)!;
    board=boardFromLevel(level);history=[];selected=null;
    message='';
    renderBoard();
  }
  sampleSelect.addEventListener('change',()=>reset(SAMPLES.findIndex(item=>item.id===Number(sampleSelect.value))),{signal});
  restart.addEventListener('click',()=>reset(),{signal});
  undo.addEventListener('click',()=>{if(!history.length||busy)return;cancelTransient();board=history.pop()!;selected=null;message='Last move undone.';renderBoard();},{signal});
  guideButton.addEventListener('click',()=>{guide=!guide;updateGuide();},{signal});
  root.querySelector('[data-next-sample]')!.addEventListener('click',()=>reset((sample+1)%SAMPLES.length),{signal});
  window.addEventListener('blur',()=>{cancelTransient();renderBoard();},{signal});
  window.addEventListener('resize',()=>{clear3D(true);currentDrag.cancel();view?.resize();updateGuide();},{signal});
  shelf.addEventListener('scroll',()=>{clear3D(true);currentDrag.cancel();view?.resize();updateGuide();},{passive:true,signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelTransient();renderBoard();}},{signal});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){clear3D(true);currentDrag.cancel();selected=null;renderBoard();}
    if(!gesture&&!pointers.size)suppress3DClick=false;
  },{capture:true,signal});
  const dispose=()=>{
    if(disposed)return;disposed=true;generation++;
    clear3D();currentDrag.dispose();stopGuide();stopMotion();guideObserver.disconnect();controller.abort();view?.dispose();view=null;
  };
  root.querySelector('.comparison-back')!.addEventListener('click',dispose,{signal});
  window.addEventListener('pagehide',event=>{if(event.persisted){cancelTransient();renderBoard();}else dispose();},{signal});
  setMode('3d');
}
