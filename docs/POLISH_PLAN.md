# Shop art and camera polish

Status: initial polish changes are implemented locally; visual review and a PR are pending. This plan captures the user's requested continuation after the decorating merge.

## Local implementation progress

The first pass adjusts camera fitting for both canvas dimensions, moves the window backdrop in front of the wall, increases sign height and teapot size, adds counter paneling and tea tins, and adds cups and pastries to the table. Lighting now gives the unfinished room a more subdued baseline. Replaced wall materials are disposed during synchronization.

Production build and all twenty level checks pass. Browser screenshot capture stalled during validation, so appearance and interaction acceptance criteria remain unchecked. GitHub authentication reported an invalid token; no PR or deployment was created.

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
- All twenty puzzles, scoring, undo, level unlocks, and the completion/Bakery placeholder flow retain their behavior.
- Effects and scene resources are cleaned up when leaving the shop.
- Level verification and the production build pass.
- The review includes phone and desktop screenshots of the shabby start and decorated finish, plus an Edit-mode view. Record viewport sizes and any performance limitations.

## Scope and handoff

Focus this milestone on the existing tea shop. Building a playable Bakery, changing the star economy, adding levels, accounts, or a backend are separate work.

Inspect the current visuals before choosing final props or camera values. Submit implementation as a reviewable PR with screenshots; wait for merge approval unless the user explicitly directs otherwise. This document is a plan, not evidence that any listed visual change has shipped.
