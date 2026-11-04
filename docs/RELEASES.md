# Decopu releases

Versions identify reviewable builds. Each entry links to its [roadmap](ROADMAP.md) scope and records whether it is in progress, hosted for review, approved or released. A preview suffix is not a release approval.

## Version policy

- Show the same version in the app and in the package/release record.
- Number preview builds as `0.2.0-preview.1`, `0.2.0-preview.2`, and so on. Increment the preview number for a newly published review build so phone reports can identify it.
- Publish `0.2.0` only after its release is approved; use later patch versions for released fixes and minor versions for the next planned feature release.
- Record release scope, save compatibility, validation, PR/commit and deployment status. Do not infer deployed status from a successful local build.
- Historical work before this record is grouped under the existing `0.1.0` package baseline. Its version was not consistently displayed in the app; the entries below do not invent earlier visible version labels or release dates.

## 0.2.0-preview.3 — hosted for review

Focused fix in [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, following the owner's report that the walls already looked decorated before any purchase.

The empty second-edition room now keeps its twelve white panels and two decorative dado rails hidden. These belong to the existing three-star wall upgrade, alongside its colour and curtains. A deliberate free style preview shows the finish temporarily; cancelling restores the actual owned room, while purchase makes it persistent. Basic walls, window, floor, structural edge trim and the diorama foundation remain visible.

Implementation: `decorateEditionRoom` creates an initially disabled `edition-wall-finish` group and keeps the foundation separate. `applyRoomStyle` updates the group from the supplied shop's paint ownership on every synchronization, so temporary preview state and saved ownership use the same path.

Prices, catalogue, ten puzzle boards, save namespace and classic/released behavior are unchanged. Existing owners retain their purchased wall finish; no migration or progress reset is required. App/package/release target: `0.2.0-preview.3`.

Validation passed: full production build and all verification scripts; focused browser checks for fresh and counter-only walls, all three free styles, Browse/Done/other-item cancellation, exact three-star purchase, reload persistence and preservation of owned finishes. Phone/desktop day/night views and classic isolation passed with no browser exceptions. Thirty-six room-style preview cycles retain identical mesh/material/texture/transform counts and dispose cleanly. [Before/after screenshots](screenshots/second-edition-v3) document the upgrade. Physical-phone acceptance remains for owner review. Hosted deployment passed at app commit `619d829bc1986d4fc2b8a508c61708ec23fcdb20`: [GitHub Pages run 41918859412](https://github.com/ElBafo/tea-shop/actions/runs/41918859412). Follow-up documentation commits record this status without changing the deployed app. Owner review: pending. The review URL remains https://elbafo.github.io/tea-shop/preview/?edition=2 and now serves preview.3. Main is unchanged. Planned ambient guest traffic moves to `0.2.0-preview.4`; hiding during Edit, layout reactions and decoration-based arrival frequency remain agreed roadmap requirements.

## 0.2.0-preview.2 — superseded by preview.3

Continuation of [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, following the owner's feedback on preview.1: “Looks good. Continue pls.” This approves continuing the direction; it does not authorize merging to main.

Implemented local scope:

- Six existing optional designs use the second-edition art language, with three styles each and eighteen additional model-rendered thumbnails: fourteen designs and forty-two thumbnails total.
- Art (8 stars) and bench (6) unlock after 3 completed puzzles; clock (10) and trolley (8) after 6; basket (12) and planter (10) after 10. Every item remains a paid purchase after unlocking.
- Chosen goals show their puzzle unlock requirement even when affordable, and suggest optional returns when no more stars can be earned. After all ten puzzles, “Improve your scores” targets score improvement; at all three-star scores, “Revisit puzzles” opens the browser. An unfinished puzzle still takes priority.
- A stationary seated guest appears when table and counter are placed, follows the table transform, and is hidden during Edit or if either piece is stored. It adds no lights or independent timer. Walking traffic and full visits remain future work.

Economy and compatibility: the ten boards, completion bonuses and edition save namespace stay unchanged. Minimum/maximum earnings remain 26/46. The eight core pieces cost 26; six optional pieces add 54 for an 80-star catalogue. A player with all core pieces and maximum scores has 20 stars left to choose optional pieces. Confirmed full-value optional returns allow experimentation and recover stars for unfinished core purchases; no purchase becomes a requirement and core completion items remain non-returnable.

Validation: full local build and all `npm run verify` checks passed, including the fourteen-piece catalogue, milestone gates, star budget, optional returns and preview.1 core-save compatibility. Browser checks passed: all six unlock boundaries, funded locked goals, real-touch first win to chosen optional style, exact purchase/return/cancel/repurchase, Undo cleanup, preview.1 backup compatibility, completion navigation, and temporary showroom/tour goal isolation. The regular first-win/onboarding/reset flow and classic editor regression checks also pass. Guest checks cover all table styles, rotation, storage, Edit hiding, day/night, reduced motion and classic isolation; eighteen rebuild cycles retain identical resource counts. Art checks cover all eighteen new variant footprints and twelve rebuilds of all fourteen designs, releasing mesh/material/texture/transform resources to zero. [Review screenshots](screenshots/second-edition-v2) include day/night, desktop, the guest and Edit hiding. Physical-phone performance and enjoyment remain for review; a 320×568 selected-item view has a small room area, with actions still visible. Hosted deployment: successful at app commit `a1a2bbc80c77716512347c1b0de5c34aa06d8018`, confirmed by [GitHub Pages run 41895797422](https://github.com/ElBafo/tea-shop/actions/runs/41895797422). Follow-up documentation commits only record review status; they do not change the deployed app. Owner phone review: pending. Package and app version: `0.2.0-preview.2`, displayed at Start and in More. The hosted URL remains https://elbafo.github.io/tea-shop/preview/?edition=2; it now serves this version. Main remains the approved `0.1.0` baseline.

Demo/tour decoration goals are session-only and cannot read or overwrite the real wishlist. Returning a moved optional piece clears its Undo state; the edition home uses one Continue puzzle action.

Walking guest visits are a separate agreed future phase after this preview: arrive, browse, order, sit and leave in response to actually placed shelves, counters, tables, reading corners, available seats and reachable paths. The owner explicitly requires all guests hidden in Edit and valid activities/positions recomputed afterward; stored or blocked furniture leads to alternatives. Future arrival frequency also grows with actually placed decorations: occasional visits in a sparse shop, usually one or two guests in a well-furnished shop, with an initial cap of two and the core eight sufficient for that target. Stored pieces and matching styles do not influence it; valid paths/seats take precedence. Exact timing remains for phone tuning. See [ROADMAP.md](ROADMAP.md); no such traffic is claimed here.

## 0.2.0-preview.1 — hosted; direction reviewed positively

Recorded: 4 November 2026. Roadmap: **Current priority — 0.2.0-preview.1** in [ROADMAP.md](ROADMAP.md). Detailed scope: [SECOND_EDITION.md](SECOND_EDITION.md).

Implemented first slice:

- One redesigned miniature tea shop with eight rounded core decoration designs, coordinated materials, room panelling and a refined shopkeeper. Twenty-four style thumbnails are rendered from the actual models.
- A tactile puzzle presentation with stationary jars, neutral frosted hidden pieces and coordinated transfer/settling/win feedback. Level guidance remains in place to prevent selection from shifting the board.
- Direct Play opens the next or unfinished puzzle; More retains All puzzles. The compact contextual editor restores collection browsing position.
- Select-then-tap floor/wall placement alongside dragging, with transient destination feedback and one-step Undo for an accepted owned move or rotation.
- A pinned decoration and style persist through reward and purchase-preview navigation. Stars remain universal; changing a goal costs nothing.
- Initial room life: a book/tea setting appears when a placed table is within 2.3 room units of a placed lamp. Existing steam is reused. Mixed styles are allowed and the reaction grants no bonus or score.
- Ten authored puzzles in three short arcs, with hidden contents in two puzzles. Full-jar completion, unlimited Undo and the absence of timer/fail state remain.
- Visible version on Start and in More, matching `package.json` and `APP_VERSION`. This review branch's ordinary-preview mode shows the same build version.

Economy: puzzle completions award 10–30 stars; derived bonuses after puzzles 3/6/10 add 4/5/7. Total earnings are 26–46 against a 26-star required eight-piece shop. Replaying improves best scores without farming rewards. Baseline economy is unchanged.

Hosted review URL: https://elbafo.github.io/tea-shop/preview/?edition=2.

Save compatibility: prototype progress uses `tea-shop-preview-edition2-progress-v1`, with separate recovery, unfinished puzzle, guide and goal keys; appearance uses its own edition key. Reset keeps the edition URL and leaves main/ordinary-preview keys intact. Backup validation rejects 10/38-board cross-edition imports. Baseline board identities and saves remain unchanged; no migration or replacement of the released game is approved.

Local validation passed:

- Production build; complete baseline verification, including all 38 solver checks; all ten prototype solver/target/budget checks.
- Classic editor and puzzle UI checks; repeated editing resources return to baseline.
- Prototype real-touch first win → pinned goal/style → purchase, rotate/Undo, direct next/resume, level browsing and edition-only onboarding reset. Main and ordinary-preview sentinel saves survive; all rendered thumbnails load.
- Phone/desktop floor and wall tap placement, transient preview, legal/blocked targets, other-piece selection, drag continuation, pinch/swipe cancellation and baseline isolation.
- Puzzle checks at 320px/390px portrait, landscape and 1280px desktop: stationary jars, frosted concealment, centring, transfer/Undo, win feedback and reduced motion.
- Twelve rebuilds per core item and shopkeeper release owned mesh/material/texture resources back to zero.

Limits: physical Safari interaction/performance, subjective art quality and enjoyable pacing still need phone/player review. The first slice does not include a full production art pipeline, wider-catalogue conversion, visitor simulation, new venues or evidence of retention. Those remain later roadmap work.

Review: [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`. Implementation commit: `67df6df35e870dfe78a12459cdbfffe36e1b1d48`; follow-up documentation commits are visible in the PR. Hosted deployment: successful at commit `73b342e18e3b633c9bf4837e650537141a1e5b0f`, confirmed by [GitHub Pages run 41836991363](https://github.com/ElBafo/tea-shop/actions/runs/41836991363). Later commits that only update these review records do not change the deployed app. Owner feedback: “Looks good. Continue pls.” The owner accepted the direction and authorized further preview work; no merge approval was given. Main remains `e7a475779e41d3a39fff9435e6ebdb119dec682d`; this version has not been merged to main.

## 0.1.0 — documented released baseline

Baseline documented: 4 November 2026. This is the existing package version, not a newly assigned historical release date. Release URL: https://elbafo.github.io/tea-shop/.

Current recorded main commit: `e7a475779e41d3a39fff9435e6ebdb119dec682d`, following the owner's approval of [PR #12](https://github.com/ElBafo/tea-shop/pull/12), [PR #14](https://github.com/ElBafo/tea-shop/pull/14), and [PR #13](https://github.com/ElBafo/tea-shop/pull/13). These PRs are merged; their own records contain deployment and validation evidence.

Included behavior:

- 38 sorting puzzles with full-jar completion, unlimited Undo, hidden-jar exploration allowance, animated transfers and a short win celebration.
- Nineteen decoration designs and five paid second copies, free included style changes, storage/restoration, and confirmed full-value returns of optional items. Core completion pieces cannot be returned.
- Isometric decorating, floor/wall dragging, rotation, zoom, day/night lighting, image showcase and local progress.
- Visual milestone reward goals, unlocks at 8/16/24/32/38 puzzles, and paid purchases. Catalogue cost 190 stars; core cost 26; maximum earnings 132 including milestone bonuses.
- Start/onboarding, manual backup/restore, previous-save recovery and unfinished-puzzle resume.
- Preview-only finished-shop demo and reset controls; the player's own Showcase remains a normal feature.
- Quiet Browse navigation, right-aligned Hide panel, centred hidden pieces and a thin concealment divider between pieces.

The Bakery remains a future destination. There is no account service, automatic cloud synchronization, monetisation or implemented outdoor yard. See the historical sections of [ROADMAP.md](ROADMAP.md) for prior decisions and backlog.
