# Tea Shop: product direction

## Experience

Tea Shop is a cozy, phone-first sorting puzzle that funds the restoration of a tiny isometric 3D tea shop. It should feel like a quiet moment: no clock, no fail state, unlimited undo, and a welcoming room that becomes more personal through play.

The core loop is: solve a shelf → earn stars → repair or decorate the shop → rearrange it → return to puzzles. Stars reward efficient solutions rather than speed. Replaying a level improves its best score; it does not farm repeat rewards.

## Established decisions

- Use Babylon.js for a real 3D cutaway diorama, with an isometric-style view.
- Let players move selected furnishings through drag-and-snap placement and rotation.
- Keep an explicit Edit mode so moving furniture does not fight camera movement.
- Offer star-bought upgrades with a small choice of visual styles; owned styles can be changed freely.
- Make the shabby-to-cozy transformation visible and rewarding at phone size.
- Completing the tea shop unlocks the Bakery as the next destination.

## Implemented baseline

The repository includes the merged decorating work from PR #1 (commit `361a47e`):

- Twenty sorting levels, with hidden contents from level 6 and five-slot jars from level 16.
- Eight upgrades: counter, sign, paint, shelves, plant, rug, lamp, and table, each with two or three styles.
- A 3D room, camera movement, Edit mode, placement constraints, rotation, and saved decoration choices.
- Device-local best scores, star spending, sound preference, and shop progress.
- A completion celebration and Bakery unlock. The Bakery currently opens a coming-soon message; it has no playable room.

## Next outcome: make it lovely

The next milestone is an art and camera polish pass on the existing shop. The desired result is a charming, readable miniature space with warmth, visual richness, and a satisfying transformation. Preserve the established puzzle and decorating mechanics.

The prior review described cropped room edges, a sparse and flat finished room, and small details that did not read well on phones. These are reported review findings to recheck in the browser, not a fresh visual assessment of this checkout.

See [the polish plan](POLISH_PLAN.md) for scope and acceptance criteria.

## History and delivery

The user supplied the earlier discussion: the first decorating PR was approved and merged; a subsequent polish agent stopped before opening a PR because its service usage was exhausted. The current Git history contains the decorating merge and no subsequent polish commit.

The earlier workflow used reviewable PRs with screenshots, followed by explicit merge approval. Continue that workflow for future implementation work unless the user directs otherwise. Only `main` publishes to the live site.
