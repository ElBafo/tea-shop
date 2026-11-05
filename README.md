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

The isolated prototype is hosted at https://elbafo.github.io/tea-shop/preview/?edition=2. Preview.1 introduced a redesigned room, ten authored puzzles, actual-model thumbnails, personal decoration goals, tap-to-place and Undo move. Preview.2 expanded to fourteen designs, preview.3 made decorative wall finishes conditional on the paid wall upgrade, and **preview.4 added ambient guest visits**. Preview.6 delivered the requested smoother walking and visitors including women and children. The owner reviewed it positively and requested continuation.

**0.2.0-preview.5 added:** six more puzzles and two special decorations, Glass garden and Botanical triptych, with three styles each. The sixteen-design catalogue costs 104 stars; sixteen puzzles and milestones earn 36–68. The 26-star core remains achievable at minimum scores, with enough left for Glass garden. Existing progress carries forward, including old ten-board backups. The final build, required verification, session/flow/choices browser suites and small-phone overflow check and hosted deployment pass; owner phone review remains pending. That deployment is preserved in the release record; the URL now serves preview.6.

This pass also shows the shopkeeper as soon as the counter is placed, including temporary previews, and fits five-slot puzzles on small portrait phones. Preview/cancel, purchase before completion, storage, restoration, rotation and reload passed browser checks. The owner subsequently said “Continue”; this is continuation authorization, not a merge or an inferred acceptance of every fix.

**0.2.0-preview.6 remains the hosted build:** bending knees/elbows, distance-driven steps and smoother visual turns, plus six visitor profiles including adult women, adult men and children. Profiles stay stable per visit and cycle across room lifetimes in the session. Two reusable rigs retain the existing routes, arrival rates and visitor limit, with correct child seating and static reduced motion. Build, package verification, independent source/geometry review and final browser checks passed, including onboarding and the immediate first-counter shopkeeper. [Release notes](docs/RELEASES.md) include phone screenshots and a fixed-step walking clip. The link serves preview.6 at app commit `6492179aa34b447d66f32d2b3ecac75c7567d4e8`, confirmed by [GitHub Pages run 41933373195](https://github.com/ElBafo/tea-shop/actions/runs/41933373195). The owner said “Looks good. Proceed”; main has not been merged.

**0.2.0-preview.7 is locally validated; hosting is pending:** four new puzzles, 17–20, and Collector’s cabinet, an optional 18-star purchase unlocked after 20 completions. Three distinct cabinet styles bring the catalogue to seventeen designs and fifty-one model thumbnails. Bonuses stay at 20, so earnings are 40–80 against a 26-star core and 122-star catalogue; there is no extra bonus at 20. Existing progress and both ten-/sixteen-board edition backups carry forward. The final production rebuild, package checks, model checks and browser flows pass, including cabinet purchases, legacy backups, guest safety and the small-phone finale. [Release notes](docs/RELEASES.md) include screenshots and evidence. Hosting and owner phone review are pending; the preview link still serves .6.

The edition has separate save/appearance keys; main and ordinary-preview progress remain isolated. More → Reset preview progress restarts only the current preview mode. The version appears at Start and in More. Main remains the approved baseline until separate merge approval.

Guest traffic stays capped at two, with arrivals based on actually displayed decorations. All visitors hide/reset during Edit, and reduced motion uses stationary activities. Optional decorations remain paid purchases with confirmed full-price returns and included styles.

See [release notes](docs/RELEASES.md), [second-edition scope](docs/SECOND_EDITION.md), [roadmap](docs/ROADMAP.md), and [first-slice puzzle pacing](docs/EDITION2_PACING.md).
