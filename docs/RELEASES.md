# Decopu releases

## 0.3.0-preview.5 — room-first home redesign

Local implementation: a branded compact header, room title and puzzle-progress entry, unboxed room, one decoration goal, and side-by-side Play/Continue and Decorate. Keeps the same saved progress, editor actions and reward rules. Responsive day/night home composition; editing and Showcase retain their own layouts. Required verification/build and nine browser-check groups pass with zero runtime exceptions. Phone, small-phone, landscape, desktop, day/night, guide and simulated safe areas are checked; Play/resume, goal preview/cancel, first purchase, keyboard focus, Showcase and save isolation pass. [Before](screenshots/home-redesign/before.webp) · [After](screenshots/home-redesign/phone-day.webp) · [Night](screenshots/home-redesign/phone-night.webp) · [Furnished](screenshots/home-redesign/furnished.webp). Physical-phone review remains pending. Hosted successfully in [Pages run 42293909180](https://github.com/ElBafo/tea-shop/actions/runs/42293909180) from source `0f4210871d8e759883f176349415c30b9576b2ef`, [PR #23](https://github.com/ElBafo/tea-shop/pull/23). Open the plain [preview](https://elbafo.github.io/tea-shop/preview/) for phone review. Main remains 0.2.1.

## 0.3.0-preview.4 — preview shortcut routing

Plain `/tea-shop/preview/` now opens the current edition, matching its installed manifest start URL. Existing `?edition=2` links and preview progress remain valid; `?edition=1` explicitly opens classic tooling. Main and all progress namespaces are unchanged. Required verification/build and the compiled mobile-browser shortcut test pass, including existing progress, puzzle resume/Undo, edition aliases, production isolation and no normal-preview worker. Hosted successfully in [Pages run 42287012894](https://github.com/ElBafo/tea-shop/actions/runs/42287012894) from source `cd5da8196694d0a3c57d3d6ad45290aa673863fc`, [PR #22](https://github.com/ElBafo/tea-shop/pull/22). All preceding room, UI and reward work is available through the stable plain preview URL. Main remains 0.2.1; existing physical-phone shortcuts should be closed and reopened for review.

## 0.3.0-preview.3 — completion and reward polish

Local implementation: an earned-star receipt toward the selected decoration, distinct milestones, quieter no-new-reward replays, stationary jar completion highlight, shorter win pause and paper/ceramic pour audio. Rules, rewards and saves are unchanged. Required verification and final build pass, along with nine focused reward-flow groups and sixteen drag regressions. Muted audio creates no nodes; two cues reuse one noise buffer and disconnect all fourteen created nodes. Milestone bonus text explicitly says it is included in the total. Screenshots: `screenshots/reward-polish/`. [PR #21](https://github.com/ElBafo/tea-shop/pull/21), source `ba5a8ddcb817a3241e448f219c5e446ff6baeda6`, was hosted successfully in [Pages run 42285562569](https://github.com/ElBafo/tea-shop/actions/runs/42285562569). Physical-phone review remains pending; main stays 0.2.1.

## 0.3.0-preview.2 — whole-game visual pass

Implemented in [PR #20](https://github.com/ElBafo/tea-shop/pull/20), source `f99f028ec05f721005a99612656bea077aea2c61`. Required verification/build, 11 first-session/guide groups, 15 comparison groups and current catalogue regressions passed. Phone/desktop screenshots are in `screenshots/ui-pass/`. Initial deployment 42281976875 succeeded. Final home sizing correction `1808e649f6fc323b7a2a985677c6a784980277f3` passed a rebuild and explicit Play visibility checks on both phone sizes and themes, and was hosted successfully in [Pages run 42282511705](https://github.com/ElBafo/tea-shop/actions/runs/42282511705). Main remains 0.2.1. Shared visual language, responsive board composition, capacity labels, decoration state clarity, compact editor and home hierarchy. Preserves 3D comparison, gameplay and saves. Family usability review pending.

**Released: [Decopu 0.2.1](https://elbafo.github.io/tea-shop/).** [PR #17](https://github.com/ElBafo/tea-shop/pull/17) merged as `2df365fd0921835cd2d647c3277d026b682f821b`; [Pages run 42128359597](https://github.com/ElBafo/tea-shop/actions/runs/42128359597) passed. Drag controls, refined puzzle artwork and the visual first-puzzle guide are live. Existing production progress is preserved; there is no new reset or storage namespace.

Versions identify reviewable builds. Each entry links to its [roadmap](ROADMAP.md) scope and records whether it is in progress, hosted for review, approved or released. A preview suffix is not a release approval.

## Version policy

- Show the same version in the app and in the package/release record.
- Number review builds with the intended release and an incrementing preview suffix, such as `0.2.1-preview.1`. Increment the preview number for a newly published application build so phone reports can identify it.
- Remove the preview suffix only after the release is approved. Use patch releases for focused refinements and minor releases for a broader planned feature milestone.
- Record release scope, save compatibility, validation, PR/commit and deployment status. Do not infer deployed status from a successful local build.
- Historical work before this record is grouped under the existing `0.1.0` package baseline. Its version was not consistently displayed in the app; the entries below do not invent earlier visible version labels or release dates.

## 0.3.0-preview.1 — Babylon puzzle comparison; hosted for review

Owner-authorized preview-only comparison of existing HTML/CSS jars and Babylon.js 3D vases/tea sachets on unchanged standard, five-slot and hidden boards. Switching presentation preserves the sample board, moves and Undo history. Samples use the existing sorting and star-calculation rules, but keep all state in memory and grant no persistent rewards. Normal preview and production progress are untouched.

The explicit `?edition=2&puzzle3d=1` route requires both a preview build and path. Main remains 0.2.1 and ignores the experiment flag. HTML input/accessibility, tap and drag, reduced motion, interruption recovery, tutorial cues, disposal and fallback are acceptance requirements. Local package verification and final production build passed (`work/puzzle-comparison-verify.log`, `work/puzzle-comparison-build.log`). The isolated browser suite passed 15 groups with zero exceptions or console errors: both renderers win the same sample, native touch/tap/keyboard, Undo/Restart, state-preserving view changes, whole-group capacity, interrupted drag recovery, hidden contents, four viewport sizes, eight engine-disposal cycles, reduced motion and real WebGL context-loss fallback. All saved-key sentinels remained unchanged; ordinary and classic preview routes remain separate. A production-build smoke test also confirms the experiment flag is ignored and existing progress, preferences, unfinished puzzles and Undo survive (`work/comparison-production.json`). Root reviewed matched Current/3D phone captures, tall small-phone, hidden/drag and landscape views. Physical-iPhone sustained performance and preference remain unmeasured. Hosted successfully in [Pages run 42277378659](https://github.com/ElBafo/tea-shop/actions/runs/42277378659) for source `aff07a7a2bbe688726e9fe44b50cfdbbf80c716e`, [PR #19](https://github.com/ElBafo/tea-shop/pull/19) stacked on PR #18. CI logs confirm preview 0.3.0-preview.1 and unchanged main 0.2.1. An additional built-preview smoke test confirms the ordinary `?edition=2` route opens the shop, retains its existing saved progress and resumes puzzles with Undo (`work/comparison-ordinary-preview.json`). The focused hidden-mesh test also passed (`work/puzzle-comparison-hidden-focus-check.json`). [Open the comparison](https://elbafo.github.io/tea-shop/preview/?edition=2&puzzle3d=1); the [normal preview](https://elbafo.github.io/tea-shop/preview/?edition=2) remains available. Owner phone comparison and any production-renderer adoption remain pending. Physical iPhone comparison is required before any production renderer decision.

[Current phone](screenshots/puzzle-comparison/phone-current.webp) · [3D phone](screenshots/puzzle-comparison/phone-3d.webp) · [Small tall board](screenshots/puzzle-comparison/small-tall.webp) · [Hidden pieces](screenshots/puzzle-comparison/hidden.webp) · [Dragging](screenshots/puzzle-comparison/dragging.webp) · [Landscape](screenshots/puzzle-comparison/landscape.webp) · [Desktop](screenshots/puzzle-comparison/desktop.webp)

## 0.2.2-preview.2 — final keeper and lighting polish; hosted for review

Owner-approved continuation of PR #18. The keeper gently turns/nods, breathes and blinks while keeping its placement and serving direction fixed. Edit and reduced motion restore a neutral pose. The existing lighting rig gains softer warm day fill, restrained sunlight, readable cool night fill and a day/night window light. Paid lamps remain warm accents. No added lights, timers, storage or currency changes. Main remains 0.2.1. Production build and package verification passed (`work/final-room-build.log`, `work/final-room-verify.log`). The browser suite passed with zero exceptions, including idle movement without placement drift, neutral Edit/reduced-motion poses, unchanged light count, full starter/counter transitions and save preservation. Day, night, purchase, small phone and desktop screenshots were reviewed. Physical iPhone performance remains unmeasured. Hosted successfully in [Pages run 42254037195](https://github.com/ElBafo/tea-shop/actions/runs/42254037195) for source `306cbf53449fcd0473cb5ba68e8441585e4c6edd` in [PR #18](https://github.com/ElBafo/tea-shop/pull/18). CI logs confirm preview 0.2.2-preview.2 and unchanged main 0.2.1. Furnished day/night views also passed visual review. Owner phone review and merge approval remain pending.

## 0.2.2-preview.1 — welcoming starting room; hosted for review

An owner-approved first-impression pass adds a temporary serving workbench, tea props and shopkeeper before the first counter purchase, with an unmistakable window and lighter bare plaster. The bench grants no inventory item or stars. It hides in Edit and where existing furniture blocks its footprint/aisle; counter previews show the regular keeper, cancellation restores the opening, and owned/stored counters prevent the starter fixture returning. Main remains 0.2.1 pending review.

Window sky, greenery, glass and framing are separated to avoid coplanar surfaces. Day and night have distinct outdoor colours. No added lights, timers, storage keys, prices or board changes. Existing scene disposal owns the new nodes/materials.

Final production build and package verification pass (`work/starter-build.log`, `work/starter-verify.log`). The browser suite passes with zero exceptions: opening bench/keeper, day/night, Edit hiding, counter preview/cancellation/purchase, reload persistence, retained starter after paint, stored-counter suppression, occupied-footprint suppression and reduced-motion steam. Screenshots checked at 390×844, 320×568, 844×390 and 1280×900. These Chromium checks do not establish physical iPhone performance. Hosted preview passed in [Pages run 42229786301](https://github.com/ElBafo/tea-shop/actions/runs/42229786301) for source `2eb912a0d7b74dd3500c2a74723e911bc05a5440`, [PR #18](https://github.com/ElBafo/tea-shop/pull/18). Build logs confirm main 0.2.1 and preview 0.2.2-preview.1. [Open the preview](https://elbafo.github.io/tea-shop/preview/?edition=2) or [temporary fresh start](https://elbafo.github.io/tea-shop/preview/?edition=2&tour=1); Start → Explore on my own shows the opening without changing saved preview progress. Owner phone review and merge approval remain pending.

[Day](screenshots/starter-room/day.webp) · [Night](screenshots/starter-room/night.webp) · [Counter purchase](screenshots/starter-room/bought.webp) · [Small phone](screenshots/starter-room/small.webp) · [Desktop](screenshots/starter-room/desktop.webp)

## 0.2.1 — released

The owner explicitly requested “Merge to main” for [PR #17](https://github.com/ElBafo/tea-shop/pull/17). Promote the reviewed `0.2.1-preview.1` application to `0.2.1`: drag tea pieces between jars alongside tap/keyboard controls, refined rounded pieces and glass, and an animated hand with nearby bubbles in the first guided puzzle. The promotion changes version/release metadata only.

Existing production progress, decorations, preferences and unfinished puzzles carry forward in the same namespaces. No reset, migration, board, price or economy change is introduced. Main continues to exclude development-only reset, showroom and temporary-tour controls; stable preview remains separate.

Reviewed-preview validation passed: all package checks and the production build, sixteen drag regression groups and ten visual-guide groups with zero exceptions, fresh onboarding/session flow and layouts at 320×568, 390×844, 844×390 and 1280×900. The prior preview entry retains detailed evidence and screenshots. Release-version verification passed using the documented no-IPC tsx loader fallback (`work/release-0.2.1-verify.log`), and the 0.2.1 production build passed (`work/release-0.2.1-build.log`). The production-browser smoke test at 390×844 passed with zero exceptions (`work/release-0.2.1-smoke.json`): existing synthetic scores, purchases/layout/styles, goal and preferences survive; an unfinished puzzle resumes across reload and restored Undo persists; main ignores showroom/tour query flags and exposes no preview/reset controls. GitHub CI verified and built the release and retained stable preview; both build and deploy jobs passed in [run 42128359597](https://github.com/ElBafo/tea-shop/actions/runs/42128359597). Build logs confirm merge `2df365fd0921835cd2d647c3277d026b682f821b`, release `0.2.1` and stable preview `0.2.1-preview.1`. Physical-device performance is not established by Chromium checks.

## 0.2.1-preview.1 — reviewed; approved for 0.2.1

The owner approved this pass after family testing showed repeated attempts to drag tea bags between jars. Direct press–drag–release now sits alongside existing tapping and keyboard controls. It moves the available matching top group, keeps jars stationary, shows legal destinations and settles a valid drop. Invalid or interrupted drags return without a move; concealed pieces remain neutral. The whole-group capacity rule, unlimited Undo, scoring and existing reward path remain.

Further first-puzzle feedback showed that highlighted jars were not understood as destinations and small guidance text was missed. This preview adds a visual hand and short bubble beside the jars, demonstrating a legal drag and pointing at the destination after a source tap. It hides during real dragging, remains non-interactive, offers static reduced-motion guidance and preserves Skip. The complete guided drag and tap tours and their layout/accessibility checks pass.

The puzzle art direction uses rounded, more tangible tea pieces, clearer glass edges, coherent highlights/contact shadows and restrained lift/landing feedback. Screwdom is a reference for the desired tactile quality; Decopu keeps its own cozy palette and HTML/CSS puzzle presentation. Reduced motion, four-/five-slot layouts and phone readability remain acceptance requirements. Dragging applies to both runtimes on this branch; the artwork is scoped to the second edition. Puzzles remain light when entered from a night shop, with a full-game dark theme still in the backlog.

This is an interaction and presentation pass. The twenty-four edition puzzles, thirty-eight classic boards, eighteen paid designs, economy and all save namespaces remain unchanged. Existing progress, goals, preferences and unfinished-puzzle Undo history must continue. The owner subsequently gave the explicit merge instruction; see the 0.2.1 release record above.

Implementation and local visual review are complete. Package verification passed (`work/tactile-verify.log`), including twenty-four edition and thirty-eight classic solvers and existing persistence/economy regressions. The final production build passed (`work/tactile-build.log`), and the fresh onboarding/session flow passed (`work/tactile-flow.log`). The independent guide layout/reduced-motion/accessibility-scroll/Skip/navigation suite passed at 320×568, 390×844, 844×390 and 1280×900 (`work/visual-guide-layout-check.json`). Root reviewed phone artwork, actual dragging, tall/small puzzles and the guide, including landscape and desktop fit.

The final drag suite passes all sixteen groups with zero runtime exceptions (`work/puzzle-drag-check.json`, `work/puzzle-drag-run.log`), including touch/tap/keyboard/mouse, whole-group capacity, hidden privacy, Undo/reload, interruption recovery, exactly-once wins, reduced motion and all four viewport sizes. The guided-tour suite passes all ten groups with zero exceptions (`work/visual-guide-check.json`, `work/visual-guide-run.log`), including complete drag and tap tours, immediate tap selection after dragging, Skip, static reduced-motion guidance and scroll/navigation cleanup. Raw DevTools touch injection produced a synthetic-fling artifact on an independent static control page; tests use validated native touch gestures and stationary releases, with no added delay before the following tap.

Application source: `ec38845ab8b604f72f9e85661425cc1d032711a5` on `preview/tactile-puzzles`, [PR #17](https://github.com/ElBafo/tea-shop/pull/17). [Pages run 42122917736](https://github.com/ElBafo/tea-shop/actions/runs/42122917736) passed for validated preview head `f06a2a0562ece292ed7f4cfef200ab269e0a8d11`. The [phone preview](https://elbafo.github.io/tea-shop/preview/?edition=2) and [temporary tour](https://elbafo.github.io/tea-shop/preview/?edition=2&tour=1) are hosted. These Chromium checks do not establish physical iPhone performance or enjoyment; the owner subsequently approved the merge to 0.2.1. See [ROADMAP.md](ROADMAP.md) for the full acceptance scope.

[Phone puzzle](screenshots/tactile-puzzles/phone.webp) · [Dragging](screenshots/tactile-puzzles/dragging.webp) · [Small phone](screenshots/tactile-puzzles/small.webp) · [Tall jars](screenshots/tactile-puzzles/tall.webp) · [Desktop](screenshots/tactile-puzzles/desktop.webp) · [First-puzzle demonstration](screenshots/tactile-puzzles/guide.webp) · [Tap destination cue](screenshots/tactile-puzzles/guide-tap.webp)

## 0.2.0 — released

The owner clarified: “I don’t care about keeping the progress. My wife should check it out like a new installation.” This supersedes the proposed migration, import and edition-choice work for this release.

The main link opens the second edition directly, with a fresh production namespace and the normal Start and first-time guide. It does not copy classic or preview scores, purchases, unfinished puzzles, goals or preferences. Existing keys remain untouched and unused by the default game. This is a one-time fresh start for the new production edition; progress earned afterward saves normally across reloads and later visits.

Production uses `tea-shop-edition2-progress-v1` and `tea-shop-edition2-appearance-v1`. Recovery, unfinished-puzzle, guide and goal keys derive from the new progress key. The preview keeps `tea-shop-preview-edition2-progress-v1` and its existing appearance key; the classic keys also stay unchanged.

The release uses the reviewed twenty-four puzzles and eighteen paid decoration designs, with fifty-four included styles/model thumbnails. Earnings remain 44–92 stars, the eight-piece core costs 26, and the full catalogue costs 138. Reading chair still unlocks at twenty-four completions for 16 stars. No puzzles, prices, bonuses, guest rules or purchase mechanics are added in this activation pass.

Main keeps development-only showroom, temporary tour and reset controls unavailable. The classic `?edition=1` regression route remains separate and has no new switch UI.

The final production build (`work/activation-build.log`) and all package checks (`work/activation-verify.log`) pass, including all twenty-four second-edition and thirty-eight classic solvers, production routing/storage isolation, backup compatibility and guest seating. Independent source review found no blocker. The release browser suite passes (`work/release-activation.log`, `work/release-activation-check.json`): an existing installed production service worker updates to the new build and opens fresh welcome guidance despite populated synthetic classic and preview saves; real first-win → style preview → counter purchase → arranging/rotation/Undo succeeds; new production progress, preferences and unfinished-puzzle resume persist after reload. The new catalogue has eighteen designs and the browser exposes twenty-four puzzles. Main ignores showroom/tour flags and has no reset/demo controls. Same-origin preview and classic data remain unchanged. Layout checks pass at 390×844, 320×568, 844×390 and 1280×900, and the updated controlled app reopens offline. Root visual review found no blocking issue in the phone welcome and first-decoration captures. These Chromium checks do not establish physical iPhone performance or enjoyment; family testing follows deployment.

PR #16 is merged and production deployment passed. Physical-phone family testing remains pending. [Start](screenshots/release-0.2.0/start.webp) · [Welcome](screenshots/release-0.2.0/welcome.webp) · [First decoration](screenshots/release-0.2.0/first-decoration.webp) · [Small phone](screenshots/release-0.2.0/small-phone.webp).

### Source integration checkpoint

PR #15 was merged on 2026-11-05 as `f9a69b704e35ec5aca55bb2de14bc4681293c0e8`; [Pages run 42067411686](https://github.com/ElBafo/tea-shop/actions/runs/42067411686) passed. That merge preserved the preview gate and therefore left the classic game on the main link. The owner then authorized activation and clarified the fresh-start requirement. The 0.2.0 work above changes that default behavior.

## 0.2.0-preview.8 — hosted; source merged in PR #15

Preview.8 continued [PR #15](https://github.com/ElBafo/tea-shop/pull/15) after the owner said “Continue” following hosted preview.7. It was hosted for review and subsequently merged as source integration; the production gate remained until the 0.2.0 activation task.

Implemented scope:

- Four authored puzzles, 21–24, in the A quiet chapter arc, preserving the first twenty and all thirty-eight classic identities, targets and existing bonuses.
- Reading chair unlocks for purchase after 24 completions at 16 stars, with three included edition styles and actual-model thumbnails. Target totals: eighteen designs, fifty-four thumbnails, 138-star catalogue and 26-star core.
- Bonuses stay at twenty, with no added reward at twenty-four. Twenty-four puzzles earn 44–92 total. Minimum finishes leave eighteen after the core, enough for Reading chair or Collector’s cabinet as alternatives; optional full-value returns remain.
- Existing visitors can use a reachable placed chair through the current seating pose and pooled rigs. Verify style/rotation-specific seat geometry, safe approach/departure paths, blocked/stored cases, Edit hiding, reduced motion and disposal, without a new serving system or guest economy.
- Preserve the edition namespace, scores, purchases, layout, goals, preferences, guide, recovery and unfinished play. Keep known ten-, sixteen- and twenty-board edition backups compatible with the new twenty-four-board shape and strict validation.

Implementation, screenshots and local validation are complete; hosting passed; owner review is pending. The app/package target is `0.2.0-preview.8`; https://elbafo.github.io/tea-shop/preview/?edition=2 serves preview.8. [ROADMAP.md](ROADMAP.md) records acceptance criteria.

Local validation is complete: all package checks and the final production build pass, including 24 edition and 38 classic solvers. Browser legacy, purchase, visuals, seating, lifecycle and onboarding/goal/reset flow checks pass. Known 10/16/20-board backups carry forward; real 23/24 wins add score stars only. All 18 models fit their footprints and release resources after twelve rebuild cycles. All six guest profiles fit all three chair styles; 72 rendered style/profile/rotation combinations pass. Phone 390×844, small phone 320×568, landscape 844×390 and desktop 1280×900 were checked in Chromium. Physical iPhone review remains pending. Evidence: `work/reading-final-verify.log`, `work/reading-final-build.log`, `work/edition-reading-*-check.json`, `work/edition8-art-check.json`.

The new edition chair defaults to (1,3), facing the open aisle, so it is usable beside the core furniture immediately. Existing saved layouts and classic defaults stay unchanged. Seating now aligns facing on the first seated frame, preventing feet sweeping through the chair during a half-turn; walking turns retain easing.

[Chair styles](screenshots/second-edition-v8/styles.webp) · [Adult and child seating](screenshots/second-edition-v8/seats.webp) · [Day](screenshots/second-edition-v8/room-day.webp) · [Night](screenshots/second-edition-v8/room-night.webp) · [Small phone](screenshots/second-edition-v8/puzzle-small.webp)

## 0.2.0-preview.7 — hosted; continuation authorized

Continue [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, after the owner reviewed preview.6 positively and said “Looks good. Proceed.” This is the next bounded preview, with main unchanged.

Implemented scope:

- Four authored puzzles, 17–20, in the Treasures to keep arc, keeping the first sixteen board definitions, IDs, targets and bonuses intact. Full jars, unlimited Undo, no timer and no fail state remain.
- Collector’s cabinet unlocks for purchase after 20 completions at 18 stars. Three included edition styles and actual-model thumbnails bring the catalogue to seventeen designs and fifty-one thumbnails, costing 122 stars. Core completion still costs 26.
- Existing milestone bonuses remain 20 stars in total, with no new bonus at 20. Twenty puzzles earn 40–80 total. Minimum finishes leave 14 stars after the core; the cabinet needs four additional score stars or a different optional collection choice. Optional returns retain full value.
- The edition namespace and existing scores, purchases, placement, styles, goals, guide, preferences, recovery and unfinished play are preserved. Both known ten- and sixteen-board edition backups load alongside current twenty-board files, with strict edition/count/unlock/balance checks.
- Preview.6 guests, the first-counter shopkeeper and classic/main isolation are retained. A small short-portrait shelf-padding fix keeps the full two-line finale title, 23-pixel treats, jars and plank visible without a stray scrollbar. No new traffic, currency, account or venue system is part of this pass.

The final production rebuild after the small-phone padding fix and all package verification pass (`work/cabinet-build.log`, `work/cabinet-verify.log`). Real-mode ten/sixteen→twenty save/backup/recovery/resume compatibility and catalogue checks pass. Independent review found no logic or compatibility blocker: the first-sixteen fingerprint and bonuses are preserved, and protected guest, keeper, storage and shared-type source files match hosted preview.6.

| Puzzle | Capacity | Solver moves | Three-star target |
| --- | --- | --- | --- |
| 17 · The Quiet Cup | 4 | 4 | 4 |
| 18 · Pairs and Space | 5 | 8 | 8 |
| 19 · A Wrapped Keepsake | 4 | 11 | 12 |
| 20 · A Place for Keepsakes | 5 | 13 | 15 |

The new arrangements are unique under flavour renaming and jar permutations. Puzzle 19 has one hidden jar and its exploration allowance; puzzle 20 has two moves of finale breathing room. [EDITION2_PACING.md](EDITION2_PACING.md) records the authored rhythm. These solver checks establish legal solutions and the scoring contract, not enjoyable pacing.

All seventeen designs pass footprint checks and twelve rebuild cycles with owned resources returning to zero. The cabinet styles use 42/58/49 meshes respectively and twelve owned materials each: one broad jade arch, twin blue porcelain bays and a lower bowed rose salon. Three actual-model thumbnails extend the unchanged forty-eight existing images to fifty-one. Phone day/night/showroom views and the style sheet were inspected without a blocking art issue. Only the temporary showroom’s wall slots were rearranged to clear the cabinet crown; player layouts are unchanged.

Final browser validation passed:

- Legacy UI continuation preserves the sixteen-board balance when extending to twenty, with resumed Undo and recovery intact. Actual ten-/sixteen-board backup picker cancellation and restoration pass, as does cross-edition rejection.
- Real touch wins at 19 and 20 take earnings from 74 to 80 through six puzzle-score stars only: cabinet availability unlocks at twenty with no added bonus. All three free style previews, cancellation, exact 18-star purchase/refund, touch movement, rotation Undo, storage/restoration, free style changes, reload, return cancellation/confirmation and repurchase pass. Replays do not farm stars, and funded-but-locked and unlocked-but-insufficient states remain distinct.
- Every new board fits 390×844, 320×568, 844×390 and 1280×900. Hidden puzzle 19 retains centered, private concealed pieces and clear divider placement. Real Next navigation across capacities 4/5/4/5 and reduced motion pass. Puzzle 20 initially had scroll height 375 versus client height 373 at 320×568; the scoped padding correction makes both 373 without shortening the title or shrinking the 23-pixel treats. All jars and the plank remain visible.
- Twelve complete style/storage cycles retain 338 meshes, 103 materials, 7 textures, 50 transforms and 5 lights. A 600-second simulation records sixteen arrivals and fourteen departures, respecting the two-guest cap, minimum separation 1.0 and cabinet collision bounds. Edit hides visitors, stored cabinet geometry is absent, and room disposal returns all resource counts to zero.
- The original onboarding/first-win → goal → purchase flow, move Undo, twenty-level next/resume navigation and edition-only reset pass. Root visual review covered the final unlock, editor, day/night, hidden, tall-small and style captures.

Evidence: `work/edition-cabinet-legacy-check.json`, `work/edition-cabinet-purchase-check.json`, `work/edition-cabinet-visuals-check.json`, `work/edition-cabinet-lifecycle-check.json` and `work/edition-cabinet-flow.log`. Browser emulation and simulation establish these bounded checks, not physical iPhone performance or player enjoyment.

Artifacts: [cabinet styles](screenshots/second-edition-v7/styles.webp), [paid room by day](screenshots/second-edition-v7/room-day.webp), [paid room by night](screenshots/second-edition-v7/room-night.webp), [desktop](screenshots/second-edition-v7/desktop.webp), [separate development showroom](screenshots/second-edition-v7/showroom.webp), [cabinet unlock](screenshots/second-edition-v7/unlock.webp), [cabinet editing](screenshots/second-edition-v7/cabinet-edit.webp), [small-phone finale](screenshots/second-edition-v7/puzzle-small.webp) and [hidden puzzle](screenshots/second-edition-v7/hidden-phone.webp). Day/night/desktop use an affordable paid core-plus-cabinet composition; the full seventeen-piece showroom is a development demo.

Local validation and hosted deployment passed. App commit: `cc371290eacb2355f164a867057feffbdbdaac0f`, confirmed by [GitHub Pages run 41940688895](https://github.com/ElBafo/tea-shop/actions/runs/41940688895). Stable branch `preview/shop-polish` stays at that app commit; follow-up documentation-only commits on `preview/second-edition` record delivery without changing the deployed app. Package/app/release version: `0.2.0-preview.7`. The review URL https://elbafo.github.io/tea-shop/preview/?edition=2 now serves preview.7. The owner subsequently said “Continue,” authorizing further preview work. Automated and simulated checks do not establish physical-device performance or player enjoyment. Main remains `e7a475779e41d3a39fff9435e6ebdb119dec682d`, with no merge authorized. [ROADMAP.md](ROADMAP.md) records acceptance criteria.

## 0.2.0-preview.6 — superseded by preview.7; continuation accepted

Continue [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, after the owner said “Continue” following preview.5. This authorizes the next preview, not a merge or an inferred acceptance of all prior fixes.

Implemented scope:

- Six visitor profiles covering two adult women, two adult men and two children, with stable appearance per visit on two reusable rigs. The roster cycles across room lifetimes within the session, without persistent guest state.
- Bending knees and elbows, distance-driven gait and frame-rate-independent visual turning. The simulation's exact routes, positions, activity choices, timing, arrival rates and two-visitor cap remain unchanged.
- Child proportions and seating that keep the hips at cushion height while shorter legs can dangle.
- Static reduced motion, Edit hiding, safe new-visit/reset behavior, background pause and clean resource disposal. No added lights, room-shadow casters, timers, saved guest state or star rewards.

The existing sixteen puzzles and designs, 36–68 earnings, 104-star catalogue, save namespace, first-counter shopkeeper and compact five-slot layout remain. There is no save-schema change, migration or reset. Main and classic behavior remain isolated.

Production build and all package verification pass. Independent source review found no blocking issue. The visual verifier covers all six profiles, 48 gait phases and twelve create/dispose cycles, confirming stable resources, root/metadata preservation, static reduced motion, child seating and safe floor/seat transitions. Each reusable rig has 40 meshes, 11 materials and 17 transforms; profile switching does not allocate another rig. A separate NullEngine review sampled 1,296 gait combinations and confirmed floor clearance within floating-point precision. Roster and seated still-image review found no blocking art issue.

Final browser validation passed:

- A 900-second simulated visit sequence showed all six profiles over 25 arrivals and 23 departures, respecting the two-visitor cap and a minimum guest separation of about 0.73 room units. All 345 sampled turns eased, and 177 unchanged repaints preserved presentation. Room resources stayed at 285 meshes, 90 materials, 7 textures, 48 transforms and 5 lights, with zero visitors in the shadow-caster lists.
- Both children naturally used every table and bench style: twelve profile/seat-style combinations. Actual UI checks passed Edit hiding, decoration drafts, background pause, static reduced motion, classic isolation and saved-progress isolation.
- Fresh preview.6 onboarding passed Start → guided first win → paid counter purchase → immediate shopkeeper. Shopkeeper preview/cancellation, purchase before the finale, storage/restoration, rotations, reload and day/night regressions also passed.
- Phone day/night/Edit, desktop and room-pose screenshots were inspected without a blocking art issue. The walking clip uses four seconds of fixed 30 Hz simulation; it is motion evidence, not a measured phone frame rate.

Artifacts: [visitor roster](screenshots/second-edition-v6/roster.webp), [gait poses](screenshots/second-edition-v6/gait.webp), [seated comparison](screenshots/second-edition-v6/seated.webp), [walking clip](screenshots/second-edition-v6/walking.mp4), [room day](screenshots/second-edition-v6/room-day.webp), [room night](screenshots/second-edition-v6/room-night.webp), [child seated](screenshots/second-edition-v6/child-seated.webp), [phone](screenshots/second-edition-v6/phone.webp), [night phone](screenshots/second-edition-v6/night-phone.webp), [Edit hiding](screenshots/second-edition-v6/edit-hidden.webp), [desktop](screenshots/second-edition-v6/desktop.webp) and [reduced motion](screenshots/second-edition-v6/reduced-motion.webp). Local logs are `work/guest-polish-integration-check.json`, `work/guest-polish-ui-check.json`, `work/guest-polish-onboarding-check.json` and `work/guest-polish-keeper.log`.

Local validation and hosted deployment passed. App commit: `6492179aa34b447d66f32d2b3ecac75c7567d4e8`, confirmed by [GitHub Pages run 41933373195](https://github.com/ElBafo/tea-shop/actions/runs/41933373195). The stable preview stayed at that app commit during preview.7 development; follow-up review-branch documentation recorded delivery without changing that app. Package/app/release version at this checkpoint: `0.2.0-preview.6`. The review URL https://elbafo.github.io/tea-shop/preview/?edition=2 served preview.6 at this checkpoint and now serves preview.7. The owner responded “Looks good. Proceed,” accepting continuation after positive review; this does not authorize a merge or establish measured physical-device performance. Main remains `e7a475779e41d3a39fff9435e6ebdb119dec682d`. The [roadmap](ROADMAP.md) records the next scope.

## 0.2.0-preview.5 — superseded by preview.6; continuation authorized

Continue [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, after the owner reviewed preview.4 positively and asked to move to the next milestone. Main remains unchanged; no merge was authorized.

Implemented scope:

- Six authored puzzles, 11–16, in the Afternoon ritual and A room of your own arcs. The first ten definitions, IDs, scoring targets and bonuses are unchanged. Levels 14–16 introduce five-slot jars; level 13 uses one hidden jar.
- Glass garden (10 stars, available after 13 completions) and Botanical triptych (14 stars, after 16), each with three edition models and accurate thumbnails: sixteen designs and 48 thumbnails total.
- Four completion-bonus stars at 16. Total earnings are 36–68, with a 26-star core and 104-star catalogue. Minimum finishes fund the core plus Glass garden. Optional full-price returns and included style changes remain.
- Existing edition saves gain six empty score/move entries. Valid ten-board edition backups remain supported alongside new sixteen-board backups, with explicit edition tags on new exports. Classic imports, invalid balances and ownership before its unlock are rejected. Purchases, placement, goals, preferences and unfinished puzzles are preserved.
- The second-edition shopkeeper appears whenever the counter is placed, independently of core-room completion. He follows its rear aisle and orientation through free preview/cancellation, purchase, storage, restoration and reload. Classic behavior is retained.
- Capacity-aware portrait sizing keeps the new five-slot rows above Undo and Restart, addressing the observed 12-pixel bottom-row clipping at 320×568.

Guest traffic remains as reviewed in preview.4. Less stiff walking/smoother turns and a broader visitor cast including women and children are separate roadmap follow-ups, deferred beyond this milestone. Paid wall ownership, classic gameplay and main saves remain protected.

The final production build after the shopkeeper and portrait fixes passed, along with every required verification script. All sixteen edition and 38 classic solver checks pass. Independent byte comparisons confirm the first ten edition definitions and classic definitions are unchanged; backup checks include rejecting locked ownership. Art checks cover all sixteen designs through twelve rebuild cycles, correct footprints, and owned resources returning to zero.

The full session browser suite passed (`work/edition-session-check.json`): old local saves and recovery, saved goal/night preference, unfinished puzzle and Undo, actual legacy-backup picker cancellation/restoration and classic rejection, real puzzle-13/16 wins, the exact four-star bonus and no repeat farming, special purchase/style/return/repurchase, and the shopkeeper appearing on the first counter purchase before any finale. Preview cancellation, store/restore, rotation and reload also passed. Views checked: 390×844, 320×568, 844×390 and 1280×900, plus reduced motion, with no recorded browser errors. The existing flow and choices regressions also pass: onboarding/reset, first win to selected goal and purchase, all prior optional unlocks, refunds, replay/navigation and temporary showroom/tour goals. The final production build after the last shelf-margin adjustment passed in 14.70 seconds. The focused 320×568 check reports equal scroll/client heights of 376 pixels with the full shelf visible (`work/edition-session-tall-small-scroll.json`). These are browser checks, not measured physical iPhone performance or enjoyment evidence.

Review screenshots: [styles](screenshots/second-edition-v5/styles.webp), [first counter and shopkeeper](screenshots/second-edition-v5/first-counter.webp), [room by day](screenshots/second-edition-v5/room-day.webp), [room by night](screenshots/second-edition-v5/room-night.webp), [tall jars](screenshots/second-edition-v5/tall-phone.webp), [small-phone tall jars](screenshots/second-edition-v5/tall-small.webp), [reward unlock](screenshots/second-edition-v5/reward-unlock.webp).

Local validation is complete. Hosted deployment passed at app commit `718a3633cfbff230c85d10e2e5ed65c47b0ca60e`: [GitHub Pages run 41927729026](https://github.com/ElBafo/tea-shop/actions/runs/41927729026). Follow-up documentation commits record this status without changing the deployed app. The owner subsequently said “Continue,” authorizing further preview work without explicitly accepting every fix or approving a merge. Package/app/release version: `0.2.0-preview.5`. The review URL https://elbafo.github.io/tea-shop/preview/?edition=2 served preview.5 at this checkpoint and now serves preview.7.

## 0.2.0-preview.4 — superseded by preview.5; continuation accepted

Continue [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, after the owner accepted the wall correction and said “Good. Let’s proceed.” This authorizes the next hosted preview, not a merge to main.

Implemented scope:

- At most two ambient visitors enter through a reachable open cutaway edge, browse placed shelves, order at the counter front, sit at reachable table/bench seating or look around, then leave. Rugs are walkable; furniture and the counter working aisle block routes. Stored/blocked activities are skipped, occupied stops are reserved, and visits can end early to clear a narrow exit.
- Unique placed decoration designs determine arrival frequency. Paint counts; stored pieces, duplicate copies and styles do not add density. The core eight reach the busiest rate. A new room runtime has a 4-second first-arrival delay; recurring intervals interpolate from 70–100 seconds at zero displayed designs to 9–14 seconds at eight or more. Population, entrance and activity availability may delay arrivals.
- A visit attempts up to three available activity kinds. Dwell ranges: browse 6–10 seconds, order 6–9, sit 24–36, look 5–8. One guest transits at a time while the other can dwell. Table seat approaches pass around chair backs; bench access and cushion height follow actual geometry.
- All visitors hide/reset in Edit and the arrival clock pauses. On exit, valid routes are recomputed, the intro delay is not repeated and the next eligible arrival is at least two seconds away. Layout/storage changes invalidate visits; styles preserve the arrival rate/clock, with bench seating geometry refreshed when needed.
- Reduced motion presents stationary visits at a single reachable activity, with no travel or limb/bob animation. Hidden pages pause; simulation steps clamp elapsed time rather than catching up after backgrounding.
- Two distinct pooled visitors use 30 meshes each, including soft contact discs. They are non-pickable, own their materials, use the existing frame loop and add no lights. They stay out of cached sun/lamp shadow maps, avoiding per-walking-frame shadow-map refreshes. The scene retains its existing five lights.

The visitors add no queues, service deadlines, tasks, matching bonuses, rewards, penalties or persistent guest/economy state. Fourteen designs, the paid wall finish, ten boards, 26–46-star earnings, edition save namespace and classic/released behavior remain unchanged. No migration or reset is needed.

Local validation passed: pure route/runtime tests cover rotation, blocked/disconnected layouts, seat access, Edit/reduced-motion behavior, cap/rate guards, style/storage semantics and immutable shop inputs. A deterministic 600-second fixture recorded eight empty-room arrivals versus eighteen for the core-eight room, mean core occupancy 1.96 and a maximum of two. An adversarial run exercised 180 legal layouts for 1,200 simulated seconds each: 10,798 arrivals, minimum guest separation about 0.73 and no residual collision/stall. These are bounded simulation results, not physical-phone performance, retention or enjoyment evidence.

The final browser traffic suite passed (`work/edition-traffic-check.json`): eleven furnished-room arrivals versus five empty-room arrivals in 360 simulated seconds, with the two-guest cap respected. A 1,200-second collision fixture completed 34 departures with minimum guest separation 0.885. Reduced-motion visits made zero spatial moves, and visitor meshes had zero overlap with cached shadow-caster lists. Sixteen lifecycle cycles retained 261 meshes, 88 materials, 7 textures, 36 transforms and 5 lights. The separate visual lifecycle matrix passed twelve rebuilds across both visitors and all five poses. Full production build and every `npm run verify` check passed, including all 38 classic and ten edition puzzle solvers. The paid-wall browser regression also passed for preview cancellation, purchase/reload, 36 resource cycles and classic isolation. These automated checks do not establish physical iPhone performance or enjoyable pacing.

Review screenshots: [busy day](screenshots/second-edition-v4/busy-day.webp), [busy night](screenshots/second-edition-v4/busy-night.webp), [visitors hidden in Edit](screenshots/second-edition-v4/edit-hidden.webp), [desktop](screenshots/second-edition-v4/desktop.webp), [reduced motion](screenshots/second-edition-v4/reduced-motion.webp).

Package/app/release version: `0.2.0-preview.4`. Hosted deployment passed at app commit `c77181a07d5340da965b91ef5007344c51400e31`: [GitHub Pages run 41923115751](https://github.com/ElBafo/tea-shop/actions/runs/41923115751). Follow-up documentation commits record this status without changing the deployed app. Owner feedback: “Looks good,” with follow-ups for stiff walking and visitor diversity, clarified as women and children. These are recorded separately in the roadmap and deferred while preview.5 proceeds. The review URL https://elbafo.github.io/tea-shop/preview/?edition=2 served preview.4 at this checkpoint; the latest deployment is recorded above. Main remains unchanged. Positive feedback is continuation approval, not a merge or measured physical-device performance result.

## 0.2.0-preview.3 — superseded by preview.4; continuation accepted

Focused fix in [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, following the owner's report that the walls already looked decorated before any purchase.

The empty second-edition room now keeps its twelve white panels and two decorative dado rails hidden. These belong to the existing three-star wall upgrade, alongside its colour and curtains. A deliberate free style preview shows the finish temporarily; cancelling restores the actual owned room, while purchase makes it persistent. Basic walls, window, floor, structural edge trim and the diorama foundation remain visible.

Implementation: `decorateEditionRoom` creates an initially disabled `edition-wall-finish` group and keeps the foundation separate. `applyRoomStyle` updates the group from the supplied shop's paint ownership on every synchronization, so temporary preview state and saved ownership use the same path.

Prices, catalogue, ten puzzle boards, save namespace and classic/released behavior are unchanged. Existing owners retain their purchased wall finish; no migration or progress reset is required. App/package/release target: `0.2.0-preview.3`.

Validation passed: full production build and all verification scripts; focused browser checks for fresh and counter-only walls, all three free styles, Browse/Done/other-item cancellation, exact three-star purchase, reload persistence and preservation of owned finishes. Phone/desktop day/night views and classic isolation passed with no browser exceptions. Thirty-six room-style preview cycles retain identical mesh/material/texture/transform counts and dispose cleanly. [Before/after screenshots](screenshots/second-edition-v3) document the upgrade. The owner subsequently gave positive continuation feedback; this is not measured physical-device performance evidence. Hosted deployment passed at app commit `619d829bc1986d4fc2b8a508c61708ec23fcdb20`: [GitHub Pages run 41918859412](https://github.com/ElBafo/tea-shop/actions/runs/41918859412). Follow-up documentation commits record this status without changing the deployed app. Owner feedback: “Good. Let’s proceed.” The owner accepted continuing after the correction without approving a merge. The review URL remains https://elbafo.github.io/tea-shop/preview/?edition=2; preview.3 was the verified deployment at this checkpoint and is now superseded by preview.4. Main is unchanged. Preview.4 adds the agreed ambient traffic, including Edit hiding, layout reactions and decoration-based arrival frequency.

## 0.2.0-preview.2 — superseded by preview.3

Continuation of [draft PR #15](https://github.com/ElBafo/tea-shop/pull/15), branch `preview/second-edition`, following the owner's feedback on preview.1: “Looks good. Continue pls.” This approves continuing the direction; it does not authorize merging to main.

Implemented local scope:

- Six existing optional designs use the second-edition art language, with three styles each and eighteen additional model-rendered thumbnails: fourteen designs and forty-two thumbnails total.
- Art (8 stars) and bench (6) unlock after 3 completed puzzles; clock (10) and trolley (8) after 6; basket (12) and planter (10) after 10. Every item remains a paid purchase after unlocking.
- Chosen goals show their puzzle unlock requirement even when affordable, and suggest optional returns when no more stars can be earned. After all ten puzzles, “Improve your scores” targets score improvement; at all three-star scores, “Revisit puzzles” opens the browser. An unfinished puzzle still takes priority.
- A stationary seated guest appears when table and counter are placed, follows the table transform, and is hidden during Edit or if either piece is stored. It adds no lights or independent timer. Walking traffic and full visits remain future work.

Economy and compatibility: the ten boards, completion bonuses and edition save namespace stay unchanged. Minimum/maximum earnings remain 26/46. The eight core pieces cost 26; six optional pieces add 54 for an 80-star catalogue. A player with all core pieces and maximum scores has 20 stars left to choose optional pieces. Confirmed full-value optional returns allow experimentation and recover stars for unfinished core purchases; no purchase becomes a requirement and core completion items remain non-returnable.

Validation: full local build and all `npm run verify` checks passed, including the fourteen-piece catalogue, milestone gates, star budget, optional returns and preview.1 core-save compatibility. Browser checks passed: all six unlock boundaries, funded locked goals, real-touch first win to chosen optional style, exact purchase/return/cancel/repurchase, Undo cleanup, preview.1 backup compatibility, completion navigation, and temporary showroom/tour goal isolation. The regular first-win/onboarding/reset flow and classic editor regression checks also pass. Guest checks cover all table styles, rotation, storage, Edit hiding, day/night, reduced motion and classic isolation; eighteen rebuild cycles retain identical resource counts. Art checks cover all eighteen new variant footprints and twelve rebuilds of all fourteen designs, releasing mesh/material/texture/transform resources to zero. [Review screenshots](screenshots/second-edition-v2) include day/night, desktop, the guest and Edit hiding. Physical-phone performance and enjoyment remain for review; a 320×568 selected-item view has a small room area, with actions still visible. Hosted deployment: successful at app commit `a1a2bbc80c77716512347c1b0de5c34aa06d8018`, confirmed by [GitHub Pages run 41895797422](https://github.com/ElBafo/tea-shop/actions/runs/41895797422). Follow-up documentation commits only record review status; they do not change the deployed app. Owner phone review: pending. Package and app version: `0.2.0-preview.2`, displayed at Start and in More. The hosted URL https://elbafo.github.io/tea-shop/preview/?edition=2 served this version at this checkpoint; the latest deployment is recorded above. Main remains the approved `0.1.0` baseline.

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
