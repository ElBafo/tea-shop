import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EDITION_LEVELS, EDITION_ARCS, EDITION_MILESTONE_BONUSES, EDITION_EXTRA_MOVES } from '../src/game/edition-levels';
import { CLASSIC_LEVELS, LEVELS } from '../src/game/levels';
import { applyMove, boardFromLevel, cloneBoard, isWon, starsForMoves } from '../src/game/engine';
import { solve } from '../src/game/solver';
import { UPGRADES } from '../src/shop/upgrades';

const expectedOptima = [3,5,7,2,8,9,3,9,7,13,3,8,9,3,7,13];
assert.equal(EDITION_LEVELS.length, 16);
assert.equal(CLASSIC_LEVELS.length, 38);
assert.equal(LEVELS, CLASSIC_LEVELS, 'Default and Node verification retain the released sequence');
// Captured from preview.4 before appending levels. Saved scores and move logs
// depend on these exact boards, capacities, sealed flags, IDs and targets.
const identity = (levels: unknown) => createHash('sha256').update(JSON.stringify(levels)).digest('hex');
assert.equal(identity(EDITION_LEVELS.slice(0,10)), '7c1bee1c1dbb6d3aa60e25fab7ef46aa9b5eaee8bdc3054dffcc20c98459f2fa', 'The first ten authored definitions must stay unchanged');
assert.equal(identity(CLASSIC_LEVELS), '021a6cd501aac4af2cff2309d879b40ac1e4373428489ae5922d9c4eac56fd79', 'Released level definitions must stay unchanged');
assert.equal(EDITION_ARCS[0].start, 1);
assert.equal(EDITION_ARCS.at(-1)!.end, EDITION_LEVELS.length);
for(let i=1;i<EDITION_ARCS.length;i++) assert.equal(EDITION_ARCS[i].start, EDITION_ARCS[i-1].end+1);
let hiddenLevels = 0;
for (const [index, level] of EDITION_LEVELS.entries()) {
  assert.equal(level.id, index+1);
  assert.equal(level.capacity, level.id < 14 ? 4 : 5);
  assert.ok(level.tubes.length <= 6, 'Keep the authored session within six phone-sized jars');
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
assert.equal(hiddenLevels,3);
assert.ok(expectedOptima[3]<expectedOptima[2], 'Arc two opens with a breather');
assert.ok(expectedOptima[6]<expectedOptima[5], 'Arc three opens with a breather');
assert.ok(expectedOptima[10]<expectedOptima[9], 'Arc four opens with a breather');
assert.ok(expectedOptima[13]<expectedOptima[12], 'The taller-jar introduction opens with a breather');
assert.equal(EDITION_LEVELS[13].sealed,undefined,'Introduce taller jars without concealed pieces');
assert.equal(isWon({capacity:5,tubes:[['rose','rose','rose','rose'],['rose'],[]],sealed:[false,false,false]}),false,'Four matching treats do not complete a five-slot jar');
const bonus=EDITION_MILESTONE_BONUSES.reduce((n,m)=>n+m.stars,0);
assert.equal(bonus,20);
assert.deepEqual(EDITION_MILESTONE_BONUSES,[{after:3,stars:4},{after:6,stars:5},{after:10,stars:7},{after:16,stars:4}]);
const core=UPGRADES.filter(d=>!d.optional).reduce((n,d)=>n+d.cost,0);
assert.equal(core,26);
assert.equal(10+EDITION_MILESTONE_BONUSES.filter(m=>m.after<=10).reduce((n,m)=>n+m.stars,0),core,'The original ten one-star finishes still fund the core room');
assert.equal(EDITION_LEVELS.length+bonus,36);
assert.equal(EDITION_LEVELS.length+bonus-core,10,'All one-star finishes fund the core plus Glass garden');
assert.equal(EDITION_LEVELS.length*3+bonus,68);
console.log('PASS: sixteen authored puzzles, three hidden jars, gentle five-slot introduction, unchanged first ten and classic boards, solvability/full-jar completion and 36–68-star economy.');
