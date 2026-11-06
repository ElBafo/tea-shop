# Architecture

**Released: [Decopu 0.2.1](https://elbafo.github.io/tea-shop/).** [PR #17](https://github.com/ElBafo/tea-shop/pull/17) merged as `2df365fd0921835cd2d647c3277d026b682f821b`; [Pages run 42128359597](https://github.com/ElBafo/tea-shop/actions/runs/42128359597) passed. Drag controls, refined puzzle artwork and the visual first-puzzle guide are live. Existing production progress is preserved; there is no new reset or storage namespace.

## Completion feedback — 0.3.0-preview.3

`rewardCard(progress, earnedStars)` adds an optional decorative savings track only for actual new currency and an unlocked decoration. Native progress values always expose the final authoritative amount; the CSS track animates from the pre-award fraction and becomes static under reduced motion. The result card distinguishes milestones and zero-new-reward replays. Reward bookkeeping still happens before visual effects in the existing transfer path; the shorter edition win pause does not move or defer persistence. Completed-jar highlighting affects the glass only, keeping input targets stationary.

`playTeaDrop` reuses a short noise buffer and creates bounded one-shot paper/ceramic nodes that disconnect on completion. Muted or hidden-page calls return without creating sound nodes. Gesture-based audio unlocking remains the existing Safari-compatible path. Ordinary edition pours use this sound; classic mode and the isolated 3D comparison retain their existing audio behavior.

## Isolated puzzle-rendering comparison — 0.3.0-preview.1

`main.ts` dynamically mounts the comparison only for a preview build/path with `edition=2&puzzle3d=1`, bypassing normal app initialization. The comparison owns ephemeral board/history and uses existing engine functions; it must not call guide/progress/resume storage or record rewards. Native HTML jar controls provide layout, focus, labels and hit targets in both views. The 3D renderer uses their measured geometry for alignment, and the visual helper can keep its DOM anchors. Rendering, gesture cleanup and fallback are owned by the comparison screen; only the active scene is retained. The ordinary app and production routing are unchanged. The 3D scene uses shared material/texture caches, two lights, DPR capped at 1.75 and on-demand rendering with a retained drawing buffer. A post-shader-ready draw avoids a blank first frame. Keyboard/tap controls remain native HTML; interrupted drags restore the previous selection and accessible pressed state. WebGL context loss switches to Current with the same board/history. Hidden sachets use neutral materials, and a sealed-source drag lifts only its visible top piece.

## Starting-room preview — 0.2.2-preview.2

`ShopVisuals.starterBench` owns temporary scenery under the room node. `positionShopkeeper` reuses the existing keeper, showing the bench only before counter ownership, outside Edit, and when `canPlace` accepts the default counter footprint and rear aisle. Owned/stored counters suppress it. No inventory/save keys change. Preview.2 adds a keeper head pivot, breathing and blink poses through the existing render tick, resetting during Edit/reduced motion. Existing ambient, sunlight and window-light settings are rebalanced for warmer daytime fill and clearer cool nights; no additional lights or continuous lamp-shadow refresh is added. Steam uses the existing frame loop and reduced-motion handling; the new geometry adds no lights or timers. Separate sky, outdoor greenery, glass and frame depths remove the old coplanar window faces. Day/night updates the backdrop material; base glass clarity no longer depends on purchasing paint. All changes are scoped to the second edition.

## Runtime

Decopu is a static, client-side TypeScript application built with Vite. Babylon.js renders the shop. The puzzle screens and shop controls use HTML templates, CSS, and DOM event listeners rather than a UI framework. There is no backend or account service.

`index.html` loads `src/main.ts`, which mounts the app and registers the service worker. `src/ui/app.ts` owns the screen state (`shop`, `levels`, `play`), current progress, active puzzle, and undo history. Screen navigation is internal state rather than URL routing.

## Production mode and fresh-start storage — 0.2.0

The activation implementation makes the normal `/tea-shop/` page select the second edition: twenty-four authored boards and eighteen paid designs. Preview mode still requires the preview build/path and `edition=2`; an explicit production `?edition=1` route retains the classic runtime for regression checks. Headless Node verification falls back to the classic mode when there is no browser context. The production-mode regression and browser checks pass for these boundaries.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`. Recovery, unfinished-puzzle, guide and goal keys derive from the new progress key. The preview keeps `tea-shop-preview-edition2-progress-v1` and its existing appearance key; the classic keys also stay unchanged.

The owner chose a fresh installation experience. There is no migration, preview copy, chooser or destructive storage clear. `loadProgress`, `initGuide`, resume and goal handling operate on the selected namespace: the first production visit receives empty progress and welcome guidance; later visits resume the newly saved game. `shop/screen.ts` uses the selected appearance key rather than a hardcoded preview key. Preview-only reset/showroom/tour gates stay independent from selecting the second-edition visuals and rules.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/game/types.ts` | Shared board, level, progress, upgrade, and placement contracts |
| `src/game/engine.ts` | Move validation and application, completion, board cloning, scoring, solver move helpers |
| `src/game/levels.ts`, `edition-levels.ts` | Select the 24-board second edition or preserved 38-board classic sequence |
| `src/game/solver.ts` | Bounded breadth-first search used by development scripts |
| `src/game/storage.ts` | Load, validate, and save progress; best scores, unlocks, and available stars |
| `src/game/audio.ts` | Web Audio sound effects, unlocked by a user gesture |
| `src/ui/app.ts`, `src/ui/items.ts` | Screen orchestration, puzzle interaction, and item markup |
| `src/ui/puzzle-drag.ts`, `puzzle-drag.css` | Pointer gesture capture, temporary lifted pieces, legal target feedback and cancellation; no saved game state |
| `src/ui/puzzle-guide.ts`, `puzzle-guide.css` | First-puzzle legal-move demonstration, nearby action bubble, accessible instruction and overlay cleanup |
| `src/shop/screen.ts` | Upgrade controls, purchase and style actions, editing controls, completion UI |
| `src/shop/upgrades.ts` | Upgrade catalog, prices, variants, defaults, and completion rules |
| `src/shop/grid.ts` | Placement rules, snapping, collisions, rotation, and saved-layout sanitization |
| `src/shop/diorama.ts` | Babylon engine and scene, camera, lights, pointer interaction, animation, and disposal |
| `src/shop/meshes.ts`, `textures.ts`, `palette.ts` | Procedural room and furniture visuals, textures, and colors |
| `src/style.css` | Responsive layout, puzzle artwork, controls, and CSS animation |

## Direct puzzle dragging — 0.2.1

The release adds `bindPuzzleDrag` in `src/ui/puzzle-drag.ts`. It keeps a small transient gesture state, crosses an eight-pixel movement threshold before capturing the source jar, and moves cloned rendered pieces above the pointer. Jar elements stay in place. Targets use `canPour`, preserving the existing whole-run capacity rule. Sealed jars clone only their visible piece; concealed colours and hidden run length are not exposed by the lifted artwork.

`app.ts` routes both taps and successful drops through one `transfer()` path, which owns validation, Undo snapshots, move logs, persistence and win rewards. Logical state and saves update immediately. After a drag, the shelf is marked busy immediately while presentation rendering is deferred to the next task and guarded against replacing a newer play state. A drag supplies its lifted-piece origins to `animatePour` in `motion.ts`; the `fromDrag` path settles directly into the jar. Invalid drops return the temporary pieces without changing the board. Rendering/navigation, pointer cancellation, lost capture, extra fingers, blur, backgrounding and resize cancel transient gesture state. Normal pointer completion lets the browser release capture; manual release handles interruption. Final browser checks confirm post-drag tapping and keyboard activation, interruption recovery, saved Undo and exactly-once win rewards. See the 0.2.1-preview.1 entry in RELEASES.md for validation artifacts and physical-device limits.

`mountPuzzleGuide` in `puzzle-guide.ts` demonstrates a legal move only while the first-puzzle guide stage is active. It uses the current board and selection to choose a source/destination through the existing move validator. A hand, route and short bubble show a drag, or point at the destination after a source tap. A separate live status description preserves the instruction for assistive technology. The fixed overlay follows shelf/jar geometry through resize and scroll observers, does not enlarge the shelf scroll area and cannot intercept input. Real dragging hides it. Reduced motion retains a static cue, backgrounding pauses animation, and render/navigation disposal cancels animation and removes observers/listeners. Existing Skip and guide progression remain authoritative.

The gesture is available in both edition and classic runtimes. The new artwork remains scoped to second-edition CSS. Puzzle screens retain their light palette when entered from a night shop; a dark theme for the whole game remains backlog work. No Babylon puzzle scene, new storage namespace, puzzle definition or economy change is introduced. Package verification, the final build, fresh-flow checks, guide layout/lifecycle checks and local visual review passed. The final sixteen drag and ten guided-tour groups passed, the preview was deployed and the owner approved merging it as 0.2.1; see [RELEASES.md](RELEASES.md) for evidence and limits.

## Data flow

Puzzle interaction validates a pour, snapshots the board for undo, applies the move, then renders feedback. Completion requires every non-empty jar to be full and monochrome, using the board capacity (four or five). The same predicate drives individual jar completion effects and solver pruning. On a win, scoring updates the level's best stars and best move count and saves progress. The next level opens after completing its predecessor.

The app passes a host interface to the shop screen. Purchases, styles, and accepted moves update `ShopState`, persist it through the storage layer, and synchronize the diorama. The diorama reports selection and placement through callbacks rather than writing storage itself. Unowned style previews use a temporary shop clone; only the explicit Buy action persists ownership and spends stars. Cancelling or leaving Edit restores the saved scene. Visual keys allow unchanged shop items to be retained during synchronization.

The room uses a 6×6 floor grid. The movable counter reserves its footprint and a rear working aisle; movable shelves share wall slots with the other wall decorations. Footprints account for rotation. Furniture cannot collide with other furniture, while rugs may sit below furniture. Placement validation is independent of Babylon rendering.

## Persistence and lifecycle

The active progress key stores best stars and moves, mute preference, owned upgrades, styles, placements, and completion celebration state. Production second edition uses `tea-shop-edition2-progress-v1`; classic uses `tea-shop-progress-v1`, with separate preview keys described above. Available stars equal total best stars plus derived milestone bonuses minus the cost of owned upgrades. Loading validates data and sanitizes the layout. Unfinished puzzles persist separately as replayable move logs. Device transfer uses manual backup files; there is no automatic cross-device synchronization.

Leaving the shop disposes its Babylon scene and engine, stops the render loop, and removes resize observers/listeners. Preserve this lifecycle when changing navigation or adding effects.

## Build, verification, and hosting

- `npm run dev`: Vite development server under `/tea-shop/`.
- `npm run verify`: checks level structure, solvability, solver-derived par, and scoring thresholds.
- `npm run build`: TypeScript checking followed by a production build into `dist/`.
- `.github/workflows/deploy.yml`: GitHub Actions verifies and builds before deploying `main` to GitHub Pages.
- `public/manifest.webmanifest` and `public/sw.js`: install metadata and cache-backed offline support. `scripts/build-offline.mjs` generates a content-versioned complete asset list. The worker precaches the full build atomically, serves a coherent shell offline, and retains one previous app cache for older tabs. `src/game/offline.ts` offers explicit waiting updates outside an active puzzle. Normal preview registration stays disabled; `/preview/offline/` is an optional isolated rehearsal scope. Local storage is never cleared by worker activation.

The solver is development tooling, not a live hint system. Its search has a node limit and prunes selected redundant moves; it is not a general-purpose unlimited solver.

## Baseline considerations

The shop is eagerly imported with the app, so Babylon contributes substantially to the initial bundle. The inspected production build emitted a main chunk of about 375 KB gzipped and a size warning. Consider loading boundaries if startup performance becomes an issue.

The scripts directory contains level, inventory, placement, and CDP browser interaction checks. Camera framing, dragging, touch behavior, and art changes require browser checks. The Bakery is an unlockable placeholder, not an implemented second game.

## Shop appearance

`src/game/appearance.ts` stores the day/night preference independently from progress. Shop controls apply it to both CSS and Babylon lighting. Preview and release use separate keys; showroom switches do not write the preference. Unavailable browser storage falls back to a day theme while still allowing session changes.

## Editor state and previews

The editor owns separate collection, selection, and draft state. Decorations lists unowned items; My decorations lists owned items. A temporary draft includes both style and placement, while Babylon stays in Edit mode throughout the editing session. Draft moves/rotations update only the temporary scene. Buying validates the draft placement and commits that exact style/layout; selecting an owned item or cancelling restores saved state without leaving Edit. The editor's collection/detail region scrolls independently of the room.

## Inventory and paid copies

`UpgradeKind` identifies a decoration design; `UpgradeId` identifies an owned copy. Original IDs remain the first copy for backwards compatibility. Five repeatable designs accept a second ID such as `lamp:2`. `DECORATIONS` contains the complete purchasable collection, while `UPGRADES` retains the original design catalogue and completion requirements.

`ShopState.stored` is optional for legacy saves and normalized to an array on loading. Stored items retain ownership, styles, and last placements but do not render or occupy grid cells. `inventory.ts` implements pure cloning, storage, and placement operations. Restoration prefers the last position, falls back to an open position, and returns no change if the room is full. Sanitization stores an unplaceable paid item instead of forcing an overlap. Currency remains derived from purchased ownership, including stored items and second copies.

The diorama tags each copy with its independent ID. Both lamps have independently positioned lights; stored lamps emit none. The shopkeeper is hidden when the counter is stored. Existing 20-level saves retain scores and receive ten empty score slots.

## Cozy corners collection

Bench, trolley, and planter are optional single-copy designs. Their procedural meshes share existing placement, preview, purchase, and inventory paths. No new light or animation loop is added. Each design has three variants with different geometry or contents. Levels 31–38 are static definitions in `collection-levels.ts`; the shared level count extends score arrays without replacing old entries. The showroom stores second copies to leave space for the new designs, without writing to player progress.

## View controls and cozy details

Diorama owns a bounded zoom multiplier applied to the responsive orthographic span. Zoom buttons, wheel events, and a two-pointer pinch share the same clamp. Pointer tracking cancels an item drag before pinching; remaining fingers cannot resume a drag until all lift. Blur, visibility changes, pointer cancellation, and disposal clear gesture state. Zoom stays out of saved progress. Fit restores camera angle and scale; image export keeps the current scale.

Three non-pickable steam meshes are attached to each eligible teapot. Synchronization caches them for the existing render loop; there is no extra timer or particle system. Reduced-motion preferences hide steam. Daytime illumination is reduced to preserve material colours; lamp lighting remains independent of input handling.

Shadow casting follows placement: floor-level furniture and the shopkeeper cast short shadows from a steep directional light. Wall decorations and elevated window plants receive lighting but do not cast room-wide shadows. Rebuilding a moved plant recalculates its eligibility. Steam never casts shadows.

Night lamps use downward SpotLights with independent 512px PCF shadow maps and a four-unit range. This avoids six cubemap renders per point light. Their maps use render-once caching, invalidated by light positions, layout/style/storage changes, drag previews, and purchase animation. Daytime disables lamp shadows; absent/stored lamps disable shadow rendering and illumination. Lamp meshes are excluded from lamp shadow maps to prevent the shade enclosing its own bulb. Existing wall/sill/steam caster exclusions still apply.

## Visual resource ownership and background rendering

`ownedVisual` records the materials created synchronously for a decoration or shopkeeper. Disposing its root releases those materials and their textures, including materials a particular variant did not attach to a mesh. Materials are not shared across item roots. Wall finishes keep a style key so unrelated layout edits reuse the existing wall material/texture. Each short-lived sparkle owns its own texture, matching particle-system disposal. Tweens skip disposed nodes.

The shop uses one stable render-loop callback. Visibility changes cancel unfinished dragging and stop that callback while hidden; returning restarts it once. Scene disposal removes the visibility listener and all rendering resources. The resource regression script checks repeated style/preview/storage operations, independent copies, particle cleanup, visibility, and scene re-entry.

`src/ui/motion.ts` owns temporary Web Animation API transfer effects, cancellation, and reduced-motion behavior. Puzzle rules remain in the engine; the UI saves completed-level rewards before starting its celebration. Navigation cancels transient visuals and guards delayed callbacks against replacing a newer puzzle.

The UI refinement keeps editor tray expansion as transient screen state. Collapsing it changes layout only; the existing canvas ResizeObserver refits the room, while selection and temporary purchase previews remain intact. Variant illustrations in `src/shop/icons.ts` are inline SVGs rather than extra WebGL scenes. Native details/summary elements group secondary settings; app-root handlers dismiss them on Escape and outside clicks.

`index.html` paints the Decopu splash before the application bundle arrives. Start stays disabled until `mountApp` has prepared the Babylon scene; it unlocks audio through a user gesture and reveals the app. Loading failure and slow-loading recovery keep Reload available without altering saves. `src/game/guide.ts` stores a small onboarding stage under a key derived from the existing progress key. Existing saves skip first-time onboarding. The preview-only `?tour=1` mode uses in-memory progress and guidance and does not save scores, purchases, guide state, or appearance changes.


## Depth preview: collecting, chapters and recovery

`game/journey.ts` defines five chapter ranges and milestone copy. Collection unlocks depend on completed puzzles (8/16/24), independently of earned-star quality. `collectionUnlocked` is checked both in presentation and the purchase handler; preview remains free. New optional items use the same inventory, collision and resource ownership paths. Catalogue illustrations show the saved variant. Legal-position markers are non-pickable meshes rebuilt on selection/layout changes and disposed with their owned material; they do not cast shadows or alter placement rules.

`game/resume.ts` persists a versioned level ID and move pairs under a key derived from the existing progress key. Loading replays legal moves from the canonical level, reconstructs Undo snapshots and rejects invalid or completed logs. Moves, Undo and restart update the log synchronously; wins clear it after recording rewards. Only one unfinished puzzle is retained, and starting another replaces it. Tour/showroom modes bypass persistence.

`game/backup.ts` validates version, scores, known ownership, currency and the move log. `ui/backup.ts` provides a native modal file picker, a human-readable restore summary and an explicit replacement action, with a download of current progress before import. No file content is inserted as HTML. Local progress saves retain the previous valid value under `:recovery`; loading falls back to that slot if primary data is missing or unreadable. Failed writes keep play running and expose a backup warning. Recovery slots and manual files do not provide server durability or cloud accounts.

The Conservatory adds three designs, each with three included styles, priced at 10/14/18 stars. Existing purchases and prices remain unchanged. Legacy catalogue cost stays 112; total catalogue cost becomes 190 against 132 earnable stars (114 from puzzles plus 18 chapter bonuses), while the core eight still cost 26. These optional choices do not change shop completion or puzzle rewards.


Chapter milestones also award 4/6/8 bonus stars at 8/16/24 completed puzzles. Bonuses are derived from completion counts, so existing players receive them retroactively and replaying cannot farm them. Total earning capacity is 132 (114 puzzle stars + 18 chapter stars), against a 190-star catalogue. A player who already owns the entire 112-star legacy collection has 20 stars available and can afford any one new statement piece. Puzzle rules and maximum earnings are unchanged. Hidden-jar three-star targets now allow one exploratory move per initially lidded jar; existing scores are preserved.


The focused editor keeps collection tabs accessible during selection and places Browse/Hide panel in a persistent navigation row. Item names and purchase/inventory actions sit outside the scrolling styles area. Browse clears a temporary preview, preserves paid placements and reopens the panel. Placement markers appear only after an item drag crosses the movement threshold; release, cancellation, scene synchronization and disposal remove them. Venue/story chapters are distinct from tea-shop puzzle milestone groups; UI rewards now say milestone stars.


## Reward and experimentation preview

`ui/reward.ts` renders the next milestone from `journey.nextReward` with an illustration, unlock progress and separate price. Home and puzzle-list cards open the same temporary shop preview. After the last unlock, the card offers an unowned milestone piece, including a returned one.

`inventory.returnValue` and `returnItem` permit owned optional items only. Removing ownership releases its catalogue cost from derived spent stars; no independent refund counter exists. Confirmation uses a native modal dialog. Returns remove only the selected ID, style, placement and stored marker; other copy IDs survive unchanged. Core completion pieces and milestone scores are untouched. New armchair/fountain kinds use the existing grid, preview, material ownership and persistence paths.

Hidden-jar pars include one exploration move per initial lid. The solver verifier checks optimum plus this allowance; `verify-pacing` fingerprints boards/IDs/hidden flags/capacities to protect saved move logs. Scores already stored are never reduced.


Preview storage keys are selected from the Vite base in `game/types.ts`, so local previews share the hosted preview isolation. Runtime preview controls additionally require the preview URL path. `resetPreviewProgress` uses an explicit allowlist for primary, recovery, unfinished puzzle, guide and appearance keys; it never clears origin storage. The preview-only More menu confirms before clearing and navigating to the clean preview URL. Main ignores demo query flags and renders no showroom/reset controls.


## Second-edition prototype — historical 0.2.0-preview.1

The first slice was implemented, validated and hosted. The owner reviewed its direction positively and authorized continuation; the accumulated source was later merged in PR #15. At this original prototype checkpoint, `game/mode.ts` gated it behind the preview build base, a preview URL path and `edition=2`. Ordinary preview and release retained the baseline mode. The prototype selected eight core decoration designs and ten authored levels; the existing 38-board sequence was preserved.

`game/types.ts` selects `tea-shop-preview-edition2-progress-v1` and `LEVEL_COUNT = 10` in this mode. Recovery, unfinished-puzzle, guide and chosen-goal keys derive from that namespace; appearance uses `tea-shop-preview-edition2-appearance-v1`. Reset clears only the active experience and navigates back with `edition=2` retained. Backup import validates the active level count and catalogue, rejecting a 38-board save in the prototype and a 10-board save in the baseline.

`game/edition-levels.ts` defines ten boards, `EDITION_ARCS`, scoring allowances and completion bonuses. `levels.ts` selects the sequence; the shared engine retains full monochrome jars, unlimited Undo and no timer/fail state. Bonuses after puzzles 3/6/10 are 4/5/7 stars. The slice therefore earns 26–46 stars against the 26-star core catalogue. `verify-edition-levels.ts` checks solvability, targets and budget; baseline verification still checks all 38 released boards.

`game/goal.ts` stores an optional decoration ID and style under `STORAGE_KEY + ':goal-v1'`. It validates them against the active catalogue and ignores owned or invalid targets. `journey.ts` and `ui/reward.ts` use that choice for progress and preview navigation. Pinning does not spend/reserve currency or grant ownership. The result action opens the same chosen style. Direct Play starts the next puzzle or resumes the unfinished one; More retains All puzzles.

`Diorama` routes drag and select-then-tap placement through the existing floor/wall validity checks and move callbacks. A transient target preview remains separate from saved placement. Illegal targets, swipes, pinch and cancellation do not commit. The shop screen retains the previous placement for one accepted owned move or rotation. Undo restores that placement, not an inventory/currency snapshot, and temporary unpurchased previews remain separate.

`shop/edition-art.ts` supplies rounded core meshes, material choices, room details and a matching shopkeeper. Its visuals stay under the existing material-ownership and disposal lifecycle. A placed lamp and table within 2.3 room units enable an open-book/tea setting on the table; `itemKey` incorporates that predicate so synchronization updates the reaction. Existing steam handling is reused, with no added reward rule or animation loop.

`render-edition-thumbnails.mjs` renders 24 images from the actual models into `public/edition2/thumbnails`. `shop/icons.ts` uses these static images for the prototype, avoiding a live Babylon scene per UI card. Prototype CSS is scoped under the second-edition body class; its jars stay stationary during transfers, hidden content uses neutral frosted artwork, and persistent level guidance avoids shifting the layout on selection.

Preview.8 was hosted with its package, Start and More version validated at deployment. PR #15 integrated that source into main while retaining the classic default. The current 0.2.0 activation section above supersedes that gate. [RELEASES.md](RELEASES.md) records evidence and delivery; [SECOND_EDITION.md](SECOND_EDITION.md) records acceptance criteria.


## Second-edition continuation — 0.2.0-preview.2 hosted preview

The continuation keeps `isSecondEdition`, all ten board identities, completion bonuses, `LEVEL_COUNT` and `tea-shop-preview-edition2-progress-v1` unchanged. The active catalogue now has fourteen IDs: the eight core pieces plus art/bench at 3 completions, clock/trolley at 6 and basket/planter at 10. Existing prices and free style variants remain; eighteen new rendered thumbnails bring the total to forty-two. `catalogueForMode` clones optional definitions to apply edition gates without mutating classic definitions. Unlock gates apply in the goal/purchase UI and purchase handler.

Goal/replay refinements distinguish unlock progress from saved-star progress. After ten completions, “Improve your scores” chooses an improvable score; “Revisit puzzles” opens the browser once all scores are three stars. Unfinished puzzles take priority, and goals suggest optional returns when earnings are exhausted. Optional returns continue to derive the refund from ownership removal. The 80-star catalogue exceeds maximum earnings of 46; core completion costs 26 and optional choices remain reversible.

In preview.2, `edition-guest.ts` built a stationary seated figure and `Diorama.updateGuest` parented it to the table when counter and table are placed, hides it during Edit or when either requirement is absent, and rebuilds it when its table parent has been disposed. Guest meshes are non-pickable and materials are disposed with the guest. It adds no economy state, new lights, independent timer or path simulation. Build, verification, browser interaction/lifecycle checks and deployment passed. Physical-phone acceptance remains pending; the release record links the deployed app commit and workflow.

Preview.4 replaces this stationary foundation with the bounded route/activity runtime described below. Its entrance/exit anchors, walkable grid, occupancy reservations, Edit invalidation, reduced-motion handling and cleanup are implemented and locally validated; hosting passed and the owner accepted continuation with movement and visitor-cast polish deferred.

The agreed arrival policy is implemented by the preview.4 controller below: actually placed designs drive frequency, core-eight furnishing reaches the busiest rate, and valid paths/activity places constrain the two-guest target. Phone review may tune the initial intervals; guest state remains transient.

Preview.2 keeps showroom/tour chosen goals in session memory, avoiding real-wishlist reads or writes in temporary experiences. Optional returns clear the prior placement Undo state; the edition home uses its primary Continue puzzle action without a duplicate legacy resume card.

## Wall ownership correction — 0.2.0-preview.3

`decorateEditionRoom` now returns an initially disabled `edition-wall-finish` transform containing the twelve wall panels and two dado rails; the foundation remains directly attached to the room. `ShopVisuals.wallFinish` is optional, leaving classic mode unchanged. `applyRoomStyle` sets its enabled state from paint ownership on every sync, outside the wall-material cache-key guard. Existing draft shop clones therefore show the finish for a free paint preview, and restoring actual state removes an unpaid finish. Buying paint persists through the existing ownership/style save path. No new material rebuild loop, save field or price is introduced. Build, focused browser checks and deployment passed; the release record links the app commit and workflow.

## Ambient guest traffic — 0.2.0-preview.4 hosted; continuation accepted

`guest-routes.ts` builds a pure `GuestLayout` and orthogonal cell-centre BFS routes. Placed floor furniture and the counter rear working aisle are blocked; rugs and stored items do not block traffic. It chooses an unblocked cutaway edge entrance with a reachable component, then exposes only reachable shelf browsing, counter-front ordering, table/bench seating and look-around stops. Seat approaches are separately checked with body clearance, side waypoints around table chair backs, reverse departure paths and bench cushion elevation. No valid entrance means no visit. An outward-facing bench at a room edge may have no interior approach and therefore no usable seat.

`guest-traffic.ts` owns the transient deterministic `GuestTraffic` state machine. It accepts an injected random function for tests, returns render snapshots and never writes shop/storage state. It caps visits at two, reserves activities and approach places, avoids the other visitor's cell and permits only one guest to transit at a time. If a narrow route is occupied, a visit may end early so the guest nearer the exit can leave first. Normal visits try up to three available activity kinds before departure; an empty room can support a look-around visit.

`furnishingCount` counts unique placed kinds, including paint and excluding stored items/copies; style changes do not change frequency. The first eligible visit follows four active seconds in a new runtime. `guestArrivalRange` interpolates recurring uniform intervals from 70–100 seconds at zero kinds to 9–14 at eight or more. Dwell ranges are browse 6–10, order 6–9, sit 24–36 and look 5–8 seconds. These values are initial preview tuning, constrained by cap, entrance and destination availability.

Edit hides/clears visits and pauses the clock. Leaving Edit recalculates valid activity and schedules no earlier than two seconds without repeating the introductory arrival. Layout/storage changes invalidate routes and visits; the bench style is included in the geometry signature to refresh seating elevation without altering density or resetting its arrival clock. Other style-only changes retain runtime state. Each tick clamps delta to 0.1 seconds; the existing page-visibility pause prevents background catch-up.

`Diorama.updateTraffic`, `tickTraffic` and `paintTraffic` connect the simulation to a two-visitor pool from `edition-guest.ts`, only in second-edition mode. Each visitor owns 30 meshes, including a soft unlit contact shadow, and its material palette for the scene lifetime. Pose changes reuse the rig. Visitors are non-pickable and are excluded from cached directional/lamp shadow maps; no new lights, timers or animation loops are added. The existing five lights and render loop remain. Disposal clears the simulation and disposes the two visual roots/materials.

Reduced motion retains arrival and dwell timing but chooses one reachable stationary activity per visit, with no translation or limb/bob animation. Changes to the reduced-motion preference clear existing visits before applying the new mode.

Production build and all verification checks pass, including pure routing/runtime tests and bounded adversarial legal-layout collision/deadlock checks. The final browser traffic suite confirmed the two-guest cap, Edit hiding, stationary reduced-motion visits, no guest inclusion in cached shadow-caster lists and stable resources through sixteen cycles: 261 meshes, 88 materials, 7 textures, 36 transforms and 5 lights. The visual lifecycle matrix and paid-wall regression also passed. [RELEASES.md](RELEASES.md) records the fixtures and screenshots. Hosted deployment passed and the owner gave positive continuation feedback, requesting smoother walking and a visitor cast including women and children in a later pass. This is not a measured physical iPhone performance result. The implementation is a bounded ambient visit loop, not a serving simulation or persistent customer economy.

## Second puzzle session — 0.2.0-preview.5 implemented

`EDITION_LEVELS` now has sixteen definitions and five arcs. The first ten definitions remain unchanged; Afternoon ritual covers 11–13 and A room of your own covers 14–16. The latter uses five-slot jars. A four-star milestone at 16 joins the existing bonuses at 3/6/10. Edition `LEVEL_COUNT` derives from this array; classic remains thirty-eight. `catalogueForMode` adds terrarium and botanical at 13/16 completions and 10/14 stars; three later special designs stay unavailable in this mode.

The existing `tea-shop-preview-edition2-progress-v1` and derived goal, guide, recovery and unfinished-puzzle keys remain. Normalization extends ten-entry score/move arrays with zeros. Version-one backup exports add an optional edition discriminator; parsing still accepts untagged historical files but requires the known ten-board predecessor or current sixteen-board shape in the second edition. It rejects arbitrary shorter arrays, mismatched tags, classic imports, invalid balances, later-board unfinished puzzles in legacy files, and ownership before its unlock. New models in `edition-specials.ts` and six thumbnails use the existing material ownership, placement and disposal lifecycle without additional lights or loops.

The missing shopkeeper came from creation being gated by core completion (`finaleSeen` or `playFinale`). The second-edition correction creates him whenever the synchronized shop has a placed counter. The same draft/owned synchronization handles preview/cancel, purchase, storage, restoration and reload; his transform follows the counter's rear aisle and orientation. The classic creation behavior is retained. The full session browser suite confirms appearance on the first purchase before completion and correct transitions afterward.

The five-slot boards exposed 12 pixels of bottom-row clipping at 320×568. Capacity-aware portrait slot sizing keeps both rows above the existing Undo/Restart controls. Phone, landscape and desktop session checks pass. The focused 320×568 overflow assertion also passes after reducing the scoped shelf margin to three pixels: scroll height and client height both measure 376 pixels, with the full shelf visible.

The final production build and all required verification pass, including sixteen and classic thirty-eight solver checks, independent identity comparisons for the existing definitions, the 36–68-star budget, catalogue unlocks and strict backup checks. Browser evidence covers old saves/recovery/preferences/goals, unfinished Undo, backup picker operations, real 13/16 wins and bonus accounting, optional purchases/returns, shopkeeper transitions and reduced motion. All sixteen models fit their footprints and release owned resources after twelve rebuild cycles. Existing onboarding/reset, goal-to-purchase, optional-choice and temporary-goal regressions also pass. Local validation is complete. Hosted deployment passed; owner phone review remains pending. See [RELEASES.md](RELEASES.md) for artifacts and limitations. Guest gait and women/children visitor profiles were subsequently delivered in preview.6 and reviewed positively.

## Guest presentation polish — 0.2.0-preview.6 hosted; continuation accepted

`guest-routes.ts` and `GuestTraffic` remain authoritative for exact positions, visits, activities and timing. `GuestMotion` in `guest-motion.ts` derives stride from travelled distance and exponentially blends facing over the shortest angle, without writing a route or position. `Diorama` copies the simulation's root position exactly and applies only the presentation facing. Repaints do not advance motion; new visits, hidden states, background changes and reduced-motion transitions reset presentation explicitly.

`guest-profiles.ts` defines six appearances: two adult women, two adult men and two children. The session-scoped `GuestRoster` cycles profiles across replaced room scenes without duplicating a currently present profile. Each slot chooses once per visit, including through unchanged style repaints. No save field is added.

`edition-guest.ts` reuses one rig per active slot, changes materials and visible hair/accessories in place, and animates bent knees/elbows with proportioned adult/child limbs. Child seated hips remain at cushion height while feet can dangle. Each rig owns 40 meshes, 11 materials and 17 transforms; profile changes allocate no new rig. The existing render loop drives both slots, with no added lights, timers, shadow-map casters or save fields.

Production build and package verification pass. The six-profile visual verifier covers 48 gait phases and twelve create/dispose cycles, static reduced motion, root/metadata preservation, seat transitions and resource reuse. A separate 1,296-sample NullEngine review confirms floor clearance within floating-point precision; source review found no blocking issue. Final browser checks pass actual-visit roster coverage, exact positions and eased turns, stable repaints/resources, all twelve child seating combinations, Edit/drafts, background/reduced motion, onboarding, shopkeeper transitions and classic/save isolation. Local validation and hosted deployment passed, and the owner responded “Looks good. Proceed.” This records positive review and continuation; physical-device performance is not measured by these checks. [RELEASES.md](RELEASES.md) records screenshots, fixed-step motion evidence and practical limits.

## Collector’s cabinet session — 0.2.0-preview.7 hosted; continuation authorized

`EDITION_LEVELS` now contains twenty definitions, with Treasures to keep spanning 17–20. The first sixteen identities and existing `EDITION_MILESTONE_BONUSES` are preserved. Edition `LEVEL_COUNT` continues to derive from the active array; classic remains thirty-eight. `catalogueForMode` adds cabinet at twenty completions and 18 stars without changing the classic definition. Totals are seventeen designs, a 122-star catalogue, twenty bonus stars and 40–80 earnings.

The edition save namespace and derived keys stay unchanged. Existing normalization extends score/move arrays with zeros while preserving values and state. Backup parsing explicitly recognizes known historical ten- and sixteen-board shapes plus the current twenty-board shape. Edition/count/balance/unlock validation remains strict, and unfinished-level bounds are checked against the source legacy count before normalization can pad it. Compatibility checks exercise both predecessors in real edition mode.

`edition-specials.ts` adds cabinet geometry using the existing owned-material scope. Jade atelier has one broad arch, Blue porcelain twin display bays and Rose salon a lower bowed crown; the variants use 42/58/49 meshes and twelve materials each. Three model-rendered thumbnails join the unchanged forty-eight previous images. All seventeen designs pass footprint and twelve-cycle disposal checks, returning owned resources to zero. Temporary showroom wall slots were moved to clear the cabinet crown; saved player layouts are untouched.

The final production rebuild and package verification pass. Independent review confirms preserved board/bonus identities and no logic or compatibility blocker. Protected visitor/keeper/storage/shared-type files match hosted preview.6; this pass adds no traffic controller, lights or loops. Browser checks pass legacy continuation/imports, actual 19/20 reward accounting, cabinet goal/purchase/return/placement paths, capacity transitions, hidden-content privacy, reduced motion, onboarding and next/resume/reset. Twelve style/storage cycles retain 338 meshes, 103 materials, 7 textures, 50 transforms and 5 lights; a 600-second visit simulation respects the two-guest cap and cabinet bounds, and disposal returns every resource count to zero.

`ui/edition-puzzle.css` reduces five-slot shelf padding from 12 to 9 pixels in portrait viewports at most 690 pixels high. This addresses the two-pixel overflow triggered by puzzle 20’s wrapped title at 320×568, without changing the 23-pixel slot size at that height. The final shelf has equal scroll/client heights of 373 pixels, with the full title, jars and plank visible. Local validation and hosted deployment passed. The owner authorized continuation after preview.7; physical-device performance remains unmeasured. [RELEASES.md](RELEASES.md) records browser evidence and screenshots.

## Reading corner — 0.2.0-preview.8 locally validated

The planned extension appends four definitions to `EDITION_LEVELS`, preserving the first twenty identities, all classic boards and the existing bonus table. Edition `LEVEL_COUNT` remains derived from the sequence. `catalogueForMode` will include armchair at twenty-four completions and 16 stars, with three edition models/thumbnails. Target totals are eighteen designs, 138-star catalogue, twenty bonus stars and 44–92 earnings.

The existing progress namespace and derived keys remain. Normalization must append zero score/move entries without replacing state. Backup validation must recognize historical ten-, sixteen- and twenty-board shapes plus the current twenty-four-board shape, preserving edition/count/balance/unlock checks and source-length unfinished-puzzle bounds.

Guest routing will expose a chair seat only when the placed armchair has a safe reachable approach. Use chair rotation and each style’s seat geometry for access, seating and departure, while keeping the existing pooled rigs and seated pose. Preserve Edit invalidation, blocked/stored handling, reduced motion, background pause and owned-resource disposal. No new persistent customer model or serving simulation is planned. The edition-only chair route approaches its open front and resets safely on style changes. All three cushions use the same seat anchor; local checks pass.
