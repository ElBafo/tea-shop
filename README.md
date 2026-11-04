# Decopu

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

Spend those stars on the home screen to repair and decorate the tea shop: pick a style, then later move plants, rugs, lamps, and tables. Finishing the core room celebrates your tea shop and offers a showcase. The Bakery is a clearly labelled future room.

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

The inventory adds free storage and restoration for owned furniture, plus a paid second plant, lamp, table, print, and basket. Each copy has its own style and position. The original collection still costs 112 stars. Puzzles award 114 stars, with 18 more from chapter milestones. The optional Conservatory collection adds 42 stars of choices; collecting everything is deliberately beyond the current budget.

The earlier Cozy corners collection added a bench, tea trolley, and tall planter, each with three distinct styles. Its eight puzzles brought the total to 38 and the original catalogue to 112 stars.

The game also includes bounded pinch/wheel zoom and − / Fit / + controls. Daytime lighting is softer, with subtle teapot steam that respects reduced-motion preferences. Zoom changes your view without changing your saved shop.

The release-polish preview keeps resources stable during repeated editing, reuses unchanged wall textures, and pauses rendering while the page is hidden.

The jar-polish review adds animated transfers, completed-jar checks, and a short star/confetti celebration. Reduced-motion preferences suppress movement; rules and rewards stay unchanged.

Production builds precache the full game for offline reopening after an online visit. Available updates ask for Update or Later outside active puzzles. This preserves local scores and purchases, with manual backup files and unfinished-puzzle resuming. There is no account or automatic cloud sync.

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

The Decopu start screen prepares the shop before enabling **Start**. New players can follow a skippable first-puzzle and decorating guide; existing saves bypass the introduction. Review the full first-time flow at [Tour preview](https://elbafo.github.io/tea-shop/preview/?tour=1), which uses temporary progress and never overwrites your preview shop.


The depth preview groups 38 puzzles into five chapters. Completing 8, 16 and 24 puzzles unlocks the Glass garden (10 stars), Botanical triptych (14) and Collector’s cabinet (18). Each has three included styles. Preview before buying; all eight core shop pieces still total 26 stars. New optional pieces are not required for completion.

Use **More → Progress & backups** to download a versioned JSON file to Files/iCloud Drive, or choose a backup to restore. Import shows a summary and requires confirmation before replacing progress; it offers a download of the current save first. Keep backups outside browser storage. A previous-save recovery slot helps with a damaged primary save, but clearing browser data removes both slots. Resume unfinished puzzles from the shop or puzzle list, including their undo history.

```bash
node --import tsx scripts/verify-backup.ts
CDP_PORT=9225 node scripts/verify-depth.mjs
```


Chapter milestones also award 4/6/8 bonus stars at 8/16/24 completed puzzles. Bonuses are derived from completion counts, so existing players receive them retroactively and replaying cannot farm them. Total earning capacity is 132 (114 puzzle stars + 18 chapter stars), against a 190-star catalogue. A player who already owns the entire 112-star legacy collection has 20 stars available and can afford any one new statement piece. Puzzle rules and maximum earnings are unchanged. Hidden-jar three-star targets now allow one exploratory move per initially lidded jar; existing scores are preserved.


The reward preview adds Reading chair (32 puzzles,16 stars) and Tea garden fountain (38 puzzles,20 stars), both indoor decorations. Select an owned optional piece and use **Return for … stars** to exchange it at full value after confirmation. Core completion pieces stay owned. Goal cards show the next reward and open its free preview. Hidden-jar puzzles now include a small exploration allowance in their three-star targets; saved boards and scores remain compatible. See [pacing audit](docs/PUZZLE_PACING.md).


## Second-edition prototype and versions

The isolated **0.2.0-preview.1** prototype was hosted at https://elbafo.github.io/tea-shop/preview/?edition=2 and reviewed positively. It introduced a redesigned eight-piece room, ten authored puzzles, model thumbnails, personal decoration goals, tap-to-place and Undo move. **0.2.0-preview.2 expanded the prototype** on the same PR: six optional designs, eighteen more model thumbnails, clearer locked goals, useful replay recommendations and a stationary seated guest foundation. **0.2.0-preview.3 is hosted with the wall-ownership fix:** white panels and dado rails belong to the three-star wall upgrade, appear during free style preview, and disappear if an unpaid preview is cancelled. The owner accepted continuing after the fix. **0.2.0-preview.4 is implemented and locally validated** with up to two ambient guests who arrive, browse/order/sit or look around, then leave. Their arrival rate grows with unique decorations on display. Production build, all verification checks and final browser regressions pass; deployment and owner phone review are pending. The same URL still serves preview.3 until the new deployment is verified. The edition has its own save/appearance keys; the ordinary preview and released game retain their progress and content. More → Reset preview progress restarts only the current preview mode. The version appears at Start and in More.

See [release notes](docs/RELEASES.md), [second-edition scope](docs/SECOND_EDITION.md), and [ten-puzzle pacing](docs/EDITION2_PACING.md). Main remains the approved baseline until a separate merge approval.


Preview.2 keeps the same ten-board save and 26–46-star earnings. Its fourteen-design catalogue costs 80 stars: 26 core plus 54 optional. Optional full-price returns let players change their choices. The requested walking guest visits—arrive, browse, order, sit, leave—are locally implemented for preview.4; the hosted preview.3 still has the seated foundation until the new deployment is verified. The runtime caps visitors at two and scales recurring intervals from 70–100 seconds with no displayed designs to 9–14 with the core eight or more, after a first eligible visit at four active seconds. All guests hide/reset during Edit. Reduced motion uses stationary reachable activities. Initial timing remains for phone review. The user's “Looks good. Continue pls” authorized continuation, not a merge to main.
