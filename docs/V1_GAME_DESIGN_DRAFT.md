# Decopu (デコプ) — Complete Game Design Document & Gameplay Specification

Recorded 2026-11-08 from the owner's follow-up v1.0.0 design text. Sections 1–5 below preserve the supplied draft. This expands the [Stitch product map](V1_STITCH_PRODUCT_MAP.md); it does not establish that the proposed systems are implemented or settle conflicts with existing game decisions. See the reconciliation notes after the supplied draft and [ROADMAP.md](ROADMAP.md).

**Status:** v1.0.0 design draft, retained for planning. The live release remains 0.3.1. No gameplay, save, deployment or version change is made by recording it.

Visual reference: the owner's original [Stitch design.md](stitch/design.md) is archived unchanged. Its [separate integration notes](stitch/README.md) retain provenance and distinguish the supplied colour/type/component specifications from implementation choices.

## 1. Executive Summary & Vision
- **Title:** Decopu (デコプ)
- **Genre:** Cozy Tactile Diorama + Color-Sort Puzzle + Room Customization
- **Platform:** Mobile (iOS / Android), Portrait Viewport-Locked (~390 × 844)
- **Target Audience:** Fans of *Good Pizza Great Pizza*, *Animal Crossing: Pocket Camp*, *Boba Story*, *Cats & Soup*, and *Water Sort Puzzle*.
- **Core Hook:** A deeply atmospheric Japanese/Botanical teahouse diorama paired directly with a satisfying, tactile color-matching tea sort puzzle. Every tea you sort is brewed directly for cozy animal and human patrons who visit your miniature room.

---

