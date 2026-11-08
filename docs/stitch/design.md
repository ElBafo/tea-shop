---
name: Decopu
colors:
  surface: '#fef9ef'
  surface-dim: '#dedad0'
  surface-bright: '#fef9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3e9'
  surface-container: '#f2ede3'
  surface-container-high: '#ece8de'
  surface-container-highest: '#e7e2d8'
  on-surface: '#1d1c16'
  on-surface-variant: '#504535'
  inverse-surface: '#32302a'
  inverse-on-surface: '#f5f0e6'
  outline: '#837563'
  outline-variant: '#d5c4af'
  surface-tint: '#805600'
  primary: '#805600'
  on-primary: '#ffffff'
  primary-container: '#e8a838'
  on-primary-container: '#5f3f00'
  inverse-primary: '#fdba49'
  secondary: '#376847'
  on-secondary: '#ffffff'
  secondary-container: '#b6edc2'
  on-secondary-container: '#3b6d4b'
  tertiary: '#9c4328'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff997b'
  on-tertiary-container: '#7c2b12'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddaf'
  primary-fixed-dim: '#fdba49'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#614000'
  secondary-fixed: '#b9efc5'
  secondary-fixed-dim: '#9dd3aa'
  on-secondary-fixed: '#00210e'
  on-secondary-fixed-variant: '#1e5031'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#3a0a00'
  on-tertiary-fixed-variant: '#7d2c13'
  background: '#fef9ef'
  on-background: '#1d1c16'
  surface-variant: '#e7e2d8'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-sm: 0.75rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embraces an expressive, tactile toy-craft aesthetic designed for a cozy miniature tea-shop diorama experience. It blends the playful warmth of storybook illustration with the delightful physicality of handcrafted wooden blocks, glazed pottery, and soft-cornered game pieces. The emotional core is calm, joyful, and deeply satisfying—invoking the tactile satisfaction of placing a miniature ceramic cup onto a smooth wooden counter.

Visual pillars:
- **Tactile Wooden & Ceramic Toy Craft:** Interfaces behave like physical objects with soft beveled highlights, comforting weighted drop shadows, and pillowy press-down micro-interactions.
- **Warm Storybook Charm:** Gentle, welcoming, and artisanal without feeling infantile; structured clarity keeps puzzle-solving and inventory placement effortless.
- **Sensory Coziness:** Warm ambient tones, generous touch targets, and tactile button states invoke the feeling of an afternoon tea room.

## Colors

The palette draws inspiration from handcrafted tea-room rituals and organic materials:
- **Primary (`#E8A838` - Honey Amber Gold):** Radiant accent for key interactive targets, rewards, gold stars, and triumphant puzzle moments. Supported by a lighter honey bloom (`#F3C358`).
- **Secondary (`#4A7C59` - Matcha Leaf Green):** Fresh, grounding tea hue for success banners, progress dials, botanical decor tabs, and confirmation actions. Softened by matcha foam (`#68A279`).
- **Tertiary (`#C86446` - Steeped Rooibos / Terracotta):** Earthy clay warmth used for alerts, active purchase counters, hearth-side decor accents, and energetic badges. Softened by warm terracotta (`#E07A5F`).
- **Neutral Canvas (`#FFFDF9` to `#EFE6D5`):** Steamed milk parchment layers and chamomile cream surfaces that create a non-fatiguing, cozy backdrop.
- **Deep Glaze Indigo (`#2C3E50`):** Replaces harsh pure black with the character of dipped ceramic glaze, preserving readability and storybook charm.

## Typography

The type scale pairs the whimsical, hand-cut character of **Bricolage Grotesque** with the clarity and warm geometric proportions of **Be Vietnam Pro**.

- **Display & Headlines (Bricolage Grotesque):** Expressive carved-wood flair with bouncy letterforms that give shop titles, quest goals, and celebratory scoring a hand-stamped presence.
- **Body & Captions (Be Vietnam Pro):** Grounded, open, and friendly apertures keep dialogues, item stats, and inventory recipes crisp on small screens.
- **Labels & Badges:** Slightly tracked medium and bold weights maintain immediate readability when embossed or debossed on toy tokens.

## Layout & Spacing

