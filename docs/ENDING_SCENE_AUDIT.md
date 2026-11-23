# Ending and story-scene art audit

Audit date: 2026-11-23

## Active ending art

`src/lib/ending-art.ts` maps all 19 authored outcomes and variants to 19 distinct generated cinematic PNGs in `public/assets/endings/ending_*_cinematic.png`. The first eight are the ORIGIN ZERO main outcomes. Older saved ending labels continue to map through `LEGACY_ENDING_ART` without changing save data.

The cinematic backgrounds are deliberately unpeopled. The ending screen composes the protagonist/EVE and only the staff and animals present in the current save. M-00 appears only on the protection route. The 8 original handoff WebP files remain preserved; unused v75/v76/v77 ending derivatives were removed after the current set was connected.

## Active story scenes

`src/components/OriginStoryArtwork.tsx` displays these canonical files behind their existing evidence gates:

- `cinematics/origin-zero/scene_m00_positive.png`
- `cinematics/origin-zero/scene_m00_transfer.png`
- `cinematics/origin-zero/scene_m00_protect.png`
- `cinematics/origin-zero/scene_origin_escape.png`
- `cinematics/origin-zero/scene_collapse.png`
- `cinematics/origin-zero/scene_ark_recall.png`
- `characters/daughter_portrait.png`
- `characters/scientist_archive.png`
- `characters/scientist_obsession.png`

Earlier unique origin-story images remain in `public/assets/archive/origin-zero-scenes/`; they are not runtime targets. Staff arrival and termination scenes continue to use their per-character `scene.webp` files.

## Stable names

Active image references use canonical descriptive names without build/revision suffixes. Versioned copies are not selected just because they have a larger suffix. Animal art continues to resolve via the species master names in `src/lib/animal-art.ts`; no canonical species master was removed.

## Verification

`npm run test:ending-matrix`, `npm run test:v75`, and the production browser suite cover route mapping, image presence and format, legacy labels, and runtime loading. A passing route test does not replace a natural fresh-save playthrough of every ending.
