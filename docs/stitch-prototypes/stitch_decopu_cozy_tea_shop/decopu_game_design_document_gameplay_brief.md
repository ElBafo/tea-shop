# Decopu (デコプ) — Complete Game Design Document & Gameplay Specification

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
