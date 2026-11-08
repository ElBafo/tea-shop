import { ITEMS } from "../game/items";
import { isSecondEdition } from "../game/mode";
import { nextReward } from "../game/journey";
import { rewardCard } from "./reward";
import { openBackups } from './backup';
import { readPuzzle, writePuzzle } from '../game/resume';
import { CHAPTERS, milestoneAt, chapterBonus } from '../game/journey';
import { initGuide, guideStage, setGuide, guideCard, suggestedJar } from "../game/guide";
import { audioToggle, updateAudioToggle } from "./toggles";
import { animatePour, pourOrigins, reducedMotion } from "./motion";
import { bindPuzzleDrag } from './puzzle-drag';
import { mountPuzzleGuide } from './puzzle-guide';
import { normalPuzzle3D } from './normal-puzzle-3d';
import {
  playClick,
  playComplete,
  playDrop,
  playTeaDrop,
  playWin,
  unlockAudio,
} from "../game/audio";
import {
  applyMove,
  boardFromLevel,
  canPour,
  cloneBoard,
  isCompleteTube,
  isWon,
  starsForMoves,
  topRun,
} from "../game/engine";
import { LEVELS } from "../game/levels";
import {
  isLevelOpen,
  loadProgress,
  recordWin,
  setMuted,
  spendableStars,
} from "../game/storage";
import { mountShop, type ShopScreen } from "../shop/screen";
import type { Board, LevelDef, Progress, UpgradeId } from "../game/types";
import { treatMarkup } from "./items";

type Screen = "shop" | "levels" | "play";

interface PlayState {
  level: LevelDef;
  board: Board;
  history: Board[];
  selected: number | null;
  moves: number;
  busy: boolean;
  won: boolean;
  hint: boolean;
  earnedStars: number;
  celebrating: boolean;
  actions: [number,number][];
  milestone: string | null;
}

const STAR = "✦";

