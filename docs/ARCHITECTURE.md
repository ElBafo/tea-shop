# Architecture

## Runtime

Decopu is a static, client-side TypeScript application built with Vite. Babylon.js renders the shop. The puzzle screens and shop controls use HTML templates, CSS, and DOM event listeners rather than a UI framework. There is no backend or account service.

`index.html` loads `src/main.ts`, which mounts the app and registers the service worker. `src/ui/app.ts` owns the screen state (`shop`, `levels`, `play`), current progress, active puzzle, and undo history. Screen navigation is internal state rather than URL routing.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/game/types.ts` | Shared board, level, progress, upgrade, and placement contracts |
| `src/game/engine.ts` | Move validation and application, completion, board cloning, scoring, solver move helpers |
| `src/game/levels.ts` | 38 static level definitions and par values; additions live in `inventory-levels.ts` and `collection-levels.ts` |
| `src/game/solver.ts` | Bounded breadth-first search used by development scripts |
| `src/game/storage.ts` | Load, validate, and save progress; best scores, unlocks, and available stars |
| `src/game/audio.ts` | Web Audio sound effects, unlocked by a user gesture |
| `src/ui/app.ts`, `src/ui/items.ts` | Screen orchestration, puzzle interaction, and item markup |
| `src/shop/screen.ts` | Upgrade controls, purchase and style actions, editing controls, completion UI |
| `src/shop/upgrades.ts` | Upgrade catalog, prices, variants, defaults, and completion rules |
| `src/shop/grid.ts` | Placement rules, snapping, collisions, rotation, and saved-layout sanitization |
| `src/shop/diorama.ts` | Babylon engine and scene, camera, lights, pointer interaction, animation, and disposal |
| `src/shop/meshes.ts`, `textures.ts`, `palette.ts` | Procedural room and furniture visuals, textures, and colors |
| `src/style.css` | Responsive layout, puzzle artwork, controls, and CSS animation |

## Data flow

Puzzle interaction validates a pour, snapshots the board for undo, applies the move, then renders feedback. Completion requires every non-empty jar to be full and monochrome, using the board capacity (four or five). The same predicate drives individual jar completion effects and solver pruning. On a win, scoring updates the level's best stars and best move count and saves progress. The next level opens after completing its predecessor.

The app passes a host interface to the shop screen. Purchases, styles, and accepted moves update `ShopState`, persist it through the storage layer, and synchronize the diorama. The diorama reports selection and placement through callbacks rather than writing storage itself. Unowned style previews use a temporary shop clone; only the explicit Buy action persists ownership and spends stars. Cancelling or leaving Edit restores the saved scene. Visual keys allow unchanged shop items to be retained during synchronization.

The room uses a 6×6 floor grid. The movable counter reserves its footprint and a rear working aisle; movable shelves share wall slots with the other wall decorations. Footprints account for rotation. Furniture cannot collide with other furniture, while rugs may sit below furniture. Placement validation is independent of Babylon rendering.

## Persistence and lifecycle

`localStorage` key `tea-shop-progress-v1` stores best stars and moves, mute preference, owned upgrades, styles, placements, and completion celebration state. Available stars equal total best stars plus derived milestone bonuses minus the cost of owned upgrades. Loading validates data and sanitizes the layout. Unfinished puzzles persist separately as replayable move logs. Device transfer uses manual backup files; there is no automatic cross-device synchronization.

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


## Second-edition prototype — 0.2.0-preview.1

The first slice was implemented, validated and hosted. The owner reviewed its direction positively and authorized continuation; it remains unmerged. `game/mode.ts` gates it behind the preview build base, a preview URL path and `edition=2`. Ordinary preview and release retain the baseline mode. The prototype selects eight core decoration designs and ten authored levels; the existing 38-board sequence is preserved.

`game/types.ts` selects `tea-shop-preview-edition2-progress-v1` and `LEVEL_COUNT = 10` in this mode. Recovery, unfinished-puzzle, guide and chosen-goal keys derive from that namespace; appearance uses `tea-shop-preview-edition2-appearance-v1`. Reset clears only the active experience and navigates back with `edition=2` retained. Backup import validates the active level count and catalogue, rejecting a 38-board save in the prototype and a 10-board save in the baseline.

`game/edition-levels.ts` defines ten boards, `EDITION_ARCS`, scoring allowances and completion bonuses. `levels.ts` selects the sequence; the shared engine retains full monochrome jars, unlimited Undo and no timer/fail state. Bonuses after puzzles 3/6/10 are 4/5/7 stars. The slice therefore earns 26–46 stars against the 26-star core catalogue. `verify-edition-levels.ts` checks solvability, targets and budget; baseline verification still checks all 38 released boards.

`game/goal.ts` stores an optional decoration ID and style under `STORAGE_KEY + ':goal-v1'`. It validates them against the active catalogue and ignores owned or invalid targets. `journey.ts` and `ui/reward.ts` use that choice for progress and preview navigation. Pinning does not spend/reserve currency or grant ownership. The result action opens the same chosen style. Direct Play starts the next puzzle or resumes the unfinished one; More retains All puzzles.

`Diorama` routes drag and select-then-tap placement through the existing floor/wall validity checks and move callbacks. A transient target preview remains separate from saved placement. Illegal targets, swipes, pinch and cancellation do not commit. The shop screen retains the previous placement for one accepted owned move or rotation. Undo restores that placement, not an inventory/currency snapshot, and temporary unpurchased previews remain separate.

`shop/edition-art.ts` supplies rounded core meshes, material choices, room details and a matching shopkeeper. Its visuals stay under the existing material-ownership and disposal lifecycle. A placed lamp and table within 2.3 room units enable an open-book/tea setting on the table; `itemKey` incorporates that predicate so synchronization updates the reaction. Existing steam handling is reused, with no added reward rule or animation loop.

`render-edition-thumbnails.mjs` renders 24 images from the actual models into `public/edition2/thumbnails`. `shop/icons.ts` uses these static images for the prototype, avoiding a live Babylon scene per UI card. Prototype CSS is scoped under the second-edition body class; its jars stay stationary during transfers, hidden content uses neutral frosted artwork, and persistent level guidance avoids shifting the layout on selection.

`game/version.ts` exposes `APP_VERSION = 0.2.0-preview.2` for the local continuation; package, Start and More identify this review build, including its ordinary-preview mode. The published first slice was `0.2.0-preview.1`. Main remains the documented `0.1.0` baseline until explicitly approved for replacement. [RELEASES.md](RELEASES.md) records scope, validation, hosted preview.1 evidence and continuation status; [SECOND_EDITION.md](SECOND_EDITION.md) records acceptance and limitations.


## Second-edition continuation — 0.2.0-preview.2 locally implemented

The continuation keeps `isSecondEdition`, all ten board identities, completion bonuses, `LEVEL_COUNT` and `tea-shop-preview-edition2-progress-v1` unchanged. The active catalogue now has fourteen IDs: the eight core pieces plus art/bench at 3 completions, clock/trolley at 6 and basket/planter at 10. Existing prices and free style variants remain; eighteen new rendered thumbnails bring the total to forty-two. `catalogueForMode` clones optional definitions to apply edition gates without mutating classic definitions. Unlock gates apply in the goal/purchase UI and purchase handler.

Goal/replay refinements distinguish unlock progress from saved-star progress. After ten completions, “Improve your scores” chooses an improvable score; “Revisit puzzles” opens the browser once all scores are three stars. Unfinished puzzles take priority, and goals suggest optional returns when earnings are exhausted. Optional returns continue to derive the refund from ownership removal. The 80-star catalogue exceeds maximum earnings of 46; core completion costs 26 and optional choices remain reversible.

`edition-guest.ts` builds a stationary seated figure. `Diorama.updateGuest` parents it to the table when counter and table are placed, hides it during Edit or when either requirement is absent, and rebuilds it when its table parent has been disposed. Guest meshes are non-pickable and materials are disposed with the guest. It adds no economy state, new lights, independent timer or path simulation. Full build and verification passed; browser lifecycle checks and deployment remain pending.

Walking visitor traffic is a separately approved future architecture task. It needs defined entrance/exit anchors, a walkable navigation representation tied to actual placements, occupancy/interaction slots, and invalidation on moves/storage. Arrive/browse/order/sit/leave state must be bounded and transient initially, with all guests hidden during Edit and valid positions/activities recomputed afterward, reduced-motion handling, background suspension and explicit cleanup. The seated guest does not establish that a navigation or complete visitor system exists.

The future arrival controller must derive furnishing level from actually placed decorations, including fixed paint and excluding stored pieces, without style matching. Sparse layouts get infrequent configurable arrivals; well-furnished layouts target one or two concurrent guests with an initial cap of two. Core-eight furnishing must be sufficient for that target. Navigation and available activity/seat capacity constrain occupancy; blocked layouts do not force spawns. Exact intervals and thresholds require phone tuning. The controller must suspend and hide guests during Edit, recompute valid activity on exit, and initially persist no guest/economy state.

Preview.2 keeps showroom/tour chosen goals in session memory, avoiding real-wishlist reads or writes in temporary experiences. Optional returns clear the prior placement Undo state; the edition home uses its primary Continue puzzle action without a duplicate legacy resume card.
