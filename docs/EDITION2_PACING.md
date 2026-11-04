# Second edition: ten-puzzle pacing slice

This sequence is available only in the isolated second-edition development mode. The released 38-puzzle sequence remains byte-for-byte compatible in board identity and retains its targets. No released score or unfinished puzzle is reassigned to one of these boards.

## Rhythm

The slice uses three short arcs. Each arc opens with a manageable puzzle, introduces or develops one idea, and ends at a decorating milestone. Four-slot jars stay consistent throughout this first slice; taller jars can be evaluated later. Only two puzzles contain hidden contents, with one hidden jar each. Hidden contents receive an exploration allowance. Two finales also have explicit breathing room in their three-star targets.

| Puzzle | Role | Solver moves | Three-star target | Hidden jars |
| --- | --- | ---: | ---: | ---: |
| 1 · First Pour | First matching-group transfer | 3 | 3 | 0 |
| 2 · A Little Space | Use a spare jar | 5 | 5 | 0 |
| 3 · Open the Shutters | Gather three flavours | 7 | 7 | 0 |
| 4 · A Quiet Refill | Quick consolidation breather | 2 | 2 | 0 |
| 5 · A Wrapped Surprise | Introduce a single reveal | 8 | 9 | 1 |
| 6 · Tea for Friends | Four-flavour arc finale | 9 | 10 | 0 |
| 7 · The Window Seat | Short, familiar breather | 3 | 3 | 0 |
| 8 · Afternoon Company | Make room for matching pairs | 9 | 9 | 0 |
| 9 · One Last Surprise | Revisit reveal on a smaller board | 7 | 8 | 1 |
| 10 · Your Opening Day | Visible-information finale | 13 | 15 | 0 |

Stacks remain bottom-to-top and use the existing legal-pour/full-jar rules. Partial same-colour stacks in puzzle 4 intentionally teach that all occupied jars must be full. Unlimited Undo, restart, and guaranteed stars for completion remain available. Three stars measure efficient play, never speed.

## Rewards

The proposed slice milestones award 4 stars after puzzle 3, 5 after puzzle 6, and 7 after puzzle 10. They are completion bonuses, so one-star finishers can still earn the 26 stars required for the eight-piece core shop. The maximum is 46 stars. Stars are universal; pursuing a chosen decoration never restricts how they can be spent. Replaying cannot farm milestone bonuses.

`EDITION_MILESTONE_BONUSES` exports the exact schedule for the journey implementation; the sequence verifier checks the minimum/maximum budget against actual core prices. The root journey implementation must consume this schedule before the slice is considered complete.

## Evidence and player testing

`node --import tsx scripts/verify-edition-levels.ts` solves every board, replays each solution through the real engine, checks full-jar completion, validates item counts and explicit target allowances, and verifies the intended breathing-room pattern. `verify-pacing.ts` independently confirms that released board identities stay unchanged.

Solver move counts are a rough workload signal, not a measurement of how difficult or enjoyable a person will find a puzzle. Player review should specifically observe:

- Whether puzzle 2 makes the spare-jar idea clear after the guided first puzzle.
- Whether the short fourth puzzle feels like a satisfying breather rather than filler.
- Whether a single hidden jar at 5 is understandable and worth keeping.
- Whether 6 and 10 feel like rewarding finales without prompting repeated restarts.
- Whether players choose to decorate at milestones and can name the next piece they want.

No retention or enjoyment claim is established by automated verification.
