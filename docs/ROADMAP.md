# Tea Shop roadmap

This is the working delivery order, not a calendar promise. Priorities can change after phone reviews. Product direction lives in [PRODUCT.md](PRODUCT.md); detailed art criteria live in [POLISH_PLAN.md](POLISH_PLAN.md).

## Current baseline

- Implemented: 20 sorting puzzles, stars, eight upgrades with styles, isometric 3D decorating, Edit mode, saved progress, and a completion celebration.
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

### Day/night theme — implemented in preview, awaiting review

Add an explicit day/night toggle (interpreting the user's “seat/night” request as day/night). Day retains the warm daytime room; night uses a darker surrounding background and visible lamp/window/shop lighting. Keep furniture, labels, and placement feedback readable in both modes. Persist the preference, respect reduced motion for transitions, and keep the choice independent of real-world time unless requested later.

Done when both themes work at phone size, changing theme preserves the layout, and the nighttime shop looks lit and welcoming rather than simply dimmed.

### Full-game dark theme — later exploration

Explore extending the shop's dark appearance to level selection, puzzle screens, menus, and dialogs. Preserve clear item colors, jar visibility, readable text, and accessible contrast. Decide whether interface appearance follows the shop's day/night setting or is a separate preference; consider a system-theme option. This is a future exploration, not part of the current shop-lighting implementation.

### A much broader decoration catalogue

Expand furniture, plants, wall art, textiles, lighting, countertop props, and style/color options so players can create visibly different shops. Plan owned-item inventory and multiple instances where appropriate rather than assuming one item per upgrade ID. Define prices, unlock pacing, placement footprints, and compatibility with existing saves before expanding the catalogue.

Start with a reviewed collection spanning several categories; agree the catalogue size after the first visual collection is approved. Variety should support distinct tastes and layouts, not just recolors.

### Showcase shops

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

Open decisions:
- Does it use the same sorting puzzle, a variation, or a new mechanic?
- Does it have separate stars/progression or continue the tea shop economy?
- What visual identity and upgrade sequence distinguish it?
- How many new levels are needed to fund its upgrades?

Start with one playable slice: enter Bakery, complete a puzzle, earn a reward, buy one visible upgrade, save, and return. Expand content only after that loop works and is reviewed on a phone.

Done when the Bakery unlock opens a playable experience with its own coherent progression and persistence. Exact content scope is not committed yet.

## Ongoing delivery workflow

1. Make a bounded change on the preview branch.
2. Run checks relevant to that change.
3. Push and confirm hosted preview deployment.
4. Share the preview link and a short list of what to test.
5. Incorporate phone feedback.
6. Merge gameplay/art changes into main only after explicit approval.

Preview saves are separate from release saves. Hosting configuration may change as needed to maintain the authorized preview workflow. Keep the preview branch available while deployment depends on it.

No accounts, backend, monetization, or multiplayer are currently planned. Revisit only when a concrete product need emerges.


## Latest preview update

A temporary showroom now exposes all decorations without writing saved progress. The home screen shows a compact star balance and affordable-upgrade notice; Edit opens the decoration controls. The sign has a separate readable face, the counter has a reserved rear aisle, and saved furniture placements are sanitized around it. Touch picking registration, drag thresholds, cancellation recovery, and lamp highlighting were corrected. Phone and desktop browser checks accompany the build and level checks; the owner approved the update and requested its merge.

## Day/night preview review

A compact Day/Night switch changes shop lighting and background. The preference is saved independently from puzzle progress, with separate preview/release keys; showroom changes remain temporary. Night adds warm window light and stronger lamp lighting while retaining readable ambient light. Switching is immediate, with no added animation. Browser checks cover phone/desktop rendering, preference reload, showroom isolation, and touch dragging. Next after approval: agree a first expanded decoration collection and the inventory model for multiple items.
