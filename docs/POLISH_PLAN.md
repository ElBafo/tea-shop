# Shop art and camera polish

Status: the original art, mobile UI, and inventory passes have shipped after phone review. The owner has prioritised another cozy polish pass and zoom before further catalogue expansion. See [ROADMAP.md](ROADMAP.md) for the current delivery status.

## Current pass

- Softer daytime lighting preserves wood, fabric, and ceramic colours; warm lamps remain readable at night.
- Gentle teapot steam respects reduced-motion preferences and cannot intercept taps.
- Pinch, wheel, and compact minus/Fit/plus controls zoom the diorama with bounded framing. Fit restores the whole-room view.
- Two-finger gestures cancel unfinished decoration moves; test regular dragging immediately afterward.
- The already-built paid bench, trolley, and tall planter collection provides more furnished compositions, with eight new puzzles funding its cost.

Preview review must include phone day/night views, zoomed details, Edit mode, landscape, and desktop. Main retains the approved inventory release until this preview is approved.

## Priorities

1. **Frame the room clearly.** Keep the complete cutaway room visible while making it large enough to enjoy on a phone. Resolve the tension between zooming in and cropping through responsive camera framing, not zoom alone. Check the room with the shop controls visible.
2. **Improve silhouettes and readability.** Make furniture chunkier and more charming. Ensure the sign, upgrade details, and selected pieces read at phone size. Keep drag targets usable.
3. **Strengthen the glow-up.** Give the starting room a dusty, subdued appearance while keeping it readable. Make each purchased upgrade produce an obvious visual improvement. Make the completed room feel warm and lived in.
4. **Add richness and warmth.** Improve lamp and window glow, soft shadows, materials, and cozy props. Candidates include tea tins, a steaming teapot, hanging plants, and a chalkboard menu. A cat is optional, not a committed requirement.
5. **Add restrained life.** Consider gentle steam or plant movement. Keep effects subtle, respect reduced-motion preferences where applicable, and avoid compromising phone performance.

## Acceptance criteria

- The room is fully framed at representative portrait phone and desktop sizes, with useful detail visible and no accidental edge cropping.
- Before/after views make the transformation obvious, and every upgrade remains visually meaningful across its styles.
- The shop sign is readable and small objects have clear silhouettes.
- Camera movement, Edit mode, selection, dragging, snapping, collision checks, rotation, and free restyling still work.
- Existing progress loads correctly; purchases and placements survive a reload.
- All 38 puzzles, scoring, undo, level unlocks, and the completion/Bakery placeholder flow retain their behavior.
- Effects and scene resources are cleaned up when leaving the shop.
- Level verification and the production build pass.
- The review includes phone and desktop screenshots of the shabby start and decorated finish, plus an Edit-mode view. Record viewport sizes and any performance limitations.

## Scope and handoff

Focus this milestone on the existing tea shop. Building a playable Bakery, larger rooms, accounts, and a backend remain separate work. The collection and its matching puzzle rewards were already implemented before the owner promoted cozy polish and zoom.

Inspect the current visuals before choosing final props or camera values. Submit implementation as a reviewable PR with screenshots; wait for merge approval unless the user explicitly directs otherwise. This document is a plan, not evidence that any listed visual change has shipped.