## 2. Core Game Loop
```
┌─────────────────────────────────────────────────────────────┐
│ 1. VISITOR ARRIVES AT DIORAMA                               │
│    Patron sits at tatami table with a tea craving           │
│    (e.g. Master Kenzo orders "Smoked Cedar Hojicha")        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PLAY THE TEA SORT TRAY (At the bottom of the screen)    │
│    Sort scrambled tea leaf segments between glass tubes     │
│    until pure jars of each tea blend are assembled          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BREW & SERVE                                             │
│    Tap "Brew & Infuse" to steep pure batches into hot pots   │
│    Deliver tea to patron -> Earn Star Coins & Moon Dew      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. UPGRADE & EXPAND                                         │
│    Buy furniture, unlock lighting moods (Morning/Dusk/Night)│
│    Upgrade shop to Grand Conservatory, unlock new guests    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Explaining the Tea Sorting Puzzle (How it Works)
The tea sorting minigame is inspired by classic logic sorting (like *Water Sort Puzzle* or *Ball Sort Puzzle*), reimagined with tactile artisanal tea jars:

1. **The Setup:**
   - Players have 4 to 5 glass cylindrical tea canisters.
   - Each jar contains 4 stacked segments of dried tea leaves (e.g., Green Sencha, Roasted Amber Hojicha, Pink Sakura petals, Golden Genmai).
   - At the start of a puzzle, the leaves are scrambled across the jars.
2. **The Rules & Mechanics:**
   - **Tap to Lift:** Tapping a jar lifts its top layer of tea leaves.
   - **Tap to Pour:** Tapping another jar pours those leaves into it, **only if**:
     1. The destination jar has available room (maximum capacity is 4 segments).
     2. The receiving jar's top layer matches the color/type of the tea you are pouring, OR the destination jar is empty.
3. **Winning the Round:**
   - When each jar is filled exclusively with 4 matching segments of a single tea (e.g., a pure 4/4 Sencha jar, a pure 4/4 Hojicha jar), that blend is complete!
   - Tapping **"Brew & Infuse"** transforms completed jars into fragrant teapots that fulfill active guest orders, rewarding Star Coins, friendship hearts, and unlocking recipes in the Tea Book.

---

## 4. Screen Architecture & Navigation
- **Primary Screen (The Living Diorama Hub):**
  - **Top Bar:** Level, Currency (Star Coins, Moon Dew), Ambient Audio toggle, Settings.
  - **Mood Strip:** Morning Sun ☀️, Amber Dusk 🌅, Rainy Calm 🌧️, **Starry Midnight 🌙** (Night Mode).
  - **Guest Notification Pill:** Shows waiting guest orders with direct 1-tap serving.
  - **Center Diorama:** Interactive 3D room with guest animations, kettle steam, glowing lanterns, and spatial tap pins.
  - **Bottom Sorting Drawer:** The active tea tube puzzle with move counters, Undo, and Hint helpers.
  - **Persistent Bottom Nav:**
    1. 🏮 **My Shop:** Shop upgrade tiers, stats, and revenue.
    2. 🍵 **Brew & Sort:** Dedicated full-screen puzzle stages and rare ingredient mortar blending.
    3. 🪴 **Decorate:** Room furniture catalog, tatami mats, scroll paintings, and seasonal lanterns.
    4. 📖 **Tea Book:** Guest friendship scrapbook, letters, and unlocked botanical recipes.

---

## 5. Progression & Monetization / Meta-Game
- **Zero-Pressure Philosophy:** No timer-based game-overs; puzzles use move counts with relaxed undo tokens.
- **Progression Milestones:**
  - *Tier 1:* Cozy Tatami Teahouse (Starter).
  - *Tier 2:* Kyoto Bamboo Garden Pavilion.
  - *Tier 3:* Grand Botanical Conservatory (Two-story glass sunroom).
- **Seasonal Events:** Autumn Harvest Moon Festival, Sakura Blossom Bloom, Winter Solstice Yuzu Infusion.

---

## Tea Book — follow-up design detail (2026-11-08)

The owner supplied this further description for the v1.0.0 notes. **Tea Book**, the proposed 📖 bottom-navigation tab, is the character's master botanical compendium and guest relationship journal. It has two connected roles, with the blending workshop supporting recipe creation. These are design concepts, not released features. Counts, quantities, percentages, ranks and reward amounts below are draft values/examples, not a balanced economy or confirmed content inventory.

### Tea Grimoire / Recipe Compendium — crafting and master recipes

- **Recipe catalogue and formulas:** track a proposed catalogue of **42 blends**, including unlocked and undiscovered entries. Named examples: **Sencha**, **Smoked Cedar Hojicha**, **Midnight Bloom Tisane**, **Sunset Berry**, **Matcha Cloud Supreme** and **Golden Pear Oolong**.
- **Botanical ingredients and harvesting requirements:** show required ingredients and available/required tallies, for example **Sun Hibiscus 3/3**, **Wild Rose 2/2** and **Honeycomb 1/1**, plus exact steeping conditions such as temperature, time and tipping bonuses. No final steeping durations, temperature table or bonus formulas were supplied.
- **Direct “Brew for Tea Bar” action:** after pure canisters have been sorted in the diorama or ingredients mortar-ground in the workshop, brew from the Grimoire to serve in the teahouse. The relationship between this action and the earlier **Brew & Infuse** action, and the eligibility/consumption rules for each input, remain to be specified.
- **Botanist mastery progression:** a completion bar toward **Master Herbalist**; the supplied example is **42% Complete** and a **+500 Star Coins** reward. The 42% display is an example progress value, distinct from the proposed 42-blend catalogue size. The final milestone threshold and reward accounting are unresolved.

### Guest Scrapbook & Story Log — patron friendships and lore

- **Villager and patron profiles:** friendship ranks/meters, including **Pippa Hedgehog — Soul Teammate**, **Grandma Willow** and **Poet Matsuo**.
- **Patron favourites and rare decor gifts:** favourite brews could grant a **+25% coin tip multiplier**; record memorable gifts such as the **Hand-carved Acorn Stirrer**. Gift ownership, whether gifts are usable decorations or journal keepsakes, and their relationship to the current star-priced catalogue remain unresolved.
- **Memory snapshots:** a storybook photo album with moments such as **“First Sip in Rain”** and **“Midnight Poetry.”**
- **Village Tea Mailbox:** a postal drawer for personalized thank-you letters and herbal gifts from animal and human patrons. Whether letters are authored or generated is not settled by this description; the earlier Stitch map separately proposes AI-generated correspondence.

### Supplied Stitch canvas screen references

The source reports these screens as already created on the Stitch canvas. Their titles and identifiers are recorded as references only: no canvas access, screenshots, exports or playable implementations were supplied or independently verified in this note-taking task.

| Screen reference | Supplied title | Described content |
| --- | --- | --- |
| `SCREEN_44` | Decopu — Tea Book Compendium | Botanical grimoire with master recipes, ingredient tallies, lore snippets, **All Blends / Herbal / Ceremonial** filter tabs and rarity tiers |
| `SCREEN_19` | Decopu — Guest Friendship & Story Log | Storybook scrapbook with guest friendship meters, photo polaroids and letter mailbox |
| `SCREEN_24` | Decopu — Artisanal Blending Workshop | Tactile apothecary workbench where mortar and pestles crush dried leaves into compendium recipes |

No recipe, ingredient, friendship, gift, mastery, tipping or brewing system is implemented by retaining these notes. Steeping time is proposed recipe context; it does not authorize a timed puzzle/failure mechanic or alter unlimited Undo. New currency/serving rewards remain subject to the economy decisions below, and existing local saves are unchanged.

## Latest puzzle-flow follow-up (2026-11-08)

[V1_PUZZLE_FLOW.md](V1_PUZZLE_FLOW.md) records the owner's subsequent step-by-step walkthrough: 4–6 jars, four-slot botanical stacks, the consecutive matching top group, jar lift/tilt/corks, pure-jar ribbon locks, a Serve payoff and Zen tools. Within the v1.0.0 draft, its **free Undo** supersedes the earlier token wording, and the **matching top group** clarifies the earlier ambiguous “top layer.” The original five-section source above remains intact for traceability. Stationary versus moving jars, actual completion locks, extra jars, general hints, order-based wins and serving rewards still require explicit design decisions before changes to released gameplay.

## Reconciliation with the released game — project notes

The supplied draft adds a direct visitor → sort → brew/serve → upgrade loop and a more specific Japanese/botanical setting. Preserve these ideas for v1.0.0 exploration. The following differences need explicit design decisions before implementation; the source wording above is retained so those decisions remain traceable.

| Topic | Released behavior / existing decision | Draft proposal and unresolved choice |
| --- | --- | --- |
| Undo and pressure | Unlimited Undo; no clock or fail state | The original “relaxed undo tokens” wording is superseded by the latest puzzle-flow follow-up's free Undo. No token restriction is planned from this draft; current unlimited Undo remains. |
| Currency and rewards | Earned stars from puzzle completion and best-score improvements, with milestone bonuses and no repeat-win farming | Star Coins, Moon Dew, friendship hearts and serve-triggered rewards are proposed. Decide whether Star Coins rename stars, what Moon Dew does, and how serving relates to existing exactly-once rewards. No new currency or reward trigger is implemented. |
| Transfers and controls | Drag or tap moves the entire consecutive matching top group, which must fit | The latest puzzle-flow follow-up clarifies the consecutive matching top group. Whole-group capacity, drag and keyboard support remain authoritative; the tap walkthrough does not remove them. |
| Board shape and completion | Authored boards have varying jar counts and four- or five-slot capacity; every non-empty jar must be full and monochrome, while empty jars are allowed | The draft describes 4–5 jars, four-slot capacity and “each jar” full. Clarify whether this describes an introductory sample or a proposed rules/content change. Existing board identities and saved puzzles remain unchanged. |
| Pieces and flavours | 3D paper sachets and existing authored tea/treat identities | Dried-leaf segments, Sencha, Hojicha, Sakura and Genmai are proposed art/content directions; no replacement catalogue is approved or implemented here. |
| Guests and brewing | Ambient guests, no functional guest-order/serving/friendship/recipe economy | Animal and human patrons, Master Kenzo, cravings, Brew & Infuse, friendship and recipe unlocks are new proposed systems. Define how play works when no guest/order is available and how completed batches are handled. |
| Shop and navigation | Reviewed room-first home, separate puzzle screen, explicit Edit, star-priced furniture and free included styles | Simultaneous diorama/sorting drawer, four bottom tabs, progression tiers, stats/revenue and hint helpers need scope and phone-fit review. Define the relation between the hub tray and full-screen puzzle stages. |
| Ambience and venues | Existing day/night shop appearance; broader themes/rooms remain future work | Four named mood presets, unlockable lighting, three venue tiers and seasonal events are proposed. Specify appearance versus mechanical progression and whether the pavilion is a room or a separate venue. Bakery remains a placeholder. |
| Platform and monetisation | Browser/PWA release with local saves, separate main/preview namespaces, no accounts or selected monetisation model | Mobile iOS/Android is a target, not a native-store release decision. Section 5 supplies no actual monetisation model; none is inferred from its heading. |

The earlier [Stitch product map](V1_STITCH_PRODUCT_MAP.md) remains complementary context for AI, community and narrative ideas; their omission from this follow-up draft does not establish cancellation or v1.0.0 inclusion. Final scope, economy, art direction, data/backend architecture and delivery order remain unresolved. Current startup reliability and human/physical-device validation priorities continue.