Layouts follow a fluid, bottom-anchored structure prioritized for handheld thumb-zone comfort.

- **Grid & Margins:** A fluid 4-column layout on mobile devices (`gutter: 1rem`, `margin: 1rem`) expands to an 8-column layout on tablets with generous side padding to frame diorama stages.
- **Thumb Zone Ergonomics:** Decorating palettes, placement toggles, and tea-craft actions sit within the bottom 40% of the viewport. Top bars are reserved for passive resource tallies and quest badges.
- **Rhythm & Floating Island Cards:** Canvas content floats inside padded pill panels. Generous empty space prevents visual clutter, allowing players to focus on delicate furniture and miniature room details.

## Elevation & Depth

Visual hierarchy uses physical, game-piece layering rather than digital dropshadows:

- **Carved Wooden Basements:** Bottom-layer navigation and diorama backing trays use warm parchment tones (`#EFE6D5`) framed with 2px borders tinted with translucent Rooibos (`rgba(200, 100, 70, 0.12)`).
- **Physical "Squish" Elevation:** Tactile components utilize dual-offset shadows. An opaque, darker clay base line (`0 4px 0 #C48E2E` for honey buttons) paired with an ambient soft glow (`0 8px 16px rgba(44, 62, 80, 0.08)`).
- **Pressed State Depths:** When tapped, elements shift down (`transform: translateY(3px)`) while reducing bottom lip depth to `1px`, mimicking a physical wooden button click.
- **Frosted Glass Tea Jars:** Floating modal overlays and inventory drawers feature semi-translucent steamed milk (`rgba(255, 253, 249, 0.88)`) with `backdrop-filter: blur(12px)` and a soft 1.5px warm inner rim highlight.

## Shapes

The shape system strictly uses pill geometries and extra-soft continuous curves (`roundedness: 3`):

- **Core Buttons & Pills:** Pill-shaped (`rounded-full` / `9999px`) for action triggers, resource chips, and dialog badges.
- **Interactive Trays & Cards:** Extra-large curved corners (`2rem` to `3rem`) evoking smoothed, tumbled wooden blocks and slip-cast ceramics.
- **Icon Vessels & Item Slots:** Squircle and soft round-rect shapes (`1.25rem` radius) providing safe, snug frames for 3D miniature furniture thumbnails.

## Components

### Buttons
- **Primary Honey Button:** Pill-shaped with honey amber fill (`#E8A838`), glazed navy text (`#2C3E50`), a crisp bottom offset rim (`0 4px 0 #BD7E16`), and an inner top specular sheen (`inset 0 1px 0 rgba(255,255,255,0.4)`).
- **Secondary Matcha Button:** Pill-shaped matcha surface (`#4A7C59`) with cream text (`#FFFDF9`) and deep forest rim (`0 4px 0 #33593D`).
- **Tertiary Utility Button:** Chamomile parchment pill (`#F7F2E8`) with subtle border (`1.5px solid #EFE6D5`) and tactile press travel.

### Chips & Tea Tags
- Pill containers (`h-8`, `px-3`, `gap-1.5`) featuring circular icon badges.
- Selected state switches from cream paper (`#FFFDF9`) to rich amber or matcha glaze with white badge typography.

### Tea Trays & Diorama Cards
- Cards feature rounded corners (`2rem`), ivory-cream parchment backgrounds (`#FFFDF9`), and a subtle 1.5px warm outline (`#EFE6D5`).
- Catalog items float within debossed circular sockets featuring an inner shadow simulating a miniature display recess.

### Checkboxes & Toggle Knobs
- **Checkboxes:** Rounded wooden pegs (`12px` radius) displaying hand-painted matcha checkmarks on check.
- **Toggles:** Pill-shaped trough with an oversized circular ceramic bead that snaps with spring physics.

### Inputs & Quantity Pickers
- Fully rounded pill input fields with indented parchment backgrounds (`#EFE6D5`), glazed navy typography, and honey amber focus rings with warm diffuse halos.
- Incremental quantity pickers feature plus/minus wooden peg buttons hugging an ivory numeric counter.

### Modal Dialogs & Bottom Drawers
- Bottom inventory sheets glide smoothly upward with `rounded-t-[3rem]`, crowned with a short pill grab-handle reminiscent of a wooden stirring stick.