# Second edition: twenty-four-puzzle pacing

This sequence is available only in the isolated second-edition development mode. Preview.1 introduced puzzles 1–10; preview.5 added 11–16; preview.7 added **Treasures to keep**, 17–20, alongside Collector’s cabinet. Preview.8 adds **A quiet chapter**, 21–24, and the optional Reading chair. The first twenty definitions, IDs, targets and hidden flags are unchanged. The released 38-puzzle sequence also retains its board identities and targets. No existing score or unfinished puzzle is reassigned.

## Rhythm

Seven short arcs connect quick satisfaction, spare-space decisions and decorating goals. The first ten boards use four-slot jars; puzzles 14–16 introduce five-slot jars. The keepsake arc returns to a short four-slot consolidation at 17, develops matching-pair space in taller jars at 18, uses one wrapped jar at 19, and closes with a visible-information tall-jar finale at 20. The reading arc keeps five-slot jars throughout: a two-flavour consolidation at 21, matching-pair decisions at 22, one reveal at 23, then four familiar flavours in the visible finale at 24. There are never more than six jars or four flavours on these boards.

Only five puzzles contain hidden contents, with one hidden jar each. Each receives one exploration move in its target. Puzzles 6, 10, 13, 16, 20 and 24 have additional explicit breathing room. The solver uses bounded breadth-first search with existing pruning; its route lengths below are development evidence rather than a claim about every possible human strategy.

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
| 21 · The First Page | Two-flavour consolidation breather | 5 | 4 | 4 | 0 |
| 22 · A Little Bookmark | Gather pairs while keeping room for the next pour | 5 | 7 | 7 | 0 |
| 23 · Under the Fold | One reveal among three familiar flavours | 5 | 10 | 11 | 1 |
| 24 · Settle In | Moderate visible-information reading finale | 5 | 12 | 14 | 0 |

Stacks remain bottom-to-top and use the existing legal-pour/full-jar rules. Partial same-colour stacks in puzzles 4, 11, 17 and 21 intentionally require consolidation. Puzzle 17 can finish a jar on its first pour, offering a quick payoff after the longer sixteenth board. Puzzle 18 gives each matching pair room to move, while 19 adds only one reveal. Puzzles 20 and 24 have no concealed information and a two-move allowance. The reading arc reduces workload after 20, then grows through solver routes of four, seven, ten and twelve moves; keeping five-slot jars throughout avoids changing capacity within that arc. Unlimited Undo, restart, and guaranteed stars for completion remain available. Three stars measure efficient play, never speed.

The arrangements added after puzzle 16 are checked against all earlier edition and released boards under flavour relabelling and jar reordering, including against one another. Adding a lid, changing colours or shuffling jars on an old arrangement does not count as a new puzzle.

## Rewards

The existing milestone bonuses remain 4 stars after puzzle 3, 5 after puzzle 6, 7 after puzzle 10, and 4 after puzzle 16: twenty bonus stars in total. There is no new bonus at 20 or 24. The original ten one-star finishes still fund the 26-star core shop. Finishing all twenty-four boards provides **44–92 stars**, depending on best scores.

The Collector’s cabinet remains available to buy after twenty completions for 18 stars. Reading chair becomes available after twenty-four completions for 16 stars. These unlocks grant access to a purchase, not free furniture. The edition catalogue now contains eighteen designs costing 138 stars, so players still choose a collection rather than automatically buying everything. At minimum scores, forty-four stars fund the core plus any one current special: Glass garden, Botanical triptych, Collector’s cabinet or Reading chair. Optional full-price returns also support changing choices. No extra currency, repeat-reward farming or paid monetisation is introduced.

At the preview.7 checkpoint, twenty completed boards still earn 40–80 against the previous 122-star catalogue. A core owner with only one-star scores at that point needs four additional score stars for the cabinet; the next four one-star finishes can supply those stars without replaying. Existing scores and bonus awards are never reduced.

Stars remain universal; pursuing a chosen decoration never reserves or restricts them. `EDITION_MILESTONE_BONUSES` exports the unchanged schedule consumed by the journey code, and verification checks its exact values and the minimum/maximum budget.

## Evidence and player testing

`node --import tsx scripts/verify-edition-levels.ts` passes all twenty-four boards, replaying each solver route through the real engine, checking full-jar completion, item counts, explicit target allowances, arrangement novelty and the intended breathing-room pattern. Fingerprints protect the first ten, sixteen and twenty complete definitions as well as all released definitions. `verify-pacing.ts` independently confirms that released board identities stay unchanged. These are local development results; the release record owns hosted-build and phone-review status.

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
- Whether 21 feels like a restorative short shelf after the keepsake finale.
- Whether the gradual reading arc stays interesting without making 22 or 23 feel repetitive.
- Whether the final visible shelf and Reading chair unlock make a satisfying place to pause and decorate.

No retention or enjoyment claim is established by automated verification.
