import type { Board, ItemId, LevelDef, Move, Tube } from "./types";

export function cloneBoard(board: Board): Board {
  return {
    capacity: board.capacity,
    tubes: board.tubes.map((tube) => tube.slice()),
    sealed: board.sealed.slice(),
  };
}

export function boardFromLevel(level: LevelDef): Board {
  return {
    capacity: level.capacity,
    tubes: level.tubes.map((tube) => tube.slice()),
    sealed: level.sealed
      ? level.sealed.slice()
      : level.tubes.map(() => false),
  };
}

export function topRun(tube: Tube): { item: ItemId; count: number } | null {
  if (tube.length === 0) return null;
  const item = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0 && tube[i] === item; i -= 1) {
    count += 1;
  }
  return { item, count };
}

export function isMono(tube: Tube): boolean {
  if (tube.length === 0) return true;
  return tube.every((item) => item === tube[0]);
}

export function isCompleteTube(tube: Tube): boolean {
  return tube.length > 0 && isMono(tube);
}

export function isWon(board: Board): boolean {
  return board.tubes.every((tube) => isMono(tube));
}

export function canPour(board: Board, from: number, to: number): number {
  if (from === to) return 0;
  const source = board.tubes[from];
  const dest = board.tubes[to];
  if (!source || !dest) return 0;
  const run = topRun(source);
  if (!run) return 0;
  const space = board.capacity - dest.length;
  if (space < run.count) return 0;
  if (dest.length === 0) return run.count;
  if (dest[dest.length - 1] !== run.item) return 0;
  return run.count;
}

export function applyMove(board: Board, from: number, to: number): Move | null {
  const count = canPour(board, from, to);
  if (count === 0) return null;
  const source = board.tubes[from];
  const dest = board.tubes[to];
  const item = source[source.length - 1];
  const unsealed = board.sealed[from];
  dest.push(...source.splice(source.length - count, count));
  if (unsealed) board.sealed[from] = false;
  return { from, to, count, item, unsealed };
}

export function legalMoves(board: Board): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < board.tubes.length; from += 1) {
    for (let to = 0; to < board.tubes.length; to += 1) {
      const count = canPour(board, from, to);
      if (count === 0) continue;
      if (shouldSkipMove(board, from, to, count)) continue;
      const item = board.tubes[from][board.tubes[from].length - 1];
      moves.push({
        from,
        to,
        count,
        item,
        unsealed: board.sealed[from],
      });
    }
  }
  return moves;
}

export function shouldSkipMove(
  board: Board,
  from: number,
  to: number,
  count: number,
): boolean {
  const source = board.tubes[from];
  const dest = board.tubes[to];
  if (isCompleteTube(source)) return true;
  if (dest.length === 0 && count === source.length) return true;
  return false;
}

export function stateKey(board: Board): string {
  return board.tubes.map((tube) => tube.join(",")).join("|");
}

export function starsForMoves(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= par + Math.max(3, Math.ceil(par * 0.4))) return 2;
  return 1;
}
