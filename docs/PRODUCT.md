# Decopu: product direction

## Experience

Decopu is a cozy, phone-first sorting puzzle that funds the restoration of a tiny isometric 3D tea shop. It should feel like a quiet moment: no clock, no fail state, unlimited Undo, and a welcoming room that becomes more personal through play.

The core loop is: solve a shelf → earn stars → preview and buy a decoration → arrange the shop → return to puzzles. Stars reward careful solutions rather than speed. Replaying improves a best score; it does not farm repeated rewards.

## Established decisions

- Finish a puzzle only when every non-empty jar is full of one type: four matching treats in standard jars, five in taller jars. Partial matching stacks must be consolidated.
- Use Babylon.js for a real 3D cutaway diorama, with an isometric-style view and an explicit Edit mode.
- Let players choose a visual style before buying. All existing included styles remain free to change after purchase.
- Make every decoration cost earned stars. Preserve achievable core completion and distinguish an unlock from a purchase.
- Preserve saved scores, purchases and layouts. Keep preview experiences separate from the released game.
- Make styles compatible through coherent scale, materials and complementary colours. Do not impose matching sets or bonuses that punish mixed styles.
- Let owned movable items be stored and placed again for free. Optional items can be returned for their full star price after confirmation; core completion pieces remain owned.
- Completing the future Bakery should unlock star-bought special pieces usable in the original tea shop. This refers to the second venue, not a group of tea-shop puzzles. The Bakery is not playable yet.

## Released baseline: 0.1.0

The baseline includes 38 puzzles, nineteen paid decoration designs plus five second copies, style previews, movable furniture, day/night lighting, zoom, image sharing, full-jar completion, a skippable guide and a tea-shop completion celebration. Progress is local, with manual backup/restore, previous-save recovery and an unfinished-puzzle save. There is no account or automatic cloud sync.

The original eight required designs cost 26 stars and control shop completion. The full catalogue costs 190 stars against 132 maximum earnings: 114 puzzle stars and 18 milestone bonuses. Optional items and second copies do not become completion requirements. A player finishing every puzzle with one star earns 56, enough for the core plus any one special piece. Optional returns allow players to try different collections over time without owning the entire catalogue simultaneously.

Milestones make Glass garden, Botanical triptych, Collector’s cabinet, Reading chair and Tea garden fountain available to buy at 8, 16, 24, 32 and 38 completed puzzles. Their prices are 10, 14, 18, 16 and 20 stars. Every included style comes with its purchase. The fountain is an indoor decoration; no yard is implemented.

The baseline uses restrained steam, shadows and animation, pauses background rendering, and preserves scene/material cleanup. The finished-shop demo and progress reset are development-preview controls. Players may still showcase and share their own room in the released game.

This baseline is recorded under the existing package version `0.1.0`; the next preview introduces a visible app version and formal release record. See [RELEASES.md](RELEASES.md) for scope and PR history.

## Approved second-edition direction

The owner approved a stronger art, interface and gameplay experience, starting with one redesigned shop, eight refined core decoration designs and ten authored puzzles. The aim is a beautiful little place the player owns, supported by satisfying sorting and a decoration they personally want.

The six approved tracks are:

1. Give the room, furniture and shopkeeper a coherent miniature identity with readable silhouettes and coordinated material treatments.
2. Make the puzzle board tactile and part of the same tea-shop world. Keep jars stationary while pieces lift, travel and settle; make hidden contents clear without exposing their colours.
3. Shorten the path from opening the shop to playing the next puzzle and decorating. Retain level browsing, use a compact contextual editor and accurate model-based previews, and unify typography, icons and spacing.
4. Support selecting an item and tapping its destination alongside dragging, with clear placement feedback, reachable Rotate and immediate Undo move.
5. Let players pin a desired decoration and see progress toward that goal. Add restrained reactions to room arrangements without rigid matching rules or compulsory layouts.
6. Author short puzzle sessions with quick satisfaction, interesting decisions, breathers and a finale. Use hidden contents selectively and retain full-jar completion, no fail state and unlimited Undo.

The first slice is `0.2.0-preview.1`, implemented and locally validated with hosting and owner review pending, at the development URL `/tea-shop/preview/?edition=2`. It uses separate saves and does not replace or migrate the released game. Its ten puzzles and milestone bonuses provide 26–46 stars against the 26-star core shop. [SECOND_EDITION.md](SECOND_EDITION.md) defines acceptance; [ROADMAP.md](ROADMAP.md) records delivery order. Full catalogue conversion, richer visitor behavior and longer puzzle arcs follow review of the slice.

## Validation and delivery

Review hosted phone builds before merging to main. Display a version in the app and maintain matching release notes, validation and PR status so feedback can identify the build. Version numbers do not grant merge approval.

Observe whether a player can independently choose a goal, solve a puzzle, preview a style, buy it, arrange it and return to browsing. Ask which decoration they want next and observe whether they voluntarily return to earn it. Correctness checks do not prove enjoyment or retention. Sorting remains the core; another minigame is not assumed necessary.

Prioritize a satisfying single-shop experience. Larger shops, full-game dark appearance, a playable Bakery, cloud progress and public galleries remain later work. Monetisation is deferred; no business model is selected. Earned-star progression remains separate from future real-money decisions.


The current first slice covers all six directions at limited scale: 24 model-rendered style thumbnails, next/unfinished-puzzle Play, pinned decoration-and-style goals, select-then-tap plus drag placement and one-step move/rotation Undo. The initial room reaction is a book/tea setting near a lamp and table. Richer visitors and full-catalogue art conversion follow review; they are not included in this preview. Package, Start screen and More show `0.2.0-preview.1` on this review branch, including its ordinary-preview mode; main remains the recorded `0.1.0` baseline.