export function mountApp(root: HTMLElement): Promise<void> {
  initGuide();
  let progress = loadProgress();
  let screen: Screen = "shop";
  let play: PlayState | null = null;
  let pendingComplete: number[] = [];
  let landed: { jar: number; count: number } | null = null;
  let shop: ShopScreen | null = null;
  let stopMotion = () => {};
  let cancelDrag = () => {};
  let stopPuzzleGuide = () => {};
  const puzzle3D = normalPuzzle3D(root);

  window.addEventListener('decopu-save-failed',()=>{
    if(document.querySelector('.save-warning'))return;
    const warning=document.createElement('aside');warning.className='save-warning';warning.setAttribute('role','alert');
    warning.innerHTML='Progress cannot be saved on this device. <button type="button">Back up now</button>';
    warning.querySelector('button')!.onclick=()=>openBackups(progress,next=>{progress=next;play=null;leaveShop();screen='shop';render();});document.body.append(warning);
  });
  const unlockOnGesture = () => {
    void unlockAudio();
  };
  root.addEventListener("pointerup", unlockOnGesture, { capture: true });
  root.addEventListener("click", unlockOnGesture, { capture: true });
  root.addEventListener("keydown", unlockOnGesture, { capture: true });
  root.addEventListener("click", event => {
    if (!(event.target as HTMLElement).closest('.settings-menu')) {
      root.querySelectorAll('.settings-menu[open]').forEach(menu => menu.removeAttribute('open'));
    }
  });
  root.addEventListener("keydown", event => {
    if (event.key !== 'Escape') return;
    root.querySelectorAll<HTMLDetailsElement>('.settings-menu[open]').forEach(menu => {
      menu.open = false;
      menu.querySelector<HTMLElement>('summary')?.focus();
    });
  });

  const render = (editShop = false, reward?: UpgradeId) => {
    stopPuzzleGuide();
    stopPuzzleGuide = () => {};
    cancelDrag();
    stopMotion();
    stopMotion = () => {};
    const focusedJar = (document.activeElement as HTMLElement | null)?.dataset.jar;
    if (screen !== 'play') puzzle3D.dispose();
    if (screen === "shop") {
      if (shop) {
        shop.refresh();
        return;
      }
      root.innerHTML = "";
      shop = mountShop(root, {
        get progress() {
          return progress;
        },
        save(next) {
          progress = next;
        },
        playNext() {
          const unfinished = readPuzzle(progress);
          if (unfinished) { resumePuzzle(); return; }
          const next = LEVELS.find((_, i) => !progress.bestStars[i]) ?? LEVELS.find((_, i) => progress.bestStars[i] < 3);
          if (next) { startLevel(next); return; }
          playClick(progress.muted);
          leaveShop();
          screen = "levels";
          play = null;
          render();
        },
        goLevels() {
          playClick(progress.muted);
          leaveShop();
          screen = "levels";
          play = null;
          render();
        },
        resumePuzzle() { resumePuzzle(); },
        backups() { openBackups(progress,next=>{progress=next;play=null;leaveShop();render();}); },
        toggleMute() {
          progress = setMuted(progress, !progress.muted);
          if (!progress.muted) playClick(false);
        },
      }, editShop, reward);
      if (guideStage() === 'welcome') {
        root.querySelector<HTMLElement>('.shop-room')!.inert = true;
        root.insertAdjacentHTML('beforeend', `<div class="overlay welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title"><section class="modal welcome-card"><p class="kicker">Welcome to Decopu</p><h3 id="welcome-title">A little shop of your own</h3><div class="welcome-path" aria-hidden="true"><span>▤</span><b>→</b><span>✦</span><b>→</b><span>⌂</span></div><p>Sort treats, earn stars, and turn this quiet corner into your favourite place.</p><p class="welcome-note">No timer. No rush. Undo whenever you like.</p><button type="button" data-guide-start>Show me how</button><button type="button" class="ghost-btn" data-welcome-skip>Explore on my own</button></section></div>`);
        const welcome = root.querySelector<HTMLElement>('.welcome-overlay')!;
        welcome.querySelector('[data-guide-start]')!.addEventListener('click',()=>{ setGuide('puzzle'); startLevel(LEVELS[0]); });
        welcome.querySelector('[data-welcome-skip]')!.addEventListener('click',()=>{ setGuide('done'); welcome.remove(); root.querySelector<HTMLElement>('.shop-room')!.inert=false; root.querySelector<HTMLElement>('#play-tea')?.focus(); });
        welcome.addEventListener('keydown', event=>{
          if(event.key!=='Tab')return;
          const buttons=[...welcome.querySelectorAll<HTMLButtonElement>('button')];
          const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
          event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
        });
      }
      return;
    }
    leaveShop();
    if (screen === "levels") {
      root.innerHTML = levelsMarkup(progress);
    } else if (play) {
      root.innerHTML = playMarkup(play, progress, pendingComplete, landed);
      if (isSecondEdition) puzzle3D.sync(play.board, play.selected);
    }
    if (screen === 'levels' && guideStage() === 'decorate') root.querySelector('.level-grid')?.insertAdjacentHTML('beforebegin', guideCard('Your stars are ready', 'Try your first decoration, or keep playing to save up.', '<button type="button" data-go="shop" data-edit>Decorate shop →</button>'));
    bind(root);
    if (screen === 'play' && play && !play.busy && !play.won && guideStage() === 'puzzle') {
      stopPuzzleGuide = mountPuzzleGuide(root, play.board, play.selected);
    }
    if (focusedJar !== undefined && !root.querySelector('.result-overlay')) {
      root.querySelector<HTMLElement>(`[data-jar="${focusedJar}"]`)?.focus({preventScroll:true});
    }
  };

  const leaveShop = () => {
    shop?.dispose();
    shop = null;
  };

  const bind = (node: HTMLElement) => {
    node.querySelector('[data-resume]')?.addEventListener('click',resumePuzzle);
    node.querySelectorAll('[data-guide-skip]').forEach(button=>button.addEventListener('click',()=>{setGuide('done');render();}));
    const dialog = node.querySelector<HTMLElement>(".result-overlay");
    if (dialog) {
      node.querySelectorAll<HTMLElement>(".play > :not(.result-overlay)").forEach(element => { element.inert = true; });
      dialog.querySelector<HTMLButtonElement>("[data-next]")?.focus();
      dialog.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;
        const buttons = [...dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
        const next = (buttons.indexOf(document.activeElement as HTMLButtonElement) + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
        event.preventDefault();
        buttons[next]?.focus();
      });
    }

    node.querySelectorAll<HTMLButtonElement>('[data-reward]').forEach(button => button.addEventListener('click', () => {
      screen = 'shop'; play = null; render(true, button.dataset.reward as UpgradeId);
    }));
    node.querySelectorAll<HTMLElement>("[data-go]").forEach((el) => {
      el.addEventListener("click", () => {
        playClick(progress.muted);
        const dest = el.dataset.go;
        if (dest === "shop" || dest === "levels") {
          screen = dest;
          play = null;
          render(dest === "shop" && el.hasAttribute("data-edit"), isSecondEdition && el.hasAttribute("data-edit") ? nextReward(progress)?.item.id : undefined);
        }
      });
    });

    node.querySelectorAll<HTMLButtonElement>("[data-level]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = Number(el.dataset.level);
        const level = LEVELS[id - 1];
        if (!level || !isLevelOpen(progress, id - 1)) return;
        playClick(progress.muted);
        startLevel(level);
      });
    });

    node.querySelector("#mute")?.addEventListener("click", () => {
      progress = setMuted(progress, !progress.muted);
      if (!progress.muted) playClick(false);
      updateAudioToggle(node.querySelector("#mute"), progress.muted);
    });

    node.querySelector("#undo")?.addEventListener("click", () => {
      if (!play || play.busy || play.won || play.history.length === 0) return;
      playClick(progress.muted);
      const previous = play.history.pop();
      if (!previous) return;
      play.board = previous;
      play.selected = null;
      play.moves = Math.max(0, play.moves - 1);
      play.actions.pop();
      persistPuzzle();
      play.hint = false;
      render();
    });

    node.querySelectorAll("#restart, [data-replay]").forEach(button => button.addEventListener("click", () => {
      if (!play || play.busy) return;
      playClick(progress.muted);
      startLevel(play.level);
    }));

    node.querySelectorAll<HTMLButtonElement>("[data-jar]").forEach((el) => {
      el.addEventListener("click", () => {
        if (!play || play.busy || play.won) return;
        const index = Number(el.dataset.jar);
        onJar(index);
      });
    });

    node.querySelector("[data-next]")?.addEventListener("click", () => {
      if (!play) return;
      playClick(progress.muted);
      const next = LEVELS[play.level.id];
      if (next) startLevel(next);
      else {
        screen = "levels";
        play = null;
        render();
      }
    });
  };

  const startLevel = (level: LevelDef) => {
    screen = "play";
    pendingComplete = [];
    landed = null;
    play = {
      level,
      board: boardFromLevel(level),
      history: [],
      selected: null,
      moves: 0,
      busy: false,
      won: false,
      hint: level.id === 1,
      earnedStars: 0,
      celebrating: false,
      actions: [],
      milestone: null,
    };
    persistPuzzle();
    render();
  };

  function persistPuzzle() {
    if(play && !play.won) writePuzzle({version:1,levelId:play.level.id,actions:play.actions});
  }
  function resumePuzzle() {
    const resumed=readPuzzle(progress);if(!resumed)return;
    screen='play';pendingComplete=[];landed=null;
    play={level:LEVELS[resumed.save.levelId-1],board:resumed.board,history:resumed.history,actions:resumed.save.actions,moves:resumed.save.actions.length,selected:null,busy:false,won:false,hint:false,earnedStars:0,celebrating:false,milestone:null};
    render();
  }

  const onJar = (index: number) => {
    if (!play) return;
    if (play.selected === null) {
      if (play.board.tubes[index].length === 0) {
        shake(index);
        return;
      }
      play.selected = index;
      playClick(progress.muted);
      navigator.vibrate?.(12);
      render();
      return;
    }

    if (play.selected === index) {
      play.selected = null;
      playClick(progress.muted);
      render();
      return;
    }

    const from = play.selected;
    const count = canPour(play.board, from, index);
    if (count === 0) {
      if (play.board.tubes[index].length > 0) {
        play.selected = index;
        playClick(progress.muted);
        render();
      } else {
        shake(index);
      }
      rejectMove(from,index);
      return;
    }

    transfer(from, index);
  };

  const transfer = (from: number, index: number, draggedOrigins?: DOMRect[]) => {
    if (!play || play.busy || play.won) return;
    const count = canPour(play.board, from, index);
    if (!count) return;
    const origins = draggedOrigins ?? pourOrigins(root, from, count);
    const snapshot = cloneBoard(play.board);
    const destWasComplete = isCompleteTube(play.board.tubes[index], play.board.capacity);
    const move = applyMove(play.board, from, index);
    if (!move) return;

    play.history.push(snapshot);
    play.moves += 1;
    play.actions.push([from,index]);
    persistPuzzle();
    play.selected = null;
    play.hint = false;
    play.busy = true;
    pendingComplete = [];
    landed = { jar: index, count: move.count };
    if (isSecondEdition) playTeaDrop(progress.muted); else playDrop(progress.muted);

    const destNowComplete =
      !destWasComplete && isCompleteTube(play.board.tubes[index], play.board.capacity);
    if (destNowComplete) pendingComplete = [index];

    // Award the logical win before visual effects, so backgrounding or leaving
    // during the celebration cannot lose earned stars. Rules/scoring stay unchanged.
    const won = isWon(play.board);
    if (won) {
      play.won = true;
      const stars = starsForMoves(play.moves, play.level.par);
      play.earnedStars = Math.max(0, stars - progress.bestStars[play.level.id - 1]);
      const firstWin=progress.bestStars[play.level.id-1]===0;
      const previousBonus=chapterBonus(progress);
      progress = recordWin(progress, play.level.id - 1, stars, play.moves);
      play.earnedStars += chapterBonus(progress)-previousBonus;
      writePuzzle(null);
      if(firstWin) play.milestone=milestoneAt(progress.bestStars.filter(n=>n>0).length);
      if (guideStage() === 'puzzle') setGuide('decorate');
    }
    const activePlay = play;
    const present = () => {
      if (play !== activePlay || screen !== "play") return;
      render();
      const motion = puzzle3D.active
        ? { finished: puzzle3D.settle(from, index), cancel: () => {} }
        : animatePour(root, index, move.item, origins, Boolean(draggedOrigins));
      stopMotion = motion.cancel;
      void motion.finished.then(() => {
        if (play !== activePlay || screen !== "play") return;
        stopMotion = () => {};
        if (destNowComplete && (!isSecondEdition || !won)) playComplete(progress.muted);
        if (won) {
          landed = null;
          play.celebrating = true;
          playWin(progress.muted);
          render();
          window.setTimeout(() => {
            if (play !== activePlay || screen !== "play") return;
            play.celebrating = false;
            play.busy = false;
            pendingComplete = [];
            render();
          }, reducedMotion() ? 0 : isSecondEdition ? 260 : 420);
        } else {
          play.busy = false;
          render();
          landed = null;
          pendingComplete = [];
        }
      });
    };
    if (draggedOrigins) {
      // Keep the pointerup target attached until the native gesture completes.
      // The move and any reward are already committed; only painting waits.
      root.querySelector('.shelves')?.setAttribute('aria-busy', 'true');
      window.setTimeout(present, 0);
    } else present();
  };

  const rejectMove = (from: number, to: number) => {
    if (!play || !isSecondEdition) return;
    root.querySelector('.move-feedback')?.remove();
    const tube=play.board.tubes[to], run=topRun(play.board.tubes[from]);
    const bubble=document.createElement('span'); bubble.className='move-feedback'; bubble.setAttribute('role','status');
    bubble.textContent=run && play.board.capacity-tube.length < run.count ? 'The whole group needs room' : 'Match the top flavour';
    root.querySelector(`[data-jar="${to}"]`)?.append(bubble);
    window.setTimeout(()=>bubble.remove(),1800);
  };

  const shake = (index: number) => {
    playClick(progress.muted);
    const jar = root.querySelector(`[data-jar="${index}"]`);
    jar?.classList.remove("shake");
    void (jar as HTMLElement | null)?.offsetWidth;
    jar?.classList.add("shake");
  };

  const drag = bindPuzzleDrag(root, {
    board: () => screen === 'play' && play && !play.busy && !play.won ? play.board : null,
    lift: () => { playClick(progress.muted); navigator.vibrate?.(12); },
    move: (from, point) => puzzle3D.move(from, point),
    release: () => puzzle3D.release(),
    drop: transfer,
    reject: rejectMove,
  });
  cancelDrag = drag.cancel;
  window.addEventListener('pagehide', event => { if (!event.persisted) puzzle3D.dispose(); });
  render();
  const initialShop = shop as ShopScreen | null;
  return initialShop ? initialShop.ready() : Promise.resolve();
}

