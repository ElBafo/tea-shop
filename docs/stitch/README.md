# Stitch design reference — v1.0.0

The owner supplied Stitch's `design.md` on 2026-11-08 and explicitly requested adding it as-is while keeping the original. [design.md](design.md) is a byte-for-byte copy of the attachment; its YAML front matter, prose, token values and formatting are unchanged. The attachment itself was not edited.

Source SHA-256: `a0c17c104f491f3a0de24f9803a4a411c0036cf09f0cb34de6d2681f9574c60c`.

Keep this source unchanged. Put interpretation, decisions and any future derived implementation tokens in separate files. A later Stitch export should be retained as a new revision with its own provenance rather than silently replacing this original.

## What the source specifies

- Tactile wooden/ceramic toy craft, warm storybook character and sensory coziness.
- Full semantic colour-token front matter plus narrative/component palettes.
- **Bricolage Grotesque** headings and **Be Vietnam Pro** body/labels, with supplied type scales.
- Mobile four-column/tablet eight-column grids, bottom-anchored interactions, spacing and rounded-shape tokens.
- Layered button shadows, press travel, translucent drawers and component styling for buttons, chips, trays, toggles, inputs and modals.

This is a v1.0.0 visual reference, not a runtime stylesheet or proof of implemented UI. This original file arrived without font assets, screen exports, 3D models or working components. The owner has since supplied a separate [Stitch prototype export archive](../stitch-prototypes/README.md), with original HTML and PNG references; the original design.md remains unchanged. The live game remains 0.3.1; importing the document does not change gameplay, saves or deployments.

## Separate integration observations

These observations do not modify or resolve the supplied source.

| Role | YAML front matter | Narrative/component examples |
| --- | --- | --- |
| Primary | `#805600`; primary container `#e8a838` | Honey primary button/accent `#E8A838` |
| Secondary | `#376847` | Matcha `#4A7C59`, softened by `#68A279` |
| Tertiary | `#9c4328` | Terracotta `#C86446`, softened by `#E07A5F` |
| Canvas | Surface/background `#fef9ef` | `#FFFDF9` through `#EFE6D5` |
| Main text | On-surface `#1d1c16` | Deep glaze indigo `#2C3E50` |

The front matter and prose describe different shades/roles. A future implementation needs an explicit semantic mapping rather than treating either set as an already-agreed single palette. Preserve every original value in the source while reviewing that mapping.

The 10px small-label token and 32px chip styling are visual specifications, not evidence that readability or touch-target requirements have been met. Review actual phone-size text, contrast, focus and at least 44px interactive targets when implementing. Preview the requested blur, layered shadows and spring/press motion on physical phones, with reduced-motion alternatives and the existing scene/resource lifecycle preserved.

The source's pill-shaped controls, soft cards and bottom-anchored layout remain design input until reviewed against the real puzzle/editor states and small-phone fit. This import does not authorize a UI rewrite, change no-fail-state/unlimited-Undo rules or settle the separate v1.0.0 economy/system proposals.

Related planning: [game-design draft](../V1_GAME_DESIGN_DRAFT.md), [puzzle flow](../V1_PUZZLE_FLOW.md), [Stitch product map](../V1_STITCH_PRODUCT_MAP.md), [roadmap](../ROADMAP.md).
