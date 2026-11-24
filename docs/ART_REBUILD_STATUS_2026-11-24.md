# ARKtopia high-resolution cinematic asset rebuild — actual Git snapshot

Date: 2026-11-24. This is a file-existence inventory, **not** artistic approval or proof of runtime completion. The user-provided two master TXT files remain the full scene/cast requirements.

## Status and rules

- **Never overwrite or delete** `public/assets/cinematics/staff-terminations/`. It is the protected original set.
- Rebuild with individual high-density 2D anime stills, ideally 16:9, no embedded dialogue-box text, violet/magenta/cyan for first meeting and subdued scarlet emergency lighting for tragic endings. Dialogue should be React UI text.
- Young male protagonist: black-purple tousled hair, magenta X goggles, cat-icon headphones, bandage. EVE: silver-lavender long hair, blue eyes, cyan headset, white holographic suit. Staff 4 must remain human (no ears/tails).
- 8 core endings + 11 distinct follow-up/interim CG paths; **not 19 independent game outcomes**. Never render dead or transferred people/animals as living in conditional scenes. M-00 is an ordinary black cat, right-ear nick and single white chest tuft, no collar/cybernetic eyes or human brain.
- Do not remove old art until the replacement is actually generated, visually verified, committed, and shown correctly in game. `staff-terminations` remains untouched regardless.
- New canonical **code-matched** event targets use `EVT_XX_<actual incident ID>.png`. They are indexed by the game's current executable 41 incident IDs; the supplied TXT's separate 41 storyboard titles may differ. Do **not** paint an unrelated event merely because two ordinal numbers match.
- IMPORTANT: GitHub cannot see images generated solely in this chat. The first-meeting image generated here is **not committed** to the repository until its binary PNG is uploaded.

## Current physical asset inventory

| Type | Files in tracked public/assets | Notes |
|---|---:|---|
| Staff portrait variants | 21 | 4 staff, mixed PNG/WebP; expression differences retained |
| Animal pixels | 27 | 13 × 2 + M-00; visual quality still requires review |
| Hidden Photo images | 12 | 12 source files; story/order QA still needed |
| Legacy incident illustrations | 7 | 41 gameplay events currently share these until replacements are installed |
| Staff arrival legacy cuts | 4 | All are supported fallbacks |
| Staff termination original cuts | 5 | Protected forever |
| Old EVE first-contact image | 1 | Supported fallback |
| Ending raster illustrations | 36 | Legacy, final and variant copies; not automatically safe to delete |

## Missing / pending canonical story CG slots (19)