function levelsMarkup(progress: Progress): string {
  const nextIndex = progress.bestStars.findIndex(stars => stars === 0);
  const practiceIndex = progress.bestStars.findIndex(stars => stars < 3);
  const recommended = LEVELS[nextIndex >= 0 ? nextIndex : practiceIndex >= 0 ? practiceIndex : 0];
  const completed = progress.bestStars.filter(stars => stars > 0).length;
  const buttons = LEVELS.map((level, index) => {
    const open = isLevelOpen(progress, index);
    const stars = progress.bestStars[index];
    return `<button class="level-btn ${open ? "" : "is-locked"} ${level === recommended ? "is-current" : ""}" data-level="${level.id}" ${open ? "" : "disabled"} aria-label="Puzzle ${level.id}: ${level.name}, ${open ? `${stars} of 3 stars` : "locked"}">
      <span class="level-num">${level.id}</span>
      <span class="level-name">${level.name}</span>
      <span class="mini-stars" aria-hidden="true">${open ? starText(stars) : "Locked"}</span>
    </button>`;
  });
  const resume=readPuzzle(progress);
  const chapters=CHAPTERS.map((chapter,i)=>{
    const count=progress.bestStars.slice(chapter.start-1,chapter.end).filter(n=>n>0).length;
    const current=recommended.id>=chapter.start&&recommended.id<=chapter.end;
    return `<details class="puzzle-chapter" ${current?'open':''}><summary><span><strong>${i+1} · ${chapter.name}</strong><small>${chapter.copy}</small></span><span>${count}/${chapter.end-chapter.start+1}</span></summary><div class="level-grid">${buttons.slice(chapter.start-1,chapter.end).join('')}</div></details>`;
  }).join('');
  return `<div class="frame levels">
    ${topBar("Puzzles", progress, "shop", true)}
    ${resume?`<button class="resume-card" data-resume type="button">Resume ${LEVELS[resume.save.levelId-1].name}<small>${resume.save.actions.length} moves · Undo history saved</small></button>`:''}
    <button class="continue-card" data-level="${recommended.id}" type="button">
      <span><strong>${nextIndex >= 0 ? completed ? "Continue" : "Start playing" : "Play again"}</strong><small>${recommended.id} · ${recommended.name}</small></span><span aria-hidden="true">→</span>
    </button>
    <p class="collection-summary">All puzzles <span>${completed} / ${LEVELS.length} completed</span></p>
    ${rewardCard(progress)}
    <div class="chapter-list">${chapters}</div>
  </div>`;
}

