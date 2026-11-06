# Decopu roadmap

Record every agreed product decision here in the same work session. Distinguish current behavior, agreed plans and open decisions. Product direction lives in [PRODUCT.md](PRODUCT.md); detailed art criteria live in [POLISH_PLAN.md](POLISH_PLAN.md).

## Current priority — 0.3.0-preview.1

The owner said “Go with your rec”, authorizing the bounded Babylon.js puzzle comparison recommended below. Build a separate preview-only experiment on top of the reviewed room preview. Main remains 0.2.1; the ordinary preview keeps its existing game and saved progress.

Scope: three samples from unchanged edition boards (1: standard, 18: five-slot, 5: hidden), a Current/3D view switch retaining the same board/history, fixed readable camera, stylized glass vases and paper tea sachets, legal whole-group drag/tap/keyboard controls, Undo/Restart, hidden-content privacy and skippable visual guidance. Use the existing rules and score calculation with ephemeral sample state; do not grant stars, write scores, unlock items, or mutate any normal/preview save. HTML controls remain accessible. Only the active renderer runs; fallback to Current if WebGL fails.

The experiment lives at `/tea-shop/preview/?edition=2&puzzle3d=1` and must be ignored by production builds and paths. Compare touch accuracy, reading the stack, appearance, loading, frame pacing and sustained use on the owner's iPhone before selecting a production renderer. Automated browser checks cannot establish physical-device performance or preference. Preserve the current game as the comparison/fallback. No full renderer conversion, physics simulation, new economy or production merge is authorized by this prototype task.

