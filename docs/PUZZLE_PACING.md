# Puzzle pacing pass

## What changed in this preview

All 38 board IDs, jar contents, capacities, and hidden-jar flags stay unchanged. This preserves existing unfinished-puzzle move logs, earned scores, and familiarity. No timer, fail state, new mechanic, or Undo limit was added.

The three-star target now allows **one exploratory move per initially lidded jar** above the solver solution length. The previous targets required a solver-matching solution even though players could not see every treat. A solver knows hidden contents; a first-time player does not. This modest allowance softens that mismatch without increasing the maximum three stars per puzzle. The two-star threshold still follows the existing formula, so it also becomes more forgiving. Existing saved star totals are preserved; replaying can improve a best score, never reduce it or farm repeats. Puzzle earning capacity remains 114 stars, plus the existing 18 milestone stars.

Levels 21–38 now have individual, brief guidance about their actual jar capacities, matching stacks, breathing room, and free Undo. The two repeated blurbs are gone. Level 10 no longer points to a non-playable Bakery; level 20 no longer misleadingly calls itself the last taller shelf.

## Evidence and judgement

- 33 of 38 puzzles contain initially hidden contents. Previously every three-star target equalled the solver's returned solution length.
- The largest early workload jumps include level 1→2 (3→7 solution moves), 8→9 (16→19 with an added flavour), and 16→17 (14→20 while adding a flavour and another lid). These are candidates for observation, not proven player difficulty spikes.
- Existing lower-workload breaks are present at 11, 21–22, 28, and 32. Keeping these breaks is preferable to making every successive level denser.
- Levels 34–38 stay relatively demanding (18–20 solution moves) with no large respite. A finale reward can supply a reason to finish, but does not prove those puzzles are enjoyable.
- Solver solution length, branching, and capacity describe structure. They do not measure frustration, appeal, solve time, accessibility, or voluntary return. Automated solvability is not a human pacing test. The solver is bounded and prunes selected redundant moves; its result is a development reference, not an unrestricted mathematical proof of optimality.

## Reference targets

“Solution” is the solver reference used by the previous build. “Target” is the new three-star move limit. Lids are the initially hidden jars.

| Puzzle | Flavours | Lids | Solution | Target |
| --- | --- | --- | --- | --- |
| 1 | 2 | 0 | 3 | 3 |
| 2 | 2 | 0 | 7 | 7 |
| 3 | 3 | 0 | 7 | 7 |
| 4 | 3 | 0 | 10 | 10 |
| 5 | 4 | 0 | 13 | 13 |
| 6 | 4 | 1 | 12 | 13 |
| 7 | 4 | 2 | 13 | 15 |
| 8 | 5 | 1 | 16 | 17 |
| 9 | 6 | 2 | 19 | 21 |
| 10 | 6 | 3 | 19 | 22 |
| 11 | 4 | 1 | 11 | 12 |
| 12 | 5 | 2 | 13 | 15 |
| 13 | 5 | 1 | 13 | 14 |
| 14 | 5 | 2 | 14 | 16 |
| 15 | 5 | 2 | 15 | 17 |
| 16 | 4 | 1 | 14 | 15 |
| 17 | 5 | 2 | 20 | 22 |
| 18 | 5 | 2 | 19 | 21 |
| 19 | 6 | 3 | 19 | 22 |
| 20 | 5 | 3 | 18 | 21 |
| 21 | 4 | 2 | 13 | 15 |
| 22 | 4 | 1 | 11 | 12 |
| 23 | 5 | 2 | 16 | 18 |
| 24 | 5 | 2 | 17 | 19 |
| 25 | 5 | 1 | 17 | 18 |
| 26 | 4 | 1 | 17 | 18 |
| 27 | 5 | 2 | 19 | 21 |
| 28 | 5 | 1 | 15 | 16 |
| 29 | 5 | 2 | 18 | 20 |
| 30 | 6 | 2 | 20 | 22 |
| 31 | 5 | 2 | 17 | 19 |
| 32 | 4 | 1 | 14 | 15 |
| 33 | 5 | 2 | 15 | 17 |
| 34 | 5 | 2 | 20 | 22 |
| 35 | 6 | 2 | 19 | 21 |
| 36 | 5 | 2 | 18 | 20 |
| 37 | 5 | 2 | 20 | 22 |
| 38 | 6 | 2 | 19 | 21 |

## Player test

Observe the first sessions without coaching. Watch the transition into hidden jars at 6, the crowded shelves at 9–10, and taller jars at 16–17. Later, check whether 21–22 and 32 feel like welcome breathing room, and whether the final stretch becomes a chore. Record voluntary Undo/restart, confusion, requests to stop, and whether a desired room item motivates another puzzle. Ask about the experience after play rather than turning the session into a questionnaire. One tester is useful formative evidence, not retention proof.

If layout changes become necessary, introduce versioned board definitions and migrate or preserve active replay logs before altering existing level contents. Do not reorder current level IDs under saved best-star arrays.

## Verification

- `node --import tsx scripts/verify-levels.ts`: solves every board, replays each solution, checks full-jar completion and exact hidden-jar allowance.
- `node --import tsx scripts/verify-pacing.ts`: fingerprints all released board identities and checks score thresholds never become less generous and maximum puzzle earnings stay unchanged.