function playMarkup(
  play: PlayState,
  progress: Progress,
  pendingComplete: number[],
  landed: { jar: number; count: number } | null,
): string {
  const { level, board, selected, moves, won } = play;
  const jars = board.tubes
    .map((tube, index) => {
      const lifted = selected === index;
      const run = lifted ? topRun(tube) : null;
      const hiddenStart = board.sealed[index] ? Math.max(0, tube.length - 1) : -1;
      const slots = [];
      for (let slot = 0; slot < board.capacity; slot += 1) {
        const item = tube[slot];
        if (!item) {
          slots.push(`<div class="slot empty"></div>`);
          continue;
        }
        const hidden = hiddenStart >= 0 && slot < hiddenStart;
        const held = Boolean(run && slot >= tube.length - (board.sealed[index] ? 1 : run.count));
        const justLanded = Boolean(
          landed &&
            landed.jar === index &&
            slot >= tube.length - landed.count,
        );
        slots.push(
          `<div class="slot ${held ? "held" : ""} ${justLanded ? "landed" : ""}">${treatMarkup(item, hidden)}${board.sealed[index] && slot === tube.length - 2 ? '<span class="lid" aria-hidden="true"></span>' : ""}</div>`,
        );
      }
      const contents = tube.length ? tube.map((item,slot) => hiddenStart >= 0 && slot < hiddenStart ? 'hidden' : ITEMS[item].label).join(', ') : 'Empty';
      const done = isCompleteTube(tube, board.capacity);
      const celebrate = pendingComplete.includes(index) || play.celebrating;
      const validTarget = selected !== null && selected !== index && canPour(board, selected, index) > 0;
      const puff = done && celebrate
        ? `<span class="puff" aria-hidden="true">${sparkles()}</span>`
        : "";
      return `
        <button class="jar ${lifted ? "selected" : ""} ${done ? "done" : ""} ${validTarget ? "valid-target" : ""} ${celebrate ? "just-completed" : ""} ${guideStage() === 'puzzle' && !play.busy && suggestedJar(board, selected) === index ? 'guide-target' : ''}" style="--jar-order:${index}" data-jar="${index}" type="button" aria-pressed="${lifted}" aria-label="Jar ${index + 1}, ${tube.length} of ${board.capacity}${done ? ', complete' : ''}" ${isSecondEdition ? `aria-describedby="jar-contents-${index}"` : ''}>
          ${isSecondEdition ? `<span class="visually-hidden" id="jar-contents-${index}">Bottom to top: ${contents}</span>` : ''}
          <span class="jar-neck"></span>
          <span class="jar-glass">
            <span class="stack" style="--slots:${board.capacity}">${slots.join("")}</span>
          </span>
          ${done ? '<span class="jar-check" aria-hidden="true">✓</span>' : ''}${isSecondEdition ? `<span class="jar-capacity" aria-hidden="true">${done ? "Full ✓" : `${tube.length} / ${board.capacity}`}</span>` : ""}
          ${puff}
        </button>`;
    })
    .join("");

  const hint = guideStage() === 'puzzle'
    ? `<aside class="guide-card puzzle-guide-heading" aria-label="Getting started"><strong>Fill each jar with one kind</strong><button type="button" data-guide-skip aria-label="Skip the getting-started guide">Skip</button></aside>`
    : isSecondEdition ? ""
    : play.hint
    ? `<p class="hint">Fill each jar with one kind. Drag treats, or tap two jars.</p>`
    : "";

  const overlay = won && !play.busy ? winOverlay(play, progress) : "";

  return `
    <div class="frame play ${play.celebrating ? "celebrating" : ""}">
      ${topBar(level.name, progress, "levels")}
      <div class="play-meta">
        <p class="moves">${moves} ${moves === 1 ? "move" : "moves"}</p>
        <p class="par" aria-label="Three stars in ${level.par} moves or fewer">3 ${STAR} ≤ ${level.par} moves</p>
      </div>
      ${hint}
      <div class="shelves" aria-busy="${play.busy}" data-count="${board.tubes.length}" data-capacity="${board.capacity}">
        <div class="shelf-row">${jars}</div>
        <div class="plank" aria-hidden="true"></div>
      </div>
      <div class="play-bar">
        <button id="undo" type="button" ${play.history.length === 0 || won || play.busy ? "disabled" : ""}>Undo</button>
        <button id="restart" type="button" ${play.busy ? "disabled" : ""}>Restart</button>
      </div>
      <p class="visually-hidden" role="status">${play.celebrating ? 'All jars tidy. Puzzle complete.' : pendingComplete.length ? 'Jar complete.' : ''}</p>
      ${overlay}
    </div>`;
}

