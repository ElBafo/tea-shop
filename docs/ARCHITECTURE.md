# Architecture

## Runtime

Tea Shop is a static, client-side TypeScript application built with Vite. Babylon.js renders the shop. The puzzle screens and shop controls use HTML templates, CSS, and DOM event listeners rather than a UI framework. There is no backend or account service.

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

`localStorage` key `tea-shop-progress-v1` stores best stars and moves, mute preference, owned upgrades, styles, placements, and completion celebration state. Available stars equal total best stars minus the cost of owned upgrades. Loading validates data and sanitizes the layout. Active puzzle state is not persisted, and there is no cross-device synchronization.

Leaving the shop disposes its Babylon scene and engine, stops the render loop, and removes resize observers/listeners. Preserve this lifecycle when changing navigation or adding effects.

## Build, verification, and hosting

- `npm run dev`: Vite development server under `/tea-shop/`.
- `npm run verify`: checks level structure, solvability, solver-derived par, and scoring thresholds.
- `npm run build`: TypeScript checking followed by a production build into `dist/`.
- `.github/workflows/deploy.yml`: GitHub Actions verifies and builds before deploying `main` to GitHub Pages.
- `public/manifest.webmanifest` and `public/sw.js`: install metadata and cache-backed offline support. `scripts/build-offline.mjs` generates a content-versioned complete asset list. The worker precaches the full build atomically, serves a coherent shell offline, and retains one previous app cache for older tabs. `src/game/offline.ts` offers explicit waiting updates outside an active puzzle. Normal preview registration stays disabled; `/preview/offline/` is an optional isolated rehearsal scope. Local storage is never cleared by worker activation.

The solver is development tooling, not a live hint system. Its search has a node limit and prunes selected redundant moves; it is not a general-purpose unlimited solver.

## Current considerations

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
