# Decopu

A cozy sorting puzzle that earns stars for a small isometric tea shop. Fill jars, choose decorations, and arrange a room that feels like yours. There is no timer or fail state, and Undo is unlimited.

**Play:** https://elbafo.github.io/tea-shop/

**Current release candidate: 0.3.0.** Consolidates the reviewed preview work and adds startup timeout/error recovery. Main release verification and deployment are in progress. Read [HANDOFF.md](docs/HANDOFF.md) when continuing in a new chat.

**Released: [Decopu 0.2.1](https://elbafo.github.io/tea-shop/).** [PR #17](https://github.com/ElBafo/tea-shop/pull/17) merged as `2df365fd0921835cd2d647c3277d026b682f821b`; [Pages run 42128359597](https://github.com/ElBafo/tea-shop/actions/runs/42128359597) passed. Drag controls, refined puzzle artwork and the visual first-puzzle guide are live. Existing production progress is preserved; there is no new reset or storage namespace.

**Materials preview: 0.3.0-preview.11.** Subtle furniture wood grain, softer porcelain, clear cup rims, and folded tea packets using puzzle colours. Updated counter/table/shelf thumbnails. Required checks and scene-resource regression pass. Hosted successfully in [Pages run 42493942967](https://github.com/ElBafo/tea-shop/actions/runs/42493942967) from source `26fdf02a2b0408110aade0c963c7df67dfa779ff`, [PR #28](https://github.com/ElBafo/tea-shop/pull/28). Review the regular [preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.11. Main remains 0.2.1.

**Editor accessibility preview: 0.3.0-preview.10.** Focus follows decoration selection, purchase and arrangement; the completion dialog isolates background controls and supports keyboard dismissal. Required checks, compiled editor flows and real touch-drag checks pass. Hosted successfully in [Pages run 42491257279](https://github.com/ElBafo/tea-shop/actions/runs/42491257279) from source `35dc336901bb812834f44f7b7fbf5bf598d5d8b3`, [PR #27](https://github.com/ElBafo/tea-shop/pull/27). Review the regular [preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.10. Main remains 0.2.1.

**Keeper pose correction: 0.3.0-preview.9.** Smaller cup held below and beside the face, joined bent supporting arm, and relaxed free arm. Required checks and browser regressions pass. Hosted successfully in [Pages run 42488875308](https://github.com/ElBafo/tea-shop/actions/runs/42488875308) from source `97b65a5a706eae26b4fd03b484e865ebd119299b`, [PR #26](https://github.com/ElBafo/tea-shop/pull/26). Open the regular [preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.9. Main remains 0.2.1.

**Shopkeeper preview: 0.3.0-preview.8.** Clearer face, softer hair silhouette and a visible cup-serving pose. Required build/verification and browser checks pass, including all counter orientations and repeated scene cleanup. Hosted successfully in [Pages run 42488075365](https://github.com/ElBafo/tea-shop/actions/runs/42488075365) from source `620b6f62370b76779c481584f9dfe85d2bbf40c7`, [PR #26](https://github.com/ElBafo/tea-shop/pull/26). Open the regular [preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.8. Main remains 0.2.1. The next human pacing review is prepared in [PLAYTEST.md](docs/PLAYTEST.md).

**Puzzle artwork preview: 0.3.0-preview.7.** Folded tea sachets, distinct flavour motifs, centered hidden pieces and visible empty-slot marks in ordinary gameplay. Required checks, real drag controls and guided-tour regression checks pass. Hosted successfully in [Pages run 42484580665](https://github.com/ElBafo/tea-shop/actions/runs/42484580665) from source `dded60be1ed830b44fad0c613fa19f50d7f43df9`, [PR #25](https://github.com/ElBafo/tea-shop/pull/25). Open the regular [preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.7. Main remains 0.2.1. [Release notes](docs/RELEASES.md).

**Hosted editor preview: 0.3.0-preview.6.** Catalogue, style selection and purchase/arrangement flow redesign. Required checks pass, including immediate lamp/counter movement and save preservation. [Before/after](docs/RELEASES.md). [Deployment passed](https://github.com/ElBafo/tea-shop/actions/runs/42476629745). Open the [regular preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.6.

**Hosted home preview: 0.3.0-preview.5.** A room-first home with one goal and clear Play/Continue and Decorate actions. Required verification/build and browser checks pass. [Before](docs/screenshots/home-redesign/before.webp) · [After](docs/screenshots/home-redesign/phone-day.webp). [Deployment passed](https://github.com/ElBafo/tea-shop/actions/runs/42293909180). Open the [regular preview](https://elbafo.github.io/tea-shop/preview/) and check v0.3.0-preview.5.

**Shortcut routing preview: 0.3.0-preview.4.** The plain [preview address](https://elbafo.github.io/tea-shop/preview/) now selects the current edition and its existing saved progress. [Deployment passed](https://github.com/ElBafo/tea-shop/actions/runs/42287012894). Close and reopen the preview shortcut to load this build.

**Hosted completion preview: 0.3.0-preview.3.** New earnings visibly advance the chosen decoration’s savings; repeat wins stay quiet, milestones stand out and pours have a soft paper/ceramic cue. Verification, browser checks and [deployment](https://github.com/ElBafo/tea-shop/actions/runs/42285562569) passed. [Open in Safari](https://elbafo.github.io/tea-shop/preview/?edition=2).

**Hosted design preview: 0.3.0-preview.2.** The shared layout, colours, decoration states and first-session flow passed verification and deployment for the [phone preview](https://elbafo.github.io/tea-shop/preview/?edition=2).  A separate [puzzle-rendering comparison](https://elbafo.github.io/tea-shop/preview/?edition=2&puzzle3d=1) has passed local checks: the same three sample boards in Current and 3D views, with no saved-progress changes. The ordinary preview retains the reviewed room, keeper and lighting work in PR #18. Hosting and review evidence is recorded in [RELEASES.md](docs/RELEASES.md). Main stays at 0.2.1 until approval.

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
