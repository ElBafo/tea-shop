# Decopu — new chat handoff

The owner requested merging the accumulated preview work into main and continuing in a new chat. The current release is 0.3.1, adding normal 3D puzzles at the owner’s explicit request. Read ROADMAP.md, PRODUCT.md, ARCHITECTURE.md and AGENTS.md before further work.

## Links and workflow

- Main game: https://elbafo.github.io/tea-shop/
- Phone preview: https://elbafo.github.io/tea-shop/preview/
- The stable preview source is `preview/shop-polish`. Keep future work reviewable there before a main merge. The owner explicitly authorized the 0.3.1 normal-3D-puzzle integration on both preview and main while continuing UI exploration in Stitch.
- Plain preview opens the current edition. Normal second-edition puzzles now use the Babylon renderer with native accessible controls and an automatic native-art fallback for rendering failure. The isolated comparison remains preview-only at `?edition=2&puzzle3d=1` and has no progression rewards.
- Main and preview have separate progress and appearance namespaces. Preserve both. Do not clear, migrate or copy saves without an explicit request.

## Consolidated work

Includes preview.1–.11: room-first home, compact decoration editor with owned/unowned collections and free style preview, clearer sachets/hidden pieces/capacity, reward and sound polish, keeper face and corrected relaxed cup pose, wood/porcelain/tea detail pass, updated thumbnails, and keyboard focus/dialog isolation. Mixed styles must work together. Keep all decorations star-priced and preserve full-jar wins, whole-group transfers, unlimited Undo and existing board identities.

## Immediate issue: iPhone loading

The owner reported preview.11 stuck on “Preparing your little shop”. The exact physical-device cause has not been reproduced. Startup previously waited indefinitely on Babylon scene readiness. The release bounds that wait, handles startup context loss, and provides error/Reload feedback for a stalled initialization or startup exception. This prevents an endless preparation state; it is not proof that the underlying iPhone rendering/network/cache issue is resolved. Never clear the owner's saved progress as a troubleshooting shortcut.

Next device check: reopen the installed shortcut and record the displayed version, exact status message, whether Reload appears, Safari versus Home Screen behavior, and fresh versus existing decorated save. Investigate WebGL context/compile readiness and failed module requests if loading still fails. Browser emulation cannot establish iPhone performance or VoiceOver behavior.

## Remaining roadmap

Future v1.0.0 design input: the owner supplied a Stitch Living Diorama/game-systems map and asked to keep it in the notes. Read [V1_STITCH_PRODUCT_MAP.md](V1_STITCH_PRODUCT_MAP.md) and the corresponding [roadmap entry](ROADMAP.md). Its navigation, new gameplay/community systems and four AI context layers are recorded proposals; no implementation or live redesign was requested by that note-taking task.

The follow-up [V1_GAME_DESIGN_DRAFT.md](V1_GAME_DESIGN_DRAFT.md) preserves the supplied five-section GDD, with the visitor/sort/brew/upgrade loop, screens and venue tiers. Read its reconciliation table before implementation: new currencies/serving rewards and four-slot/all-jars-full wording are not settled replacements for current rules. The later puzzle-flow notes clarify free Undo and matching top groups.

The same draft includes the Tea Book follow-up: recipe compendium, guest scrapbook/mailbox, workshop linkage and supplied Stitch screen IDs `SCREEN_44` / `SCREEN_19` / `SCREEN_24`. The subsequent [Stitch export index](stitch-prototypes/README.md) now provides original HTML, images and inspection status for these references. Recipe counts, mastery/tip rewards, gifts and brewing conditions remain draft design inputs, not implemented or final economy values.

The latest [V1_PUZZLE_FLOW.md](V1_PUZZLE_FLOW.md) clarifies free Undo (superseding the earlier token wording) and consecutive matching top groups. It also proposes moving/tilting jars, completed-jar locks, extra canisters, general hints and serving rewards. Those mechanics are not implemented or approved replacements for current rules; read its reconciliation table before making changes.

Original Stitch visual source: [stitch/design.md](stitch/design.md) is preserved byte for byte at the owner's request. Keep it unchanged; put interpretations or derived tokens elsewhere. Read [stitch/README.md](stitch/README.md) for its hash and separate notes on differing front-matter/prose colour values, typography and future phone validation. No runtime UI changes were requested by importing it.

1. Resolve any remaining device-specific startup failure before further feature expansion.
2. Observe an uncoached first session; use PLAYTEST.md. Human pacing/retention evidence remains pending. Do not change boards or star targets based only on solver minima.
3. Broader material cohesion, physical-phone performance and remaining accessibility review. The latest material pass was bounded to representative furniture and shared cup details.
4. The owner selected normal 3D puzzle rendering and requested deployment to main and preview. Continue physical-device performance/accessibility review and preserve native-art recovery.
5. Larger rooms/zoom progression, more distinctive rare decorations, later Bakery/room progression, cloud saves and monetisation remain backlog. Bakery is a placeholder.

## Repository caution

Remote GitHub branches are authoritative. The current /workspace/tea-shop git index is stale and shows many pre-existing modifications/untracked files; do not bulk commit/reset it. Prior changes were published using explicit trees based on remote heads. Prefer a fresh controlled checkout for the next chat if available. Preserve the deployed workflow, which builds main and preview separately; the local workflow copy is older.

## Stitch prototype export archive

The owner supplied `docs/stitch-prototypes/`: the original ZIP plus 70 matching extracted source files (25 HTML, 43 PNG, 2 Markdown). [The index](stitch-prototypes/README.md) and hash manifest preserve originals and distinguish paired captures, standalone artwork and three missing screenshots. Five images were visually inspected. The Living Diorama capture has a missing room image; the HTML uses external CDN/image references and contains no canvas/engine initialization or editable 3D models. These are v1 design references, not a running replacement for the released game. Existing original `stitch/design.md` remains unchanged and matches the exported DESIGN.md exactly.

## Validation and release status

Package verification and production/preview builds are required. This release adds a compiled startup check covering success, failure, stalled initialization and real production onboarding. Earlier preview browser evidence covers touch dragging, keyboard/dialog flows, purchases, save preservation, day/night/mixed styles and scene disposal. See RELEASES.md for the final consolidation PR and deployment status. Physical iPhone validation remains pending.

0.3.0 consolidation status: Merged through [PR #29](https://github.com/ElBafo/tea-shop/pull/29) as `702fe1599da885d381bab83088f608ebe35bc777` and hosted successfully in [Pages run 42494900818](https://github.com/ElBafo/tea-shop/actions/runs/42494900818). Main and preview serve 0.3.0. Old stacked PRs #19–28 were verified included and closed. No new chat was started; the owner asked for a copyable continuation prompt in the current chat.

## 0.3.1 final release status

Merged through [PR #30](https://github.com/ElBafo/tea-shop/pull/30) as `2b7312dcc0a1ddd36787d8ee0d26da6cef32c92c` and deployed successfully in [Pages run 42497266122](https://github.com/ElBafo/tea-shop/actions/runs/42497266122). Main and preview serve 0.3.1. Hosted phone-size smoke checks confirm the displayed version, normal first-session 3D puzzles, transfer and Undo on both links, with zero runtime exceptions and unchanged main progress while playing preview in the isolated test browser. No user saves were reset, copied or migrated. Physical-iPhone startup/performance and uncoached human-session validation remain pending. All required package/build checks, eight normal-3D groups on each compiled build, sixteen drag groups, eleven fresh-browser guide/editor groups and startup recovery checks pass. The owner is exploring UI designs in Stitch and will provide further direction; do not start another UI redesign based on that exploration alone.
