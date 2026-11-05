# Second edition: twenty-puzzle pacing

This sequence is available only in the isolated second-edition development mode. Preview.1 introduced puzzles 1–10; preview.5 added 11–16. Preview.7 adds the four-puzzle **Treasures to keep** arc, 17–20, alongside the optional Collector’s cabinet. The first sixteen definitions, IDs, targets and hidden flags are unchanged. The released 38-puzzle sequence also retains its board identities and targets. No existing score or unfinished puzzle is reassigned.

## Rhythm

Six short arcs connect quick satisfaction, spare-space decisions and decorating goals. The first ten boards use four-slot jars; puzzles 14–16 introduce five-slot jars. The new arc returns to a short four-slot consolidation at 17, develops matching-pair space in taller jars at 18, uses one wrapped jar at 19, and closes with a visible-information tall-jar finale at 20. There are never more than six jars or four flavours on these boards.

Only four puzzles contain hidden contents, with one hidden jar each. Each receives one exploration move in its target. Puzzles 6, 10, 13, 16 and 20 have additional explicit breathing room. The solver uses bounded breadth-first search with existing pruning; its route lengths below are development evidence rather than a claim about every possible human strategy.

| Puzzle | Role | Capacity | Solver moves | Three-star target | Hidden jars |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 · First Pour | First matching-group transfer | 4 | 3 | 3 | 0 |
| 2 · A Little Space | Use a spare jar | 4 | 5 | 5 | 0 |
| 3 · Open the Shutters | Gather three flavours | 4 | 7 | 7 | 0 |
| 4 · A Quiet Refill | Quick consolidation breather | 4 | 2 | 2 | 0 |
| 5 · A Wrapped Surprise | Introduce a single reveal | 4 | 8 | 9 | 1 |
| 6 · Tea for Friends | Four-flavour arc finale | 4 | 9 | 10 | 0 |
| 7 · The Window Seat | Short, familiar breather | 4 | 3 | 3 | 0 |
| 8 · Afternoon Company | Make room for matching pairs | 4 | 9 | 9 | 0 |
| 9 · One Last Surprise | Revisit reveal on a smaller board | 4 | 7 | 8 | 1 |
| 10 · Your Opening Day | Visible-information finale | 4 | 13 | 15 | 0 |
| 11 · The Second Pot | Short refill and consolidation | 4 | 3 | 3 | 0 |
| 12 · Save a Little Space | Match pairs with available space | 4 | 8 | 8 | 0 |
| 13 · Under Glass | Four-flavour reveal with breathing room | 4 | 9 | 11 | 1 |
| 14 · A Taller Pour | Gentle five-slot introduction | 5 | 3 | 3 | 0 |
| 15 · Room for Five | Gather three flavours in taller jars | 5 | 7 | 7 | 0 |
| 16 · Leaves and Light | Visible tall-jar finale | 5 | 13 | 15 | 0 |
| 17 · The Quiet Cup | Immediate matching pour, short consolidation | 4 | 4 | 4 | 0 |
| 18 · Pairs and Space | Make room for whole pairs | 5 | 8 | 8 | 0 |
| 19 · A Wrapped Keepsake | Reveal one jar and regroup four flavours | 4 | 11 | 12 | 1 |
| 20 · A Place for Keepsakes | Visible-information keepsake finale | 5 | 13 | 15 | 0 |

Stacks remain bottom-to-top and use the existing legal-pour/full-jar rules. Partial same-colour stacks in puzzles 4, 11 and 17 intentionally require consolidation. Puzzle 17 can finish a jar on its first pour, offering a quick payoff after the longer sixteenth board. Puzzle 18 gives each matching pair room to move, while 19 adds only one reveal. The final board has no concealed information and a two-move allowance. Unlimited Undo, restart, and guaranteed stars for completion remain available. Three stars measure efficient play, never speed.

The four new arrangements are checked against all earlier edition and released boards under flavour relabelling and jar reordering. Adding a lid, changing colours or shuffling jars on an old arrangement does not count as a new puzzle.

## Rewards

The existing milestone bonuses remain 4 stars after puzzle 3, 5 after puzzle 6, 7 after puzzle 10, and 4 after puzzle 16: twenty bonus stars in total. There is no new bonus at 20. The original ten one-star finishes still fund the 26-star core shop. Finishing all twenty boards provides **40–80 stars**, depending on best scores.

The Collector’s cabinet becomes available to buy after twenty completions for 18 stars; unlocking it does not grant the decoration. The edition catalogue totals 122 stars, so players still choose a collection rather than automatically buying everything. At minimum scores, forty stars fund the core plus either Glass garden or Botanical triptych. A core owner starting from all one-star scores needs four additional best-score stars to afford the cabinet. Optional full-price returns also support changing choices. No extra currency, repeat-reward farming or paid monetisation is introduced.

Stars remain universal; pursuing a chosen decoration never reserves or restricts them. `EDITION_MILESTONE_BONUSES` exports the unchanged schedule consumed by the journey code, and verification checks its exact values and the minimum/maximum budget.

## Evidence and player testing

`node --import tsx scripts/verify-edition-levels.ts` passes all twenty boards, replaying each solver route through the real engine, checking full-jar completion, item counts, explicit target allowances, arrangement novelty and the intended breathing-room pattern. Fingerprints protect the first ten and first sixteen complete definitions as well as all released definitions. `verify-pacing.ts` independently confirms that released board identities stay unchanged. These are local development results; the release record owns hosted-build and phone-review status.

Solver move counts are a rough workload signal, not a measurement of how difficult or enjoyable a person will find a puzzle. Player review should specifically observe:

- Whether puzzle 2 makes the spare-jar idea clear after the guided first puzzle.
- Whether the short fourth puzzle feels like a satisfying breather rather than filler.
- Whether a single hidden jar at 5 is understandable and worth keeping.
- Whether 6 and 10 feel like rewarding finales without prompting repeated restarts.
- Whether players choose to decorate at milestones and can name the next piece they want.
- Whether 17 feels like a welcome breather after the tall sixteenth board.
- Whether whole-pair capacity at 18 produces useful decisions without confusing pours.
- Whether the single reveal at 19 is understandable without repeated restarts.
- Whether the cabinet and its styles are appealing enough to motivate the final arc and a few improved scores.

No retention or enjoyment claim is established by automated verification.
