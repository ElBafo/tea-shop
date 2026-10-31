# Architecture

## Runtime

Tea Shop is a static, client-side TypeScript application built with Vite. Babylon.js renders the shop. The puzzle screens and shop controls use HTML templates, CSS, and DOM event listeners rather than a UI framework. There is no backend or account service.

`index.html` loads `src/main.ts`, which mounts the app and registers the service worker. `src/ui/app.ts` owns the screen state (`shop`, `levels`, `play`), current progress, active puzzle, and undo history. Screen navigation is internal state rather than URL routing.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/game/types.ts` | Shared board, level, progress, upgrade, and placement contracts |
| `src/game/engine.ts` | Move validation and application, completion, board cloning, scoring, solver move helpers |
| `src/game/levels.ts` | Twenty authored level definitions and par values |
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

Puzzle interaction validates a pour, snapshots the board for undo, applies the move, then renders feedback. On a win, scoring updates the level's best stars and best move count and saves progress. The next level opens after completing its predecessor.

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
- `public/manifest.webmanifest` and `public/sw.js`: install metadata and cache-backed offline support. The worker precaches the shell and caches successful GET responses as they are fetched.

The solver is development tooling, not a live hint system. Its search has a node limit and prunes selected redundant moves; it is not a general-purpose unlimited solver.

## Current considerations

The shop is eagerly imported with the app, so Babylon contributes substantially to the initial bundle. The inspected production build emitted a main chunk of about 375 KB gzipped and a size warning. Consider loading boundaries if startup performance becomes an issue.

There is level verification but no browser interaction or visual regression suite. Camera framing, dragging, touch behavior, and art changes require browser checks. The Bakery is an unlockable placeholder, not an implemented second game.

## Shop appearance

`src/game/appearance.ts` stores the day/night preference independently from progress. Shop controls apply it to both CSS and Babylon lighting. Preview and release use separate keys; showroom switches do not write the preference. Unavailable browser storage falls back to a day theme while still allowing session changes.
