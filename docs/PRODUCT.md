# Tea Shop: product direction

## Experience

Tea Shop is a cozy, phone-first sorting puzzle that funds the restoration of a tiny isometric 3D tea shop. It should feel like a quiet moment: no clock, no fail state, unlimited undo, and a welcoming room that becomes more personal through play.

The core loop is: solve a shelf → earn stars → repair or decorate the shop → rearrange it → return to puzzles. Stars reward efficient solutions rather than speed. Replaying a level improves its best score; it does not farm repeat rewards.

## Established decisions

- Finish a puzzle only when every non-empty jar is full of one type: four matching treats in standard jars, five in taller jars. Partial matching stacks must be consolidated.

- Use Babylon.js for a real 3D cutaway diorama, with an isometric-style view.
- Let players move selected furnishings through drag-and-snap placement and rotation.
- Keep an explicit Edit mode so moving furniture does not fight camera movement.
- Offer star-bought upgrades with a small choice of visual styles; owned styles can be changed freely.
- Make the shabby-to-cozy transformation visible and rewarding at phone size.
- Completing the tea shop unlocks the Bakery as the next destination.

## Current release and collection preview

The released game includes thirty puzzles, eleven paid decoration designs, style previews, movable furniture, day/night lighting, image sharing, compact phone UI, and full-jar completion. Best scores and shop layouts are stored locally. The Bakery remains a coming-soon destination.

The released inventory supports: store and restore owned movable decorations for free, retaining their style and position. Plants, lamps, tables, prints, and baskets can each have a second copy bought for stars. Preview each style before buying; copies can be styled and arranged independently. Paint remains a fixed finish.

The inventory release offers 90 stars across thirty puzzles; eleven designs and five second copies cost 88 stars. The Cozy corners preview adds a bench, trolley, and tall planter with three styles each, plus eight puzzles. That brings rewards to 114 stars and total purchases to 112. The original eight required designs still control shop completion; optional copies are not required to unlock the Bakery card.

The owner has now prioritised cozy polish and zoom ahead of additional catalogue expansion. This preview softens daytime lighting, adds reduced-motion-aware teapot steam, and provides bounded pinch/wheel/button zoom with a Fit reset. Camera gestures do not save decoration movement.

## Delivery

Review changes on the hosted phone preview before merging to main. Preview and release saves are separate. Include screenshots and relevant verification in review PRs; merge only after approval. Larger shops, zoom, full-game dark appearance, cloud progress, and a playable Bakery remain roadmap work.
