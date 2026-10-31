import { applyMove, cloneBoard, isWon, legalMoves, stateKey } from "./engine";
import type { Board, Move } from "./types";

export interface SolveResult {
  solvable: boolean;
  moves: Move[];
  visited: number;
}

const NODE_LIMIT = 400_000;

export function solve(start: Board, nodeLimit = NODE_LIMIT): SolveResult {
  if (isWon(start)) {
    return { solvable: true, moves: [], visited: 1 };
  }

  const queue: Board[] = [cloneBoard(start)];
  const cameFrom = new Map<string, { prev: string; move: Move }>();
  const seen = new Set<string>([stateKey(start)]);

  let visited = 0;
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    visited += 1;
    if (visited > nodeLimit) {
      return { solvable: false, moves: [], visited };
    }

    const key = stateKey(current);
    const options = legalMoves(current);

    for (const move of options) {
      const next = cloneBoard(current);
      applyMove(next, move.from, move.to);
      const nextKey = stateKey(next);
      if (seen.has(nextKey)) continue;
      seen.add(nextKey);
      cameFrom.set(nextKey, { prev: key, move });
      if (isWon(next)) {
        return {
          solvable: true,
          moves: reconstruct(cameFrom, nextKey),
          visited,
        };
      }
      queue.push(next);
    }
  }

  return { solvable: false, moves: [], visited };
}

function reconstruct(
  cameFrom: Map<string, { prev: string; move: Move }>,
  endKey: string,
): Move[] {
  const path: Move[] = [];
  let key = endKey;
  while (cameFrom.has(key)) {
    const step = cameFrom.get(key);
    if (!step) break;
    path.push(step.move);
    key = step.prev;
  }
  path.reverse();
  return path;
}

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(list: T[], rand: () => number): T[] {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}
