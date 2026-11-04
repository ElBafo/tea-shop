# Decopu releases

Versions identify reviewable builds. Each entry links to its [roadmap](ROADMAP.md) scope and records whether it is in progress, hosted for review, approved or released. A preview suffix is not a release approval.

## Version policy

- Show the same version in the app and in the package/release record.
- Number preview builds as `0.2.0-preview.1`, `0.2.0-preview.2`, and so on. Increment the preview number for a newly published review build so phone reports can identify it.
- Publish `0.2.0` only after its release is approved; use later patch versions for released fixes and minor versions for the next planned feature release.
- Record release scope, save compatibility, validation, PR/commit and deployment status. Do not infer deployed status from a successful local build.
- Historical work before this record is grouped under the existing `0.1.0` package baseline. Its version was not consistently displayed in the app; the entries below do not invent earlier visible version labels or release dates.

## 0.2.0-preview.1 — locally validated, hosting/review pending

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

Review URL when published: https://elbafo.github.io/tea-shop/preview/?edition=2.

Save compatibility: prototype progress uses `tea-shop-preview-edition2-progress-v1`, with separate recovery, unfinished puzzle, guide and goal keys; appearance uses its own edition key. Reset keeps the edition URL and leaves main/ordinary-preview keys intact. Backup validation rejects 10/38-board cross-edition imports. Baseline board identities and saves remain unchanged; no migration or replacement of the released game is approved.

Local validation passed:

- Production build; complete baseline verification, including all 38 solver checks; all ten prototype solver/target/budget checks.
- Classic editor and puzzle UI checks; repeated editing resources return to baseline.
- Prototype real-touch first win → pinned goal/style → purchase, rotate/Undo, direct next/resume, level browsing and edition-only onboarding reset. Main and ordinary-preview sentinel saves survive; all rendered thumbnails load.
- Phone/desktop floor and wall tap placement, transient preview, legal/blocked targets, other-piece selection, drag continuation, pinch/swipe cancellation and baseline isolation.
- Puzzle checks at 320px/390px portrait, landscape and 1280px desktop: stationary jars, frosted concealment, centring, transfer/Undo, win feedback and reduced motion.
- Twelve rebuilds per core item and shopkeeper release owned mesh/material/texture resources back to zero.

Limits: physical Safari interaction/performance, subjective art quality and enjoyable pacing still need phone/player review. The first slice does not include a full production art pipeline, wider-catalogue conversion, visitor simulation, new venues or evidence of retention. Those remain later roadmap work.

Review: [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`. Implementation commit: `67df6df35e870dfe78a12459cdbfffe36e1b1d48`; follow-up documentation commits are visible in the PR. Hosted deployment: pending. Owner review: pending. Main remains `e7a475779e41d3a39fff9435e6ebdb119dec682d`; this version has not been merged to main.

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
