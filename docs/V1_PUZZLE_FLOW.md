# Decopu — v1.0.0 3D tea-sorting puzzle flow

Recorded 2026-11-08 from the owner's latest step-by-step design description. This supplements the [game-design draft](V1_GAME_DESIGN_DRAFT.md) and [Stitch product map](V1_STITCH_PRODUCT_MAP.md). The proposed player experience is retained below; the final section distinguishes changes from released gameplay.

**Status: future design draft.** Recording it does not implement new rules, visuals, tools, currencies or rewards. The live game remains 0.3.1 with unchanged saves. This latest description clarifies free Undo and a matching top group, replacing the earlier draft's Undo-token suggestion and ambiguous single-layer wording within the v1.0.0 notes.

## 1. Artisanal colour-sort concept and setup

A Water Sort / Ball Sort-style logic puzzle presented as cylindrical apothecary glass jars filled with colourful dried botanicals on a sunlit wooden workshop table.

The supplied stage setup is:

- **4–6 glass jars** on the table.
- **Four capacity slots per jar**, holding up to four units/layers of leaves.
- Scrambled ingredients, with examples of golden **Chamomile**, roasted amber **Hojicha**, green **Sencha** and pink **Rose** petals.
- **One or two empty auxiliary jars** for tactical working room.

The 4–6-jar description updates the earlier draft's 4–5-jar sample. It is a proposed v1 setup, not a change to existing authored boards or a decision to remove their five-slot jars.

## 2. Select, lift and pour

The supplied illustration shows top Chamomile moving from Jar 1 onto matching Chamomile in Jar 2, with an empty auxiliary Jar 3:

```text
      [ Jar 1 ]                [ Jar 2 ]               [ Empty Jar 3 ]
    ┌───────────┐            ┌───────────┐              ┌───────────┐
    │ 🌼 Chamo  │ (Lifts Up) │           │              │           │
    ├───────────┤     └───►  ├───────────┤              ├───────────┤
    │ 🍃 Sencha │            │ 🌼 Chamo  │              │           │
    ├───────────┤            ├───────────┤              ├───────────┤
    │ 🍂 Hoji   │            │ 🌼 Chamo  │              │           │
    ├───────────┤            ├───────────┤              ├───────────┤
    │ 🌹 Rose   │            │ 🍂 Hoji   │              │           │
    └───────────┘            └───────────┘              └───────────┘
```

**Tap 1 — Select & Lift.** Tap a non-empty jar. In the proposed Babylon.js presentation, the jar floats up slightly, an amber selection ring glows and its cork opens. Detect the consecutive matching top block: if the top two layers are Chamomile, both are ready to pour together.

**Tap 2 — Pour.** Tap a destination. The supplied conditions are available space (fewer than four layers) and a matching top botanical or an empty destination.

- **Valid transfer:** a graceful 3D jar-tilt animation, dried petals showering into the destination, a gentle wooden/ceramic ASMR rattle, and the source returning to the table.
- **Invalid transfer:** the selected jar gently shakes, gives a subtle haptic buzz and settles back down.
- **Cancel selection:** tap the selected jar again to lower it without spending a move.

The latest text establishes the matching top group but does not explicitly settle what happens when the destination has some space but cannot fit the whole group. The existing whole-group-must-fit rule remains authoritative; partial splitting is not introduced by this description. Existing drag and keyboard paths are not removed by the tap walkthrough.

## 3. Pure jars, stage victory and teahouse payoff

**Jar completion — pure 4/4.** Filling all four slots with one botanical completes that blend. The proposed feedback is the cork returning, a golden ribbon seal, a soft sparkle and a completed-jar lock.

**Stage victory.** The draft clears a stage when every botanical required for its guest order has been sorted into a pure jar. How any other non-empty jars affect this condition remains to be specified; the released rule requires every non-empty jar to be full and monochrome.

**From puzzle to teahouse.** An example **“Serve Willow's Tisane (+180 ⭐)”** action triggers pure jars pouring into an iron kettle, rising steam and delivery to guests such as **Grandma Willow** or **Master Kenzo**.

Proposed rewards are:

- **Star Coins** to buy shop decor.
- **Moon Dew** to upgrade tea plants.
- Newly unlocked **folklore folios** in the Tea Book.

The +180 amount and star icon are a supplied UI example, not a priced reward or an approved conversion of existing stars. The relation between this Serve action, **Brew & Infuse** and the Tea Book's **Brew for Tea Bar** remains open. Current puzzle-completion rewards are not deferred, duplicated or replaced by recording this proposal.

## 4. Zen tools and zero pressure

- **No timers:** players do not lose stars or fail because of elapsed time.
- **Undo (Free):** step backward move by move when stuck. This latest clarification supersedes the earlier draft's “relaxed undo tokens”; retain current free, unlimited Undo unless explicitly changed later.
- **“+ Jar Slot”:** add an extra **empty canister**, rather than increase an existing jar's capacity. The source says this is available “if you run out of moves.” Clarify whether that means no legal transfers; the current game has no consumable move budget or move-cap failure. Cost, availability, repeat use and scoring effects are unspecified.
- **Cozy Hint:** highlight the best next move with a soft floating leaf trail. No solver, hint cost, frequency or guarantee of an optimal move is specified by the draft.

## Reconciliation and open implementation choices

| Topic | Current behavior | Latest draft / unresolved change |
| --- | --- | --- |
| Presentation | Jars remain stationary; matching pieces lift/follow the finger and settle | Whole-jar lift, cork opening, tilt and petal shower are proposed. This conflicts with the reviewed stationary-jar direction and needs a deliberate animation/input decision. Do not move hit targets during a gesture or let decorative animation decide a transfer. |
| Transfer rules | Entire consecutive matching top group must fit; drag, tap and keyboard controls | Latest draft agrees on the top group, but only states that some destination space is needed. Keep whole-group capacity and all existing controls until explicitly revised. |
| Capacity/content | Authored boards vary in jar count and use four- or five-slot jars; hidden contents remain private | Proposed 4–6-jar, four-slot botanical stages must be scoped separately. The omission of hidden pieces is not a decision to remove concealment or replace current flavour identities. |
| Completed jars | Completion is recognizable; full jars can remain legal sources under the existing engine rules | A physical lock is a rules change, not just a cork/ribbon effect. Define whether “locks” means visual sealing or inability to transfer, and verify solvability before changing the engine. |
| Victory and payout | Every non-empty jar must be full and monochrome; rewards recorded exactly once on puzzle completion | Order-based victory and a later serving payout are proposed. Define remaining-jar handling, replay accounting, cancellation/reload and where the reward is committed before implementing. |
| Extra jars | Existing board identities, histories, solvers and persisted unfinished puzzles use their authored shape | Adding a canister changes board shape and available solutions. Define Undo/Restart, persistence, scoring and level/backup compatibility before implementing the tool; do not silently mutate saved boards. |
| Hint guidance | Existing first-puzzle visual guidance and accessible instructions | A general “best next move” tool is new. Define its search/validation behavior, dead ends, runtime cost, reduced-motion leaf cue and accessible equivalent. |
| Economy | Earned stars, puzzle-score improvements and milestone bonuses; separate main/preview saves | Star Coins, Moon Dew, tea-plant upgrades, folklore unlocks and the +180 Serve example remain design inputs requiring economy decisions. No new currency, migration or reward path is implemented. |

These notes do not authorize an implementation or live UI/rule change. Existing no-fail-state, unlimited Undo, earned-star purchases, save isolation, scene disposal and phone accessibility requirements remain in force. Physical-iPhone startup/performance validation and human first-session testing are still pending.
