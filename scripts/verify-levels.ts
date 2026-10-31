import { boardFromLevel, isWon, starsForMoves } from "../src/game/engine";
import { LEVELS } from "../src/game/levels";
import { solve } from "../src/game/solver";
import { LEVEL_COUNT } from "../src/game/types";

function countItems(level: (typeof LEVELS)[number]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tube of level.tubes) {
    for (const item of tube) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return counts;
}

let failed = 0;

if (LEVELS.length !== LEVEL_COUNT) {
  console.error(`Expected ${LEVEL_COUNT} levels, found ${LEVELS.length}`);
  failed += 1;
}

for (const [index, level] of LEVELS.entries()) {
  if (level.id !== index + 1) {
    console.error(`Level order mismatch at index ${index}: id ${level.id}`);
    failed += 1;
  }
  if (level.tubes.some((tube) => tube.length > level.capacity)) {
    console.error(`Level ${level.id} has an overfilled jar`);
    failed += 1;
  }
  if (level.sealed && level.sealed.length !== level.tubes.length) {
    console.error(`Level ${level.id} sealed flags do not match jar count`);
    failed += 1;
  }
  const counts = countItems(level);
  for (const [item, count] of counts) {
    if (count > level.capacity) {
      console.error(
        `Level ${level.id} has ${count} ${item} items, more than one jar can hold`,
      );
      failed += 1;
    }
  }

  const board = boardFromLevel(level);
  if (isWon(board)) {
    console.error(`Level ${level.id} starts already tidy`);
    failed += 1;
    continue;
  }

  const started = Date.now();
  const result = solve(board);
  const ms = Date.now() - started;
  if (!result.solvable) {
    console.error(
      `Level ${level.id} "${level.name}" is not solvable (visited ${result.visited})`,
    );
    failed += 1;
    continue;
  }

  const shortest = result.moves.length;
  if (level.par !== shortest) {
    console.error(
      `Level ${level.id} par is ${level.par}, solver found ${shortest}`,
    );
    failed += 1;
  }

  const three = starsForMoves(shortest, level.par);
  const two = starsForMoves(level.par + 1, level.par);
  if (three !== 3 || two < 2) {
    console.error(`Level ${level.id} star thresholds look wrong`);
    failed += 1;
  }

  console.log(
    `ok  ${String(level.id).padStart(2)}  ${level.name.padEnd(18)} par ${shortest}  ${ms}ms  visited ${result.visited}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log("\nAll 20 levels are solvable.");
