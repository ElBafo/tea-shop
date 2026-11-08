# Decopu — new chat handoff

The owner requested merging the accumulated preview work into main and continuing in a new chat. This release is 0.3.0. Read ROADMAP.md, PRODUCT.md, ARCHITECTURE.md and AGENTS.md before further work.

## Links and workflow

- Main game: https://elbafo.github.io/tea-shop/
- Phone preview: https://elbafo.github.io/tea-shop/preview/
- The stable preview source is `preview/shop-polish`. Keep future work reviewable there before a main merge; the owner explicitly authorized this consolidation only.
- Plain preview opens the current edition. The isolated Babylon puzzle comparison is preview-only at `?edition=2&puzzle3d=1`; it is not the normal puzzle renderer.
- Main and preview have separate progress and appearance namespaces. Preserve both. Do not clear, migrate or copy saves without an explicit request.

## Consolidated work

Includes preview.1–.11: room-first home, compact decoration editor with owned/unowned collections and free style preview, clearer sachets/hidden pieces/capacity, reward and sound polish, keeper face and corrected relaxed cup pose, wood/porcelain/tea detail pass, updated thumbnails, and keyboard focus/dialog isolation. Mixed styles must work together. Keep all decorations star-priced and preserve full-jar wins, whole-group transfers, unlimited Undo and existing board identities.

## Immediate issue: iPhone loading

The owner reported preview.11 stuck on “Preparing your little shop”. The exact physical-device cause has not been reproduced. Startup previously waited indefinitely on Babylon scene readiness. The release bounds that wait, handles startup context loss, and provides error/Reload feedback for a stalled initialization or startup exception. This prevents an endless preparation state; it is not proof that the underlying iPhone rendering/network/cache issue is resolved. Never clear the owner's saved progress as a troubleshooting shortcut.

Next device check: reopen the installed shortcut and record the displayed version, exact status message, whether Reload appears, Safari versus Home Screen behavior, and fresh versus existing decorated save. Investigate WebGL context/compile readiness and failed module requests if loading still fails. Browser emulation cannot establish iPhone performance or VoiceOver behavior.

## Remaining roadmap

1. Resolve any remaining device-specific startup failure before further feature expansion.
2. Observe an uncoached first session; use PLAYTEST.md. Human pacing/retention evidence remains pending. Do not change boards or star targets based only on solver minima.
3. Broader material cohesion, physical-phone performance and remaining accessibility review. The latest material pass was bounded to representative furniture and shared cup details.
4. Decide normal 3D puzzle rendering only after real-device comparison; the experiment alone is not adoption approval.
5. Larger rooms/zoom progression, more distinctive rare decorations, later Bakery/room progression, cloud saves and monetisation remain backlog. Bakery is a placeholder.

## Repository caution

Remote GitHub branches are authoritative. The current /workspace/tea-shop git index is stale and shows many pre-existing modifications/untracked files; do not bulk commit/reset it. Prior changes were published using explicit trees based on remote heads. Prefer a fresh controlled checkout for the next chat if available. Preserve the deployed workflow, which builds main and preview separately; the local workflow copy is older.

## Validation and release status

Package verification and production/preview builds are required. This release adds a compiled startup check covering success, failure, stalled initialization and real production onboarding. Earlier preview browser evidence covers touch dragging, keyboard/dialog flows, purchases, save preservation, day/night/mixed styles and scene disposal. See RELEASES.md for the final consolidation PR and deployment status. Physical iPhone validation remains pending.

Final release status: Merged through [PR #29](https://github.com/ElBafo/tea-shop/pull/29) as `702fe1599da885d381bab83088f608ebe35bc777` and hosted successfully in [Pages run 42494900818](https://github.com/ElBafo/tea-shop/actions/runs/42494900818). Main and preview serve 0.3.0. Old stacked PRs #19–28 were verified included and closed. No new chat was started; the owner asked for a copyable continuation prompt in the current chat.