| Status | Target PNG path |
|---|---|
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_01_zoo_gate_prologue.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_02_eve_first_meeting.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_03_cctv_missing_frame.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_04_rabbit_medic_arrival.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_05_fox_supply_arrival.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_06_deer_archive_arrival.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_07_wolf_guard_arrival.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_08_first_roaming_threat.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_09_wolf_last_stand.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_10_m00_encounter.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_11_m00_origin_signature.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_12_m00_transfer.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_13_m00_protection.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_14_human_origin_revelation.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_15_scientist_daughter_cat.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_16_protagonist_scientist_memory.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_17_eve_independent_choice.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_18_operation_ark_recall.png` |
| MISSING | `public/assets/cinematics/origin-zero/story/SCN_19_final_farewell.png` |

## Missing / pending code-matched event CG slots (41)

| ID | Actual executable incident ID | Target PNG path | Status |
|---:|---|---|---|
| 1 | `generator_overheat` | `public/assets/cinematics/origin-zero/events/EVT_01_generator_overheat.png` | MISSING; runtime legacy fallback works |
| 2 | `blackout` | `public/assets/cinematics/origin-zero/events/EVT_02_blackout.png` | MISSING; runtime legacy fallback works |
| 3 | `breach` | `public/assets/cinematics/origin-zero/events/EVT_03_breach.png` | MISSING; runtime legacy fallback works |
| 4 | `cctv_loop` | `public/assets/cinematics/origin-zero/events/EVT_04_cctv_loop.png` | MISSING; runtime legacy fallback works |
| 5 | `rations` | `public/assets/cinematics/origin-zero/events/EVT_05_rations.png` | MISSING; runtime legacy fallback works |
| 6 | `coolant` | `public/assets/cinematics/origin-zero/events/EVT_06_coolant.png` | MISSING; runtime legacy fallback works |
| 7 | `filter_clog` | `public/assets/cinematics/origin-zero/events/EVT_07_filter_clog.png` | MISSING; runtime legacy fallback works |
| 8 | `escape_tracks` | `public/assets/cinematics/origin-zero/events/EVT_08_escape_tracks.png` | MISSING; runtime legacy fallback works |
| 9 | `patrol_echo` | `public/assets/cinematics/origin-zero/events/EVT_09_patrol_echo.png` | MISSING; runtime legacy fallback works |
| 10 | `feed_shortage` | `public/assets/cinematics/origin-zero/events/EVT_10_feed_shortage.png` | MISSING; runtime legacy fallback works |
| 11 | `echo` | `public/assets/cinematics/origin-zero/events/EVT_11_echo.png` | MISSING; runtime legacy fallback works |
| 12 | `evidence_gap` | `public/assets/cinematics/origin-zero/events/EVT_12_evidence_gap.png` | MISSING; runtime legacy fallback works |
| 13 | `quiet` | `public/assets/cinematics/origin-zero/events/EVT_13_quiet.png` | MISSING; runtime legacy fallback works |
| 14 | `pump_backflow` | `public/assets/cinematics/origin-zero/events/EVT_14_pump_backflow.png` | MISSING; runtime legacy fallback works |
| 15 | `medic_memory` | `public/assets/cinematics/origin-zero/events/EVT_15_medic_memory.png` | MISSING; runtime legacy fallback works |
| 16 | `staff_conflict` | `public/assets/cinematics/origin-zero/events/EVT_16_staff_conflict.png` | MISSING; runtime legacy fallback works |
| 17 | `guard_refusal` | `public/assets/cinematics/origin-zero/events/EVT_17_guard_refusal.png` | MISSING; runtime legacy fallback works |
| 18 | `animal_fever` | `public/assets/cinematics/origin-zero/events/EVT_18_animal_fever.png` | MISSING; runtime legacy fallback works |
| 19 | `empty_chair` | `public/assets/cinematics/origin-zero/events/EVT_19_empty_chair.png` | MISSING; runtime legacy fallback works |
| 20 | `signal` | `public/assets/cinematics/origin-zero/events/EVT_20_signal.png` | MISSING; runtime legacy fallback works |
| 21 | `intrusion` | `public/assets/cinematics/origin-zero/events/EVT_21_intrusion.png` | MISSING; runtime legacy fallback works |
| 22 | `hq_recall_order` | `public/assets/cinematics/origin-zero/events/EVT_22_hq_recall_order.png` | MISSING; runtime legacy fallback works |
| 23 | `hq_delete_order` | `public/assets/cinematics/origin-zero/events/EVT_23_hq_delete_order.png` | MISSING; runtime legacy fallback works |
| 24 | `field_scavenger` | `public/assets/cinematics/origin-zero/events/EVT_24_field_scavenger.png` | MISSING; runtime legacy fallback works |
| 25 | `contamination_pool` | `public/assets/cinematics/origin-zero/events/EVT_25_contamination_pool.png` | MISSING; runtime legacy fallback works |
| 26 | `battery_swelling` | `public/assets/cinematics/origin-zero/events/EVT_26_battery_swelling.png` | MISSING; runtime legacy fallback works |
| 27 | `cable_arc` | `public/assets/cinematics/origin-zero/events/EVT_27_cable_arc.png` | MISSING; runtime legacy fallback works |
| 28 | `resonance_drift` | `public/assets/cinematics/origin-zero/events/EVT_28_resonance_drift.png` | MISSING; runtime legacy fallback works |
| 29 | `enclosure_rattle` | `public/assets/cinematics/origin-zero/events/EVT_29_enclosure_rattle.png` | MISSING; runtime legacy fallback works |
| 30 | `predator` | `public/assets/cinematics/origin-zero/events/EVT_30_predator.png` | MISSING; runtime legacy fallback works |
| 31 | `keepsake` | `public/assets/cinematics/origin-zero/events/EVT_31_keepsake.png` | MISSING; runtime legacy fallback works |
| 32 | `garden` | `public/assets/cinematics/origin-zero/events/EVT_32_garden.png` | MISSING; runtime legacy fallback works |
| 33 | `m00_signature` | `public/assets/cinematics/origin-zero/events/EVT_33_m00_signature.png` | MISSING; runtime legacy fallback works |
| 34 | `cctv_blindspot` | `public/assets/cinematics/origin-zero/events/EVT_34_cctv_blindspot.png` | MISSING; runtime legacy fallback works |
| 35 | `visitor` | `public/assets/cinematics/origin-zero/events/EVT_35_visitor.png` | MISSING; runtime legacy fallback works |
| 36 | `spores` | `public/assets/cinematics/origin-zero/events/EVT_36_spores.png` | MISSING; runtime legacy fallback works |
| 37 | `exposure_critical` | `public/assets/cinematics/origin-zero/events/EVT_37_exposure_critical.png` | MISSING; runtime legacy fallback works |
| 38 | `data_corruption` | `public/assets/cinematics/origin-zero/events/EVT_38_data_corruption.png` | MISSING; runtime legacy fallback works |
| 39 | `fence_crack` | `public/assets/cinematics/origin-zero/events/EVT_39_fence_crack.png` | MISSING; runtime legacy fallback works |
| 40 | `construction_noise` | `public/assets/cinematics/origin-zero/events/EVT_40_construction_noise.png` | MISSING; runtime legacy fallback works |
| 41 | `neural_static` | `public/assets/cinematics/origin-zero/events/EVT_41_neural_static.png` | MISSING; runtime legacy fallback works |

## Missing / pending ending CG slots (19)

| Slot | Target story-file path | Status |
|---:|---|---|
| 1 | `public/assets/cinematics/origin-zero/endings/END_01_eternal_experiment.png` | MISSING (existing legacy ending routes stay in service) |
| 2 | `public/assets/cinematics/origin-zero/endings/END_02_eden.png` | MISSING (existing legacy ending routes stay in service) |
| 3 | `public/assets/cinematics/origin-zero/endings/END_03_ark_seeds.png` | MISSING (existing legacy ending routes stay in service) |
| 4 | `public/assets/cinematics/origin-zero/endings/END_04_last_zoo.png` | MISSING (existing legacy ending routes stay in service) |
| 5 | `public/assets/cinematics/origin-zero/endings/END_05_subject_000.png` | MISSING (existing legacy ending routes stay in service) |
| 6 | `public/assets/cinematics/origin-zero/endings/END_06_silent_automation.png` | MISSING (existing legacy ending routes stay in service) |
| 7 | `public/assets/cinematics/origin-zero/endings/END_07_scattered_names.png` | MISSING (existing legacy ending routes stay in service) |
| 8 | `public/assets/cinematics/origin-zero/endings/END_08_last_signal.png` | MISSING (existing legacy ending routes stay in service) |
| 9 | `public/assets/cinematics/origin-zero/endings/END_09_experiment_successor.png` | MISSING (existing legacy ending routes stay in service) |
| 10 | `public/assets/cinematics/origin-zero/endings/END_10_eden_memory_cost.png` | MISSING (existing legacy ending routes stay in service) |
| 11 | `public/assets/cinematics/origin-zero/endings/END_11_seeds_long_research.png` | MISSING (existing legacy ending routes stay in service) |
| 12 | `public/assets/cinematics/origin-zero/endings/END_12_zoo_protected_animals.png` | MISSING (existing legacy ending routes stay in service) |
| 13 | `public/assets/cinematics/origin-zero/endings/END_13_subject_self_choice.png` | MISSING (existing legacy ending routes stay in service) |
| 14 | `public/assets/cinematics/origin-zero/endings/END_14_automation_eve_offline.png` | MISSING (existing legacy ending routes stay in service) |
| 15 | `public/assets/cinematics/origin-zero/endings/END_15_names_memorial.png` | MISSING (existing legacy ending routes stay in service) |
| 16 | `public/assets/cinematics/origin-zero/endings/END_16_signal_uncertain.png` | MISSING (existing legacy ending routes stay in service) |
| 17 | `public/assets/cinematics/origin-zero/endings/END_17_headquarters_aftermath.png` | MISSING (existing legacy ending routes stay in service) |
| 18 | `public/assets/cinematics/origin-zero/endings/END_18_sanctuary_aftermath.png` | MISSING (existing legacy ending routes stay in service) |
| 19 | `public/assets/cinematics/origin-zero/endings/END_19_eve_last_memory.png` | MISSING (existing legacy ending routes stay in service) |

## Staff facial-expression work

Real existing `portrait.webp`, `portrait_unstable.webp`, `portrait_critical.webp` are selected by the current status UI. Existing `portrait_unstable.png` and `portrait_critical.png` are separate dialogue-expression candidates. They are **not byte-identical duplicates solely because filenames resemble each other**.

Target long-term naming per staff: `portrait_normal.png`, `portrait_unstable.png`, `portrait_critical.png` for status; `portrait_talk_neutral.png`, `portrait_talk_soft.png`, `portrait_talk_shocked.png` for dialogue. Do not hard-rename until matching independent images are available and every import path is migrated.

## Completed code work / boundaries

- `src/lib/cinematic-art.ts`: first EVE / 4 staff arrivals prefer new canonical story CG, retain known existing fallback.
- `src/lib/incident-art.ts`: 41 code-matched distinct preferred paths with historical illustrator fallbacks.
- `src/components/IncidentArtwork.tsx` and `CrewSystem.tsx` use fallback loaders. `scripts/test-v83.cjs` checks route uniqueness and existing fallback files.
- A generated PNG displayed in this conversation does **not** count as committed production art. High-resolution scene regeneration, exact character QA, conditional-endings composition and final obsolete-art deletion remain outstanding.
