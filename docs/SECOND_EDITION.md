# Decopu second edition

Status: the `0.2.0-preview.1` first slice is implemented and locally validated; hosting and owner review are pending. This document defines the wider approved direction and review criteria; the release notes identify the limited slice actually delivered. See [release notes](RELEASES.md) for build status and [roadmap](ROADMAP.md) for sequencing.

## Experience

Make Decopu feel like a beautiful little place the player owns, with satisfying puzzles supporting their choices. The distinguishing experience is the connection between a desired object, earning it, and arranging a personal room. Preserve the calm pace: no timers, fail states, mandatory matching sets or loss of earned progress.

## First playable milestone

Deliver one complete tea-shop experience with eight core decoration designs and ten authored puzzles. The core designs are counter, sign, paint, shelves, plant, rug, lamp and table; their style options should remain easy to mix. Show an app version of `0.2.0-preview.1`, with matching roadmap and release notes.

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

Package, Start and More show `0.2.0-preview.1`. The same review-build version also appears in ordinary-preview mode on this branch. Main is unchanged. See [RELEASES.md](RELEASES.md) for passing local checks and outstanding device/player review.

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
