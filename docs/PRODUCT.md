# Decopu: product direction

## Experience

Decopu is a cozy, phone-first sorting puzzle that funds the restoration of a tiny isometric 3D tea shop. It should feel like a quiet moment: no clock, no fail state, unlimited undo, and a welcoming room that becomes more personal through play.

The core loop is: solve a shelf → earn stars → repair or decorate the shop → rearrange it → return to puzzles. Stars reward efficient solutions rather than speed. Replaying a level improves its best score; it does not farm repeat rewards.

## Established decisions

- Finish a puzzle only when every non-empty jar is full of one type: four matching treats in standard jars, five in taller jars. Partial matching stacks must be consolidated.

- Use Babylon.js for a real 3D cutaway diorama, with an isometric-style view.
- Let players move selected furnishings through drag-and-snap placement and rotation.
- Keep an explicit Edit mode so moving furniture does not fight camera movement.
- Offer star-bought upgrades with a small choice of visual styles; owned styles can be changed freely.
- Make the shabby-to-cozy transformation visible and rewarding at phone size.
- Completing the tea shop unlocks the Bakery as the next destination.

## Current release

The released game includes 38 puzzles, fourteen paid decoration designs, style previews, movable furniture, day/night lighting, image sharing, compact phone UI, and full-jar completion. Best scores and shop layouts are stored locally. The Bakery remains a coming-soon destination.

The released inventory supports: store and restore owned movable decorations for free, retaining their style and position. Plants, lamps, tables, prints, and baskets can each have a second copy bought for stars. Preview each style before buying; copies can be styled and arranged independently. Paint remains a fixed finish.

The full collection, including five second copies, costs 112 of 114 stars available across 38 puzzles. The original eight required designs still control shop completion; optional decorations and copies are not required to unlock the Bakery card.

The approved cozy release includes softer lighting, reduced-motion-aware steam, pinch/wheel/button zoom with Fit, short room shadows, and cached lamp-driven shadows at night. The next pass focuses on long-session performance: stable resource counts while editing and paused rendering when the page is hidden. Further catalogue expansion and larger rooms wait behind release polish.

## Delivery

Review changes on the hosted phone preview before merging to main. Preview and release saves are separate. Include screenshots and relevant verification in review PRs; merge only after approval. Larger shops, full-game dark appearance, cloud progress, and a playable Bakery remain roadmap work.


## Approved depth preview

The next review adds a room-first editor with compact variant illustrations and legal placement markers, five puzzle chapters, milestone-unlocked Conservatory pieces and a clear tea-shop completion/showcase action. The Bakery stays explicitly future content. All previous purchases/styles are preserved. New optional collections introduce choice beyond the current star budget; the core shop still costs 26 stars. Local progress gains manual file backup/restore, a previous-save recovery slot and unfinished-puzzle resuming with Undo. Accounts and automatic cloud sync remain future work.


Chapter milestones also award 4/6/8 bonus stars at 8/16/24 completed puzzles. Bonuses are derived from completion counts, so existing players receive them retroactively and replaying cannot farm them. Total earning capacity is 132 (114 puzzle stars + 18 chapter stars), against a 190-star catalogue. A player who already owns the entire 112-star legacy collection has 20 stars available and can afford any one new statement piece. Puzzle rules and maximum earnings are unchanged. Hidden-jar three-star targets now allow one exploratory move per initially lidded jar; existing scores are preserved.


Collections should be compatible across styles: coherent scale, materials and complementary colours support personal taste without mandatory matching sets. Completing the future Bakery (second venue/story chapter) should unlock star-bought special pieces usable in the original tea shop. This is separate from tea-shop puzzle-group milestones. Sorting remains the core; long-term retention needs player evidence before adding another game mode.


Immediate priority is a strong single-shop experience for player testing. Monetisation is deferred to a later roadmap phase; no business model is selected. Earned-star progression is separate from future real-money decisions.


The approved reward preview adds a Reading chair at32 completed puzzles (16 stars) and a small indoor Tea garden fountain at38 (20), bringing the catalogue to190. The core remains26 and maximum earnings132. Confirmed optional-item returns restore the full star price, allowing experimentation without changing milestone gates. Core completion pieces are excluded. Visual goals open free in-room previews; the compact editor keeps the room prominent. No outdoor space is implemented.
