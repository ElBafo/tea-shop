# Tea Shop

A cozy little sort puzzle. Line up the tea tins, cups, and treats — there is no clock and no fail state. Stars you earn dress up a tiny 3D tea shop.

**Play it here:** [https://elbafo.github.io/tea-shop/](https://elbafo.github.io/tea-shop/)

Made for a quiet moment on a phone. Add it to your Home Screen from Safari if you like.

## How to play

Tap a jar to lift the matching treats on top. Tap another jar to set them down. A drop only works on an empty jar, or on the same kind, and only when there is room.

A shelf is finished when every jar is either empty or completely full of one kind. Matching treats split between partly filled jars still need to be brought together. Undo as much as you like. Restart whenever you want.

From level 6, some jars wear a little lid. You can see the top treat, but not what waits underneath until you lift it.

From level 16, a few shelves use taller jars that can hold five treats.

## Stars

Each shelf has a par. Finish at or under par for three stars, a little over for two, and any finish for one. Your best stars are saved on this device.

Spend those stars on the home screen to repair and decorate the tea shop: pick a style, then later move plants, rugs, lamps, and tables. When the room is finished, the bakery unlocks.

## Develop

```bash
npm install
npm run verify   # proves all 38 levels are solvable
npm run dev      # http://localhost:5173/tea-shop/
npm run build
```

The GitHub Actions workflow on `main` verifies the levels, builds the site, and deploys it to GitHub Pages.

## Project direction and architecture

- [Roadmap](docs/ROADMAP.md): delivery order, completion criteria, and phone preview reviews.
- [Product direction](docs/PRODUCT.md): the experience, established decisions, and implemented baseline.
- [Architecture](docs/ARCHITECTURE.md): modules, state, persistence, rendering, and deployment.
- [Shop polish plan](docs/POLISH_PLAN.md): the next art and camera milestone and its acceptance criteria.

The shop includes day/night lighting, touch editing, style previews, and image sharing. The Bakery remains a coming-soon destination.

The inventory adds free storage and restoration for owned furniture, plus a paid second plant, lamp, table, print, and basket. Each copy has its own style and position. The complete collection costs 112 of the 114 stars available across 38 puzzles.

The Cozy corners collection adds a bench, tea trolley, and tall planter, each with three distinct styles. Eight more puzzles bring the total to 38 and the reward budget to 114 stars; all purchases together cost 112.

The game also includes bounded pinch/wheel zoom and − / Fit / + controls. Daytime lighting is softer, with subtle teapot steam that respects reduced-motion preferences. Zoom changes your view without changing your saved shop.

The release-polish preview keeps resources stable during repeated editing, reuses unchanged wall textures, and pauses rendering while the page is hidden.

The jar-polish review adds animated transfers, completed-jar checks, and a short star/confetti celebration. Reduced-motion preferences suppress movement; rules and rewards stay unchanged.

Production builds precache the full game for offline reopening after an online visit. Available updates ask for Update or Later outside active puzzles. This preserves local scores and purchases, but does not add cloud backup or save an unfinished puzzle.

The ordinary [phone preview](https://elbafo.github.io/tea-shop/preview/) stays uncached. For installed/offline review, open the separate [offline rehearsal](https://elbafo.github.io/tea-shop/preview/offline/) online and wait for “Ready”, then add it to the Home Screen or reopen in airplane mode. It uses preview progress and never replaces the main installed game's save.

Additional reliability checks:

```bash
node scripts/verify-offline-worker.mjs
# With Chromium remote debugging on port 9225:
npx vite build --base=/tea-shop/preview/ --outDir=work/offline-a
CDP_PORT=9225 node scripts/verify-offline.mjs
# With Vite at 5174, base /tea-shop/preview/:
CDP_PORT=9225 node scripts/verify-game-ui.mjs
CDP_PORT=9225 node scripts/verify-jar-motion.mjs
```
