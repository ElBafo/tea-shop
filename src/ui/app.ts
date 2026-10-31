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
}

const STAR = "✦";

export function mountApp(root: HTMLElement): void {
  let progress = loadProgress();
  let screen: Screen = "shop";
  let play: PlayState | null = null;
  let pendingComplete: number[] = [];
  let landed: { jar: number; count: number } | null = null;
  let shop: ShopScreen | null = null;

  const unlockOnGesture = () => {
    void unlockAudio();
  };
  root.addEventListener("pointerup", unlockOnGesture, { capture: true });
  root.addEventListener("click", unlockOnGesture, { capture: true });
  root.addEventListener("keydown", unlockOnGesture, { capture: true });

  const render = () => {
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
      });
      return;
    }
    leaveShop();
    if (screen === "levels") {
      root.innerHTML = levelsMarkup(progress);
    } else if (play) {
      root.innerHTML = playMarkup(play, progress, pendingComplete, landed);
    }
    bind(root);
  };

  const leaveShop = () => {
    shop?.dispose();
    shop = null;
  };

  const bind = (node: HTMLElement) => {
    node.querySelectorAll<HTMLElement>("[data-go]").forEach((el) => {
      el.addEventListener("click", () => {
        playClick(progress.muted);
        const dest = el.dataset.go;
        if (dest === "shop" || dest === "levels") {
          screen = dest;
          play = null;
          render();
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
      render();
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

    node.querySelector("#restart")?.addEventListener("click", () => {
      if (!play || play.busy) return;
      playClick(progress.muted);
      startLevel(play.level);
    });

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

    const snapshot = cloneBoard(play.board);
    const destWasComplete = isCompleteTube(play.board.tubes[index]);
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
      !destWasComplete && isCompleteTube(play.board.tubes[index]);
    if (destNowComplete) pendingComplete = [index];

    render();

    window.setTimeout(() => {
      if (!play) return;
      if (destNowComplete) playComplete(progress.muted);
      if (isWon(play.board)) {
        play.won = true;
        const stars = starsForMoves(play.moves, play.level.par);
        progress = recordWin(progress, play.level.id - 1, stars, play.moves);
        playWin(progress.muted);
        window.setTimeout(() => {
          if (!play) return;
          play.busy = false;
          render();
        }, 420);
      } else {
        play.busy = false;
        pendingComplete = [];
        landed = null;
        render();
      }
    }, 360);
  };

  const shake = (index: number) => {
    playClick(progress.muted);
    const jar = root.querySelector(`[data-jar="${index}"]`);
    jar?.classList.remove("shake");
    void (jar as HTMLElement | null)?.offsetWidth;
    jar?.classList.add("shake");
  };

  render();
}

function levelsMarkup(progress: Progress): string {
  const buttons = LEVELS.map((level, index) => {
    const open = isLevelOpen(progress, index);
    const stars = progress.bestStars[index];
    const starLine = open
      ? `<span class="mini-stars">${starText(stars)}</span>`
      : `<span class="mini-stars locked-note">Finish the last shelf first</span>`;
    return `
      <button class="level-btn ${open ? "" : "is-locked"}" data-level="${level.id}" ${open ? "" : "disabled"}>
        <span class="level-num">${level.id}</span>
        <span class="level-name">${level.name}</span>
        ${starLine}
      </button>`;
  }).join("");

  return `
    <div class="frame levels">
      ${topBar("Choose a shelf", progress, true, "shop")}
      <p class="lede tight">Twenty quiet puzzles. Stars come from tidy, gentle play — not from speed. Spend them to fix up the tea shop.</p>
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
      const done = pendingComplete.includes(index) || (won && isCompleteTube(tube));
      const lid = board.sealed[index]
        ? `<span class="lid" aria-hidden="true"></span>`
        : "";
      const puff = done
        ? `<span class="puff" aria-hidden="true">${sparkles()}</span>`
        : "";
      return `
        <button class="jar ${lifted ? "selected" : ""} ${done ? "done" : ""}" data-jar="${index}" type="button" aria-label="Jar ${index + 1}">
          <span class="jar-neck"></span>
          <span class="jar-glass">
            ${lid}
            <span class="stack" style="--slots:${board.capacity}">${slots.join("")}</span>
          </span>
          ${puff}
        </button>`;
    })
    .join("");

  const hint = play.hint
    ? `<p class="hint">Tap a jar to lift matching treats, then tap another jar with room.</p>`
    : `<p class="hint quiet">${level.blurb}</p>`;

  const overlay = won ? winOverlay(play, progress) : "";

  return `
    <div class="frame play">
      ${topBar(level.name, progress, true, "levels")}
      <div class="play-meta">
        <p class="moves">${moves} ${moves === 1 ? "move" : "moves"}</p>
        <p class="par">Par ${level.par}</p>
      </div>
      ${hint}
      <div class="shelves" data-count="${board.tubes.length}">
        <div class="shelf-row">${jars}</div>
        <div class="plank" aria-hidden="true"></div>
      </div>
      <div class="play-bar">
        <button id="undo" type="button" ${play.history.length === 0 || won ? "disabled" : ""}>Undo</button>
        <button id="restart" type="button">Restart</button>
      </div>
      ${overlay}
    </div>`;
}

function topBar(
  title: string,
  progress: Progress,
  back: boolean,
  dest: "shop" | "levels" = "shop",
): string {
  const backBtn = back
    ? `<button class="icon-btn" data-go="${dest}" type="button">Back</button>`
    : `<span class="icon-btn ghost" aria-hidden="true"></span>`;
  return `
    <header class="topbar">
      ${backBtn}
      <h2>${title}</h2>
      <button id="mute" class="icon-btn" type="button" aria-label="${progress.muted ? "Turn sound on" : "Turn sound off"}">${progress.muted ? "Sound off" : "Sound on"}</button>
    </header>`;
}

function winOverlay(play: PlayState, progress: Progress): string {
  const stars = starsForMoves(play.moves, play.level.par);
  const best = progress.bestMoves[play.level.id - 1];
  const next = LEVELS[play.level.id];
  return `
    <div class="overlay" role="dialog" aria-label="Shelf is tidy">
      <div class="modal">
        <p class="kicker">All tidy</p>
        <h3>${play.level.name}</h3>
        <p class="big-stars">${starText(stars)}</p>
        <p class="lede tight">${play.moves} ${play.moves === 1 ? "move" : "moves"} · par ${play.level.par}${best ? ` · best ${best}` : ""}</p>
        <div class="modal-actions">
          <button data-next type="button">${next ? "Next shelf" : "See all shelves"}</button>
          <button data-go="levels" type="button" class="ghost-btn">Level list</button>
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

