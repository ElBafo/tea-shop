# Decopu second edition

**Current status: `0.2.0` is implemented and locally validated; [PR #16](https://github.com/ElBafo/tea-shop/pull/16) is ready for explicit merge confirmation.** Its reviewed application commit is `c8f441b3b044bfd60c5d83a6eed2ac206aa0c7eb` on `release/second-edition`. Main remains at `f9a69b704e35ec5aca55bb2de14bc4681293c0e8`, serving the original game. PR #16 will make the second edition the default with fresh production progress and onboarding; it has not been merged or deployed.

## Production activation — 0.2.0

The owner clarified: “I don’t care about keeping the progress. My wife should check it out like a new installation.” This supersedes the proposed migration, import and edition-choice work for this release.

The main link will open the second edition directly, with a fresh production namespace and the normal Start and first-time guide. It will not copy classic or preview scores, purchases, unfinished puzzles, goals or preferences. Existing keys remain untouched and unused by the default game. This is a one-time fresh start for the new production edition; progress earned afterward saves normally across reloads and later visits.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`. Recovery, unfinished-puzzle, guide and goal keys derive from the new progress key. The preview keeps `tea-shop-preview-edition2-progress-v1` and its existing appearance key; the classic keys also stay unchanged.

The release uses the reviewed twenty-four puzzles and eighteen paid decoration designs, with fifty-four included styles/model thumbnails. Earnings remain 44–92 stars, the eight-piece core costs 26, and the full catalogue costs 138. Reading chair still unlocks at twenty-four completions for 16 stars. No puzzles, prices, bonuses, guest rules or purchase mechanics are added in this activation pass.

Acceptance: verify default main and its query variants use the fresh edition, onboarding starts even when old classic/preview saves exist, first win → preview → purchase → arranging works, and newly earned production progress and preferences survive reload. Check that classic and preview keys are unchanged, preview progress still loads, main exposes no showroom/tour/reset controls, and cached/installed-app updates reopen the intended edition. Run all package checks, the production build, phone/desktop browser flows and offline checks. Physical iPhone family testing follows deployment.

Local release validation passed: full package checks, production build, fresh main onboarding with prior keys present, actual first win/purchase/arranging, new-save persistence, preview isolation, four viewport sizes and installed-update/offline reopening. [RELEASES.md](RELEASES.md) records evidence and screenshots. PR #16 awaits merge confirmation; production hosting and physical iPhone family testing remain pending.

## Experience

Make Decopu feel like a beautiful little place the player owns, with satisfying puzzles supporting their choices. The distinguishing experience is the connection between a desired object, earning it, and arranging a personal room. Preserve the calm pace: no timers, fail states, mandatory matching sets or loss of earned progress.

## First playable milestone — delivered in preview.1

The first milestone delivered one complete tea-shop experience with eight core decoration designs and ten authored puzzles. The core designs are counter, sign, paint, shelves, plant, rug, lamp and table; their style options should remain easy to mix. It identified app version `0.2.0-preview.1`, with matching roadmap and release notes; later preview records below extend this baseline.

The original prototype was gated behind the development preview at `/tea-shop/preview/?edition=2`. It uses its own progress, recovery, unfinished-puzzle, onboarding, appearance and chosen-goal storage. Opening the prototype must neither copy over nor clear main or ordinary-preview progress. Its reset control must affect only that experience. Existing game rules and the released 38 boards remain available in the baseline.

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

The first slice authored ten puzzles that alternate quick satisfaction, an interesting choice, breathing space and a finale. Use hidden jars selectively. Preserve full monochrome jars as the win condition, unlimited Undo and the absence of a timer or fail state. Keep the existing source/destination interaction and transparent move feedback.

Verify each board's item counts, solvability and scoring target. Minimum completion earnings must fund the required eight-design shop; maximum earnings and milestone bonuses must be explicit in the release notes. Replays improve best scores without farming currency. These boards belong to the isolated prototype, not existing save indices.

Solver checks establish correctness and budget checks establish affordability. Neither proves enjoyable pacing. The phone test must observe where a player hesitates, experiments, repeats a puzzle or chooses to stop.

## First-slice delivery record

Implemented locally: all eight core designs, coordinated room/shopkeeper, 24 rendered thumbnails, a scoped puzzle/UI treatment, direct next/resume Play, optional level browsing, persistent chosen decoration and style, select-then-tap and drag placement, one-step owned move/rotation Undo, and browsing-position restoration. The first room reaction adds an open book/tea setting when placed table and lamp are within 2.3 room units; existing reduced-motion-aware steam is reused. It adds no currency, score or mandatory matching rule.

The ten authored boards use three arcs and only two hidden-content puzzles. Completion bonuses after puzzles 3/6/10 are 4/5/7 stars. Total earnings are 26–46, funding the 26-star eight-piece shop even at one star per puzzle. Separate keys protect main and ordinary-preview saves; reset retains `edition=2`, and backup validation rejects cross-edition 10/38-board imports.

The hosted first slice identified itself as `0.2.0-preview.1`; later previews carried their own versions through `0.2.0-preview.8`. Each was validated and hosted before source integration in PR #15. The current production activation target is `0.2.0`, with the fresh-start policy defined above. See [RELEASES.md](RELEASES.md) for delivery status.

## Preview.2 continuation and acceptance

Continue within the same room, ten boards and edition save namespace. Add six optional designs with three styles each: art (8 stars) and bench (6) after 3 puzzle completions; clock (10) and trolley (8) after 6; basket (12) and planter (10) after 10. Generate eighteen additional thumbnails from those models. Fourteen designs cost 80 stars in total, while earnings remain 26–46 and the core still costs 26. Returnable optional choices support experimentation and recovery of spending for core completion.

The implemented goal UI states the puzzle unlock requirement even when a target is affordable, keeps previewing free and preserves the chosen style. After all ten boards, “Improve your scores” points toward an improvable score; at all three-star scores, “Revisit puzzles” opens the browser. Unfinished puzzles still take priority. Goal guidance suggests optional returns once no further stars can be earned.

The implemented stationary seated guest appears only when both counter and table are placed. It is parented to the table and follows its placement/rotation, hides during Edit or when either required piece is stored, and adds no new economy state, lights or timer loops. It has no navigation or seat-allocation simulation. Full build and all verification checks passed, including catalogue guards, economy, returns and preview.1 core compatibility. Browser checks for old saves/backups, new thumbnails, goal states, replay behavior and guest lifecycle passed before publication. Owner phone review remains pending.

## Guest traffic — 0.2.0-preview.4 hosted; continuation accepted

The owner requested guests who arrive, look around and leave, hide during decorating and become more frequent as the shop fills out. The local implementation supports at most two visitors, choosing reachable shelf browsing, counter-front ordering, table/bench seating or a look around before departure. Stored or blocked furniture leads to another activity or a shorter safe visit. Routes respect furniture, the counter working aisle and occupied destinations; table seat approaches go around chair backs.

Arrival frequency counts unique placed decoration kinds, including paint and excluding stored pieces and duplicates. Styles do not change it. The first eligible visitor follows four active seconds in a new runtime. Recurring intervals interpolate from 70–100 seconds at zero displayed kinds to 9–14 seconds at eight or more. Core-eight furnishing is enough for the busiest setting; reachable paths and free activity places take precedence over occupancy. Initial dwell ranges are browse 6–10 seconds, order 6–9, sit 24–36 and look 5–8. Exact timing remains subject to owner phone tuning.

Normal visits attempt up to three available activity kinds, with only one guest walking at a time. All guests hide/reset during Edit and their clock pauses; leaving Edit recomputes valid routes, avoids a repeated intro burst and waits at least two seconds before the next eligible arrival. Style changes retain arrival timing, while bench geometry refreshes for cushion height. Backgrounding pauses and elapsed time is not caught up afterward.

Reduced motion uses one stationary reachable activity per visit, with no translation or bobbing. Two pooled, non-pickable figures reuse the existing loop and lights, use soft contact discs and do not enter cached room shadow maps. Visits remain atmosphere: no queues, service deadlines, mandatory tasks, matching bonuses, rewards, penalties or persistent customer state.

Production build and all verification checks passed, including deterministic density comparisons and legal-layout collision/deadlock checks. Final browser traffic tests, repeated visual/resource lifecycle checks and the paid-wall regression passed. [RELEASES.md](RELEASES.md) records the bounded evidence and day/night, Edit, desktop and reduced-motion screenshots. Deployment passed and the owner reviewed positively. Less stiff walking/smoother turns and a broader cast including women and children are two separate agreed backlog items. These were deferred while preview.5 extended the puzzle/reward journey, then delivered in preview.6 and reviewed positively. Richer visitor reactions may follow later. It does not add a serving game, a customer economy or another venue.

## Review gate

Before describing the slice as ready:

- Run baseline verification and all prototype solver checks (twenty-four for preview.8), independently preserving the first twenty identities and existing bonuses.
- Verify isolated saves, guide/reset behavior, chosen-goal persistence and purchase affordability, including known ten-, sixteen- and twenty-board edition backups and their original unfinished-puzzle bounds when extending to twenty-four.
- Check drag and tap placement, Undo move, rotation, blocked floor/wall targets, pinch and cancellation.
- Check Start, direct Play, level browsing, results and the selected-goal purchase path.
- Capture the room, editor and puzzle board on small and standard portrait phones, landscape and desktop, including day/night and reduced-motion behavior where relevant.
- Compare repeated editing/rendering resource counts and record material mobile-device limitations honestly.
- Add actual validation, screenshots, commit/PR and hosted-review status to [RELEASES.md](RELEASES.md). Request merge approval only once the preview is concrete and reviewable.

The first milestone is a limited but connected experience across all six approved directions. It does not claim the entire catalogue, a second venue, a complete customer simulation or retention evidence.

## Wall ownership correction before guest traffic

Preview.3 makes the decorative wall panels and dado rails part of the existing three-star paint purchase. Empty and counter-only rooms retain plain plaster; a deliberate free wall preview shows the finish, cancellation removes it, and buying saves it with the chosen colour and curtains. The basic window, structural trim, floor and foundation remain visible. Focused visual, preview/cancel, purchase/reload and resource checks passed before hosting; the owner subsequently gave positive continuation feedback. Guest traffic shipped in preview.4; preview.5 retains its arrival-frequency and Edit-hiding rules.

## Preview.5 continuation and acceptance — hosted for owner review

Puzzles 11–16 add the Afternoon ritual and A room of your own arcs, preserving all first-ten definitions, IDs, targets and bonuses. Full-jar completion, unlimited Undo and calm pacing remain; level 13 has one hidden jar and levels 14–16 use five-slot jars. A four-star milestone at 16 brings bonus earnings to twenty and total earnings to 36–68. The required core remains 26.

Glass garden unlocks after 13 completions for 10 stars and Botanical triptych after 16 for 14. Each has three edition models and accurate thumbnails; the sixteen-design catalogue has 48 thumbnails and costs 104 stars. Minimum finishes fund the core plus Glass garden. Optional returns and better scores support player choices; neither new design becomes a core completion requirement.

The edition save namespace preserves local progress, preferences, guide state, goals, purchases, placements and unfinished puzzles. Existing ten-entry scores/moves gain six zeros. Valid old ten-board and current sixteen-board edition backups are supported with strict validation; new exports identify their edition, and classic imports or locked ownership are rejected. No progress reset or main migration is part of this work.

A placed counter now shows the second-edition shopkeeper immediately, standing in its rear aisle and following its orientation. Preview/cancellation, first purchase before completion, storage, restoration, rotation and reload passed the full session browser suite. Classic creation behavior remains unchanged. Capacity-aware portrait sizing addresses the observed five-slot bottom-row clipping at 320×568.

The final production build and every required verification pass, including all sixteen and 38 classic solvers and independent identity checks for existing boards. The full session browser suite verifies legacy local/recovery saves, unfinished Undo, goal/night preference, actual backup picker cancellation/restoration and classic rejection, both unlock wins, exact bonus/no farming, purchase/style/return/repurchase and reduced motion. It covers 390×844, 320×568, 844×390 and 1280×900. Art checks confirm all sixteen footprints and clean resource disposal over twelve rebuild cycles. Existing onboarding/flow and choice regressions pass, along with the final small-phone shelf assertion: the 320×568 board has no scroll overflow and the full shelf is visible.

Local validation is complete. Hosted deployment passed; owner phone review remains pending. [RELEASES.md](RELEASES.md) links day/night, model styles, first-counter, tall-jar and reward screenshots. Guest gait and a visitor cast including women and children were subsequently delivered in preview.6 and reviewed positively. These automated checks do not establish physical iPhone performance or player enjoyment.

## Preview.6 guest polish and acceptance — hosted; continuation accepted

The pass addresses the owner's two distinct requests: less stiff walking and visitor variety including women and children. Six profiles cover two adult women, two adult men and two children on the existing two pooled rigs. A profile stays stable for its visit, including during an unchanged style repaint. The roster cycles across room lifetimes within a session without a save-schema change. Children have smaller, distinct proportions; seated hips stay at cushion height and shorter feet can dangle.

Bent knees and elbows, distance-driven stride and smooth shortest-angle turning replace the stiff gait. The traffic simulation continues to supply exact root positions, safe routes, activities, arrival rates and the two-visitor cap. Edit hiding, static reduced motion, background pause, clean resets and disposal remain; the pass adds no lights, room-shadow casters, timers, rewards or saved guest state.

Acceptance requires profile variety across actual visits, stable per-visit identity, frame-rate/turn-wrap checks, all profiles at floor and table/bench heights, resource stability over repeated switches, and phone/desktop day/night review. Motion evidence supports walking review alongside still images; neither automated checks nor static screenshots establish enjoyable motion or physical-device performance. The preview.5 shopkeeper, sixteen puzzles and designs, 36–68 earnings, 104-star catalogue and existing saves remain.

Production build and all package verification pass. The visual verifier passes six profiles, 48 gait phases and twelve create/dispose cycles, with stable resources/root metadata, static reduced motion and safe seat/floor transitions. A separate NullEngine review sampled 1,296 gait combinations and confirmed floor clearance within floating-point precision. Independent source and visual review found no blocking issue.

Final browser checks pass all six profiles across actual visits, stable identity/positions/repaints/resources, eased turns and the two-visitor cap. Both children naturally used all three table and three bench styles, covering twelve combinations. Actual UI checks cover Edit/drafts, background pause, static reduced motion, save/classic isolation and fresh Start → guided first win → paid counter → immediate shopkeeper onboarding. The full keeper lifecycle regression also passes. Phone day/night/Edit and room poses were inspected; [RELEASES.md](RELEASES.md) links screenshots and a four-second fixed-30-Hz walking clip, which is simulation evidence rather than measured phone performance. Local validation and hosted deployment passed. The owner reviewed preview.6 positively and said “Looks good. Proceed”; this is continuation authorization, not a merge or measured performance result.

## Preview.7 collector’s cabinet session — hosted; continuation authorized

Treasures to keep adds puzzles 17–20 while preserving every first-sixteen definition, ID, capacity, hidden flag and scoring target. The existing four flavours and at most six jars remain. The arc has a short consolidation, matching-pair decisions, one hidden-content board and a tall-jar finale, with no new rules or fail states. Solver/three-star targets are 4/4, 8/8, 11/12 and 13/15. [EDITION2_PACING.md](EDITION2_PACING.md) records the authored rhythm and solver evidence.

Collector’s cabinet unlocks for purchase after twenty completions for 18 stars. Jade atelier, Blue porcelain and Rose salon have distinct edition models and actual-model thumbnails that fit the existing room, footprint and material language. The catalogue is seventeen paid designs, fifty-one thumbnails and 122 stars, with the core eight still costing 26.

Bonuses remain 4/5/7/4 at 3/6/10/16; there is no new bonus at twenty. Twenty boards earn 40–80 total. Minimum finishes leave 14 after the core, so buying the 18-star cabinet as well requires four additional score stars. Optional full-price returns support different choices, and an unlock only makes a piece available to buy.

The same edition namespace preserves existing local/recovery saves, ownership, styles, placements, goals, guide, preferences and unfinished Undo history. Ten- and sixteen-board edition backups continue to load alongside new twenty-board files, while strict checks reject unrelated sizes, cross-edition data, invalid earned balances, locked ownership and unfinished-level IDs beyond a legacy file’s original sequence.

Acceptance includes twenty and 38-classic solver checks, independent first-sixteen/bonus identity checks, actual 19→20 and final-unlock flows, goal/style preview/cancel, exact purchase/return/repurchase, insufficient funds, moving/storing/rotating/reloading the cabinet and model cleanup. Check new boards at 390×844, 320×568, 844×390 and 1280×900, including hidden contents and reduced motion. Preserve onboarding, first-counter shopkeeper, preview.6 visitors and safe paths with the cabinet placed or stored.

Production build and all package verification pass, including real-mode ten/sixteen→twenty compatibility and the seventeen-design catalogue. Independent checks preserve the first-sixteen fingerprint and bonus table; new layouts are distinct under flavour renaming and jar permutation, and no logic/compatibility blocker was found. Protected guest, keeper, storage and shared-type files remain identical to hosted preview.6.

All seventeen designs pass footprint checks and twelve resource-cleanup cycles. The cabinet’s broad jade arch, twin blue porcelain bays and lower bowed rose crown use 42/58/49 meshes and twelve materials each; three new thumbnails join the unchanged forty-eight prior images. Phone day/night/showroom and style-sheet review found no blocking art issue. A showroom-only wall rearrangement clears the cabinet crown without changing player layouts.

Final browser checks pass preserved sixteen-board balances, resumed Undo/recovery, actual ten-/sixteen-board backup picker cancellation/restoration and cross-edition rejection. Real wins at 19/20 add six puzzle-score stars (74→80) and unlock cabinet purchase with no new bonus. All style previews, exact 18-star purchases/refunds, cancel/confirm returns, repurchase, touch moves, rotation Undo, storage/restoration, free styles and reload pass, including locked/funded and insufficient-funds states. The original onboarding/goal/purchase, twenty-level next/resume and edition-only reset flow also passes.

All four new boards fit 390×844, 320×568, 844×390 and 1280×900; hidden puzzle 19 maintains centering, privacy and divider clarity, and real Next transitions across capacities 4/5/4/5 work with reduced motion. The final small-phone puzzle-20 shelf reports scroll/client heights 373/373 after a scoped vertical-padding fix, preserving the two-line title, 23-pixel treats and every jar/plank. Twelve all-style/storage cycles keep resources stable; a 600-second, sixteen-arrival guest run respects the cap, separation and cabinet bounds. Edit hiding, stored geometry removal and zero-resource disposal pass.

The final production rebuild after the padding fix passed. Root visual review found no blocking issue in unlock/Edit/day/night/hidden/tall-small/style captures. [RELEASES.md](RELEASES.md) links evidence and screenshots; paid room images show an affordable core-plus-cabinet composition, while the seventeen-piece showroom is a separate development demo. Local validation and hosted deployment passed. The link now serves preview.8. The owner subsequently said “Continue”; preview work continues. Reading chair is now preview.8 scope; Tea garden fountain, further arcs, Bakery, larger rooms, cloud accounts and monetisation remain later work.

## Preview.8 Reading corner — hosted; source merged

Append puzzles 21–24 while preserving all first-twenty definitions, IDs, capacities, hidden flags, scoring targets and the bonus table, plus the classic thirty-eight-board sequence. The A quiet chapter arc retains full monochrome jars, unlimited Undo and no timer or fail state. Final names, boards and scoring evidence will be recorded when authored and verified.

Reading chair unlocks for purchase after twenty-four completions at 16 stars. Three included edition styles and three actual-model thumbnails target eighteen paid designs, fifty-four thumbnails and a 138-star catalogue. Core completion stays at 26. Keep the existing twenty bonus stars and add none at twenty-four: total earnings become 44–92, leaving eighteen after core completion at minimum scores. The chair and cabinet are alternative affordable goals; optional full-value returns remain available.

Existing visitors may sit on a reachable placed chair through the same pooled rigs and seated pose. Valid style/rotation-specific seat anchors, clear approaches/departures, and blocked/stored behavior are required. Preserve the two-visitor cap, Edit hiding, reduced motion, background pause and cleanup, without service tasks, rewards or saved customer state.

Keep edition progress isolated and carry scores, ownership, styles, placements, goals, guide, preferences, recovery and unfinished Undo forward. Known ten-, sixteen- and twenty-board backups must remain valid alongside new twenty-four-board exports, with strict original-length unfinished-puzzle and edition/count/balance/unlock checks.

Acceptance covers twenty-four and classic thirty-eight solver checks; first-twenty/bonus fingerprints; old twenty-board continuation and all three legacy backup sizes; actual final unlock and zero new bonus; all-style previews/cancellation, exact purchase/return/repurchase, insufficient-funds states, touch placement, rotation, storage and reload. Check new boards at small/standard portrait, landscape and desktop sizes, with hidden-content privacy and reduced motion. Verify adult/child chair contact, all styles/rotations, reachable and blocked layouts, Edit transitions, safe guest separation and repeated resource cleanup.

Implementation, screenshots and local validation are complete; hosting passed; owner review is pending. The link now serves preview.8. Tea garden fountain, further arcs, Bakery, larger rooms, cloud accounts and monetisation remain later work.
