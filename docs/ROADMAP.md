# Tea Shop roadmap

Record every agreed product decision here in the same work session. Clearly distinguish implemented behavior, agreed plans, and open decisions.

This is the working delivery order, not a calendar promise. Priorities can change after phone reviews. Product direction lives in [PRODUCT.md](PRODUCT.md); detailed art criteria live in [POLISH_PLAN.md](POLISH_PLAN.md).

## Current priority

Review the isolated reliability and jar-animation preview: installed/Home Screen updates, offline reopening, saved rewards, smoother transfers, and level celebrations. Preserve gameplay and shop progress; merge only after owner acceptance. Larger rooms remain backlog consideration.

## Current baseline

- Released: 38 sorting puzzles, stars, fourteen decoration designs plus five paid second copies, isometric 3D decorating, Edit mode, saved progress, and a completion celebration.
- Hosted preview: https://elbafo.github.io/tea-shop/preview/ automatically rebuilds from preview/shop-polish. The released game remains at https://elbafo.github.io/tea-shop/.
- The simplified shop UI, showroom, touch picking, sign correction, and counter aisle were reviewed and merged in PR #2.
- Mobile audio retry and clearer sound labels are implemented and checked with a mocked audio context; confirmed working by the owner in Safari.
- The Bakery is an unlockable coming-soon card.

## 1. Make phone play reliable — current priority

Resolve issues observed during phone reviews before adding more content.

- Confirm audio starts after a tap, respects mute, and recovers after backgrounding.
- Check portrait and landscape layout, scrolling, room framing, and readable controls.
- Check camera movement versus Edit mode, dragging, snapping, rotation, and tapping small pieces.
- Verify purchases, layouts, and best scores survive a reload.
- Make preview builds easy to identify; provide preview-only access to a fully decorated room so art reviews do not require replaying every level.

Done when the owner can play puzzles and decorate comfortably on their phone, with no known blocking defects. Automated checks support this review but do not replace device testing.

## 2. Make the tea shop lovely — next

Complete the existing art milestone rather than treating the initial pass as finished.

- Refine camera framing and composition across phone and desktop sizes.
- Improve furniture silhouettes, sign readability, and style differences.
- Strengthen the dusty-to-cozy transformation with warmer lighting and visible upgrade rewards.
- Add carefully placed props, then restrained idle details such as steam or plant movement.
- Check performance and reduced-motion behavior before expanding effects.

Done when phone-size views of the starting and finished room show a clear, charming transformation, all eight upgrades read clearly, and placement interactions still work. Capture before/after views for review. A cat remains optional.

## 3. Personal expression and shop showcases — requested

### Day/night theme — released and reviewed

