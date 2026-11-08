# Decopu

A cozy 3D sorting puzzle that earns stars for a small isometric tea shop. Fill jars, choose decorations, and arrange a room that feels like yours. There is no timer or fail state, and Undo is unlimited.

**Play:** https://elbafo.github.io/tea-shop/

**Released: Decopu 0.3.1.** Normal 3D puzzles are live on main and preview, preserving existing progress and controls with native rendering recovery if WebGL fails. Merged through [PR #30](https://github.com/ElBafo/tea-shop/pull/30) as `2b7312dcc0a1ddd36787d8ee0d26da6cef32c92c` and deployed successfully in [Pages run 42497266122](https://github.com/ElBafo/tea-shop/actions/runs/42497266122). Main and preview serve 0.3.1. Hosted phone-size smoke checks confirm the displayed version, normal first-session 3D puzzles, transfer and Undo on both links, with zero runtime exceptions and unchanged main progress while playing preview in the isolated test browser. No user saves were reset, copied or migrated. Physical-iPhone startup/performance and uncoached human-session validation remain pending. See [release details](docs/RELEASES.md) and [handoff](docs/HANDOFF.md).

Earlier releases and reviewed preview milestones are recorded in [RELEASES.md](docs/RELEASES.md).

## Normal 3D puzzles — 0.3.1

Main and preview use 3D jars and tea pieces in ordinary second-edition puzzles, with the existing drag/tap controls, progression, rewards and saved Undo history. A rendering failure restores the native presentation without resetting progress. Main and preview saves stay separate. Physical-iPhone startup/performance validation remains pending.

## Progress since the 0.2.0 fresh start

The owner requested a new-installation experience. The first visit to the main game shows Start and the normal first-time guide, using fresh production progress. Existing classic and preview saves remain untouched. New progress earned after that first visit saves normally on the device.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`; the preview keeps separate keys. No account, migration chooser or automatic cloud sync is added. The finished-shop demo, temporary tour and reset controls remain development-only.

## Play and decorate

Drag the top matching treats to a compatible jar with enough space, or tap the source and then the destination. Finish when every non-empty jar is full of one kind. Hidden jars reveal their contents as you pour; taller jars hold five treats. Source jars stay still during the pour animation.

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

GitHub Actions verifies and builds main and the preview before deploying both to Pages. The hosted preview is https://elbafo.github.io/tea-shop/preview/ and keeps its own progress. The plain preview URL opens the current edition; `?edition=1` explicitly opens preserved classic tooling. The explicit production `?edition=1` route is retained for classic regression checks; no edition-switching UI is part of this release.

- [Roadmap](docs/ROADMAP.md): current work, accepted decisions and backlog.
- [Product direction](docs/PRODUCT.md): player experience and established rules.
- [Architecture](docs/ARCHITECTURE.md): modules, persistence, rendering and deployment.
- [Release record](docs/RELEASES.md): versions, validation and hosted status.
- [Second-edition scope](docs/SECOND_EDITION.md): acceptance criteria and preview history.
- [Puzzle pacing](docs/EDITION2_PACING.md): the twenty-four authored boards.
