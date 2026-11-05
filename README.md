# Decopu

A cozy sorting puzzle that earns stars for a small isometric tea shop. Fill jars, choose decorations, and arrange a room that feels like yours. There is no timer or fail state, and Undo is unlimited.

**Play:** https://elbafo.github.io/tea-shop/

**Released: [Decopu 0.2.0](https://elbafo.github.io/tea-shop/).** [PR #16](https://github.com/ElBafo/tea-shop/pull/16) merged as `966c613fa486c9ce34dd1cf5f8bb9ac4a5905d3c`; [Pages run 42081278504](https://github.com/ElBafo/tea-shop/actions/runs/42081278504) passed. Main opens the second edition with fresh production progress and normal onboarding. Progress earned afterward saves normally; physical iPhone family testing remains pending.

## Fresh start for family testing

The owner requested a new-installation experience. The first visit to the main game shows Start and the normal first-time guide, using fresh production progress. Existing classic and preview saves remain untouched. New progress earned after that first visit saves normally on the device.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`; the preview keeps separate keys. No account, migration chooser or automatic cloud sync is added. The finished-shop demo, temporary tour and reset controls remain development-only.

## Play and decorate

Tap a jar to select its top matching treats, then tap a compatible jar with enough space. Finish when every non-empty jar is full of one kind. Hidden jars reveal their contents as you pour; taller jars hold five treats. Source jars stay still during the pour animation.

The second edition has 24 authored puzzles and 18 paid decoration designs, each with three included styles. Earn up to three stars per puzzle; improving a best score earns the difference, while repeated wins cannot farm stars. Milestone bonuses bring total earnings to 44–92. The core room costs 26 stars; the 138-star catalogue gives players choices beyond what they can own at once.

Preview a style before buying. Pin a decoration as your goal, then drag it or select it and tap an open destination in Edit. Rotate, Undo move, store furniture and freely change included styles. Optional pieces can be returned for their full star price after confirmation. Day/night, zoom and image sharing help showcase the room. Up to two guests visit reachable furniture and hide during Edit.

The Bakery is a future room. Tea garden fountain, further puzzle arcs, larger rooms, cloud accounts and monetisation remain later work.

## Saves and updates

Progress is stored locally on each device. **More → Progress & backups** exports a versioned file or restores one after validation and confirmation. An unfinished puzzle retains its move history for Undo. Production precaches the game after an online visit and offers Update or Later when a new build is ready, outside active puzzle play.

For iPhone testing, open the main link in Safari or its existing Home Screen shortcut after the release update is available. A first launch of the new production edition receives the fresh guide; subsequent launches resume that new progress.

## Development

```bash
npm install
npm run verify   # verifies the 24 edition and 38 preserved classic boards, plus regression checks
npm run dev      # http://localhost:5173/tea-shop/
npm run build
```

GitHub Actions verifies and builds main and the preview before deploying both to Pages. The hosted second-edition preview remains https://elbafo.github.io/tea-shop/preview/?edition=2 and keeps its own progress. Ordinary preview uses the preserved classic mode. The explicit production `?edition=1` route is retained for classic regression checks; no edition-switching UI is part of this release.

- [Roadmap](docs/ROADMAP.md): current work, accepted decisions and backlog.
- [Product direction](docs/PRODUCT.md): player experience and established rules.
- [Architecture](docs/ARCHITECTURE.md): modules, persistence, rendering and deployment.
- [Release record](docs/RELEASES.md): versions, validation and hosted status.
- [Second-edition scope](docs/SECOND_EDITION.md): acceptance criteria and preview history.
- [Puzzle pacing](docs/EDITION2_PACING.md): the twenty-four authored boards.