Add an explicit day/night toggle (interpreting the user's “seat/night” request as day/night). Day retains the warm daytime room; night uses a darker surrounding background and visible lamp/window/shop lighting. Keep furniture, labels, and placement feedback readable in both modes. Persist the preference, respect reduced motion for transitions, and keep the choice independent of real-world time unless requested later.

Done when both themes work at phone size, changing theme preserves the layout, and the nighttime shop looks lit and welcoming rather than simply dimmed.

### Full-game dark theme — later exploration

Explore extending the shop's dark appearance to level selection, puzzle screens, menus, and dialogs. Preserve clear item colors, jar visibility, readable text, and accessible contrast. Decide whether interface appearance follows the shop's day/night setting or is a separate preference; consider a system-theme option. This is a future exploration, not part of the current shop-lighting implementation.

### A much broader decoration catalogue

Expand furniture, plants, wall art, textiles, lighting, countertop props, and style/color options so players can create visibly different shops. Plan owned-item inventory and multiple instances where appropriate rather than assuming one item per upgrade ID. Define prices, unlock pacing, placement footprints, and compatibility with existing saves before expanding the catalogue.

Start with a reviewed collection spanning several categories; agree the catalogue size after the first visual collection is approved. Variety should support distinct tastes and layouts, not just recolors.

### Showcase shops — initial implementation released

Provide a clean view with controls hidden for admiring and capturing a shop, including its chosen day/night theme. Plan a phone-friendly image export/share flow. Public profiles, a gallery, cloud saves, and social features are not implied by this request; evaluate them separately if image sharing is insufficient.

Done when players can compose a distinctive shop and share a clear image of it from their phone. A backend is not required for the initial image-sharing approach.

## 4. Finish and release the tea shop

- Review star costs, level progression, and the time needed to complete the room.
- Polish first-use guidance, sound controls, completion feedback, and the Bakery's coming-soon wording.
- Check touch targets, labels, keyboard focus, contrast, and reduced motion.
- Check load time, repeated scene entry/exit, offline behavior, and existing saves.
- Resolve findings from a complete playthrough; obtain approval before merging gameplay/art changes into main.

Done when level verification and production build pass, the owner approves the phone experience, and there are no known release-blocking issues.

## 5. Design and build the Bakery — later

Agree on the Bakery experience before implementing a second room.

Confirmed progression direction: later shops may begin with shabby fixtures (including a counter) to restore, giving each starting scenario variety. Each successive shop should require a higher minimum earned-star total to unlock, alongside the agreed prior-shop completion requirements. Use total earned stars rather than the unspent balance so decoration purchases do not delay access. Choose exact thresholds with the level/reward plan and ensure they are reachable. This is planned progression; the current Bakery card still follows the existing tea-shop completion rule and remains a placeholder.

Open decisions:
- Does it use the same sorting puzzle, a variation, or a new mechanic?
- Does it have separate stars/progression or continue the tea shop economy?
- What visual identity and upgrade sequence distinguish it?
- How many new levels are needed to fund its upgrades?

Start with one playable slice: enter Bakery, complete a puzzle, earn a reward, buy one visible upgrade, save, and return. Expand content only after that loop works and is reviewed on a phone.

Done when the Bakery unlock opens a playable experience with its own coherent progression and persistence. Exact content scope is not committed yet.

## Player progress and cloud saves — agreed direction

Current behavior: progress is stored in browser localStorage on each device. Preview and release progress are separate, and showroom changes are temporary. There are no accounts or cloud saves yet; clearing browser data can remove progress.

For public release, support immediate guest play with an optional account to back up and synchronize progress across devices. Retain local saves for offline play and synchronize account progress to a database. Preserve existing guest progress when a player signs in.

Before implementation, choose authentication and hosting, define guest-to-account migration, and settle conflict handling for offline play and multiple devices. Scores, star spending, ownership, and placements must remain consistent during synchronization. Exact providers, schemas, and delivery timing are not yet decided.

If public showcases or competitive rewards are introduced, add server-side validation of star earning and purchases as appropriate. Public profiles, social features, and competitive play remain separate decisions.

Acceptance: a guest can play immediately; signing in preserves their progress; the same account can recover its shop on another device; offline changes synchronize without duplicating rewards or losing purchases.

## Ongoing delivery workflow

1. Make a bounded change on the preview branch.
2. Run checks relevant to that change.
3. Push and confirm hosted preview deployment.
4. Share the preview link and a short list of what to test.
5. Incorporate phone feedback.
6. Merge gameplay/art changes into main only after explicit approval.

Preview saves are separate from release saves. Hosting configuration may change as needed to maintain the authorized preview workflow. Keep the preview branch available while deployment depends on it.

Optional accounts and a cloud-save backend are planned as described above. Monetization and multiplayer are not currently planned.


## Latest preview update

A temporary showroom now exposes all decorations without writing saved progress. The home screen shows a compact star balance and affordable-upgrade notice; Edit opens the decoration controls. The sign has a separate readable face, the counter has a reserved rear aisle, and saved furniture placements are sanitized around it. Touch picking registration, drag thresholds, cancellation recovery, and lamp highlighting were corrected. Phone and desktop browser checks accompany the build and level checks; the owner approved the update and requested its merge.

## Day/night preview review

A compact Day/Night switch changes shop lighting and background. The preference is saved independently from puzzle progress, with separate preview/release keys; showroom changes remain temporary. Night adds warm window light and stronger lamp lighting while retaining readable ambient light. Switching is immediate, with no added animation. Browser checks cover phone/desktop rendering, preference reload, showroom isolation, and touch dragging. Next after approval: agree a first expanded decoration collection and the inventory model for multiple items.

## Decoration economy requirement

Every purchasable decoration, including the counter, costs earned stars. Optional catalogue additions are optional for shop completion, not free. The review-only showroom can expose items temporarily without granting ownership in saved play. Validate the full catalogue cost against available level rewards before adding content; add sufficient earnable stars through new playable levels before costs exceed the reward budget. The first expanded catalogue costs 56 stars against 60 available from twenty levels. The starting shop has no counter; buying it for 2 stars reveals the selected Wood, Marble, or Painted style. Existing ownership is preserved.

## First paid decoration collection — in preview

Framed prints (8 stars), wall clocks (10 stars), and baskets (12 stars) each offer three styles. These are optional purchases beyond the original eight completion upgrades. The counter is now absent until purchased for 2 stars, with Wood, Marble, and Painted choices. Buying an item grants its style options; changing the style of an owned item remains free, as in the existing design. The full eleven-item catalogue costs 56 of the 60 available stars. All items are included in the temporary review showroom. Multiple copies and a larger inventory model remain future work.

## Progression direction confirmed by owner

The first shop starts empty of a counter; preserve the shabby-counter restoration idea for later shops to vary their starting scenarios. Some decorations should be aspirational. The optional collection costs 8/10/12 stars, making all eleven items cost 56 stars and leaving only four of the current maximum 60 unused. The original eight upgrades still cost 26 stars and control the completion/Bakery unlock. Collecting everything requires strong scores and replaying for improvements. Expand earnable rewards before future catalogue additions exceed the available budget.

## Lamp touch usability

Night-mode feedback identified a narrow lamp touch target and a floor-projection jump when grabbing the shade. Provide a minimum 44 CSS-pixel-wide selection area along the lamp in both themes, preserve the initial floor-item grab offset, and keep direct selection of other furniture intact. Validate near-miss taps and drag continuity across lamp styles and display pixel ratios before publishing.

Lamp usability validation: the 44 CSS-pixel selection target and preserved grab offset passed emulated touch checks for all three lamp styles in day/night at 1× and 2× pixel density (12 cases). Near-shade taps select the lamp, small drags do not jump, and a one-cell drag reaches the expected grid cell. Physical phone confirmation remains pending. The browser regression script is `scripts/verify-lamp-touch.mjs`.

## Continuous touch dragging

Phone feedback reported the lamp stopping after roughly one cell, rather than snapping back on release. Track active drags through native pointer events and current screen coordinates until release; retain window-level move/up handlers if canvas pointer capture is lost. Genuine pointer cancellation, page hiding, and focus loss restore the saved placement. A browser regression test passed 30 multi-cell and repeated night-mode drags across all lamp styles and 1×/2× pixel density, deliberately releasing capture during each drag. Night lighting remained enabled. Safari-device confirmation is still required; lighting performance remains a separate possible concern rather than an established cause.

## Showcase image sharing

A Showcase view hides the shop UI while retaining camera movement and the selected day/night lighting. Share image opens native file sharing when supported; Save image and unsupported-share fallback download a PNG. Export renders the current room at 1200 pixels wide without UI overlays, then restores the live canvas size. Export does not change scores, ownership, placements, or theme preference. The native Safari share sheet still requires phone review; browser tests cover image dimensions/content, share invocation, download fallback, cancellation, and save isolation. Public galleries and accounts remain separate roadmap work.


## Larger shops backlog; zoom promoted to current work

- Consider progressively larger shop spaces as players advance to later shops, allowing more room for decorations and distinct layouts.
- Player-controlled zoom was promoted from consideration to the next implementation priority by the owner; see Cozy polish and zoom below.

Larger shop spaces remain an exploration idea. Zoom is now committed work; test camera limits, touch interaction with furniture dragging, and phone performance.

## Decoration selection and shopkeeper — phone review follow-up

Owner feedback: the figure should serve from behind the counter, counters and shelves should be movable, and players must choose and see their desired decoration/style before paying.

Implemented for preview review: the shopkeeper stands behind the counter, faces its serving side, and follows counter moves/rotation. Counter placement reserves a one-cell rear working aisle and keeps it inside the room. Shelves can be dragged along either wall and switched with Other wall; window and occupied wall slots remain protected.

The decoration picker uses a grid with All decorations / My decorations filters, named style choices, and a live room preview. Browsing or cancelling a preview spends no stars and does not save temporary ownership or styles. A separate Buy button shows the chosen style and star cost. Unaffordable styles remain previewable with the shortfall shown. Leaving Edit discards an unpurchased preview. Owned styles remain free to change. Purchases require a valid placement; if no space is available, the player must rearrange existing items first.

Validation: placement/aisle and shelf collision checks, catalogue economy checks, all levels, and production build. Browser checks cover phone and desktop views, free previews, cancellation, explicit purchases, insufficient funds, counter/shelf touch movement, shopkeeper position, and reload persistence. Physical Safari review remains pending. This replaces the earlier fixed-counter and fixed-shelf behavior; larger inventories and multiple copies are still future work.

## Editor redesign and whole-game UI review

Latest phone feedback: selecting a decoration can leave placement unavailable until exiting and reopening Edit. Resolve the preview/edit-mode transition so owned items can be selected and moved immediately, and temporary previews can be positioned before purchase without saving ownership or spending stars.

Agreed collection rule: Decorations contains only unowned items; My decorations contains only owned items. A purchase moves its item into My decorations. Replace the previous All decorations tab and duplicated ownership listings.

Editor redesign: keep the room visible in a stable region, with collection tabs and a separately scrolling panel below on portrait phones and beside it on larger/landscape screens. Show either collection cards or the selected item's style/purchase controls, with a clear return to the collection. Browsing, previewing, arranging, and confirming a purchase must have distinct feedback. Owned layout/style changes save automatically; Done leaves Edit rather than acting as a required save step.

Broader UI direction: review the home shop, level selection, puzzle screen, and completion/dialog flows as one coherent interface. Use consistent navigation, typography, spacing, button priorities, and compact star displays. Keep puzzle readability, cozy character, accessible touch targets, and the existing game rules. Start with the editor and review it on a phone before carrying the visual language through the other screens; whole-game restyling has not shipped in this editor pass. Full-game dark appearance remains a separate exploration.

Editor preview validation: automated browser checks pass for selection-to-drag, temporary preview movement/rotation, purchasing the chosen placement, immediate movement after buying, direct owned selection during a preview, cancellation, exclusive collections, shelf movement, insufficient funds, and reload persistence. Portrait, small-phone, landscape, and desktop layouts are checked. Buy/Cancel occupy a separate footer rather than covering the scrolling style controls. Physical Safari review is still required.

Additional editor review direction: combine theme, sound, stars, and Edit/Done into one compact toolbar; remove the instruction text beneath the shop; slightly reduce button padding and type sizes. Preserve readable labels and usable touch targets. Apply the compact toolbar to shop home and Edit so the room gains space in both views.

Remove the redundant “Choose a style” heading from purchase previews; the named style buttons and selected state provide the choice directly.

## Whole-game UI pass — in preview review

Carry the editor's compact controls and clearer action priorities through the shop home, puzzle selection, play, and results. Home has a stronger Play action and quieter Bakery/decoration notices. Puzzle selection uses a compact card grid, available-star balance, completion count, and a Continue action that opens the first unfinished puzzle (or a puzzle with stars to improve once all are complete).

Puzzle play has compact navigation and move/star-target information, with only the initial first-puzzle instruction retained. Jar layouts adapt to small portrait phones and landscape without reducing the number of visible slots. Undo and Restart remain available. Results show the score, only newly earned stars, a primary Next puzzle action, and a direct Decorate shop action; replays do not grant duplicate rewards. Result dialogs isolate keyboard focus. Returning to another screen during a pour prevents that old animation callback from affecting a new puzzle.

Validation: all twenty levels and production build pass. Browser touch checks cover locked levels, Continue, real pours, Undo/Restart, completion, replay rewards, return-to-shop stars, and navigation during an animation. Tall five-slot puzzles fit 320px phones, portrait, landscape, and desktop. Phone review is pending; this is not merged. The shop's Day/Night appearance remains a shop setting; full-game dark mode is still backlog exploration.

## Release approved for family testing

The owner approved the reviewed editor, shop, and whole-game UI changes for merging into main and testing with his wife. Use the normal live URL for this review; preview and release saves remain separate. Collect feedback from actual phone play before selecting the next implementation milestone.

## Full-jar puzzle completion — family feedback

A puzzle finishes only when every jar is empty or completely full of one type. A one-item yellow stack and a separate three-item yellow stack must still be combined; matching partial stacks no longer count as completed jars or completed puzzles. Standard jars require four items and taller jars require five.

Update the solver's completion/pruning rule and individual-jar celebration checks together. Level 3 previously contained only three of each type in four-slot jars; add the missing items so each type can fill a jar. Recalculate all twenty par values under the new goal so three stars remain earnable. Maximum available rewards remain 60 stars. Preserve existing earned stars, unlocks, decoration ownership, and historical scores.

Validation: explicit split-stack and five-slot regressions; every level has capacity-compatible item counts; all twenty solver paths are replayed to legal, fully completed boards; recalculated par/scoring checks and production build pass. Browser review checks that split stacks remain playable and that only the final consolidation shows the result. The owner approved merging this fix directly into main so his wife can test it from the normal live game URL.

## Inventory and second copies — released in PR #5

Proceed with personal expression through inventory and additional placements. Every owned movable decoration can be stored and placed again for free. Ownership, chosen style, and last position remain saved; storing never refunds stars or revokes completion. Paint remains a fixed wall finish. When restoring, use the previous position if available, otherwise find a legal space. If none fits, keep it safely stored and explain that space is needed.

For this 6×6 room, plants, lamps, tables, prints, and baskets each support two copies. Buy the second for the original price, after owning the first. Copies have independent styles, positions, collision footprints, and lamp lights. Decorations shows eligible unpurchased copies; My decorations shows owned copies with In shop/Stored status. Every copy must be previewed and explicitly purchased with stars.

Add ten static puzzles (21–30) to fund the collection. The original catalogue costs 56 stars; second copies cost 32 more. Total: 88 of 90 earnable stars, leaving two after everything is bought. The original eight required upgrades still cost 26 and control completion. Preserve all previous scores, ownership, styles, and layouts when extending saves. This supersedes the earlier 20-level/60-star economy for this preview.

Verification: all 30 solver paths replay to fully completed jars; inventory, collision, paid-copy budget, and legacy-score migration checks pass. Browser checks cover phone purchase previews, independent second-lamp touch dragging, night lights turning off when stored, free restoration, reload persistence, and desktop layout. Physical Safari review remains required before release.

The initial next-step plan was to expand decoration designs with matching rewards. After the Cozy corners collection was built, the owner prioritised cozy polish and zoom before further catalogue expansion; see the current priority above. Larger rooms/zoom, whole-game dark appearance, and cross-device progress retain their separate backlog/planning status.

## Cozy corners collection — next preview

The owner approved and merged PR #5 after phone review. Inventory and the 30-level reward plan are now released. Proceed with three distinct optional designs: a bench (6 stars), tea trolley (8), and tall planter (10). Each purchase includes three freely changeable styles with different shapes or contents: reading/garden/velvet seating, tea/treat/book carts, and olive/bamboo/citrus plants. Each supports preview-before-buy, dragging, rotation, storage, and restoration. Keep one copy of each new design for this small room; existing repeatable designs retain their two-copy limits.

Eight puzzles (31–38) fund the 24-star addition. The full catalogue including existing second copies costs 112 of 114 earnable stars. Existing prices, prior scores, and the original eight-item completion requirement stay intact. No free unlocks or replay farming.

The temporary showroom presents the new pieces in a composed room with second copies stored; reviewers can place them again from My decorations. This arrangement affects only the showroom, never a player's saved layout.

Validation: all 38 puzzle solutions replay to full jars, catalogue and inventory economy checks, and production build. Automated browser checks pass for all nine new style previews, star purchases, touch placement, storage, and 30-level save migration. Phone day/night and desktop screenshots were reviewed. Existing inventory and puzzle flows are also checked. Physical phone approval is required before merging this collection.

## Cozy polish and zoom — priority confirmed by owner

The owner explicitly prioritised a cozier polish pass and zoom in/out ahead of further catalogue expansion. Finish the already-built Cozy corners collection in this preview, then focus on room presentation and camera usability rather than adding more catalogue designs.

Provide pinch-to-zoom on phones, wheel zoom on desktop, and compact minus/Fit/plus buttons on the canvas. Keep the top toolbar compact. Limit the camera to 0.85–1.9 times the fitted view; Fit restores the default framing and angle. Zoom is a temporary view setting, preserved across day/night and Edit changes in the same shop session, and never changes purchases or layouts. Export captures the current framing.

Two fingers switch to a camera gesture. Cancel any uncommitted item movement before pinching and require all fingers to lift before another drag starts. Test normal lamp dragging immediately after pinch and at non-default zoom. Camera changes must not spend stars or save furniture movement.

Cozy polish: soften the over-bright daytime lighting so wood, fabrics, and ceramic colours remain visible; retain readable nighttime furniture and warm lamps. Add subtle rising steam to purchased teapots. Steam is non-interactive, does not cast shadows, and is hidden when reduced motion is requested. No added decoration is granted for free: the new collection remains star-bought, while lighting and steam refine existing purchased furniture.

Larger rooms remain backlog consideration. Full-game dark mode, cloud progress, and Bakery design are separate later work. Review this combined preview on the phone before merging it.

Cozy/zoom validation: 30 long and repeated lamp drags pass across three styles and two pixel densities with deliberate pointer-capture loss. Pinch/button/wheel bounds, cancellation of unfinished moves, post-pinch dragging, reduced motion, and responsive camera checks pass. All 38 levels and the production build pass. The previous test browser stopped delivering valid touch capture; the same drag suite passed in a clean headless browser. Physical Safari review remains the release gate.

## Shadow polish — phone review follow-up

The owner reported a detached window-pot shadow on the floor and an oversized clock shadow across the wall. Use a steeper light directed into the room for shorter furniture shadows, soften their contrast/filtering, and exclude wall ornaments and elevated windowsill plants from casting room-wide shadows. Floor-standing plants still cast grounding shadows; moving a plant between floor and sill updates that rule. Apply the same geometry rules in both day and night. Preserve placement, ownership, zoom, and inventory behavior. Review phone screenshots before merging PR #6.

Validation: day/night caster checks, floor-to-sill and sill-to-floor plant transitions, phone/zoom/desktop screenshot review, all 38 level solutions, and production build pass. The clock and window pot no longer project shadows across the wall or floor. Changes remain in PR #6 preview.

## Lamp-driven shadows — next lighting preview

After noticing that lamp movement did not affect shadows, the owner approved continuing the lighting work. At night each placed lamp uses a downward light pool with one 512px shadow map, rather than a six-face omnidirectional map. Both purchased lamps can cast nearby furniture shadows independently. Cache maps while idle and refresh when lamps, furniture, or purchase animations move. Daytime retains the subtle fixed-light shadows. Stored lamps stop lighting and shadow rendering.

Keep clock/wall ornaments and windowsill plants excluded from large projected shadows, and prevent lamp shades from blocking their own bulbs. Preserve continuous touch dragging and inventory behavior. Validate both lamps, map caching, moving other furniture, floor/sill transitions, and physical iPhone performance before release; desktop emulation cannot establish iPhone frame rate. This continues PR #6 preview without merging new lighting into main.

Lamp-shadow validation: browser checks pass for two independent non-cubemap 512px maps, no idle redraws, light and furniture movement invalidation, storage, day/night switching, and retained wall/sill shadow exclusions. Shadow refreshes during drags are limited to snapped grid changes. Production build and all 38 puzzles pass; physical iPhone performance still requires owner review.

## Cozy milestone released; long-session performance polish

The owner approved and merged PR #6, including the Cozy corners collection, zoom, steam, corrected room shadows, and cached moving-lamp shadows. The main deployment passed. This releases 38 levels, 114 earnable stars, and 112 stars of purchases.

Proceed with the tea-shop release checklist. Repeated style changes exposed retained materials/textures: a 90-change probe grew from 40 to 260 materials and 8 to 68 textures while mesh count remained 103. Every rebuilt visual now releases its own materials and textures, including unused variant materials. Unchanged wall finishes retain their material/texture instead of regenerating on unrelated edits. Placement sparkle systems own their disposable textures so later sparkles remain valid. Disposed pieces stop pending pop-in effects.

Pause the shop render loop when the document becomes hidden and resume exactly one loop on return. Preserve layouts, scores, lighting, and gestures. These changes refine the existing experience without adding catalogue content or changing the economy.

Validation: 120 style changes, 12 store/restore cycles, and 12 preview/cancel cycles keep materials/textures/meshes at 43/7/107. Paint previews still change walls, second-copy materials remain independent, repeated sparkles clean up correctly, three hide/resume cycles pause/resume rendering, and three shop exits/re-entries release their scenes. Production build passes. Review this performance pass on preview before a separate merge. Installed/offline update behavior and the remaining release checklist are later checks; cloud saves and Bakery decisions remain planned.

## Performance release approved

The owner approved merging PR #7. Material/texture cleanup, unchanged-wall reuse, reliable placement sparkles, and background render-loop pausing are now merged into main. The next existing roadmap item is installed/offline update behavior, especially the iPhone Home Screen experience; implementation has not started in this merge-and-roadmap turn. Bakery design follows release reliability work and still requires its content/progression decisions.

## Reliability and jar polish — isolated review branch

The owner requested finishing release reliability alongside smoother, more expressive jar gameplay, with preview approval before any merge. Work lives on `preview/jar-polish`, mirrored to the hosted preview branch. Main keeps the approved experience until acceptance.

Jar selection lifts gently and highlights legal destinations. Treats travel between jars, settle on landing, and completed jars gain a check mark. A completed puzzle briefly celebrates its full jars, then reveals staggered stars and a short confetti finish. Effects are finite and respect reduced motion. Preserve full monochrome jar completion, all 38 puzzles, pars, unlimited undo, star rewards, and purchased shop content. Save a win before visual effects so leaving during the celebration cannot lose its reward. Input stays guarded during transfers; navigating away removes temporary effects.

Installed reliability: generate a content-versioned cache of the complete production build. Install only when every required asset is available. Updates wait for an explicit Update action, with Later available, and never force a mid-puzzle reload. Keep one previous app cache for open tabs and leave unrelated caches and local progress alone. Offline remains device-local; this is not cloud backup or in-progress puzzle persistence.

Keep the normal preview uncached. Provide an optional `/tea-shop/preview/offline/` rehearsal with its own worker scope and manifest, sharing only preview progress. The main save and installed main app remain separate. First open the rehearsal online and wait for “Ready” before testing airplane mode or adding it to the Home Screen.

Validation includes all puzzle/economy checks, production build, touch navigation, undo/restart, full-jar wins, replay rewards, phone/landscape/desktop layouts, transfer cleanup, reduced motion, worker failure/isolation checks, and a two-version production browser test for deferred updates and offline reopening. Physical iPhone Safari/Home Screen acceptance remains pending; automated Chromium checks do not establish iOS behavior. Bakery and cloud progress stay separate roadmap work.

## Jar preview feedback — steady jars and direct decorating

Keep the source jar stationary while treats fly out; remove its sideways tilt while retaining item transfers and the completion celebration. The result screen’s Decorate shop action opens Edit mode directly on the Decorations catalogue, ready to preview purchases with earned stars. Ordinary Shop navigation still opens the home view. Continue on PR #8 preview, without merging until approval.

## Reliability/jar milestone merged; UI review requested

The owner approved PR #8, merged as `a28a44d37c076a1142ce3187a1e3299a43fd8933`. This includes offline/update reliability, animated transfers with stationary source jars, completion celebrations, and direct entry to decorating from results.

The owner requested a UI review and suggestions before further implementation. The following are proposals, not accepted scope:

- Use adaptive jar sizing to reduce empty puzzle space, especially on early levels, while preserving readable four/five-slot layouts on small phones.
- Give the editor a collapsible catalogue/details tray so placement can use more of the room; retain clear access to Decorations and My decorations.
- Show visual style thumbnails instead of text-only style choices, retaining free in-room previews before purchase and clear star prices.
- Consolidate secondary controls (sound, day/night, showcase) while keeping the star balance and Edit/Done easy to reach. Keep generous touch targets despite smaller visual controls.
- Make the next puzzle and earned stars easier to scan; reduce the visual weight of the long locked-level grid.
- Simplify completion copy and distinguish newly earned stars from the available shop balance; retain Next puzzle and direct Decorate actions.

Recommended first pass: puzzle proportions plus editor space and visual style selection. No new UI implementation or further merge is approved by this review request. Preserve the cozy palette, existing interaction behavior, saves, puzzle rules, and preview-first review process.

## UI refinement — all five adjustments approved for preview

The owner approved all five suggestions and explicitly highlighted the hard-to-see star balance. Implement on `preview/ui-refinement`, mirrored to the phone preview; do not merge until reviewed.

- A contrasting gold balance pill with a stronger icon and larger number on shop and level screens, including night mode.
- An explicit More room / Show decorations control that collapses the editor tray and enlarges the room. It preserves the current selection, unpurchased preview, saved placement, and star balance. Hidden controls are inert. No automatic collapsing during a drag.
- Lightweight variant-specific style illustrations and selected checkmarks for both new purchases and owned decorations. The actual in-room preview remains available before purchase; illustrations do not add WebGL renderers. Keep the buy/cancel bar reachable independently of scrolling style details.
- Larger jars/treats on sparse puzzles on taller portrait phones, while retaining compact layouts for small phones, landscape, and dense five-slot puzzles. Source jars remain steady during transfers.
- Group sound, day/night, and showcase under Settings, leaving the balance and Edit/Done prominent. Support keyboard dismissal and tapping outside; preserve familiar labelled actions and touch targets.

Rules, stars, prices, ownership, saves, and offline behavior are unchanged. Locked-level grouping and further result-copy changes remain separate proposals, outside this five-item pass.

UI refinement validation: production build and all 38 solver/full-jar/economy checks pass. Browser checks cover touch puzzle play, undo/replay rewards, direct entry to Edit, 320px/phone/landscape/desktop layouts, menu dismissal, day/night and showcase access, style purchase/restyling/storage, and preview preservation when collapsing the tray. Drag checks pass with the tray collapsed and immediately after selection, purchase, cancellation, and shelf rotation. Phone/day/night/desktop screenshots reviewed. Await owner review on the hosted preview before merging.

## UI refinement release approved

The owner approved merging PR #9. The visible gold star balance, grouped Settings controls, collapsible editor tray, illustrated style choices, and larger sparse-puzzle jars are merged into main as `30cb8510e83e45a8f9527ebf34e28026fa966204`. No additional UI changes are authorized by this merge request.

## Direct animated appearance/audio controls — preview requested

The owner asked to move day/night and audio back onto the top bar as animated icons. This supersedes grouping those two controls inside Settings. Keep the prominent star balance and Edit/Done. Show sun/moon for the current shop lighting and a speaker/waves or muted speaker for audio. Use short transitions, accessible action labels, 44px touch targets, and reduced-motion support. Showcase remains under a compact More options control, hidden in Edit when there are no secondary actions.

Audio is on by default for new players (the existing `muted: false` default); retain saved explicit mute choices. Mobile browser audio unlock still happens on a user gesture. Keep audio directly accessible on shop, puzzle list, and puzzle screens. Toggling sound during a pour must not rebuild or cancel the puzzle's visual state. Day/night remains a shop-lighting setting; full-game dark mode is still separate backlog work.

Implement on `preview/top-bar-icons`, mirror to hosted preview, and await review before merging.

Direct-control validation: production build, all 38 puzzles, inventory/full-jar checks, and audio unlock/interruption/mute checks pass. Browser checks verify new-player audio-on default, persisted mute and night preferences, correct visible icon states, direct audio on all game screens, sound toggling during a pour without rebuilding jars, 44px touch targets at 320px width, and reduced-motion transitions. Phone/day/night/desktop screenshots reviewed. Await phone preview acceptance before merge.


## Decopu identity, start screen, and first-time guidance — approved scope

The owner renamed the game **Decopu** and requested a splash/loading screen with an explicit **Start** button, plus a guided introduction for new users. Work belongs on `preview/decopu-onboarding` and must be reviewed in preview before merging.

Use Decopu in the game title, splash, browser metadata, and installed-app names. Retain existing URL paths, service-worker scopes, save keys, earned stars, purchases, and layouts so current players keep their progress and shortcuts. Tea Shop remains the first venue; the overall game is Decopu. Existing iPhone shortcut labels may require re-adding the shortcut to reflect the renamed app.

The splash appears immediately while assets load. Start becomes available when the first screen is ready; do not add artificial waiting or fake percentage progress. Starting uses the user's gesture to unlock mobile audio, respecting the saved mute choice. Include a useful loading failure/retry state and reduced-motion support.

For new players, introduce the loop through playing: sort the first jars, fill every nonempty jar completely with one kind, earn stars, then preview and buy a decoration. Keep guidance short, skippable, and separate from puzzle rules. Preserve undo, scoring, styles-before-buying, and normal decorating. Save onboarding progress separately; do not force the introduction on existing players or repeat completed guidance.

Initial status: branding and scope were recorded while the workspace was offline. Implementation resumed once the workspace became available; see the delivery notes below. Main remains unchanged until approval.


## Collection choice and aspirational decorations — product direction

The owner wants showcasing to express meaningful differences between players: a wider selection of items and styles, expensive decorations that require saving across levels, and later rooms/content that let players return to personalize their original tea shop with less-common pieces.

Current economy: 38 puzzles provide 114 stars and all purchases cost 112. Several items already cost more than one level's maximum three-star reward, but the full catalogue is deliberately affordable. Future optional collection expansion should offer more choices than a player can afford at once, with enough rewards for core progression. This revises the earlier blanket goal of funding every optional purchase immediately; it does not change the live economy or revoke existing purchases.

Proposed design for balancing, not yet approved prices or implementation:
- Accessible essentials, more distinctive optional designs, and aspirational statement pieces. Illustrative future price bands: 2–6, 8–15, and 20–35 stars respectively; calculate actual prices against the level/room budget before shipping.
- Add separately star-priced new premium variants where their appearance merits a separate purchase. Preserve all existing included/free style options for current owners; do not charge again for styles already granted.
- Some special items require both a progress/mastery milestone and stars, making their acquisition a visible accomplishment. Keep them optional and preserve the game's no-timer/no-failure character.
- Later rooms introduce puzzles and new designs usable when revisiting earlier shops. Exact inventory sharing/movement rules between rooms remain undecided.
- Keep room progression achievable regardless of optional spending. Recommended approach: room eligibility based on lifetime stars earned, consistent with the earlier higher minimum-star unlock plan. The owner's suggestion of buying rooms with spendable stars needs an explicit budget/access design before implementation; do not silently choose a room fee or let a decoration purchase permanently block the only source of new stars.
- Add new earnable content with progression. Do not promise repeat-star farming, random drops, paid currency, or artificial player-count exclusivity; those are not agreed mechanics.

Next step: model the first two rooms, essential costs, optional catalogue, and reward budget before implementing this economy. The Decopu rename, Start splash, and first-time guide remain the active unfinished milestone; this discussion adds roadmap direction rather than replacing that work.


## Decopu start and guided first visit — implementation for review

The Decopu splash now paints before the bundle loads and waits for scene readiness. Start explicitly opens the app and unlocks audio through that gesture. Existing sound preferences are preserved. Slow loading exposes Reload; initialization failures retain a recoverable loading screen. No artificial wait or percentage is shown.

New players can choose Show me how or Explore on my own. Guidance highlights a possible first-puzzle move, explains the full-jar goal, saves the real first win, introduces spending stars, then explains arranging the first purchased piece. Every contextual guide has Skip; completed/skipped guidance stays dismissed. Existing saves skip the introduction. Guide progress uses a separate versioned key derived from the existing save key, leaving scores and inventory untouched.

Review the whole first-time flow at `/tea-shop/preview/?tour=1`. This preview-only tour starts with temporary empty progress and never writes scores, purchases, guide state, or appearance changes to the saved preview shop. Normal preview and main retain their established save keys and URLs. Tea Shop remains the first room within Decopu. Installed-app names and browser metadata use Decopu; iPhone shortcuts may retain a cached old label until re-added.

Validation: all 38 solver/full-jar/economy checks, production and hosted-preview builds, real-touch first win/purchase, onboarding skip/completion persistence, existing-save migration, temporary tour isolation, phone/320px/landscape/desktop layouts, and offline-update/reopen checks. Physical phone review remains required before merge. Future collection scarcity and room-economy changes remain roadmap proposals, outside this release.
