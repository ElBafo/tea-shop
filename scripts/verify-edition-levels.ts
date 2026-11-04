import assert from 'node:assert/strict';
import { EDITION_LEVELS, EDITION_ARCS, EDITION_MILESTONE_BONUSES, EDITION_EXTRA_MOVES } from '../src/game/edition-levels';
import { CLASSIC_LEVELS, LEVELS } from '../src/game/levels';
import { applyMove, boardFromLevel, cloneBoard, isWon, starsForMoves } from '../src/game/engine';
import { solve } from '../src/game/solver';
import { UPGRADES } from '../src/shop/upgrades';

const expectedOptima = [3,5,7,2,8,9,3,9,7,13];
assert.equal(EDITION_LEVELS.length, 10);
assert.equal(CLASSIC_LEVELS.length, 38);
assert.equal(LEVELS, CLASSIC_LEVELS, 'Default and Node verification retain the released sequence');
assert.equal(EDITION_ARCS[0].start, 1);
assert.equal(EDITION_ARCS.at(-1)!.end, EDITION_LEVELS.length);
for(let i=1;i<EDITION_ARCS.length;i++) assert.equal(EDITION_ARCS[i].start, EDITION_ARCS[i-1].end+1);
let hiddenLevels = 0;
for (const [index, level] of EDITION_LEVELS.entries()) {
  assert.equal(level.id, index+1);
  assert.equal(level.capacity, 4);
  assert.equal(level.sealed?.length ?? level.tubes.length, level.tubes.length);
  const counts = new Map<string,number>();
  for(const tube of level.tubes) {
    assert.ok(tube.length<=level.capacity);
    for(const item of tube) counts.set(item,(counts.get(item)??0)+1);
  }
  for(const count of counts.values()) assert.equal(count, level.capacity, 'Each flavour fills exactly one jar');
  const hidden = level.sealed?.filter(Boolean).length ?? 0;
  if(hidden) hiddenLevels++;
  assert.ok(hidden<=1, 'The slice introduces only one hidden jar at once');
  const initial = boardFromLevel(level), board = cloneBoard(initial);
  assert.equal(isWon(board),false);
  const solution = solve(board);
  assert.equal(solution.solvable,true,level.name);
  assert.equal(solution.moves.length,expectedOptima[index],level.name+' authored pacing bound');
  assert.equal(level.par,solution.moves.length+hidden+(EDITION_EXTRA_MOVES[level.id]??0));
  for(const move of solution.moves) assert.ok(applyMove(board,move.from,move.to));
  assert.equal(isWon(board),true);
  assert.deepEqual(initial,boardFromLevel(level),'Solving does not mutate the definition');
  assert.equal(starsForMoves(solution.moves.length,level.par),3);
  assert.equal(starsForMoves(level.par+100,level.par),1,'A finish always earns a star');
  console.log(`ok ${level.id}: ${level.name} — ${solution.moves.length} optimal / ${level.par} target`);
}
assert.equal(hiddenLevels,2);
assert.ok(expectedOptima[3]<expectedOptima[2], 'Arc two opens with a breather');
assert.ok(expectedOptima[6]<expectedOptima[5], 'Arc three opens with a breather');
const bonus=EDITION_MILESTONE_BONUSES.reduce((n,m)=>n+m.stars,0);
assert.equal(bonus,16);
const core=UPGRADES.filter(d=>!d.optional).reduce((n,d)=>n+d.cost,0);
assert.equal(core,26);
assert.equal(EDITION_LEVELS.length+bonus,core,'All one-star finishes fund the core room');
assert.equal(EDITION_LEVELS.length*3+bonus,46);
console.log('PASS: ten authored puzzles, two hidden jars, solvability/full-jar completion, breathing-room targets, released-sequence isolation and 26–46-star economy.');
