# Ending and story-scene audit

Audit date: 2026-11-23

## Ending routes

The game retains eight main ORIGIN ZERO outcomes and the previous state-driven ending variants. `src/lib/ending-art.ts` maps the 19 authored route titles to 19 distinct existing route compositions. Six older wording aliases and the no-route fallback continue to resolve. The 8 original handoff WebP files and the earlier v75/v76 image sets are preserved in the repository.

| Ending title | Active scene file | Cast restriction |
|---|---|---|
| Eternal Experiment | `ending_eternal_experiment_v77.svg` | Canonical manager/EVE portraits only |
| Eden | `ending_eden_v77.svg` | Canonical manager/EVE portraits only |
| Seed of the Ark | `ending_seed_ark_v77.svg` | Canonical manager/EVE portraits only |
| Last Zoo | `ending_last_zoo_v77.svg` | Canonical manager/EVE portraits only |
| Subject 000 | `ending_subject_000_v77.svg` | Canonical manager/EVE portraits only |
| Silent Automation | `ending_silent_automation_v77.svg` | Canonical manager/EVE portraits only |
| Scattered Names | `ending_scattered_names_v77.svg` | Canonical manager/EVE portraits only |
| Last Signal | `ending_last_signal_v77.svg` | Canonical manager/EVE portraits only |
| HQ Successor | `ending_successor_v77.svg` | Canonical manager/EVE portraits only |
| Humane Restoration | `ending_humane_restoration_v77.svg` | Canonical manager/EVE portraits only |
| Spring Outside the Records | `ending_spring_outside_records_v77.svg` | Canonical manager/EVE portraits only |
| Late Gate | `ending_late_gate_v77.svg` | Canonical manager/EVE portraits only |
| Empty Shiftroom | `ending_empty_shiftroom_v77.svg` | Canonical manager/EVE portraits only |
| First Sentence After Humanity | `ending_first_sentence_v77.svg` | Canonical manager/EVE portraits only |
| Incomplete Revival | `ending_incomplete_revival_v77.svg` | Canonical manager/EVE portraits only |
| Spring Beyond the Cage | `ending_spring_beyond_cage_v77.svg` | Canonical manager/EVE portraits only |
| Last Two Caretakers | `ending_two_caretakers_v77.svg` | Canonical manager/EVE portraits only |
| Quiet Automation | `ending_quiet_automation_v77.svg` | Canonical manager/EVE portraits only |
| Final Transmission | `ending_final_transmission_v77.svg` | Canonical manager/EVE portraits only |

These are existing portrait-led SVG compositions. They do not introduce a new or unrelated person, and the ending UI separately lists only recruited, living staff while putting retired staff in the loss record. They are not the requested high-detail red/pink painted scenes, their acting poses are not bespoke, and the image itself does not dynamically change with the living staff roster. Mark the bespoke ending art as **missing** until actual images are generated and reviewed.

The eight original unversioned handoff images remain preserved: `ending_incomplete_revival.webp`, `ending_new_consciousness.webp`, `ending_two_caretakers.webp`, `ending_open_spring.webp`, `ending_subject_000.webp`, `ending_silent_automation.webp`, `ending_scattered_names.webp`, and `ending_last_signal.webp`. They are reference/source art, not substitutes for the requested new ending scenes.

## Story cinematics currently present

All paths below exist in `public/assets` and are displayed by `src/components/OriginStoryArtwork.tsx` when their evidence gates are met.

| Scene | Asset | Gate |
|---|---|---|
| M-00 independent cognition | `cinematics/origin-zero/scene_m00_positive_v72.png` | Positive marker evidence |
| Headquarters transfer route | `cinematics/origin-zero/scene_m00_transfer_v72.png` | Transfer route selected |
| Shelter/protection route | `cinematics/origin-zero/scene_m00_protect_v72.png` | Protection route selected |
| Disposal order / containment failure | `cinematics/origin-zero/scene_origin_escape.png` | Story photo evidence |
| Facility collapse and leak | `cinematics/origin-zero/scene_collapse.png` | Story photo evidence |
| Individual specimen re-analysis | `cinematics/origin-zero/scene_ark_recall_v72.png` | Later evidence threshold |
| Recovered family photo | `characters/daughter_portrait.png` | Photo count threshold |
| Scientist's preservation plan | `characters/scientist_archive.png` | Late evidence threshold |
| Scientist's obsession | `characters/scientist_obsession.png` | Final evidence threshold |

These assets are story archive panels, not a continuous animated movie. Additional bespoke cinematic art for the staff memories, each of the 19 endings, the last report in other ending routes, and additional story events is **missing**. Staff arrival and termination scenes use their existing per-character cinematic folders; the Wolf termination depicts the female black-haired guard.

## Image-generation state

The `imagegen` skill file exists, but no callable native `image_gen` tool is connected in this session. An approved Codex CLI attempt also returned that image generation is unavailable; it produced no file. The old v75 PNGs show animal/mutant ensembles and the v76 PNGs contain mismatched human appearances, so neither set is active for ending scenes. Do not claim the new high-detail illustrations are complete or fabricate replacements with SVG/Pillow.

## Verification

- `npm run test:v75` validates 19 distinct active scene paths, preserves the original handoff WebPs, and checks legacy ending titles.
- `npm run test:browser` loads all 19 active scene compositions from the production build.
- The canonical story route logic has its existing eight-outcome deterministic regression coverage. Natural fresh-save playthroughs for every ending title and state-dependent staff survival are still outstanding.
