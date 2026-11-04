# Decopu second edition

Status: the `0.2.0-preview.1` first slice was implemented, validated, hosted and reviewed positively in [PR #15](https://github.com/ElBafo/tea-shop/pull/15). The continuation, `0.2.0-preview.2`, is hosted for owner review after passing build, verification and browser checks. Physical-phone acceptance remains pending. The `0.2.0-preview.3` wall-ownership fix was hosted after passing validation and received positive continuation feedback. The current `0.2.0-preview.4` ambient traffic is implemented and locally validated: production build, all verification checks, final browser traffic/lifecycle checks and the paid-wall regression passed. Deployment and owner phone review remain pending. Continuing this direction does not authorize a merge. This document defines the wider approved direction and review criteria; the release notes identify the limited slice actually delivered. See [release notes](RELEASES.md) for build status and [roadmap](ROADMAP.md) for sequencing.

## Experience

Make Decopu feel like a beautiful little place the player owns, with satisfying puzzles supporting their choices. The distinguishing experience is the connection between a desired object, earning it, and arranging a personal room. Preserve the calm pace: no timers, fail states, mandatory matching sets or loss of earned progress.

## First playable milestone — delivered in preview.1

The first milestone delivered one complete tea-shop experience with eight core decoration designs and ten authored puzzles. The core designs are counter, sign, paint, shelves, plant, rug, lamp and table; their style options should remain easy to mix. It identified app version `0.2.0-preview.1`, with matching roadmap and release notes; later preview records below extend this baseline.

The prototype is gated behind the development preview at `/tea-shop/preview/?edition=2`. It needs its own progress, recovery, unfinished-puzzle, onboarding, appearance and chosen-goal storage. Opening the prototype must neither copy over nor clear main or ordinary-preview progress. Its reset control must affect only that experience. Existing game rules and the released 38 boards remain available in the baseline.

## Art and presentation

- Author a coherent miniature with rounded silhouettes and convincing wood, ceramic and fabric treatments. Prioritize composition and recognisable objects over tiny details or extra effects.
- Refine the shopkeeper to match the environment, with the counter's working aisle and orientation still respected.
- Use thumbnail images generated from the actual models so a style choice predicts what will appear in the room. A missing thumbnail must have an honest fallback, not an unrelated illustration.
- Present jars and treats as part of the same tea-shop world. Jars remain stationary during pours. A concealed piece must not reveal its underlying colour or become covered by another graphic.
- Respect reduced motion. Reuse the established rendering lifecycle, material ownership and paused-background behavior.

## Navigation and arranging

The intended path is **open shop → play next puzzle → earn stars → preview the chosen decoration → place it**. Keep explicit access to level browsing and do not discard unfinished puzzles silently.

On phones, keep the room prominent and use a compact contextual panel for the selected piece. Collection browsing should offer accurate, legible previews; returning from an item should retain useful browsing context. Use one typography, icon, colour and spacing system across shop, puzzle and result screens.

In Edit, support both dragging and selecting a piece followed by tapping a destination. Keep Rotate easy to reach and show placement feedback. An immediate Undo move restores the last accepted move; it must not undo purchases, refund stars or replace unrelated inventory state. Illegal positions, cancelled gestures and pinch must leave saved furniture unchanged.

## Personal goals and room life

Let the player choose a decoration to save for, preview it before purchase, and see progress toward that goal after puzzles. Stars remain universal, and changing the goal has no cost. Buying the target should lead naturally into arranging it. The goal UI must distinguish ownership, affordability and any unlock requirement.

Room reactions should make arranging feel playful. Suitable first-slice reactions include an active serving area or a tea setting that appears when furniture supports it. Richer visitors and usable reading corners may follow review. These are visual acknowledgements of the player's arrangement, not matching-set bonuses or scores that punish taste. Avoid new animation or lighting systems merely to claim a livelier room.

## Puzzle rhythm and economy

Author ten puzzles that alternate quick satisfaction, an interesting choice, breathing space and a finale. Use hidden jars selectively. Preserve full monochrome jars as the win condition, unlimited Undo and the absence of a timer or fail state. Keep the existing source/destination interaction and transparent move feedback.

Verify each board's item counts, solvability and scoring target. Minimum completion earnings must fund the required eight-design shop; maximum earnings and milestone bonuses must be explicit in the release notes. Replays improve best scores without farming currency. These boards belong to the isolated prototype, not existing save indices.

Solver checks establish correctness and budget checks establish affordability. Neither proves enjoyable pacing. The phone test must observe where a player hesitates, experiments, repeats a puzzle or chooses to stop.

## First-slice delivery record

Implemented locally: all eight core designs, coordinated room/shopkeeper, 24 rendered thumbnails, a scoped puzzle/UI treatment, direct next/resume Play, optional level browsing, persistent chosen decoration and style, select-then-tap and drag placement, one-step owned move/rotation Undo, and browsing-position restoration. The first room reaction adds an open book/tea setting when placed table and lamp are within 2.3 room units; existing reduced-motion-aware steam is reused. It adds no currency, score or mandatory matching rule.

The ten authored boards use three arcs and only two hidden-content puzzles. Completion bonuses after puzzles 3/6/10 are 4/5/7 stars. Total earnings are 26–46, funding the 26-star eight-piece shop even at one star per puzzle. Separate keys protect main and ordinary-preview saves; reset retains `edition=2`, and backup validation rejects cross-edition 10/38-board imports.

The hosted first slice identified itself as `0.2.0-preview.1`; the wall fix identified itself as `0.2.0-preview.3`; the current traffic target is `0.2.0-preview.4` in package, Start and More. The same review-build version also appears in ordinary-preview mode on this branch. Main is unchanged. See [RELEASES.md](RELEASES.md) for passing local checks and outstanding device/player review.

## Preview.2 continuation and acceptance

Continue within the same room, ten boards and edition save namespace. Add six optional designs with three styles each: art (8 stars) and bench (6) after 3 puzzle completions; clock (10) and trolley (8) after 6; basket (12) and planter (10) after 10. Generate eighteen additional thumbnails from those models. Fourteen designs cost 80 stars in total, while earnings remain 26–46 and the core still costs 26. Returnable optional choices support experimentation and recovery of spending for core completion.

The implemented goal UI states the puzzle unlock requirement even when a target is affordable, keeps previewing free and preserves the chosen style. After all ten boards, “Improve your scores” points toward an improvable score; at all three-star scores, “Revisit puzzles” opens the browser. Unfinished puzzles still take priority. Goal guidance suggests optional returns once no further stars can be earned.

The implemented stationary seated guest appears only when both counter and table are placed. It is parented to the table and follows its placement/rotation, hides during Edit or when either required piece is stored, and adds no new economy state, lights or timer loops. It has no navigation or seat-allocation simulation. Full build and all verification checks passed, including catalogue guards, economy, returns and preview.1 core compatibility. Browser checks for old saves/backups, new thumbnails, goal states, replay behavior and guest lifecycle passed before publication. Owner phone review remains pending.

## Guest traffic — 0.2.0-preview.4 locally validated

The owner requested guests who arrive, look around and leave, hide during decorating and become more frequent as the shop fills out. The local implementation supports at most two visitors, choosing reachable shelf browsing, counter-front ordering, table/bench seating or a look around before departure. Stored or blocked furniture leads to another activity or a shorter safe visit. Routes respect furniture, the counter working aisle and occupied destinations; table seat approaches go around chair backs.

Arrival frequency counts unique placed decoration kinds, including paint and excluding stored pieces and duplicates. Styles do not change it. The first eligible visitor follows four active seconds in a new runtime. Recurring intervals interpolate from 70–100 seconds at zero displayed kinds to 9–14 seconds at eight or more. Core-eight furnishing is enough for the busiest setting; reachable paths and free activity places take precedence over occupancy. Initial dwell ranges are browse 6–10 seconds, order 6–9, sit 24–36 and look 5–8. Exact timing remains subject to owner phone tuning.

Normal visits attempt up to three available activity kinds, with only one guest walking at a time. All guests hide/reset during Edit and their clock pauses; leaving Edit recomputes valid routes, avoids a repeated intro burst and waits at least two seconds before the next eligible arrival. Style changes retain arrival timing, while bench geometry refreshes for cushion height. Backgrounding pauses and elapsed time is not caught up afterward.

Reduced motion uses one stationary reachable activity per visit, with no translation or bobbing. Two pooled, non-pickable figures reuse the existing loop and lights, use soft contact discs and do not enter cached room shadow maps. Visits remain atmosphere: no queues, service deadlines, mandatory tasks, matching bonuses, rewards, penalties or persistent customer state.

Production build and all verification checks passed, including deterministic density comparisons and legal-layout collision/deadlock checks. Final browser traffic tests, repeated visual/resource lifecycle checks and the paid-wall regression passed. [RELEASES.md](RELEASES.md) records the bounded evidence and day/night, Edit, desktop and reduced-motion screenshots. Deployment and owner phone review remain pending. Richer visitor reactions can follow review of this bounded loop. It does not add a serving game, a customer economy or another venue.

## Review gate

Before describing the slice as ready:

- Run baseline verification and all ten prototype solver checks.
- Verify isolated saves, guide/reset behavior, chosen-goal persistence and purchase affordability.
- Check drag and tap placement, Undo move, rotation, blocked floor/wall targets, pinch and cancellation.
- Check Start, direct Play, level browsing, results and the selected-goal purchase path.
- Capture the room, editor and puzzle board on small and standard portrait phones, landscape and desktop, including day/night and reduced-motion behavior where relevant.
- Compare repeated editing/rendering resource counts and record material mobile-device limitations honestly.
- Add actual validation, screenshots, commit/PR and hosted-review status to [RELEASES.md](RELEASES.md). Request merge approval only once the preview is concrete and reviewable.

The first milestone is a limited but connected experience across all six approved directions. It does not claim the entire catalogue, a second venue, a complete customer simulation or retention evidence.

## Wall ownership correction before guest traffic

Preview.3 makes the decorative wall panels and dado rails part of the existing three-star paint purchase. Empty and counter-only rooms retain plain plaster; a deliberate free wall preview shows the finish, cancellation removes it, and buying saves it with the chosen colour and curtains. The basic window, structural trim, floor and foundation remain visible. Focused visual, preview/cancel, purchase/reload and resource checks passed before hosting; the owner subsequently gave positive continuation feedback. Guest traffic is now the active preview.4 phase without changing its agreed arrival-frequency or Edit-hiding rules.