function topBar(title: string, progress: Progress, dest: "shop" | "levels", balance = false): string {
  return `<header class="topbar screen-toolbar">
    <button class="icon-btn" data-go="${dest}" type="button">← ${dest === "shop" ? "Shop" : "Puzzles"}</button>
    <h2>${title}</h2>
    ${balance ? `<span class="balance-pill" aria-label="${spendableStars(progress)} stars available"><span aria-hidden="true">${STAR}</span> <strong>${spendableStars(progress)}</strong></span>` : ""}
    ${audioToggle(progress.muted)}
  </header>`;
}

function winOverlay(play: PlayState, progress: Progress): string {
  const stars = starsForMoves(play.moves, play.level.par);
  const best = progress.bestMoves[play.level.id - 1];
  const next = LEVELS[play.level.id];
  return `<div class="overlay result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
    <div class="modal result-card" data-earned="${play.earnedStars > 0}" data-milestone="${Boolean(play.milestone)}">
      <div class="result-confetti" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%;--turn:${i%2?180:-160}deg"></i>`).join('')}</div>
      <span class="result-seal" aria-hidden="true">✓</span>
      <p class="kicker">Puzzle ${play.level.id} complete</p>
      <h3 id="result-title">${isSecondEdition && play.milestone ? "A little milestone" : "All tidy"}</h3>
      <p class="big-stars" aria-label="${stars} of 3 stars">${starText(stars)}</p>
      <p class="result-reward">${play.earnedStars ? `+${play.earnedStars} ${STAR} for your shop` : "Best stars already collected"}</p>
      ${isSecondEdition ? rewardCard(progress,play.earnedStars) : ""}
      ${guideStage() === 'decorate' ? '<p class="guide-reward">These stars are yours to spend. Try Decorate shop to choose your first piece.</p>' : ''}
      ${play.milestone?`<p class="milestone-reward">${isSecondEdition && play.milestone.startsWith("+") ? "Includes " : ""}${play.milestone}</p>`:""}
      <p class="result-stats">${play.moves} moves · Best ${best}</p>
      <div class="modal-actions">
        <button class="primary-action" data-next type="button">${next ? "Next puzzle →" : "All puzzles"}</button>
        <button data-go="shop" data-edit type="button">Decorate shop <span aria-label="${spendableStars(progress)} stars available">${STAR} ${spendableStars(progress)}</span></button>
        <button data-replay type="button" class="ghost-btn">Play again</button>
      </div>
    </div>
  </div>`;
}

function starText(count: number): string {
  return [1, 2, 3]
    .map((n) => `<span class="${n <= count ? "on" : "off"}">${STAR}</span>`)
    .join("");
}

function sparkles(): string {
  return Array.from({ length: 7 }, (_, i) => `<i class="spark s${i}"></i>`).join(
    "",
  );
}

