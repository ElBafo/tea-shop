import { initGuide, guideStage, setGuide, guideCard, suggestedJar } from "../game/guide";
import { audioToggle, updateAudioToggle } from "./toggles";
import { animatePour, pourOrigins, reducedMotion } from "./motion";
import {
  playClick,
  playComplete,
  playDrop,
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
import type { Board, LevelDef, Progress } from "../game/types";
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

  const render = (editShop = false) => {
    stopMotion();
    stopMotion = () => {};
    const focusedJar = (document.activeElement as HTMLElement | null)?.dataset.jar;
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
        goLevels() {
          playClick(progress.muted);
          leaveShop();
          screen = "levels";
          play = null;
          render();
        },
        toggleMute() {
          progress = setMuted(progress, !progress.muted);
          if (!progress.muted) playClick(false);
        },
      }, editShop);
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
    }
    if (screen === 'levels' && guideStage() === 'decorate') root.querySelector('.level-grid')?.insertAdjacentHTML('beforebegin', guideCard('Your stars are ready', 'Try your first decoration, or keep playing to save up.', '<button type="button" data-go="shop" data-edit>Decorate shop →</button>'));
    bind(root);
    if (focusedJar !== undefined && !root.querySelector('.result-overlay')) {
      root.querySelector<HTMLElement>(`[data-jar="${focusedJar}"]`)?.focus({preventScroll:true});
    }
  };

  const leaveShop = () => {
    shop?.dispose();
    shop = null;
  };

  const bind = (node: HTMLElement) => {
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

    node.querySelectorAll<HTMLElement>("[data-go]").forEach((el) => {
      el.addEventListener("click", () => {
        playClick(progress.muted);
        const dest = el.dataset.go;
        if (dest === "shop" || dest === "levels") {
          screen = dest;
          play = null;
          render(dest === "shop" && el.hasAttribute("data-edit"));
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
    };
    render();
  };

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
      return;
    }

    const origins = pourOrigins(root, from, count);
    const snapshot = cloneBoard(play.board);
    const destWasComplete = isCompleteTube(play.board.tubes[index], play.board.capacity);
    const move = applyMove(play.board, from, index);
    if (!move) return;

    play.history.push(snapshot);
    play.moves += 1;
    play.selected = null;
    play.hint = false;
    play.busy = true;
    pendingComplete = [];
    landed = { jar: index, count: move.count };
    playDrop(progress.muted);

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
      progress = recordWin(progress, play.level.id - 1, stars, play.moves);
      if (guideStage() === 'puzzle') setGuide('decorate');
    }
    render();
    const activePlay = play;
    const motion = animatePour(root, index, move.item, origins);
    stopMotion = motion.cancel;
    void motion.finished.then(() => {
      if (play !== activePlay || screen !== "play") return;
      stopMotion = () => {};
      if (destNowComplete) playComplete(progress.muted);
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
        }, reducedMotion() ? 0 : 420);
      } else {
        play.busy = false;
        render();
        landed = null;
        pendingComplete = [];
      }
    });
  };

  const shake = (index: number) => {
    playClick(progress.muted);
    const jar = root.querySelector(`[data-jar="${index}"]`);
    jar?.classList.remove("shake");
    void (jar as HTMLElement | null)?.offsetWidth;
    jar?.classList.add("shake");
  };

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
  }).join("");
  return `<div class="frame levels">
    ${topBar("Puzzles", progress, "shop", true)}
    <button class="continue-card" data-level="${recommended.id}" type="button">
      <span><strong>${nextIndex >= 0 ? completed ? "Continue" : "Start playing" : "Play again"}</strong><small>${recommended.id} · ${recommended.name}</small></span><span aria-hidden="true">→</span>
    </button>
    <p class="collection-summary">All puzzles <span>${completed} / ${LEVELS.length} completed</span></p>
    <div class="level-grid">${buttons}</div>
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
        const held = Boolean(run && slot >= tube.length - run.count);
        const justLanded = Boolean(
          landed &&
            landed.jar === index &&
            slot >= tube.length - landed.count,
        );
        slots.push(
          `<div class="slot ${held ? "held" : ""} ${justLanded ? "landed" : ""}">${treatMarkup(item, hidden)}</div>`,
        );
      }
      const done = isCompleteTube(tube, board.capacity);
      const celebrate = pendingComplete.includes(index) || play.celebrating;
      const validTarget = selected !== null && selected !== index && canPour(board, selected, index) > 0;
      const lid = board.sealed[index]
        ? `<span class="lid" aria-hidden="true"></span>`
        : "";
      const puff = done && celebrate
        ? `<span class="puff" aria-hidden="true">${sparkles()}</span>`
        : "";
      return `
        <button class="jar ${lifted ? "selected" : ""} ${done ? "done" : ""} ${validTarget ? "valid-target" : ""} ${celebrate ? "just-completed" : ""} ${guideStage() === 'puzzle' && !play.busy && suggestedJar(board, selected) === index ? 'guide-target' : ''}" style="--jar-order:${index}" data-jar="${index}" type="button" aria-pressed="${lifted}" aria-label="Jar ${index + 1}, ${tube.length} of ${board.capacity}${done ? ', complete' : ''}">
          <span class="jar-neck"></span>
          <span class="jar-glass">
            ${lid}
            <span class="stack" style="--slots:${board.capacity}">${slots.join("")}</span>
          </span>
          ${done ? '<span class="jar-check" aria-hidden="true">✓</span>' : ''}
          ${puff}
        </button>`;
    })
    .join("");

  const hint = guideStage() === 'puzzle'
    ? guideCard('1 · Fill each jar with one kind', selected === null ? 'Tap a jar to lift its top treats. Each finished jar must be full.' : suggestedJar(board, selected) === -1 ? 'That jar has no matching space. Tap another jar to try a different move.' : 'Tap a matching or empty jar to move the treats. The highlighted jar is one option.')
    : play.hint
    ? `<p class="hint">Fill each jar with one kind. Tap two jars to move treats.</p>`
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
    <div class="modal result-card">
      <div class="result-confetti" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--i:${i};--x:${(i*37)%100}%;--turn:${i%2?180:-160}deg"></i>`).join('')}</div>
      <span class="result-seal" aria-hidden="true">✓</span>
      <p class="kicker">Puzzle ${play.level.id} complete</p>
      <h3 id="result-title">All tidy</h3>
      <p class="big-stars" aria-label="${stars} of 3 stars">${starText(stars)}</p>
      <p class="result-reward">${play.earnedStars ? `+${play.earnedStars} ${STAR} for your shop` : "Best stars already collected"}</p>
      ${guideStage() === 'decorate' ? '<p class="guide-reward">These stars are yours to spend. Try Decorate shop to choose your first piece.</p>' : ''}
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

