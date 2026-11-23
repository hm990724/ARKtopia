# Ending Art Audit and v77 Correction

The first v76 ending pass was not a complete character audit: several generated scenes introduced people who do not match the cast, and multiple outcomes reused copies of the same illustration. Those raster files remain archived and are no longer used by ending screens.

The active 19 routes now use separate SVG compositions. Each composition references only the canonical protagonist portrait and/or EVE hologram, so it cannot introduce an unrelated human, animal, or mutant. Palette, archival geometry, scene framing, and ending identifier differ per route. The reusable source is `scripts/generate-ending-cards.cjs`; runtime mapping is `src/lib/ending-art.ts`.

This is a cast-correct interim visual treatment, not the requested bespoke painterly cinematic set. The current official portraits are reused as foreground figures; their expressions and poses do not change with each ending. High quality story-specific paintings still need to be generated after image generation authentication recovers, using official cast references. Keep all existing raster art and replace the active SVGs only after the new image is visually checked against the character sheets and each ending's unlocked story facts.

`npm run test:v75` checks all 19 route files for valid SVG structure, distinct paths, and allowed human portrait sources. The production browser suite also passed 36/36, including image loading for all 19 ending routes. A visual review should still check how the original portrait backgrounds layer against the SVG scene treatment.