Local package verification and final production build passed (`work/puzzle-comparison-verify.log`, `work/puzzle-comparison-build.log`). The isolated browser suite passed 15 groups with zero exceptions or console errors: both renderers win the same sample, native touch/tap/keyboard, Undo/Restart, state-preserving view changes, whole-group capacity, interrupted drag recovery, hidden contents, four viewport sizes, eight engine-disposal cycles, reduced motion and real WebGL context-loss fallback. All saved-key sentinels remained unchanged; ordinary and classic preview routes remain separate. A production-build smoke test also confirms the experiment flag is ignored and existing progress, preferences, unfinished puzzles and Undo survive (`work/comparison-production.json`). Root reviewed matched Current/3D phone captures, tall small-phone, hidden/drag and landscape views. Physical-iPhone sustained performance and preference remain unmeasured. Hosted successfully in [Pages run 42277378659](https://github.com/ElBafo/tea-shop/actions/runs/42277378659) for source `aff07a7a2bbe688726e9fe44b50cfdbbf80c716e`, [PR #19](https://github.com/ElBafo/tea-shop/pull/19) stacked on PR #18. CI logs confirm preview 0.3.0-preview.1 and unchanged main 0.2.1. An additional built-preview smoke test confirms the ordinary `?edition=2` route opens the shop, retains its existing saved progress and resumes puzzles with Undo (`work/comparison-ordinary-preview.json`). The focused hidden-mesh test also passed (`work/puzzle-comparison-hidden-focus-check.json`). [Open the comparison](https://elbafo.github.io/tea-shop/preview/?edition=2&puzzle3d=1); the [normal preview](https://elbafo.github.io/tea-shop/preview/?edition=2) remains available. Owner phone comparison and any production-renderer adoption remain pending. The review backlog below remains planned; this pass does not silently implement all its items. The night-lamp glow defect remains a separate pre-merge correction.

## Next improvements — review backlog and renderer decision

Recorded 2026-11-06 at the owner's request following the honest review of 0.2.2-preview.2. All six enhancement recommendations and the lamp defect below are now planned backlog items. Recording them does not start implementation or authorize merging PR #18. The owner also requested consideration of Babylon.js 3D vases/jars and tea bags before proceeding; the renderer decision remains open. The subsequent bounded-prototype authorization is recorded above.

### Review recommendations to carry forward

1. **Fix the visible night-lamp glow before the next merge.** The second-edition material is named `edition-lamp-shade`, but the day/night adjustment currently targets only `lamp-shade`. Correct the targeting so a lamp visibly glows where it lights the floor. Check all three styles, day/night, moving/storing/restoring, and the classic rendering path. Keep the recent lighting improvements.
2. **Make puzzle pieces recognisably tea-related.** Explore rounded tea sachets with a folded seam and clear flavour illustrations. Preserve redundant colour, symbol and letter cues and legibility in four-/five-slot jars. Compare at actual phone size. Decide the rendering direction below before investing in a complete new CSS or 3D piece catalogue.
3. **Explain rejected moves at the destination.** Give short, local feedback for insufficient capacity, mismatched flavours and other invalid drops, including the fact that the whole matching group must fit. Avoid more permanent text at the top. Taps and drags should communicate the same rule without changing it, and interruptions must remain distinguishable from illegal moves.
4. **Strengthen later puzzle variety and calibrate three-star targets with human play.** Trial a few boards offering distinct temporary-space and grouping decisions under the current rules, retaining easy breathers. Observe first-attempt moves, Undo use, hesitation and frustration, including hidden jars. Solver minima prove solvability, not enjoyable difficulty. Avoid simply adding many similar levels; preserve existing progress/board identities and explicitly plan compatibility before any target or content changes.
5. **Bring puzzle and room artwork together and improve keeper readability.** Align paper, glass, wood and ceramic materials, edge softness and scale, starting with the counter, table and representative puzzle piece. Improve the keeper's face, head silhouette and serving pose at normal phone framing. Extra animation is not a substitute for readable character design. Preserve compatible mixed decoration styles and the visible improvement from paid upgrades.
6. **Make completion more satisfying while keeping ordinary wins brisk.** Refine existing lift, landing, jar-completion and win timing; trial soft paper/ceramic sounds. Give important milestones a clear visual connection from earned stars to the player's chosen decoration. Preserve mute/Safari gesture handling, reduced motion, direct Decorate navigation and exactly-once rewards. Avoid adding long or compulsory celebrations after every move.
7. **Simplify overlapping home-screen progression prompts.** Consolidate the affordable-decoration banner and inspiration/goal message around one concise current-goal card; consider affordability on Edit or within that card. Keep Play obvious, stars readable and the room prominent. This is a focused hierarchy change, not a commitment to another full UI redesign.

Suggested order: correct the lamp defect; resolve the puzzle-rendering/art direction with a small comparison; improve piece identity and rejected-move feedback; then use family playtesting to prioritize puzzle pacing, materials/keeper, rewards/audio and home-screen simplification. Observe whether the player voluntarily chooses another puzzle and wants a particular decoration. Retention remains unproven; new venues, daily systems and monetisation are not implied by this review.

### Babylon.js 3D puzzle rendering — evaluate before committing

**Status:** the owner subsequently authorized the bounded comparison prototype recorded above. A production renderer replacement remains undecided. This explicitly reopens the earlier conditional 3D-renderer option after the DOM/CSS drag and art pass. The current renderer remains available throughout evaluation.

**Potential value:** real rounded glass rims, dimensional paper sachets, coherent lighting/materials with the shop, and authored lift/tilt/settle movement could give the puzzle stronger object identity and tactile appeal. Babylon.js is already a dependency for the shop, so adopting it for puzzles would reuse the rendering technology. Better models and art direction are still necessary; switching engines alone does not ensure better graphics or engagement.

**Recommended comparison prototype, if approved:**

- Use a fixed, near-front orthographic camera with slight depth. Prioritize readable stack order and large touch targets; free camera rotation is unnecessary for this puzzle.
- Build one representative vase/jar and tea-sachet art treatment, then exercise it on an early board and a late five-slot/hidden-piece board. Compare the same rules and layouts with the existing presentation on the owner's iPhone.
- Keep the board/engine, legal whole-group transfers, full-jar completion, Undo, scoring, exactly-once rewards, goals and storage authoritative. Use authored animation with deterministic slot snapping; physical simulation must not decide a move's outcome. Keep jars stationary during transfers.
- Preserve tap and drag, interrupted-touch recovery, keyboard/screen-reader access, accessible HTML controls and the guided hand/bubbles. The current drag ghosts, target geometry and tutorial anchors depend on DOM jars and must be adapted behind a rendering/input boundary; a 3D canvas is not a drop-in replacement.
- Start with stylized glass and inexpensive lighting. Transparent layers can obscure tea bags, draw in the wrong order and increase rendering cost. Avoid making realistic refraction, dynamic shadows, cloth physics or many lights prerequisites.
- Keep preview experiments and synthetic progress isolated. Run only the active scene; validate disposal, repeated shop/puzzle navigation, background/resume and WebGL context recovery. Retain the current renderer as the comparison/fallback while evaluating.
- Judge visual improvement, flavour recognition, four-/five-slot fit, hidden-content privacy, finger-following responsiveness, guide clarity and reduced motion. Measure load time, frame pacing and memory over sustained physical-iPhone play; do not infer mobile performance from desktop screenshots. Compare a small and standard phone layout and a populated board, not just a hero model.

**Decision gate:** choose 3D only if the playable comparison produces a clear visual/tactile gain without regressing readability, input, accessibility, saves or acceptable phone performance. If it does not, apply the successful art ideas to the existing renderer or evaluate pre-rendered artwork. Device targets and measured performance budgets are to be established in the prototype plan, not claimed as achieved here.

## Previous preview — 0.2.2-preview.2

Owner approved finishing the keeper idle animation and broader lighting pass. Add gentle head turns, breathing and blinking with a neutral pose during Edit/reduced motion. Rebalance existing ambient, sun and window lights for warmer day fill and readable cool nights; retain paid lamps as warm accents without extra lights or shadow-map refresh loops. Preserve progress and counter placement. Production build and package verification passed (`work/final-room-build.log`, `work/final-room-verify.log`). The browser suite passed with zero exceptions, including idle movement without placement drift, neutral Edit/reduced-motion poses, unchanged light count, full starter/counter transitions and save preservation. Day, night, purchase, small phone and desktop screenshots were reviewed. Physical iPhone performance remains unmeasured. Hosted successfully in [Pages run 42254037195](https://github.com/ElBafo/tea-shop/actions/runs/42254037195) for source `306cbf53449fcd0473cb5ba68e8441585e4c6edd` in [PR #18](https://github.com/ElBafo/tea-shop/pull/18). CI logs confirm preview 0.2.2-preview.2 and unchanged main 0.2.1. Furnished day/night views also passed visual review. Owner phone review and merge approval remain pending.

### A welcoming starting room

Family feedback, 2026-11-06: the starting room feels too plain, and the window was not immediately recognizable as a window. The owner proposed a simple bench/table with the shopkeeper present from the start and clearer window graphics, and requested an opinion. The owner approved implementation with “Ok let’s do it.” Build a review preview; production publication still follows review.

Recommendation: start with a modest temporary serving workbench, a small tea prop and the shopkeeper behind it facing the front. Replace the workbench when the first paid counter is bought, retaining counter style previews and the existing price. This would deliberately revise the earlier empty-start decision and make the temporary bench an explicit exception to the rule that furniture costs stars; it would not grant a catalogue item or ownership. Keep most floor space available and preserve a strong visual improvement from the first purchase. The earlier shabby-counter restoration idea for later venues remains a separate plan.

Make the base window readable before any purchase: distinct frame/recess and sill, cool daylight with a simple outdoor silhouette, restrained glass highlights, and an appropriate night view. The existing wall-coloured panes and shallow backing weaken its silhouette. Improve base-room lighting and material depth while keeping paid wall finishes and decorations visibly rewarding. Avoid extra free furnishings as a substitute for a clear opening composition.

Scope the approved preview to the initial room, first counter preview/purchase and day/night at actual phone size. Resolve temporary-bench placement/editing and restoration behavior without blocking decoration placement, duplicating the shopkeeper or changing existing paid ownership, progress or economy. Implementation: a temporary workbench and keeper appear before counter ownership when the default counter footprint and rear aisle are free. Hide both during Edit; a counter style preview shows its keeper and cancellation restores the starting scene. Purchased or stored counters never restore the temporary bench. Use existing placement rules to avoid covering other furniture. The window has separated sky/glass layers, outdoor greenery, deeper framing and day/night colours. Bare edition plaster is lighter; paid finishes remain distinct. Existing saves, prices and puzzle rules are unchanged. Final production build and package verification pass (`work/starter-build.log`, `work/starter-verify.log`). The browser suite passes with zero exceptions: opening bench/keeper, day/night, Edit hiding, counter preview/cancellation/purchase, reload persistence, retained starter after paint, stored-counter suppression, occupied-footprint suppression and reduced-motion steam. Screenshots checked at 390×844, 320×568, 844×390 and 1280×900. These Chromium checks do not establish physical iPhone performance. Hosted preview passed in [Pages run 42229786301](https://github.com/ElBafo/tea-shop/actions/runs/42229786301) for source `2eb912a0d7b74dd3500c2a74723e911bc05a5440`, [PR #18](https://github.com/ElBafo/tea-shop/pull/18). Build logs confirm main 0.2.1 and preview 0.2.2-preview.1. [Open the preview](https://elbafo.github.io/tea-shop/preview/?edition=2) or [temporary fresh start](https://elbafo.github.io/tea-shop/preview/?edition=2&tour=1); Start → Explore on my own shows the opening without changing saved preview progress. Owner phone review and merge approval remain pending.

## Released milestone — 0.2.1

**Released: [Decopu 0.2.1](https://elbafo.github.io/tea-shop/).** [PR #17](https://github.com/ElBafo/tea-shop/pull/17) merged as `2df365fd0921835cd2d647c3277d026b682f821b`; [Pages run 42128359597](https://github.com/ElBafo/tea-shop/actions/runs/42128359597) passed. Drag controls, refined puzzle artwork and the visual first-puzzle guide are live. Existing production progress is preserved; there is no new reset or storage namespace.

Release verification and the production build pass. A production-browser smoke test at 390×844 confirms v0.2.1, existing scores/purchases/layout/preferences, reload/resume with Undo, and absent preview/reset controls, with zero runtime exceptions (`work/release-0.2.1-smoke.json`). GitHub CI verified and built both the release and retained stable preview before successful deployment.

**Family feedback, 2026-11-05:** the tester repeatedly tries to move tea bags between jars by keeping her finger down and dragging to the destination. The owner confirmed this is a drag, not a quick flick. Her favourite puzzle game is [Screwdom 3D / Screwdom](https://apps.apple.com/us/app/screwdom/id6740043080), particularly its graphics. This is feedback from family play, not a complete iPhone regression sign-off. The preceding 0.2.0 release supported tap-to-select and tap-to-transfer only.

**Reviewed preview:** the owner said “Ok let’s do em,” approving direct dragging alongside tapping and keyboard controls plus a focused puzzle-art pass. This preview preserves existing edition progress and game rules. Implementation, the final production build and all browser checks pass in [PR #17](https://github.com/ElBafo/tea-shop/pull/17). [Pages run 42122917736](https://github.com/ElBafo/tea-shop/actions/runs/42122917736) passed, serving preview head `f06a2a0562ece292ed7f4cfef200ab269e0a8d11` at the [phone preview](https://elbafo.github.io/tea-shop/preview/?edition=2). The owner has now explicitly approved merging this preview to main as 0.2.1. Full physical-device regression coverage is not claimed.

**Additional family feedback:** during the guided first puzzle, the tester did not understand that highlighted destination jars could be tapped. The owner wants guidance that can be understood without reading small text at the top. Include a visual demonstration in this same preview: an animated hand and a short bubble beside the jars show a source-to-valid-destination drag; selecting a source by tapping instead points at its destination. Hide the cue during a real drag, provide a static reduced-motion indicator, and keep the existing Skip control. Check that the cue cannot intercept touches or imply an illegal move.

- Start dragging the available top tea pieces without a long press. The moving group follows slightly above the finger so the destination remains visible; eligible jars highlight, and a valid release settles the group into place. Keep the source and destination jars stationary.
- Preserve the existing whole-group rule: all consecutive matching top pieces travel together and must fit in the destination. Do not transfer arbitrary buried pieces, partially split a group, reveal concealed contents, or change scoring and board definitions.
- A release outside a legal target returns the pieces without spending a move. Keep tap-to-tap available, prevent the release from also firing a tap, and cancel cleanly on interrupted touch, navigation, backgrounding or additional fingers. Undo, saved unfinished puzzles and exactly-once win rewards must use the same transfer path as tapping.
- Use Screwdom as a visual reference for the desired sense of tangible puzzle objects. The approved Decopu direction is chunkier, rounded tea pieces, clearer glass edges, consistent highlights and soft contact shadows, readable colours and restrained lift/landing feedback within the cozy palette. Compare a small visual sample on a phone before committing to a wider art overhaul. The puzzle keeps its light palette when entered from a night shop; a dark theme for the whole game remains backlog work.
- Prioritize this observed interaction problem over adding another puzzle arc or more furniture. A full 3D puzzle renderer is an open option only if a focused treatment cannot achieve the intended result; the existing DOM/CSS presentation can support the first gesture preview.

Acceptance for an implementation preview: actual touch drag between jars in both directions, matching/full/empty/invalid targets, whole-group capacity, four- and five-slot jars, hidden-content privacy, tap/keyboard fallback, cancelled and interrupted gestures, repeated moves, Undo/reload and a final winning drag without duplicate rewards. Verify the fresh first-puzzle hand/bubble shows a legal move, redirects to the destination after source selection, hides during real dragging, respects Skip and reduced motion, and does not block play or overflow small phones. Check small/standard phone, landscape and desktop layouts, reduced motion and day/night readability; then obtain physical iPhone feedback on how it feels. Preview first; merge gameplay or art changes after owner review.

Local evidence: package verification passed, including all twenty-four edition and thirty-eight classic solvers (`work/tactile-verify.log`), and the final production build passed (`work/tactile-build.log`). Fresh onboarding/session flow passed (`work/tactile-flow.log`). Root visual review covered the phone artwork, actual drag, tall/small layouts and the new guide. The final drag suite passes all sixteen groups with zero runtime exceptions (`work/puzzle-drag-check.json`, `work/puzzle-drag-run.log`): real touch transfers, tapping/keyboard/mouse, whole-group capacity, hidden privacy, Undo/reload, cancellation/lost capture/extra fingers, navigation/background, exactly-once wins and reduced motion. The final guided-tour suite passes all ten groups with zero exceptions (`work/visual-guide-check.json`, `work/visual-guide-run.log`), including complete drag and tap tours, immediate tapping after a drag, Skip, accessible instructions and scroll-aligned cues. Layouts pass at 320×568, 390×844, 844×390 and 1280×900. Owner merge approval is recorded above; comprehensive physical iPhone regression testing remains outside the automated evidence. The application source is `ec38845ab8b604f72f9e85661425cc1d032711a5` on `preview/tactile-puzzles` in PR #17; [RELEASES.md](RELEASES.md) links the review images.

## Previous release — 0.2.0

**Released: [Decopu 0.2.0](https://elbafo.github.io/tea-shop/).** [PR #16](https://github.com/ElBafo/tea-shop/pull/16) merged as `966c613fa486c9ce34dd1cf5f8bb9ac4a5905d3c`; [Pages run 42081278504](https://github.com/ElBafo/tea-shop/actions/runs/42081278504) passed. Main opens the second edition with fresh production progress and normal onboarding. Progress earned afterward saves normally. Family feedback has now begun; a complete physical iPhone regression pass remains pending.

The owner clarified: “I don’t care about keeping the progress. My wife should check it out like a new installation.” This supersedes the proposed migration, import and edition-choice work for this release.

The main link opens the second edition directly, with a fresh production namespace and the normal Start and first-time guide. It does not copy classic or preview scores, purchases, unfinished puzzles, goals or preferences. Existing keys remain untouched and unused by the default game. This is a one-time fresh start for the new production edition; progress earned afterward saves normally across reloads and later visits.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`. Recovery, unfinished-puzzle, guide and goal keys derive from the new progress key. The preview keeps `tea-shop-preview-edition2-progress-v1` and its existing appearance key; the classic keys also stay unchanged.

The release uses the reviewed twenty-four puzzles and eighteen paid decoration designs, with fifty-four included styles/model thumbnails. Earnings remain 44–92 stars, the eight-piece core costs 26, and the full catalogue costs 138. Reading chair still unlocks at twenty-four completions for 16 stars. No puzzles, prices, bonuses, guest rules or purchase mechanics are added in this activation pass.

The production page must keep development-only showroom, tour and reset controls hidden. The explicit `?edition=1` route may retain the classic runtime for regression checks; this pass adds no edition chooser or switch menu. Bakery, Tea garden fountain, further puzzle arcs, larger rooms, cloud accounts and monetisation remain later work.

Acceptance: verify default main and its query variants use the fresh edition, onboarding starts even when old classic/preview saves exist, first win → preview → purchase → arranging works, and newly earned production progress and preferences survive reload. Check that classic and preview keys are unchanged, preview progress still loads, main exposes no showroom/tour/reset controls, and cached/installed-app updates reopen the intended edition. Run all package checks, the production build, phone/desktop browser flows and offline checks. Physical iPhone family testing follows deployment.

The final production build (`work/activation-build.log`) and all package checks (`work/activation-verify.log`) pass, including all twenty-four second-edition and thirty-eight classic solvers, production routing/storage isolation, backup compatibility and guest seating. Independent source review found no blocker. The release browser suite passes (`work/release-activation.log`, `work/release-activation-check.json`): an existing installed production service worker updates to the new build and opens fresh welcome guidance despite populated synthetic classic and preview saves; real first-win → style preview → counter purchase → arranging/rotation/Undo succeeds; new production progress, preferences and unfinished-puzzle resume persist after reload. The new catalogue has eighteen designs and the browser exposes twenty-four puzzles. Main ignores showroom/tour flags and has no reset/demo controls. Same-origin preview and classic data remain unchanged. Layout checks pass at 390×844, 320×568, 844×390 and 1280×900, and the updated controlled app reopens offline. Root visual review found no blocking issue in the phone welcome and first-decoration captures. These Chromium checks do not establish physical iPhone performance or enjoyment; family testing follows deployment.

The owner explicitly approved PR #16, and its merge and production deployment are complete. Initial family feedback is recorded above; broader physical iPhone testing continues. See [RELEASES.md](RELEASES.md) for validation and screenshots.

The following preview sections are delivery history. Their original review gates do not override the fresh-start production decision above.

### Preview.8: Reading corner — hosted; source merge approved

Add four authored puzzles, 21–24, in the A quiet chapter arc. Preserve the first twenty definitions, IDs, capacities, hidden flags, scoring targets and all existing bonuses, together with the classic thirty-eight-board sequence. Keep full-jar completion, unlimited Undo and a calm progression without timers or fail states. Puzzles 21–24 are The First Page, A Little Bookmark, Under the Fold and Settle In, with solver/three-star targets 4/4, 7/7, 10/11 and 12/14.

Reading chair becomes available to buy after **24 completed puzzles for 16 stars**, with three included edition styles and three thumbnails rendered from the actual models. This targets eighteen paid designs, fifty-four thumbnails and a 138-star catalogue. The core eight still cost 26. Existing milestone bonuses stay at twenty stars, so twenty-four puzzles earn **44–92 total**; there is no added bonus at twenty-four. At minimum scores, completing the core leaves eighteen stars, enough for the Reading chair or Collector’s cabinet as alternative choices. Optional full-value returns and free included style changes remain.

Existing visitors may sit in a reachable, placed Reading chair. Reuse the existing seated pose and pooled visitor rigs, and derive safe approach/departure paths from the chair’s placement, rotation and style geometry. A blocked or stored chair must not attract a visit; moving or storing it must leave the room safe. Keep the two-visitor cap, Edit hiding, reduced-motion behavior, background pause and scene cleanup. This extends furniture use without adding a serving system, guest rewards or saved customer state.

Keep the edition namespace and preserve scores, moves, ownership, styles, placements, goals, guide state, preferences, recovery and unfinished Undo history. Known ten-, sixteen- and twenty-board edition backups must remain supported alongside new twenty-four-board files. Continue strict edition, count, balance, unlock and original-length unfinished-puzzle checks.

Acceptance: solve/replay all twenty-four edition and thirty-eight classic boards; independently preserve the first twenty identities and bonus table; verify old twenty-board continuation, all three legacy backup sizes, actual final unlock with no new bonus, every chair style’s free preview/cancel and exact purchase/return/repurchase, touch placement/rotation/storage/reload and insufficient-funds/locked states. Check small/standard portrait phones, landscape, desktop, hidden contents and reduced motion. Verify chair seat contact and access for adults/children across styles and rotations, blocked/stored cases, Edit transitions, guest separation and repeated resource cleanup. Keep the shopkeeper, cabinet and prior room behavior reliable.

Implementation, local testing, visual evidence and hosting are complete. The owner authorized merging the reviewed source. Tea garden fountain, further arcs, Bakery, larger rooms, cloud accounts and monetisation remain later work.

Local validation is complete: all package checks and the final production build pass, including 24 edition and 38 classic solvers. Browser legacy, purchase, visuals, seating, lifecycle and onboarding/goal/reset flow checks pass. Known 10/16/20-board backups carry forward; real 23/24 wins add score stars only. All 18 models fit their footprints and release resources after twelve rebuild cycles. All six guest profiles fit all three chair styles; 72 rendered style/profile/rotation combinations pass. Phone 390×844, small phone 320×568, landscape 844×390 and desktop 1280×900 were checked in Chromium. Physical iPhone review remains pending. Evidence: `work/reading-final-verify.log`, `work/reading-final-build.log`, `work/edition-reading-*-check.json`, `work/edition8-art-check.json`.

Reading chair starts at a reachable position beside the core furniture. Fixed seated facing prevents a half-turn through the chair; walking still eases normally. The owner subsequently approved source integration in PR #15; production activation is the current 0.2.0 task.

### Preview.7: four puzzles and the Collector’s cabinet — hosted; continuation authorized

Puzzles 17–20 form the Treasures to keep arc: The Quiet Cup is a breather after puzzle 16, Pairs and Space explores matching groups in tall jars, A Wrapped Keepsake uses one hidden jar, and A Place for Keepsakes is a visible-information finale. Every first-sixteen definition, ID, scoring target and existing bonus is preserved. The current four flavours, at most six jars, full-jar completion, unlimited Undo and no timer or fail state remain.

Collector’s cabinet becomes available to buy after 20 completed puzzles for **18 stars**. Its three included edition styles have distinct shapes and tea-ware arrangements: Jade atelier has one broad arch, Blue porcelain has twin display bays, and Rose salon has a lower bowed crown. Three thumbnails rendered from these models bring the catalogue to seventeen paid designs, fifty-one thumbnails and 122 stars; the required eight-piece shop still costs 26. Existing forty-eight thumbnails are unchanged.

Keep the existing 20 milestone-bonus stars: 4/5/7/4 at 3/6/10/16 completions. **There is no added bonus at 20.** Twenty puzzles then earn 20–60 score stars plus 20 bonus stars, or **40–80 total**. Minimum finishes fund the core plus Botanical triptych; owning the core and the 18-star cabinet requires at least four more score stars. This keeps the cabinet aspirational while optional full-price returns allow different choices. Unlocking never grants free furniture, and replays cannot farm rewards.

The edition save namespace, scores, moves, ownership, styles, placement, goals, guide state, preferences, recovery and unfinished puzzles are retained. Both known ten- and sixteen-board edition backups load alongside the new twenty-board shape; strict checks reject unrelated lengths, cross-edition imports, invalid balances, premature ownership and unfinished-puzzle IDs beyond the source backup’s level count. Sequence growth appends empty scores rather than replacing progress.

Acceptance: solve and replay all twenty edition boards and all 38 classic boards; independently verify the first sixteen identities and bonus table; check 19→20 progression, cabinet unlock versus affordability, all-style free preview/cancel, exact purchase/return/repurchase, movement/storage/rotation/reload, both legacy backup sizes and continued unfinished play. Check phone, small portrait, landscape and desktop puzzle fit, hidden contents, reduced motion, mixed-style cabinet presentation, guest paths with the cabinet placed/stored and model/resource cleanup. Preserve the preview.6 visitor cast and first-counter shopkeeper behavior.

Implementation is frozen and local validation is complete. The final production rebuild and all package checks pass, including all twenty edition and 38 classic solvers, ten/sixteen→twenty compatibility, catalogue and budget checks. Solver/three-star targets for 17–20 are 4/4, 8/8, 11/12 and 13/15; independent checks preserve the first-sixteen fingerprint and bonus table, and new arrangements are distinct under flavour renaming and jar permutations. All seventeen designs pass footprint and twelve-cycle resource cleanup checks. Final browser phases pass old-save/backup continuation, real 19/20 wins with no new bonus, every cabinet style and purchase/return/placement path, small-phone/landscape/desktop layout, hidden-content privacy, capacity transitions, reduced motion, guest safety and lifecycle cleanup. The original onboarding/goal/purchase/resume/reset flow also passes.

A two-line puzzle-20 title exposed a two-pixel scrollbar at 320×568. Reducing short-portrait five-slot shelf padding preserves the full title, 23-pixel treats and all jars/plank; the final shelf reports equal scroll/client heights of 373 pixels. Phone day/night/Edit, unlock, hidden/tall-small and style images were reviewed without a blocking issue. The day/night/desktop room images show an affordable paid core-plus-cabinet composition; the seventeen-piece showroom is a separate development demo. Showroom-only wall slots clear the cabinet crown without changing player layouts. [RELEASES.md](RELEASES.md) records logs and artifacts. Hosted deployment passed. The owner subsequently said “Continue,” authorizing the Reading corner preview. Reading chair is now the preview.8 milestone; Tea garden fountain, further arcs, Bakery, cloud accounts, larger rooms and monetisation remain later work.

### Preview.6: natural movement and a broader visitor cast — hosted; continuation accepted

The owner said visitors “walk funny stiff” and clarified the requested variety as “women or kids.” Both agreed follow-ups were implemented in preview.6:

- Six recognizable visitor profiles: two adult women, two adult men and two children, with different proportions, hair, clothing and skin tones. Appearance stays stable during a visit; the roster cycles across room lifetimes within the session without a save-schema change. This is not a player character-selection feature.
- Walking uses bending knees and elbows, distance-driven steps, restrained body motion and frame-rate-independent visual turns. Root positions still follow the exact traffic route; visual turning does not cut corners through furniture.
- Children have shorter limbs and distinct proportions. Seated hips stay at the chair or bench cushion height while shorter legs can dangle.
- Two reusable guest rigs retain the two-visitor cap, routes, activity choices, timing and decoration-based arrival rates. Visitors still hide during Edit; reduced motion is static and backgrounding pauses the existing loop.
- Visitors remain non-pickable and own their disposable resources. The pass adds no lights, room-shadow casters, timers, saved customer state or rewards.

Acceptance: check per-visit identity, actual profile variety over successive visits, turn wrapping and frame-rate consistency, stopping and reset behavior, all profiles at floor and seat heights, Edit/background/reduced-motion behavior, repeated profile-switch cleanup and phone/desktop day/night presentation. A motion clip or direct hosted review must support any claim that walking looks better; static screenshots alone cannot establish it.

Preview.6 preserved the sixteen puzzles, sixteen paid decoration designs, 36–68-star earnings, 104-star catalogue, save namespace, first-counter shopkeeper and small-phone jar fixes. Preview.7 now takes up four more puzzles and the Collector’s cabinet; the other two special designs and later venues remain future work.

Production build, all package verification and final browser checks passed. Visual/source review confirms six-profile geometry, floor and seat contact, stable resources and cleanup. A 900-second simulated browser run visited all six profiles, respected the two-visitor cap and kept exact traffic positions while easing turns; both children used every table and bench style. Actual UI, Edit/drafts, background, reduced motion, save/classic isolation, fresh onboarding and first-counter shopkeeper regressions passed. Phone day/night/Edit and room poses were inspected; a four-second fixed-30-Hz walking clip supports motion review without claiming measured phone performance. [RELEASES.md](RELEASES.md) records detailed evidence and artifacts. Deployment passed, and the owner responded “Looks good. Proceed.” This is positive review and continuation authorization, not a merge.

### Preview.5: a longer puzzle journey and two special pieces — hosted; continuation authorized

Puzzles 11–16 add the Afternoon ritual and A room of your own arcs, with breathers, meaningful choices and selective hidden contents. Levels 14–16 use five-slot jars, and level 13 has one hidden jar. The first ten board definitions, IDs, scoring targets and existing completion bonuses are preserved. Full jars, unlimited Undo, no timer and no fail state remain the rules.

| New edition design | Puzzle unlock | Star price | Included styles |
| --- | --- | --- | --- |
| Glass garden | 13 completed | 10 | 3 |
| Botanical triptych | 16 completed | 14 | 3 |

Both designs now use the edition's miniature art language with six accurate model thumbnails. They share the existing palette and placement categories, support mixed styles, and remain optional paid purchases. Unlocking only makes them available to buy. The catalogue contains sixteen designs costing 104 stars; the other three special designs remain later work.

Four completion-bonus stars at 16 join the 4/5/7 bonuses at 3/6/10. Sixteen puzzles then earn 16–48 score stars plus 20 bonus stars: **36–68 total**. The core still costs 26, so even minimum finishes can fund it plus Glass garden; optional choices and better scores still matter. Full-value optional returns remain available. No farming, new currency or monetisation is introduced.

The edition save namespace is retained. Existing ten-entry score/move arrays gain six empty entries without changing scores, purchases, styles, placements, goals, guide state or unfinished puzzles. Legitimate ten-board edition backups and new sixteen-board backups are accepted; new exports identify their edition. Classic imports, invalid balances and ownership before its unlock are rejected. The released boards and ordinary-preview behavior stay unchanged.

Acceptance: all sixteen edition boards and all 38 classic boards pass verification; the first ten edition definitions stay unchanged; both new unlocks, prices, free previews, purchases, returns and goal paths work. Verify old local saves, ten-to-sixteen backup compatibility, unfinished-puzzle resuming, model footprints/disposal and phone/desktop day/night presentation. Record actual results before calling the build ready. Guest traffic and paid wall ownership remain regression requirements.

This pass also addresses two observed defects. Buying and placing the counter now shows the shopkeeper immediately in the second edition, without waiting for core-room completion. He belongs in the aisle behind the counter and follows its placement and orientation. A free counter preview shows him temporarily; cancellation removes him, storage hides him, and restoration or reload shows him again when the counter is placed. Classic behavior remains unchanged.

The new five-slot puzzles exposed bottom-row clipping at 320×568. Capacity-aware portrait sizing now keeps both jar rows above Undo and Restart. The full session browser suite passed on small/standard phones, landscape and desktop, including shopkeeper preview/cancel, purchase before completion, storage, restoration, rotation and reload. The final build and all required verification passed; all sixteen edition and 38 classic puzzles are solvable, and independent identity checks preserve existing boards. Art rebuilds across all sixteen designs return resources to zero. Onboarding/choices regressions and the focused small-phone overflow assertion also pass, with the complete shelf visible. Local validation is complete. Hosted deployment passed; owner phone review remains pending. See [RELEASES.md](RELEASES.md) for detailed evidence and screenshots.

### Preview.3: paid wall finish — hosted; continuation accepted

An unpurchased room starts with plain plaster. The twelve white wall panels and two decorative dado rails appear only when paint is owned, or while the player is deliberately previewing its style. The existing three-star wall upgrade includes the colour, decorative finish and curtains. Basic walls, window, floor, structural edge trim and the diorama foundation remain part of the room.

A free preview must not spend stars or grant ownership. Browse, Done or selecting another unowned decoration restores the actual purchased room; buying paint commits the finish and selected style, which must survive reload. The finish group is initially disabled and follows the same ownership state on every room synchronization, so no completed finish appears before the first update. The floor foundation stays outside that group.

All prices, fourteen-design content, ten boards, saves and classic/released behavior stayed unchanged. Fresh and counter-only rooms, all wall styles, cancellation, purchase/reload, unrelated owned previews, stable resources and phone/desktop day/night screenshots passed before hosting. The owner responded “Good. Let’s proceed.” Guest traffic shipped in preview.4; preview.5 now extends puzzles and rewards.

### Preview.2: more choices and a first guest — hosted for review

| Optional designs | Puzzle unlock | Star prices |
| --- | --- | --- |
| Art, bench | 3 completed | 8, 6 |
| Clock, trolley | 6 completed | 10, 8 |
| Basket, planter | 10 completed | 12, 10 |

Each design now has three styles in the existing miniature art language, with eighteen additional thumbnails rendered from those models: fourteen designs and forty-two thumbnails total. Goals show the puzzle unlock requirement even when the player can afford the price; reaching a milestone makes the item available to buy. After all ten puzzles, “Improve your scores” leads toward an improvable score, or “Revisit puzzles” opens the browser when every score is three stars. An unfinished puzzle still takes priority. When no further stars can be earned, goal guidance suggests returning optional pieces.

The ten boards and existing saves remain compatible. Earnings stay 26–46, core cost 26, optional cost 54, total catalogue 80. Maximum-score players have 20 stars beyond the core to choose extras. Optional full-price returns let players change choices and recover stars for remaining core items; no additional currency or farming loop is introduced.

A stationary seated guest is implemented when both the table and counter are actually placed. It is attached to the table, moves/rotates with it, is hidden in Edit, and disappears when either required piece is stored. This visual adds no lights, independent timer, economy state or walking simulation. Local build and all verification checks, including the expanded catalogue, passed; browser and guest lifecycle checks also passed; physical-phone review remains pending. This hosted stationary guest was the foundation for the preview.4 visit loop below.

### Ambient guest traffic — 0.2.0-preview.4 hosted; continuation accepted

The owner requested guests who arrive, look around and leave, react to the displayed room, and disappear while decorating. The local implementation now supports a maximum of two visitors: enter through a reachable open cutaway edge, browse placed shelves, order at the customer side of the counter, sit at reachable table or bench seating, then leave. A sparse room can support a look-around visit. Stored or blocked furniture is skipped; a blocked activity or exit can shorten a visit rather than force an overlap.

Arrival frequency counts unique decoration designs actually on display, including fixed paint and excluding stored pieces and duplicate copies. Styles do not affect the count or rate. A new room runtime schedules its first eligible guest after 4 active seconds. Recurring intervals interpolate from 70–100 seconds at zero displayed designs to 9–14 seconds at eight or more. The core eight are sufficient for the busiest setting. These are initial implementation values for phone tuning, not an occupancy guarantee: reachable paths, the two-guest cap and free activity places can delay an arrival.

A normal visit attempts up to three available activity kinds before leaving. Initial dwell ranges are 6–10 seconds browsing, 6–9 ordering, 24–36 sitting and 5–8 looking around. Only one guest walks at a time; the other may remain at its reserved activity. Orthogonal grid routes avoid placed floor furniture and the counter working aisle, while rugs remain walkable. Table approaches go around chair backs, and bench seating respects cushion height and reachable front access. An outward-facing bench at an edge may have no usable seat.

All guests hide and visits reset during Edit. The arrival clock pauses, and ending Edit recomputes valid room use without repeating the introductory arrival; the next eligible arrival is at least two seconds away. Placement/storage changes rebuild valid routes, while style-only changes do not change the arrival rate or clock. Bench style changes refresh seat geometry. Backgrounding pauses the existing render loop, and each simulation step is bounded to prevent elapsed-time catch-up.

Reduced motion uses stationary visits at one reachable activity, retaining normal arrival/dwell timing but omitting spatial travel and limb/bob animation. Two pooled, distinct miniature visitors use the existing render loop, remain non-pickable and own their disposable resources. They add no new lights, independent timers or per-frame room-shadow rendering. Moving visitors use soft contact discs and stay out of cached sun/lamp shadow maps.

Visits are ambience: no queues, service deadlines, mandatory tasks, matching-set bonuses, star rewards, penalties or saved guest/economy state. They cannot block decorating. Prices, paid wall ownership, fourteen designs, ten puzzle boards and existing saves are unchanged.

Pure route/runtime tests passed, including rotations, storage, blocked and disconnected layouts, seat approaches, Edit/reduced-motion behavior, population bounds and arrival scaling. A deterministic 600-second fixture recorded eight arrivals in an empty room and eighteen with the core eight, with mean core occupancy 1.96 and the cap respected. An adversarial run covered 180 legal layouts for 1,200 simulated seconds each, reporting 10,798 arrivals, minimum pair separation about 0.73 and no residual collision or stall. These are simulation checks, not phone performance or enjoyment evidence. Production build, all verification checks, final browser traffic tests, visual lifecycle checks and the paid-wall regression passed. Browser fixtures confirmed Edit hiding, reduced motion, collision avoidance and stable resources through sixteen cycles; [RELEASES.md](RELEASES.md) records the bounded evidence and screenshots. Deployment passed. The owner reviewed positively and requested the movement and visitor-cast follow-ups recorded above.

The agreed movement and visitor-cast work was deferred during preview.5, delivered in preview.6 and reviewed positively. Further activity reactions may follow. It does not imply a serving game, real customer economy or new venue.

### Six approved second-edition tracks

| Track | First milestone: 0.2.0-preview.1 | Acceptance for phone review |
| --- | --- | --- |
| 1. A distinctive miniature | Refine counter, sign, paint, shelves, plant, rug, lamp and table, together with the room and shopkeeper. Use coordinated wood, ceramic and fabric treatments, rounded silhouettes and consistent proportions. | All eight designs read at phone size; mixed styles look intentional; day/night framing, material cleanup and placement footprints remain reliable. |
| 2. Tactile puzzle presentation | Compose jars on a tea counter, with coherent treat artwork, clear glass and an understandable frosted treatment for hidden contents. Coordinate existing pour, settling and celebration feedback. | Jars remain stationary; pieces move clearly; concealed colours stay concealed; full-jar completion, Undo, audio preferences and reduced motion work. |
| 3. A shorter, coherent journey | Make Play open the next puzzle, while retaining level browsing. Use a compact contextual decorating panel and accurate previews from the furniture models. Carry one visual language through shop, puzzles and results. | A player can go from shop to puzzle to chosen decoration without unnecessary intermediate screens, losing their selection or losing their collection position. |
| 4. Comfortable arranging | Add select-then-tap placement alongside dragging, a clear destination preview, reachable Rotate and immediate Undo move. Preserve explicit Edit mode. | Floor and wall placement work with either method; blocked cells, other-item selection and pinch do not accidentally move furniture; Undo restores the accepted previous placement. |
| 5. Personal goals and room life | Let the player pin a decoration to save for and show progress after puzzles. Add restrained room reactions to useful arrangements where supported by this slice. | The chosen goal persists, can be changed without losing stars, and leads to a correct purchase preview. Room life does not impose matching sets, scores, compulsory layouts or extra resource loops. |
| 6. Authored puzzle sessions | Build ten puzzles with a rhythm of quick satisfaction, decisions, breathers and a finale. Use hidden contents selectively and verify the slice's star budget. | Every puzzle is solvable; full jars, no timer/fail state and unlimited Undo remain. Even minimum completion rewards can fund the required eight-piece shop. Existing 38-board identities and saves are untouched. |

### Delivery stages

1. **Playable slice — hosted; direction reviewed positively:** the six tracks are connected within the one-room/eight-design/ten-puzzle boundary. The app identifies `0.2.0-preview.1`; separate saves, reset, goals and the full first-win/purchase flow are checked. Actual scope, economy and tests are recorded in [RELEASES.md](RELEASES.md). Hosting passed; the owner approved continuing this direction without merging.
2. **Phone comparison — after the slice is ready:** review old and new versions, including a fresh onboarding session and the full choose-goal → play → reward → preview → buy → arrange loop. Observe confusing controls, missed drag/tap targets, wanted rewards and puzzle fatigue. Correct observed problems before expanding.
3. **Extend the approved direction — delivered through preview.8:** preview.2 expanded the catalogue, preview.3 corrected paid walls, preview.4 introduced visits, preview.5 extended puzzles/rewards, preview.6 polished guests and preview.7 added Treasures to keep and Collector’s cabinet. After “Continue,” preview.8 now adds puzzles 21–24 and Reading chair, including safe use by existing visitors. Preserve prior progress, board identities and rewards; Tea garden fountain remains later work.
4. **Release decision — fresh-start activation approved:** the owner requested the second edition on main as a new installation. Version 0.2.0 uses a separate production namespace, without migration or an edition-choice screen. Verify onboarding, new-save persistence, preview isolation and installed/offline behavior before deployment.

First-slice implementation: eight rounded core models with coordinated materials, room panelling and a refined shopkeeper; 24 thumbnails rendered from those models; a book/tea setting appears when a placed table is within 2.3 room units of a placed lamp. Direct Play opens the next or unfinished puzzle; More retains All puzzles. A pinned decoration and style persist through results and purchase preview. Tap placement, dragging, one-step owned move/rotation Undo, and collection-position restoration are implemented. Puzzle jars stay stationary, hidden pieces use a neutral frosted treatment, and level guidance remains visible to prevent a selection layout jump.

First-slice economy: ten puzzles award 10–30 completion stars; fixed completion bonuses at puzzles 3/6/10 add 4/5/7 stars, for 26–46 total earnings. The required eight-piece shop costs 26. Two puzzles have hidden contents. The separate ten-board save cannot replace a 38-board backup. Baseline earnings and catalogue are unchanged.

Local validation passed for baseline and prototype solvers, same-session flows, phone/desktop placement, responsive puzzle presentation, reduced motion and resource cleanup. These checks do not establish physical iPhone performance or enjoyable pacing. Preview.2 extended six optional designs and started a seated guest foundation. Walking visits are implemented and locally validated in preview.4, including production build, all verification checks and final browser regressions; hosting passed and the owner accepted continuation with guest polish follow-ups. Preview.5 advances six additional levels and two special designs. Preview.6 guest polish was reviewed positively. Preview.7 added Collector’s cabinet and a four-puzzle arc. Preview.8 now takes up Reading chair and four further puzzles; a full production asset pipeline and Tea garden fountain stay later work.

Bakery implementation and its cross-room rewards, larger rooms, public galleries, cloud accounts and monetisation remain later roadmap work. A second minigame is not part of this milestone. The sections below retain the game's delivery history and backlog; the current 0.2.0 section above controls the immediate priority.

## Approved reward and experimentation pass — merged in PR #12

The owner approved all six review recommendations before wife testing, then approved merging PR #12. These changes are now on main.

- Improve the Glass garden and Botanical triptych with fuller, phone-readable geometry and meaningful style differences. Keep wood, brass, cream and complementary colours compatible across collections.
- Replace accounting-heavy goal text with a reward illustration, puzzle progress, a separate star price and a tap directly into a free room preview. Unlocks mean available to buy, never automatically granted furniture.
- Add Reading chair at 32 completed puzzles for 16 stars and Tea garden fountain at 38 for 20 stars. The fountain is a small indoor decoration; no yard or outdoor venue is added. Every style is included in the purchase.
- Allow confirmed full-price returns of optional decorations, including stored items and optional second copies. Core eight completion pieces cannot be returned. Returns remove the chosen item and release its stars; ordinary storage remains free and does not refund stars. Other copies, scores and milestone unlocks remain intact. Repurchase uses the usual gates and price.
- Keep Browse and collection tabs visible, shorten selected-item content, retain visual styles and primary Buy/Rotate/Store actions, and give unused panel space back to the room. Return is a secondary action with confirmation.
- Refine puzzle pacing fairly: allow one exploratory move per initially lidded jar in the three-star target; preserve all 38 boards, IDs, hidden flags, capacities, existing scores and resumed move logs. Replace repetitive late-level guidance with specific brief cues. See [PUZZLE_PACING.md](PUZZLE_PACING.md) for evidence and player-test priorities.

Economy: catalogue 190, maximum earnings 132 (114 puzzle + 18 milestone), core 26. A player finishing every puzzle with one star earns 56, enough for the core plus any one special piece (maximum20). Full legacy collectors still have20 available at maximum scores. Optional returns let players try the entire unlocked catalogue over time; owning everything simultaneously is deliberately outside the budget. No new bonus stars at32/38, no repeat-reward farming, no monetisation.

Review on phone: choose a desired reward; preview styles before buying; buy, move, store, return and repurchase; check that the later rewards motivate play. Automated correctness checks do not establish enjoyment or retention. Bakery/cross-room rewards, larger rooms and monetisation remain later work.

## Classic baseline before 0.2.0

- Released baseline `0.1.0`: 38 sorting puzzles, nineteen decoration designs plus five paid second copies, isometric 3D decorating, Edit mode, saved progress, and a completion celebration. Core decorations cost 26 stars; the full catalogue costs 190 against 132 maximum earnable stars.
- Hosted preview: https://elbafo.github.io/tea-shop/preview/ automatically rebuilds from preview/shop-polish. The released game remains at https://elbafo.github.io/tea-shop/.
- The simplified shop UI, showroom, touch picking, sign correction, and counter aisle were reviewed and merged in PR #2.
- Mobile audio retry and clearer sound labels are implemented and checked with a mocked audio context; confirmed working by the owner in Safari.
- The Bakery is an unlockable coming-soon card.

## 1. Make phone play reliable — continuing acceptance criteria

Resolve issues observed during phone reviews before adding more content.

- Confirm audio starts after a tap, respects mute, and recovers after backgrounding.
- Check portrait and landscape layout, scrolling, room framing, and readable controls.
- Check camera movement versus Edit mode, dragging, snapping, rotation, and tapping small pieces.
- Verify purchases, layouts, and best scores survive a reload.
- Make preview builds easy to identify; provide preview-only access to a fully decorated room so art reviews do not require replaying every level.

Done when the owner can play puzzles and decorate comfortably on their phone, with no known blocking defects. Automated checks support this review but do not replace device testing.

## 2. Make the tea shop lovely — continuing art direction

Complete the existing art milestone rather than treating the initial pass as finished.

- Refine camera framing and composition across phone and desktop sizes.
- Improve furniture silhouettes, sign readability, and style differences.
- Strengthen the dusty-to-cozy transformation with warmer lighting and visible upgrade rewards.
- Add carefully placed props, then restrained idle details such as steam or plant movement.
- Check performance and reduced-motion behavior before expanding effects.

Done when phone-size views of the starting and finished room show a clear, charming transformation, all eight upgrades read clearly, and placement interactions still work. Capture before/after views for review. A cat remains optional.

## 3. Personal expression and shop showcases — requested

### Day/night theme — released and reviewed

Add an explicit day/night toggle (interpreting the user's “seat/night” request as day/night). Day retains the warm daytime room; night uses a darker surrounding background and visible lamp/window/shop lighting. Keep furniture, labels, and placement feedback readable in both modes. Persist the preference, respect reduced motion for transitions, and keep the choice independent of real-world time unless requested later.

Done when both themes work at phone size, changing theme preserves the layout, and the nighttime shop looks lit and welcoming rather than simply dimmed.

### Full-game dark theme — later exploration

Explore extending the shop's dark appearance to level selection, puzzle screens, menus, and dialogs. Preserve clear item colors, jar visibility, readable text, and accessible contrast. Decide whether interface appearance follows the shop's day/night setting or is a separate preference; consider a system-theme option. This is a future exploration, not part of the current shop-lighting implementation.

### A much broader decoration catalogue

Expand furniture, plants, wall art, textiles, lighting, countertop props, and style/color options so players can create visibly different shops. Plan owned-item inventory and multiple instances where appropriate rather than assuming one item per upgrade ID. Define prices, unlock pacing, placement footprints, and compatibility with existing saves before expanding the catalogue.

Start with a reviewed collection spanning several categories; agree the catalogue size after the first visual collection is approved. Variety should support distinct tastes and layouts, not just recolors.

### Showcase shops — initial implementation released

Provide a clean view with controls hidden for admiring and capturing a shop, including its chosen day/night theme. Plan a phone-friendly image export/share flow. Public profiles, a gallery, cloud saves, and social features are not implied by this request; evaluate them separately if image sharing is insufficient.

Done when players can compose a distinctive shop and share a clear image of it from their phone. A backend is not required for the initial image-sharing approach.

## 4. Finish and release the tea shop

- Review star costs, level progression, and the time needed to complete the room.
- Polish first-use guidance, sound controls, completion feedback, and the Bakery's coming-soon wording.
- Check touch targets, labels, keyboard focus, contrast, and reduced motion.
- Check load time, repeated scene entry/exit, offline behavior, and existing saves.
- Resolve findings from a complete playthrough; obtain approval before merging gameplay/art changes into main.

Done when level verification and production build pass, the owner approves the phone experience, and there are no known release-blocking issues.

## 5. Design and build the Bakery — later

Agree on the Bakery experience before implementing a second room.

Confirmed progression direction: later shops may begin with shabby fixtures (including a counter) to restore, giving each starting scenario variety. Each successive shop should require a higher minimum earned-star total to unlock, alongside the agreed prior-shop completion requirements. Use total earned stars rather than the unspent balance so decoration purchases do not delay access. Choose exact thresholds with the level/reward plan and ensure they are reachable. This is planned progression; the current Bakery card still follows the existing tea-shop completion rule and remains a placeholder.

Open decisions:
- Does it use the same sorting puzzle, a variation, or a new mechanic?
- Does it have separate stars/progression or continue the tea shop economy?
- What visual identity and upgrade sequence distinguish it?
- How many new levels are needed to fund its upgrades?

Start with one playable slice: enter Bakery, complete a puzzle, earn a reward, buy one visible upgrade, save, and return. Expand content only after that loop works and is reviewed on a phone.

Done when the Bakery unlock opens a playable experience with its own coherent progression and persistence. Exact content scope is not committed yet.

## Player progress and cloud saves — agreed direction

Current behavior: progress is stored in browser localStorage on each device. Preview and release progress are separate, and showroom changes are temporary. There are no accounts or cloud saves yet; clearing browser data can remove progress.

For public release, support immediate guest play with an optional account to back up and synchronize progress across devices. Retain local saves for offline play and synchronize account progress to a database. Preserve existing guest progress when a player signs in.

Before implementation, choose authentication and hosting, define guest-to-account migration, and settle conflict handling for offline play and multiple devices. Scores, star spending, ownership, and placements must remain consistent during synchronization. Exact providers, schemas, and delivery timing are not yet decided.

If public showcases or competitive rewards are introduced, add server-side validation of star earning and purchases as appropriate. Public profiles, social features, and competitive play remain separate decisions.

Acceptance: a guest can play immediately; signing in preserves their progress; the same account can recover its shop on another device; offline changes synchronize without duplicating rewards or losing purchases.

## Ongoing delivery workflow

1. Make a bounded change on the preview branch.
2. Run checks relevant to that change.
3. Push and confirm hosted preview deployment.
4. Share the preview link and a short list of what to test.
5. Incorporate phone feedback.
6. Merge gameplay/art changes into main only after explicit approval.

Preview saves are separate from release saves. Hosting configuration may change as needed to maintain the authorized preview workflow. Keep the preview branch available while deployment depends on it.

Optional accounts and a cloud-save backend are planned as described above. Monetisation is deferred to a later roadmap phase after single-shop playtesting. Multiplayer is not currently planned.


## Latest preview update

A temporary showroom now exposes all decorations without writing saved progress. The home screen shows a compact star balance and affordable-upgrade notice; Edit opens the decoration controls. The sign has a separate readable face, the counter has a reserved rear aisle, and saved furniture placements are sanitized around it. Touch picking registration, drag thresholds, cancellation recovery, and lamp highlighting were corrected. Phone and desktop browser checks accompany the build and level checks; the owner approved the update and requested its merge.

## Day/night preview review

A compact Day/Night switch changes shop lighting and background. The preference is saved independently from puzzle progress, with separate preview/release keys; showroom changes remain temporary. Night adds warm window light and stronger lamp lighting while retaining readable ambient light. Switching is immediate, with no added animation. Browser checks cover phone/desktop rendering, preference reload, showroom isolation, and touch dragging. Next after approval: agree a first expanded decoration collection and the inventory model for multiple items.

## Decoration economy requirement

Every purchasable decoration, including the counter, costs earned stars. Optional catalogue additions are optional for shop completion, not free. The review-only showroom can expose items temporarily without granting ownership in saved play. Validate the full catalogue cost against available level rewards before adding content; add sufficient earnable stars through new playable levels before costs exceed the reward budget. The first expanded catalogue costs 56 stars against 60 available from twenty levels. The starting shop has no counter; buying it for 2 stars reveals the selected Wood, Marble, or Painted style. Existing ownership is preserved.

## First paid decoration collection — in preview

Framed prints (8 stars), wall clocks (10 stars), and baskets (12 stars) each offer three styles. These are optional purchases beyond the original eight completion upgrades. The counter is now absent until purchased for 2 stars, with Wood, Marble, and Painted choices. Buying an item grants its style options; changing the style of an owned item remains free, as in the existing design. The full eleven-item catalogue costs 56 of the 60 available stars. All items are included in the temporary review showroom. Multiple copies and a larger inventory model remain future work.

## Progression direction confirmed by owner

The first shop starts empty of a counter; preserve the shabby-counter restoration idea for later shops to vary their starting scenarios. Some decorations should be aspirational. The optional collection costs 8/10/12 stars, making all eleven items cost 56 stars and leaving only four of the current maximum 60 unused. The original eight upgrades still cost 26 stars and control the completion/Bakery unlock. Collecting everything requires strong scores and replaying for improvements. Expand earnable rewards before future catalogue additions exceed the available budget.

## Lamp touch usability

Night-mode feedback identified a narrow lamp touch target and a floor-projection jump when grabbing the shade. Provide a minimum 44 CSS-pixel-wide selection area along the lamp in both themes, preserve the initial floor-item grab offset, and keep direct selection of other furniture intact. Validate near-miss taps and drag continuity across lamp styles and display pixel ratios before publishing.

Lamp usability validation: the 44 CSS-pixel selection target and preserved grab offset passed emulated touch checks for all three lamp styles in day/night at 1× and 2× pixel density (12 cases). Near-shade taps select the lamp, small drags do not jump, and a one-cell drag reaches the expected grid cell. Physical phone confirmation remains pending. The browser regression script is `scripts/verify-lamp-touch.mjs`.

## Continuous touch dragging

Phone feedback reported the lamp stopping after roughly one cell, rather than snapping back on release. Track active drags through native pointer events and current screen coordinates until release; retain window-level move/up handlers if canvas pointer capture is lost. Genuine pointer cancellation, page hiding, and focus loss restore the saved placement. A browser regression test passed 30 multi-cell and repeated night-mode drags across all lamp styles and 1×/2× pixel density, deliberately releasing capture during each drag. Night lighting remained enabled. Safari-device confirmation is still required; lighting performance remains a separate possible concern rather than an established cause.

## Showcase image sharing

A Showcase view hides the shop UI while retaining camera movement and the selected day/night lighting. Share image opens native file sharing when supported; Save image and unsupported-share fallback download a PNG. Export renders the current room at 1200 pixels wide without UI overlays, then restores the live canvas size. Export does not change scores, ownership, placements, or theme preference. The native Safari share sheet still requires phone review; browser tests cover image dimensions/content, share invocation, download fallback, cancellation, and save isolation. Public galleries and accounts remain separate roadmap work.


## Larger shops backlog; zoom promoted to current work

- Consider progressively larger shop spaces as players advance to later shops, allowing more room for decorations and distinct layouts.
- Player-controlled zoom was promoted from consideration to the next implementation priority by the owner; see Cozy polish and zoom below.

Larger shop spaces remain an exploration idea. Zoom is now committed work; test camera limits, touch interaction with furniture dragging, and phone performance.

## Decoration selection and shopkeeper — phone review follow-up

Owner feedback: the figure should serve from behind the counter, counters and shelves should be movable, and players must choose and see their desired decoration/style before paying.

Implemented for preview review: the shopkeeper stands behind the counter, faces its serving side, and follows counter moves/rotation. Counter placement reserves a one-cell rear working aisle and keeps it inside the room. Shelves can be dragged along either wall and switched with Other wall; window and occupied wall slots remain protected.

The decoration picker uses a grid with All decorations / My decorations filters, named style choices, and a live room preview. Browsing or cancelling a preview spends no stars and does not save temporary ownership or styles. A separate Buy button shows the chosen style and star cost. Unaffordable styles remain previewable with the shortfall shown. Leaving Edit discards an unpurchased preview. Owned styles remain free to change. Purchases require a valid placement; if no space is available, the player must rearrange existing items first.

Validation: placement/aisle and shelf collision checks, catalogue economy checks, all levels, and production build. Browser checks cover phone and desktop views, free previews, cancellation, explicit purchases, insufficient funds, counter/shelf touch movement, shopkeeper position, and reload persistence. Physical Safari review remains pending. This replaces the earlier fixed-counter and fixed-shelf behavior; larger inventories and multiple copies are still future work.

## Editor redesign and whole-game UI review

Latest phone feedback: selecting a decoration can leave placement unavailable until exiting and reopening Edit. Resolve the preview/edit-mode transition so owned items can be selected and moved immediately, and temporary previews can be positioned before purchase without saving ownership or spending stars.

Agreed collection rule: Decorations contains only unowned items; My decorations contains only owned items. A purchase moves its item into My decorations. Replace the previous All decorations tab and duplicated ownership listings.

Editor redesign: keep the room visible in a stable region, with collection tabs and a separately scrolling panel below on portrait phones and beside it on larger/landscape screens. Show either collection cards or the selected item's style/purchase controls, with a clear return to the collection. Browsing, previewing, arranging, and confirming a purchase must have distinct feedback. Owned layout/style changes save automatically; Done leaves Edit rather than acting as a required save step.

Broader UI direction: review the home shop, level selection, puzzle screen, and completion/dialog flows as one coherent interface. Use consistent navigation, typography, spacing, button priorities, and compact star displays. Keep puzzle readability, cozy character, accessible touch targets, and the existing game rules. Start with the editor and review it on a phone before carrying the visual language through the other screens; whole-game restyling has not shipped in this editor pass. Full-game dark appearance remains a separate exploration.

Editor preview validation: automated browser checks pass for selection-to-drag, temporary preview movement/rotation, purchasing the chosen placement, immediate movement after buying, direct owned selection during a preview, cancellation, exclusive collections, shelf movement, insufficient funds, and reload persistence. Portrait, small-phone, landscape, and desktop layouts are checked. Buy/Cancel occupy a separate footer rather than covering the scrolling style controls. Physical Safari review is still required.

Additional editor review direction: combine theme, sound, stars, and Edit/Done into one compact toolbar; remove the instruction text beneath the shop; slightly reduce button padding and type sizes. Preserve readable labels and usable touch targets. Apply the compact toolbar to shop home and Edit so the room gains space in both views.

Remove the redundant “Choose a style” heading from purchase previews; the named style buttons and selected state provide the choice directly.

## Whole-game UI pass — in preview review

Carry the editor's compact controls and clearer action priorities through the shop home, puzzle selection, play, and results. Home has a stronger Play action and quieter Bakery/decoration notices. Puzzle selection uses a compact card grid, available-star balance, completion count, and a Continue action that opens the first unfinished puzzle (or a puzzle with stars to improve once all are complete).

Puzzle play has compact navigation and move/star-target information, with only the initial first-puzzle instruction retained. Jar layouts adapt to small portrait phones and landscape without reducing the number of visible slots. Undo and Restart remain available. Results show the score, only newly earned stars, a primary Next puzzle action, and a direct Decorate shop action; replays do not grant duplicate rewards. Result dialogs isolate keyboard focus. Returning to another screen during a pour prevents that old animation callback from affecting a new puzzle.

Validation: all twenty levels and production build pass. Browser touch checks cover locked levels, Continue, real pours, Undo/Restart, completion, replay rewards, return-to-shop stars, and navigation during an animation. Tall five-slot puzzles fit 320px phones, portrait, landscape, and desktop. Phone review is pending; this is not merged. The shop's Day/Night appearance remains a shop setting; full-game dark mode is still backlog exploration.

## Release approved for family testing

The owner approved the reviewed editor, shop, and whole-game UI changes for merging into main and testing with his wife. Use the normal live URL for this review; preview and release saves remain separate. Collect feedback from actual phone play before selecting the next implementation milestone.

## Full-jar puzzle completion — family feedback

A puzzle finishes only when every jar is empty or completely full of one type. A one-item yellow stack and a separate three-item yellow stack must still be combined; matching partial stacks no longer count as completed jars or completed puzzles. Standard jars require four items and taller jars require five.

Update the solver's completion/pruning rule and individual-jar celebration checks together. Level 3 previously contained only three of each type in four-slot jars; add the missing items so each type can fill a jar. Recalculate all twenty par values under the new goal so three stars remain earnable. Maximum available rewards remain 60 stars. Preserve existing earned stars, unlocks, decoration ownership, and historical scores.

Validation: explicit split-stack and five-slot regressions; every level has capacity-compatible item counts; all twenty solver paths are replayed to legal, fully completed boards; recalculated par/scoring checks and production build pass. Browser review checks that split stacks remain playable and that only the final consolidation shows the result. The owner approved merging this fix directly into main so his wife can test it from the normal live game URL.

## Inventory and second copies — released in PR #5

Proceed with personal expression through inventory and additional placements. Every owned movable decoration can be stored and placed again for free. Ownership, chosen style, and last position remain saved; storing never refunds stars or revokes completion. Paint remains a fixed wall finish. When restoring, use the previous position if available, otherwise find a legal space. If none fits, keep it safely stored and explain that space is needed.

For this 6×6 room, plants, lamps, tables, prints, and baskets each support two copies. Buy the second for the original price, after owning the first. Copies have independent styles, positions, collision footprints, and lamp lights. Decorations shows eligible unpurchased copies; My decorations shows owned copies with In shop/Stored status. Every copy must be previewed and explicitly purchased with stars.

Add ten static puzzles (21–30) to fund the collection. The original catalogue costs 56 stars; second copies cost 32 more. Total: 88 of 90 earnable stars, leaving two after everything is bought. The original eight required upgrades still cost 26 and control completion. Preserve all previous scores, ownership, styles, and layouts when extending saves. This supersedes the earlier 20-level/60-star economy for this preview.

Verification: all 30 solver paths replay to fully completed jars; inventory, collision, paid-copy budget, and legacy-score migration checks pass. Browser checks cover phone purchase previews, independent second-lamp touch dragging, night lights turning off when stored, free restoration, reload persistence, and desktop layout. Physical Safari review remains required before release.

The initial next-step plan was to expand decoration designs with matching rewards. After the Cozy corners collection was built, the owner prioritised cozy polish and zoom before further catalogue expansion; see the current priority above. Larger rooms/zoom, whole-game dark appearance, and cross-device progress retain their separate backlog/planning status.

## Cozy corners collection — next preview

The owner approved and merged PR #5 after phone review. Inventory and the 30-level reward plan are now released. Proceed with three distinct optional designs: a bench (6 stars), tea trolley (8), and tall planter (10). Each purchase includes three freely changeable styles with different shapes or contents: reading/garden/velvet seating, tea/treat/book carts, and olive/bamboo/citrus plants. Each supports preview-before-buy, dragging, rotation, storage, and restoration. Keep one copy of each new design for this small room; existing repeatable designs retain their two-copy limits.

Eight puzzles (31–38) fund the 24-star addition. The full catalogue including existing second copies costs 112 of 114 earnable stars. Existing prices, prior scores, and the original eight-item completion requirement stay intact. No free unlocks or replay farming.

The temporary showroom presents the new pieces in a composed room with second copies stored; reviewers can place them again from My decorations. This arrangement affects only the showroom, never a player's saved layout.

Validation: all 38 puzzle solutions replay to full jars, catalogue and inventory economy checks, and production build. Automated browser checks pass for all nine new style previews, star purchases, touch placement, storage, and 30-level save migration. Phone day/night and desktop screenshots were reviewed. Existing inventory and puzzle flows are also checked. Physical phone approval is required before merging this collection.

## Cozy polish and zoom — priority confirmed by owner

The owner explicitly prioritised a cozier polish pass and zoom in/out ahead of further catalogue expansion. Finish the already-built Cozy corners collection in this preview, then focus on room presentation and camera usability rather than adding more catalogue designs.

Provide pinch-to-zoom on phones, wheel zoom on desktop, and compact minus/Fit/plus buttons on the canvas. Keep the top toolbar compact. Limit the camera to 0.85–1.9 times the fitted view; Fit restores the default framing and angle. Zoom is a temporary view setting, preserved across day/night and Edit changes in the same shop session, and never changes purchases or layouts. Export captures the current framing.

Two fingers switch to a camera gesture. Cancel any uncommitted item movement before pinching and require all fingers to lift before another drag starts. Test normal lamp dragging immediately after pinch and at non-default zoom. Camera changes must not spend stars or save furniture movement.

Cozy polish: soften the over-bright daytime lighting so wood, fabrics, and ceramic colours remain visible; retain readable nighttime furniture and warm lamps. Add subtle rising steam to purchased teapots. Steam is non-interactive, does not cast shadows, and is hidden when reduced motion is requested. No added decoration is granted for free: the new collection remains star-bought, while lighting and steam refine existing purchased furniture.

Larger rooms remain backlog consideration. Full-game dark mode, cloud progress, and Bakery design are separate later work. Review this combined preview on the phone before merging it.

Cozy/zoom validation: 30 long and repeated lamp drags pass across three styles and two pixel densities with deliberate pointer-capture loss. Pinch/button/wheel bounds, cancellation of unfinished moves, post-pinch dragging, reduced motion, and responsive camera checks pass. All 38 levels and the production build pass. The previous test browser stopped delivering valid touch capture; the same drag suite passed in a clean headless browser. Physical Safari review remains the release gate.

## Shadow polish — phone review follow-up

The owner reported a detached window-pot shadow on the floor and an oversized clock shadow across the wall. Use a steeper light directed into the room for shorter furniture shadows, soften their contrast/filtering, and exclude wall ornaments and elevated windowsill plants from casting room-wide shadows. Floor-standing plants still cast grounding shadows; moving a plant between floor and sill updates that rule. Apply the same geometry rules in both day and night. Preserve placement, ownership, zoom, and inventory behavior. Review phone screenshots before merging PR #6.

Validation: day/night caster checks, floor-to-sill and sill-to-floor plant transitions, phone/zoom/desktop screenshot review, all 38 level solutions, and production build pass. The clock and window pot no longer project shadows across the wall or floor. Changes remain in PR #6 preview.

## Lamp-driven shadows — next lighting preview

After noticing that lamp movement did not affect shadows, the owner approved continuing the lighting work. At night each placed lamp uses a downward light pool with one 512px shadow map, rather than a six-face omnidirectional map. Both purchased lamps can cast nearby furniture shadows independently. Cache maps while idle and refresh when lamps, furniture, or purchase animations move. Daytime retains the subtle fixed-light shadows. Stored lamps stop lighting and shadow rendering.

Keep clock/wall ornaments and windowsill plants excluded from large projected shadows, and prevent lamp shades from blocking their own bulbs. Preserve continuous touch dragging and inventory behavior. Validate both lamps, map caching, moving other furniture, floor/sill transitions, and physical iPhone performance before release; desktop emulation cannot establish iPhone frame rate. This continues PR #6 preview without merging new lighting into main.

Lamp-shadow validation: browser checks pass for two independent non-cubemap 512px maps, no idle redraws, light and furniture movement invalidation, storage, day/night switching, and retained wall/sill shadow exclusions. Shadow refreshes during drags are limited to snapped grid changes. Production build and all 38 puzzles pass; physical iPhone performance still requires owner review.

## Cozy milestone released; long-session performance polish

The owner approved and merged PR #6, including the Cozy corners collection, zoom, steam, corrected room shadows, and cached moving-lamp shadows. The main deployment passed. This releases 38 levels, 114 earnable stars, and 112 stars of purchases.

Proceed with the tea-shop release checklist. Repeated style changes exposed retained materials/textures: a 90-change probe grew from 40 to 260 materials and 8 to 68 textures while mesh count remained 103. Every rebuilt visual now releases its own materials and textures, including unused variant materials. Unchanged wall finishes retain their material/texture instead of regenerating on unrelated edits. Placement sparkle systems own their disposable textures so later sparkles remain valid. Disposed pieces stop pending pop-in effects.

Pause the shop render loop when the document becomes hidden and resume exactly one loop on return. Preserve layouts, scores, lighting, and gestures. These changes refine the existing experience without adding catalogue content or changing the economy.

Validation: 120 style changes, 12 store/restore cycles, and 12 preview/cancel cycles keep materials/textures/meshes at 43/7/107. Paint previews still change walls, second-copy materials remain independent, repeated sparkles clean up correctly, three hide/resume cycles pause/resume rendering, and three shop exits/re-entries release their scenes. Production build passes. Review this performance pass on preview before a separate merge. Installed/offline update behavior and the remaining release checklist are later checks; cloud saves and Bakery decisions remain planned.

## Performance release approved

The owner approved merging PR #7. Material/texture cleanup, unchanged-wall reuse, reliable placement sparkles, and background render-loop pausing are now merged into main. The next existing roadmap item is installed/offline update behavior, especially the iPhone Home Screen experience; implementation has not started in this merge-and-roadmap turn. Bakery design follows release reliability work and still requires its content/progression decisions.

## Reliability and jar polish — isolated review branch

The owner requested finishing release reliability alongside smoother, more expressive jar gameplay, with preview approval before any merge. Work lives on `preview/jar-polish`, mirrored to the hosted preview branch. Main keeps the approved experience until acceptance.

Jar selection lifts gently and highlights legal destinations. Treats travel between jars, settle on landing, and completed jars gain a check mark. A completed puzzle briefly celebrates its full jars, then reveals staggered stars and a short confetti finish. Effects are finite and respect reduced motion. Preserve full monochrome jar completion, all 38 puzzles, pars, unlimited undo, star rewards, and purchased shop content. Save a win before visual effects so leaving during the celebration cannot lose its reward. Input stays guarded during transfers; navigating away removes temporary effects.

Installed reliability: generate a content-versioned cache of the complete production build. Install only when every required asset is available. Updates wait for an explicit Update action, with Later available, and never force a mid-puzzle reload. Keep one previous app cache for open tabs and leave unrelated caches and local progress alone. Offline remains device-local; this is not cloud backup or in-progress puzzle persistence.

Keep the normal preview uncached. Provide an optional `/tea-shop/preview/offline/` rehearsal with its own worker scope and manifest, sharing only preview progress. The main save and installed main app remain separate. First open the rehearsal online and wait for “Ready” before testing airplane mode or adding it to the Home Screen.

Validation includes all puzzle/economy checks, production build, touch navigation, undo/restart, full-jar wins, replay rewards, phone/landscape/desktop layouts, transfer cleanup, reduced motion, worker failure/isolation checks, and a two-version production browser test for deferred updates and offline reopening. Physical iPhone Safari/Home Screen acceptance remains pending; automated Chromium checks do not establish iOS behavior. Bakery and cloud progress stay separate roadmap work.

## Jar preview feedback — steady jars and direct decorating

Keep the source jar stationary while treats fly out; remove its sideways tilt while retaining item transfers and the completion celebration. The result screen’s Decorate shop action opens Edit mode directly on the Decorations catalogue, ready to preview purchases with earned stars. Ordinary Shop navigation still opens the home view. Continue on PR #8 preview, without merging until approval.

## Reliability/jar milestone merged; UI review requested

The owner approved PR #8, merged as `a28a44d37c076a1142ce3187a1e3299a43fd8933`. This includes offline/update reliability, animated transfers with stationary source jars, completion celebrations, and direct entry to decorating from results.

The owner requested a UI review and suggestions before further implementation. The following are proposals, not accepted scope:

- Use adaptive jar sizing to reduce empty puzzle space, especially on early levels, while preserving readable four/five-slot layouts on small phones.
- Give the editor a collapsible catalogue/details tray so placement can use more of the room; retain clear access to Decorations and My decorations.
- Show visual style thumbnails instead of text-only style choices, retaining free in-room previews before purchase and clear star prices.
- Consolidate secondary controls (sound, day/night, showcase) while keeping the star balance and Edit/Done easy to reach. Keep generous touch targets despite smaller visual controls.
- Make the next puzzle and earned stars easier to scan; reduce the visual weight of the long locked-level grid.
- Simplify completion copy and distinguish newly earned stars from the available shop balance; retain Next puzzle and direct Decorate actions.

Recommended first pass: puzzle proportions plus editor space and visual style selection. No new UI implementation or further merge is approved by this review request. Preserve the cozy palette, existing interaction behavior, saves, puzzle rules, and preview-first review process.

## UI refinement — all five adjustments approved for preview

The owner approved all five suggestions and explicitly highlighted the hard-to-see star balance. Implement on `preview/ui-refinement`, mirrored to the phone preview; do not merge until reviewed.

- A contrasting gold balance pill with a stronger icon and larger number on shop and level screens, including night mode.
- An explicit More room / Show decorations control that collapses the editor tray and enlarges the room. It preserves the current selection, unpurchased preview, saved placement, and star balance. Hidden controls are inert. No automatic collapsing during a drag.
- Lightweight variant-specific style illustrations and selected checkmarks for both new purchases and owned decorations. The actual in-room preview remains available before purchase; illustrations do not add WebGL renderers. Keep the buy/cancel bar reachable independently of scrolling style details.
- Larger jars/treats on sparse puzzles on taller portrait phones, while retaining compact layouts for small phones, landscape, and dense five-slot puzzles. Source jars remain steady during transfers.
- Group sound, day/night, and showcase under Settings, leaving the balance and Edit/Done prominent. Support keyboard dismissal and tapping outside; preserve familiar labelled actions and touch targets.

Rules, stars, prices, ownership, saves, and offline behavior are unchanged. Locked-level grouping and further result-copy changes remain separate proposals, outside this five-item pass.

UI refinement validation: production build and all 38 solver/full-jar/economy checks pass. Browser checks cover touch puzzle play, undo/replay rewards, direct entry to Edit, 320px/phone/landscape/desktop layouts, menu dismissal, day/night and showcase access, style purchase/restyling/storage, and preview preservation when collapsing the tray. Drag checks pass with the tray collapsed and immediately after selection, purchase, cancellation, and shelf rotation. Phone/day/night/desktop screenshots reviewed. Await owner review on the hosted preview before merging.

## UI refinement release approved

The owner approved merging PR #9. The visible gold star balance, grouped Settings controls, collapsible editor tray, illustrated style choices, and larger sparse-puzzle jars are merged into main as `30cb8510e83e45a8f9527ebf34e28026fa966204`. No additional UI changes are authorized by this merge request.

## Direct animated appearance/audio controls — preview requested

The owner asked to move day/night and audio back onto the top bar as animated icons. This supersedes grouping those two controls inside Settings. Keep the prominent star balance and Edit/Done. Show sun/moon for the current shop lighting and a speaker/waves or muted speaker for audio. Use short transitions, accessible action labels, 44px touch targets, and reduced-motion support. Showcase remains under a compact More options control, hidden in Edit when there are no secondary actions.

Audio is on by default for new players (the existing `muted: false` default); retain saved explicit mute choices. Mobile browser audio unlock still happens on a user gesture. Keep audio directly accessible on shop, puzzle list, and puzzle screens. Toggling sound during a pour must not rebuild or cancel the puzzle's visual state. Day/night remains a shop-lighting setting; full-game dark mode is still separate backlog work.

Implement on `preview/top-bar-icons`, mirror to hosted preview, and await review before merging.

Direct-control validation: production build, all 38 puzzles, inventory/full-jar checks, and audio unlock/interruption/mute checks pass. Browser checks verify new-player audio-on default, persisted mute and night preferences, correct visible icon states, direct audio on all game screens, sound toggling during a pour without rebuilding jars, 44px touch targets at 320px width, and reduced-motion transitions. Phone/day/night/desktop screenshots reviewed. Await phone preview acceptance before merge.


## Decopu identity, start screen, and first-time guidance — approved scope

The owner renamed the game **Decopu** and requested a splash/loading screen with an explicit **Start** button, plus a guided introduction for new users. Work belongs on `preview/decopu-onboarding` and must be reviewed in preview before merging.

Use Decopu in the game title, splash, browser metadata, and installed-app names. Retain existing URL paths, service-worker scopes, save keys, earned stars, purchases, and layouts so current players keep their progress and shortcuts. Tea Shop remains the first venue; the overall game is Decopu. Existing iPhone shortcut labels may require re-adding the shortcut to reflect the renamed app.

The splash appears immediately while assets load. Start becomes available when the first screen is ready; do not add artificial waiting or fake percentage progress. Starting uses the user's gesture to unlock mobile audio, respecting the saved mute choice. Include a useful loading failure/retry state and reduced-motion support.

For new players, introduce the loop through playing: sort the first jars, fill every nonempty jar completely with one kind, earn stars, then preview and buy a decoration. Keep guidance short, skippable, and separate from puzzle rules. Preserve undo, scoring, styles-before-buying, and normal decorating. Save onboarding progress separately; do not force the introduction on existing players or repeat completed guidance.

Initial status: branding and scope were recorded while the workspace was offline. Implementation resumed once the workspace became available; see the delivery notes below. Main remains unchanged until approval.


## Collection choice and aspirational decorations — product direction

The owner wants showcasing to express meaningful differences between players: a wider selection of items and styles, expensive decorations that require saving across levels, and later rooms/content that let players return to personalize their original tea shop with less-common pieces.

Current economy: 38 puzzles provide 114 stars and all purchases cost 112. Several items already cost more than one level's maximum three-star reward, but the full catalogue is deliberately affordable. Future optional collection expansion should offer more choices than a player can afford at once, with enough rewards for core progression. This revises the earlier blanket goal of funding every optional purchase immediately; it does not change the live economy or revoke existing purchases.

Proposed design for balancing, not yet approved prices or implementation:
- Accessible essentials, more distinctive optional designs, and aspirational statement pieces. Illustrative future price bands: 2–6, 8–15, and 20–35 stars respectively; calculate actual prices against the level/room budget before shipping.
- Add separately star-priced new premium variants where their appearance merits a separate purchase. Preserve all existing included/free style options for current owners; do not charge again for styles already granted.
- Some special items require both a progress/mastery milestone and stars, making their acquisition a visible accomplishment. Keep them optional and preserve the game's no-timer/no-failure character.
- Later rooms introduce puzzles and new designs usable when revisiting earlier shops. Exact inventory sharing/movement rules between rooms remain undecided.
- Keep room progression achievable regardless of optional spending. Recommended approach: room eligibility based on lifetime stars earned, consistent with the earlier higher minimum-star unlock plan. The owner's suggestion of buying rooms with spendable stars needs an explicit budget/access design before implementation; do not silently choose a room fee or let a decoration purchase permanently block the only source of new stars.
- Add new earnable content with progression. Do not promise repeat-star farming, random drops, paid currency, or artificial player-count exclusivity; those are not agreed mechanics.

Next step: model the first two rooms, essential costs, optional catalogue, and reward budget before implementing this economy. The Decopu rename, Start splash, and first-time guide remain the active unfinished milestone; this discussion adds roadmap direction rather than replacing that work.


## Decopu start and guided first visit — implementation for review

The Decopu splash now paints before the bundle loads and waits for scene readiness. Start explicitly opens the app and unlocks audio through that gesture. Existing sound preferences are preserved. Slow loading exposes Reload; initialization failures retain a recoverable loading screen. No artificial wait or percentage is shown.

New players can choose Show me how or Explore on my own. Guidance highlights a possible first-puzzle move, explains the full-jar goal, saves the real first win, introduces spending stars, then explains arranging the first purchased piece. Every contextual guide has Skip; completed/skipped guidance stays dismissed. Existing saves skip the introduction. Guide progress uses a separate versioned key derived from the existing save key, leaving scores and inventory untouched.

Review the whole first-time flow at `/tea-shop/preview/?tour=1`. This preview-only tour starts with temporary empty progress and never writes scores, purchases, guide state, or appearance changes to the saved preview shop. Normal preview and main retain their established save keys and URLs. Tea Shop remains the first room within Decopu. Installed-app names and browser metadata use Decopu; iPhone shortcuts may retain a cached old label until re-added.

Validation: all 38 solver/full-jar/economy checks, production and hosted-preview builds, real-touch first win/purchase, onboarding skip/completion persistence, existing-save migration, temporary tour isolation, phone/320px/landscape/desktop layouts, and offline-update/reopen checks. Physical phone review remains required before merge. Future collection scarcity and room-economy changes remain roadmap proposals, outside this release.


### Wall-to-wall dragging — preview review

- Wall decorations dragged toward the other wall now snap to the nearest available slot on that wall, including when the finger is over the window or an occupied slot.
- A full wall keeps the original placement and shows a brief explanation to move or store another decoration. Window clearance and paid ownership remain intact.
- Check: real touch drags in both directions at phone and desktop sizes, window snapping, crowded-wall rejection and saved placement. Included in PR #11 for phone review before merging.

## Approved depth and ownership pass — in development

The owner accepted the full candid review after merging PR #11. Deliver on a separate preview branch and wait for phone review before merging.

- Give the room more space while editing; use variant illustrations in the catalogue, compact contextual controls, and visible legal placement guidance.
- Add a distinctive Conservatory collection: three separately star-priced statement pieces with puzzle-completion milestones. Preserve every existing purchase, price and included style. Optional collecting offers choices beyond the immediately available star budget; core shop completion remains affordable.
- Group the existing 38 puzzles into chapters, show the next collection milestone and acknowledge milestones in results. Preserve rules, scoring and unlimited undo.
- Celebrate the tea shop as a finished destination. Do not promise a playable Bakery; it remains explicitly future content.
- Improve the new pieces' silhouettes and the shopkeeper's readability; prioritize recognizable shapes over extra particle effects.
- Provide versioned downloadable progress backups, validated import with an explicit replacement confirmation, recovery from a damaged primary save, and persisted unfinished puzzles with undo. This is device/file recovery, not accounts or automatic cloud sync.
- Include migration, economy, import failure, resume, real-touch editor/gameplay, phone/desktop and resource checks. Record limitations honestly.


Implementation choices for the depth preview: Conservatory prices are 10/14/18 stars with unlocks at 8/16/24 completed puzzles, three included styles each. Total catalogue is 154 stars against 132 earnable; the original 112-star catalogue and 26-star core retain their prices. Milestones unlock the right to buy, not free furniture. The 38 puzzles are grouped into five chapters without new rules. A single unfinished puzzle is saved; starting a different puzzle replaces that slot. Backups are manually transferred files, with validated import and replacement confirmation. Cloud accounts, larger rooms and a playable Bakery remain separate future work.

Depth preview validation: all 38 solvability checks, full-jar rules, legacy inventory/currency, placement, backup round-trip/rejection/recovery/storage failure, and resume replay pass. Browser checks cover real-touch purchases, all nine new styles, milestone locks, reload/Undo, import confirmation, chapter-eight unlock, completion-to-showcase, 320px/390px/landscape/desktop layouts and pinned action controls. Existing gameplay/editor checks pass. Repeated editing/marker selection returns to baseline resource counts; hidden rendering pauses and scene disposal pass. Production offline/update/reopen checks pass. At that validation checkpoint, physical iPhone review was pending and main was still on PR #11. The owner subsequently reviewed and merged the depth and reward work in PR #12.


Chapter milestones also award 4/6/8 bonus stars at 8/16/24 completed puzzles. Bonuses are derived from completion counts, so existing players receive them retroactively and replaying cannot farm them. Total earning capacity is 132 (114 puzzle stars + 18 chapter stars), against a 154-star catalogue. A player who already owns the entire 112-star legacy collection has 20 stars available and can afford any one new statement piece. Puzzle scoring itself is unchanged.


### Selection navigation fix — depth preview

Phone review found the return link easy to miss or lose while scrolling selected-item details. Keep a clearly labelled, 44px-high **Back to decorations** button fixed above the scroll area for owned selections and unpurchased previews. Returning restores the list and both collection tabs without leaving Edit, purchasing an item or changing the saved layout.


## Focused editor pass and clarified product direction — approved

- Keep collection tabs available during selection. Put Browse and Hide/Show panel in a stable navigation row; Browse returns to the active list and expands a collapsed panel. Pin the selected item's name and purchase/Rotate/Store controls independently of style scrolling. Show legal-position markers only while dragging, clearing them on release/cancellation. Preserve purchasing, preview cancellation, free styles and saves.
- Collections must mix well: shared scale, compatible materials and coordinated accent colours should support intentional combinations across collections. Themes are suggestions, not compulsory sets; do not introduce matching-set bonuses or punish mixed styles. Future art review must include mixed-collection room arrangements, not only matching showroom sets.
- The Bakery is the second room/story chapter, distinct from the five puzzle groups currently inside the tea shop. Completing the playable Bakery should unlock special decorations that can be brought back to the tea shop. Under the established all-decorations-cost-stars rule, this unlocks purchase availability; items, prices and completion criteria remain to be designed with the Bakery. Do not relabel the existing 8/16/24-puzzle unlocks as Bakery rewards or revoke current ownership.
- Keep jar sorting as the current core. Long-term retention is unproven. First test whether new players enjoy multiple sessions, find later puzzles varied enough and voluntarily return to earn a specific decoration or open a room. Observe where sorting becomes a chore. A new minigame is not assumed necessary; do not add pressure mechanics to manufacture retention. No analytics collection is implemented by this decision.
- Execute the editor pass first on PR #12's preview. Premium art refinement and optional-item exchanges were subsequently approved and implemented in the reward pass below. A playable Bakery and its cross-room rewards remain future work.


Owner confirmed the immediate scope is the best possible single-shop experience for wife testing. Keep this pass on the tea shop and verify the first-time puzzle → reward → preview → purchase → arrange → browse loop. Bakery implementation is not part of this pass. Reserve story chapters for venues; tea-shop puzzle groups award “milestone stars” in player-facing copy. Future cross-room rewards must preserve each room’s layout and let players return freely to decorate the tea shop. Mixing styles remains an art acceptance criterion.


### Monetisation — later roadmap phase

The owner explicitly deferred monetisation. First validate a satisfying, understandable single-shop experience through wife/new-player testing, then expand the room journey based on evidence. Revisit monetisation only in a later planning step; no business model, pricing or implementation is approved yet. Current star costs are an earned in-game progression system, separate from future real-money decisions.


Phone feedback requests tighter vertical spacing across tabs and pills. Reduce collection tabs to 36px plus container spacing, secondary toolbar/navigation controls to 40px, the noninteractive star pill to 36px and style-card padding. Keep Buy/Rotate/Store actions at least 44px. Check wrapping, touch navigation and small-screen clipping in the same editor pass.


## Post-review visual corrections — merged in PR #13

PR #12 was approved and merged. The owner requested two follow-up refinements: remove the light-green filled Browse pill when a decoration is selected, and fix hidden-piece alignment inside puzzle jars. Browse remains a clearly labelled, transparent text control with the same tap target and keyboard focus. Hidden-piece artwork is centered within its treat container and sized proportionally so four-slot/five-slot and narrow/wide jar layouts agree. The owner clarified that the issue is horizontal and vertical alignment of concealed pieces, not the lid artwork; preserve their neutral appearance, concealment/reveal rules, jar lids, scoring and saves. The owner reviewed and approved this visual follow-up; PR #13 is merged.

Phone follow-up: right-align Hide/Show panel. The wooden concealment strip must sit in the gap below the visible top piece, rather than at a fixed percentage of jar height that covers hidden artwork. Tie its position to the first hidden slot and use a thin divider; preserve reveal and Undo behavior.


## Development-only showroom and onboarding reset — merged in PR #14

The owner requires the finished-shop demo and reset controls only in the development preview. Main renders neither, and ignores showroom/tour query flags. Preview detection requires both its build base and preview path. Preview save-key isolation now lives in source as well as the hosted build. More → Reset preview progress opens a confirmation, clears only the preview primary/recovery/puzzle/onboarding/appearance keys, and reloads the normal preview at Start with new-player guidance. Main progress and unrelated browser storage are preserved. The player's own Showcase remains a normal game feature; it does not grant the finished demo room.
