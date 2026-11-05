# Decopu: product direction

**Released: [Decopu 0.2.0](https://elbafo.github.io/tea-shop/).** [PR #16](https://github.com/ElBafo/tea-shop/pull/16) merged as `966c613fa486c9ce34dd1cf5f8bb9ac4a5905d3c`; [Pages run 42081278504](https://github.com/ElBafo/tea-shop/actions/runs/42081278504) passed. Main opens the second edition with fresh production progress and normal onboarding. Progress earned afterward saves normally; physical iPhone family testing remains pending.

## Experience

Decopu is a cozy, phone-first sorting puzzle that funds the restoration of a tiny isometric 3D tea shop. It should feel like a quiet moment: no clock, no fail state, unlimited Undo, and a welcoming room that becomes more personal through play.

The core loop is: solve a shelf → earn stars → preview and buy a decoration → arrange the shop → return to puzzles. Stars reward careful solutions rather than speed. Replaying improves a best score; it does not farm repeated rewards.

## Established decisions

- Finish a puzzle only when every non-empty jar is full of one type: four matching treats in standard jars, five in taller jars. Partial matching stacks must be consolidated.
- Use Babylon.js for a real 3D cutaway diorama, with an isometric-style view and an explicit Edit mode.
- Let players choose a visual style before buying. All existing included styles remain free to change after purchase.
- Make every decoration cost earned stars. Preserve achievable core completion and distinguish an unlock from a purchase.
- Preserve saved scores, purchases and layouts within each edition. The owner explicitly chose a fresh production start for 0.2.0, using a new namespace while leaving older data untouched. Keep preview experiences separate from the released game.
- Make styles compatible through coherent scale, materials and complementary colours. Do not impose matching sets or bonuses that punish mixed styles.
- Let owned movable items be stored and placed again for free. Optional items can be returned for their full star price after confirmation; core completion pieces remain owned.
- Completing the future Bakery should unlock star-bought special pieces usable in the original tea shop. This refers to the second venue, not a group of tea-shop puzzles. The Bakery is not playable yet.

## Approved interaction preview — 0.2.1-preview.1

Family testing identified an expectation to drag tea pieces from one jar to another. The owner approved adding this gesture alongside tapping and keyboard controls, with the available matching top group following the finger and legal destinations highlighted. Jars stay stationary. A valid drop follows the same move, scoring and Undo rules; an invalid or cancelled drag does not spend a move. Hidden contents remain concealed, and the whole group must fit.

The implemented graphics direction is more tangible rounded pieces, clearer glass, consistent highlights and soft contact shadows, with calm lift/landing feedback. Screwdom is the owner's visual reference. This preview keeps the cozy palette, current puzzle/economy definitions and existing progress. Implementation and the final build are complete; final touch/browser regressions and hosting are pending. The main release remains 0.2.0 until review and merge approval.

The first guided puzzle must communicate the action visually beside the jars. A hand and brief bubble demonstrate a legal source-to-destination drag; tapping a source changes the cue to its destination. The cue hides during real dragging, cannot intercept input, respects reduced motion and leaves Skip available. This addresses family feedback that highlighted jars and small top-of-screen instructions were not understood.

## Production activation — 0.2.0

The owner clarified: “I don’t care about keeping the progress. My wife should check it out like a new installation.” This supersedes the proposed migration, import and edition-choice work for this release.

The main link opens the second edition directly, with a fresh production namespace and the normal Start and first-time guide. It does not copy classic or preview scores, purchases, unfinished puzzles, goals or preferences. Existing keys remain untouched and unused by the default game. This is a one-time fresh start for the new production edition; progress earned afterward saves normally across reloads and later visits.

The release uses the reviewed twenty-four puzzles and eighteen paid decoration designs, with fifty-four included styles/model thumbnails. Earnings remain 44–92 stars, the eight-piece core costs 26, and the full catalogue costs 138. Reading chair still unlocks at twenty-four completions for 16 stars. No puzzles, prices, bonuses, guest rules or purchase mechanics are added in this activation pass.

Preview and production progress stay separate. A new account system, automatic import, progress translation and edition chooser are outside this fresh-start release. Main provides the normal onboarding and persistence experience, with no development reset or completed-room demo. Activation verification and production deployment passed after the owner approved PR #16. Family testing is next.

## Classic baseline: 0.1.0 (historical)

The baseline includes 38 puzzles, nineteen paid decoration designs plus five second copies, style previews, movable furniture, day/night lighting, zoom, image sharing, full-jar completion, a skippable guide and a tea-shop completion celebration. Progress is local, with manual backup/restore, previous-save recovery and an unfinished-puzzle save. There is no account or automatic cloud sync.

The original eight required designs cost 26 stars and control shop completion. The full catalogue costs 190 stars against 132 maximum earnings: 114 puzzle stars and 18 milestone bonuses. Optional items and second copies do not become completion requirements. A player finishing every puzzle with one star earns 56, enough for the core plus any one special piece. Optional returns allow players to try different collections over time without owning the entire catalogue simultaneously.

Milestones make Glass garden, Botanical triptych, Collector’s cabinet, Reading chair and Tea garden fountain available to buy at 8, 16, 24, 32 and 38 completed puzzles. Their prices are 10, 14, 18, 16 and 20 stars. Every included style comes with its purchase. The fountain is an indoor decoration; no yard is implemented.

The baseline uses restrained steam, shadows and animation, pauses background rendering, and preserves scene/material cleanup. The finished-shop demo and progress reset are development-preview controls. Players may still showcase and share their own room in the released game.

This baseline is recorded under the existing package version `0.1.0`; preview.1 introduced a visible app version and formal release record. See [RELEASES.md](RELEASES.md) for scope and PR history.

## Approved second-edition direction

The owner approved a stronger art, interface and gameplay experience, starting with one redesigned shop, eight refined core decoration designs and ten authored puzzles. The aim is a beautiful little place the player owns, supported by satisfying sorting and a decoration they personally want.

The six approved tracks are:

1. Give the room, furniture and shopkeeper a coherent miniature identity with readable silhouettes and coordinated material treatments.
2. Make the puzzle board tactile and part of the same tea-shop world. Keep jars stationary while pieces lift, travel and settle; make hidden contents clear without exposing their colours.
3. Shorten the path from opening the shop to playing the next puzzle and decorating. Retain level browsing, use a compact contextual editor and accurate model-based previews, and unify typography, icons and spacing.
4. Support selecting an item and tapping its destination alongside dragging, with clear placement feedback, reachable Rotate and immediate Undo move.
5. Let players pin a desired decoration and see progress toward that goal. Add restrained reactions to room arrangements without rigid matching rules or compulsory layouts.
6. Author short puzzle sessions with quick satisfaction, interesting decisions, breathers and a finale. Use hidden contents selectively and retain full-jar completion, no fail state and unlimited Undo.

The first slice, `0.2.0-preview.1`, was implemented, validated and hosted; the owner responded “Looks good. Continue pls.” This accepts the direction and authorizes further preview work, not a merge. The development URL is `/tea-shop/preview/?edition=2`. It uses separate saves and does not replace or migrate the released game. Its ten puzzles and milestone bonuses provide 26–46 stars against the 26-star core shop. [SECOND_EDITION.md](SECOND_EDITION.md) defines acceptance; [ROADMAP.md](ROADMAP.md) records delivery order. Preview.2 added six optional designs, preview.3 corrected paid wall finishes, and preview.4 added ambient visits. The owner reviewed traffic positively and deferred movement/visitor-cast polish. Preview.5 added six more puzzles and two special designs and passed validation and hosting. The owner then said “Continue.” Preview.6 delivered the requested guest movement and visitor-cast polish and passed validation and deployment. The owner responded “Looks good. Proceed.” Preview.7 continues the single-shop puzzle/reward journey with four more puzzles and Collector’s cabinet. Local validation and deployment passed. The owner then said “Continue.” Preview.8 now extends the journey with four more puzzles and Reading chair, including safe seating for existing visitors; its implementation and validation passed before source integration in PR #15.

## Validation and delivery

Review hosted phone builds before merging to main. Display a version in the app and maintain matching release notes, validation and PR status so feedback can identify the build. Version numbers do not grant merge approval.

Observe whether a player can independently choose a goal, solve a puzzle, preview a style, buy it, arrange it and return to browsing. Ask which decoration they want next and observe whether they voluntarily return to earn it. Correctness checks do not prove enjoyment or retention. Sorting remains the core; another minigame is not assumed necessary.

Prioritize a satisfying single-shop experience. Larger shops, full-game dark appearance, a playable Bakery, cloud progress and public galleries remain later work. Monetisation is deferred; no business model is selected. Earned-star progression remains separate from future real-money decisions.


The reviewed first slice covered all six directions at limited scale: 24 model-rendered style thumbnails, next/unfinished-puzzle Play, pinned decoration-and-style goals, select-then-tap plus drag placement and one-step move/rotation Undo. The initial room reaction is a book/tea setting near a lamp and table. The published continuation, `0.2.0-preview.2`, is hosted for owner review after passing build, verification and browser checks. Physical-phone acceptance remains pending. The preceding hosted fix identifies `0.2.0-preview.3`; build, browser validation and hosting passed, and the owner accepted continuing. The preceding build was `0.2.0-preview.4`, positively reviewed with guest polish follow-ups. Preview.5 added the next puzzle/reward session and passed validation and deployment. Preview.6 passed build, verification, browser checks and deployment; the owner reviewed it positively and said “Looks good. Proceed.” The latest hosted build is `0.2.0-preview.7`, with local validation and deployment passed. The owner said “Continue,” authorizing preview.8. Main remains the recorded `0.1.0` baseline.


## Approved continuation: 0.2.0-preview.2

Expand the prototype to fourteen designs by refining six existing optional items: art and bench unlock after 3 completed puzzles, clock and trolley after 6, basket and planter after 10. Their respective prices stay 8/6, 10/8 and 12/10 stars. Each has three included styles and accurate model thumbnails. The ten boards and edition save namespace remain unchanged.

The optional pieces add 54 stars to the 26-star core catalogue. Earnings remain 26–46; a player cannot own all 80 stars of decorations at once. Full-value optional returns support experimentation and protect the ability to recover stars for unfinished core items. Unlocks remain paid purchase availability. Goal labels now distinguish unlock requirements from affordability and suggest optional returns once no further stars can be earned. After all ten puzzles, players see “Improve your scores”, or “Revisit puzzles” at all three-star scores; unfinished puzzles still take priority.

A stationary seated guest is implemented when counter and table are both placed. It follows the table and is hidden while decorating or when either piece is stored. The owner also requested a later phase of guests arriving, browsing, ordering, sitting and leaving. The owner explicitly confirmed that all guests must be hidden during Edit and react to actually placed shelves, counters, tables and cozy reading corners. Recompute valid positions and activities after Edit; use reachable paths and available seats, with alternate activities when furniture is stored or blocked. Visits remain calm and optional. Initially they add no queues, deadlines, mandatory matching rules, save state or star rewards. Valid paths, occupancy, occlusion, moved/stored furniture, reduced motion and mobile performance must be verified before claiming guest traffic works. Preview.2 is not a full visitor simulation.

Arrival frequency will respond to the number of actually placed decorations, including fixed paint and excluding stored pieces. A sparse shop should receive occasional guests at configurable intervals; a well-furnished shop should usually have one or two guests, with an initial population cap of two. The eight core decorations must be enough to reach that livelier target: buying all fourteen designs or matching styles is not required. Reachable paths and available activity/seat slots take precedence over the occupancy target. Exact intervals and thresholds remain for phone-preview tuning; no specific number of minutes is agreed.

## Paid wall finish correction — 0.2.0-preview.3

The starting room must not receive decorative wall panels or dado rails before purchase. Those details, wall colour and curtains belong to the existing three-star wall upgrade. Free style previews may show the complete finish, but cancellation restores the owned room and only a purchase makes the finish persistent. Basic room structure remains visible. This is a hosted correction with positive continuation feedback and no price or save changes. Guest traffic shipped in preview.4; the next milestone extends the puzzle/reward journey.

## Ambient visits — 0.2.0-preview.4 hosted; continuation accepted

The local preview now has calm guest arrivals, activities and departures with a cap of two. Guests enter through an open cutaway edge, browse reachable shelves, order from the front of the counter, sit at reachable table/bench seating or look around, then leave. Occupied or blocked activities are skipped, and a narrow exit can shorten a visit. The old stationary guest is replaced by two reusable, distinct visitor figures; only one transits at a time.

Unique decorations actually on display increase arrival frequency, with paint included, stored/duplicate items excluded and the core eight sufficient for the busiest setting. Styles do not alter frequency. Initial timing is four active seconds for the first eligible visit, then recurring intervals that scale from 70–100 seconds in an empty room to 9–14 seconds with eight or more displayed designs. Valid paths, free activity places and the cap can delay arrival; a furnished room is not guaranteed to have a fixed occupancy at every instant.

All visitors disappear and visits reset during Edit. The clock pauses and valid routes are recomputed afterward without an introductory burst. Reduced motion keeps quiet stationary activities with no travel or bobbing. Hidden pages pause the simulation. No queues, deadlines, mandatory servicing, rewards, penalties or saved guest state are introduced; the existing puzzle economy and progress remain unchanged.

Production build, all verification checks, final browser traffic/lifecycle checks and the paid-wall regression passed. Deployment passed and the owner reviewed positively; [RELEASES.md](RELEASES.md) records evidence and screenshots. Two separate guest follow-ups are agreed: less stiff walking with smoother turns, and a broader visitor cast including women and children. They were deferred through preview.5, delivered in preview.6 and reviewed positively. The visitors remain ambience, not a customer-service game.

## Next puzzle session and special pieces — 0.2.0-preview.5 implemented

Six authored puzzles, 11–16, extend the same shop while retaining the first ten definitions, scores and milestone bonuses. Afternoon ritual and A room of your own alternate decisions with breathers. One new puzzle uses hidden contents, and the final three introduce five-slot jars. Glass garden (10 stars, unlock after 13 completions) and Botanical triptych (14 stars, after 16) each have three edition styles compatible with existing furniture.

A four-star completion bonus at 16 raises total earnings to 36–68. The core costs 26 and the sixteen-design catalogue costs 104. Minimum finishes fund the core plus Glass garden; higher scores and optional full-price returns support different choices. Unlocks never grant free furniture. The remaining three special designs, guest polish and later venues remain outside this milestone.

The same edition save namespace preserves purchases, styles, placement, goals and unfinished puzzles. Existing ten-entry scores/moves gain six empty entries. Legitimate ten-board edition backups remain supported alongside new sixteen-board files, while classic imports and locked ownership are rejected. New backup exports identify their edition.

The shopkeeper appears as soon as the second-edition counter is placed, without requiring a finished core room. He stands behind it in the working aisle and follows its orientation. Free previews show him temporarily; cancelling or storing the counter hides him, while buying, restoring or reloading a placed counter shows him. Capacity-aware portrait sizing addresses five-slot jar clipping at 320×568. These changes are preserved while preview.6 addresses guest gait and the visitor cast.

The final production build, all required verification, model lifecycle checks and the full session browser suite passed. These checks cover preserved progress, actual unlock/win/purchase flows and the counter visibility transitions. Existing onboarding/choices regressions and the focused small-phone shelf overflow check also pass. Local validation is complete. Hosted deployment passed; owner phone review remains pending. [RELEASES.md](RELEASES.md) records evidence and screenshots; automation does not establish physical iPhone performance or retention.

## Guest movement and visitor variety — 0.2.0-preview.6 hosted; continuation accepted

Room life now has six recognizable profiles: two adult women, two adult men and two children. Appearance stays stable for each visit; the roster cycles across room lifetimes within a session. Children have distinct proportions and sensible floor/seat contact, including shorter legs that can dangle from adult seating.

Walking uses bending knees and elbows, distance-driven steps and smoother visual turns while retaining the exact safe traffic paths. Two reused rigs preserve arrival rates, the two-visitor cap, Edit hiding, static reduced motion and background pause. The pass adds no lights, room-shadow casters, timers, guest rewards or persistent customer state.

The sixteen puzzles, paid catalogue, economy, save schema and first-counter shopkeeper remain. Build, package verification, independent source/geometry review and final browser checks pass, including fresh onboarding and immediate shopkeeper appearance after the first counter purchase. Phone day/night/Edit views and room poses were inspected; [RELEASES.md](RELEASES.md) includes screenshots and fixed-step walking evidence. Local validation and hosted deployment passed. The owner reviewed preview.6 positively before requesting continuation; the preview URL now serves preview.7. Preview.7 takes up Collector’s cabinet and four more puzzles; the other special designs and later venues remain future work. This feedback is not a merge instruction or measured performance evidence.

## A collector’s next goal — 0.2.0-preview.7 hosted; continuation authorized

Four authored puzzles, 17–20, continue the same tea shop while preserving every earlier board identity and the player’s progress. The Treasures to keep arc moves through a short consolidation, decisions about matching groups, one hidden jar and a tall-jar finale. Existing four-/five-slot rules, calm pacing and unlimited Undo remain.

Collector’s cabinet becomes available to buy after twenty completions for 18 stars, with Jade atelier, Blue porcelain and Rose salon included. One broad jade arch, twin blue porcelain bays and a lower bowed rose crown give the styles different silhouettes that still mix with earlier furniture. Preview it freely before buying, and use full-value optional returns to reconsider a room.

The catalogue has seventeen designs costing 122 stars; the core remains 26. Keep the existing 20 milestone-bonus stars and add none at twenty. Total earnings become 40–80: minimum finishes fund the core plus a 14-star Botanical triptych, while the core and cabinet together need four additional score stars. Rarity comes from collecting choices and better scores, with no new currency, repeated reward farming or monetisation.

Ten- and sixteen-board edition saves/backups preserve current ownership and layouts, goals, preferences, guide, recovery and unfinished puzzles when extended to twenty boards. Final browser checks pass real progression and cabinet unlocks, all styles and purchase/return/placement paths, old backup continuation, onboarding and guest safety. New puzzles fit the checked phone, landscape and desktop sizes; a short-portrait padding fix prevents a stray scrollbar beneath the finale’s two-line title while keeping its full artwork. The final production rebuild, package verification, independent logic/compatibility review and model lifecycle checks also pass. Local validation and hosted deployment passed. The owner authorized continuation; Reading chair is now part of preview.8, while Tea garden fountain, new venues and cloud accounts stay later work.

## Reading corner — 0.2.0-preview.8 locally validated

Four more authored puzzles, 21–24, continue the same calm shop journey. Preserve every first-twenty board identity and existing reward, along with full jars, unlimited Undo and no timer or fail state. Reading chair becomes available to buy after twenty-four completions for 16 stars, with three included styles designed to mix with the current collection.

Let existing visitors sit in a reachable placed chair, using the current seated pose and visitor pool. Safe access, rotation, style-specific seating geometry and available space take precedence; stored or blocked furniture cannot create an activity. This makes a chosen reading corner useful without adding service tasks, guest rewards or saved customer state.

The target catalogue has eighteen designs, fifty-four actual-model thumbnails and a 138-star total. The core stays at 26 and bonuses remain twenty, giving 44–92 total earnings. Minimum finishes leave eighteen after the core, so Reading chair and Collector’s cabinet are affordable alternative goals. There is no new bonus at twenty-four, and optional full-price returns continue to support experimentation.

Keep the same edition namespace, existing ownership/layouts, goals, preferences, recovery and unfinished play. Known ten-, sixteen- and twenty-board backups remain compatibility requirements when extending to twenty-four. Implementation, validation and hosting are pending; Tea garden fountain, further arcs, later venues, cloud accounts and monetisation remain later work.
