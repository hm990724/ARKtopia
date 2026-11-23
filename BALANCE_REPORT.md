# ORIGIN ZERO — Economy and day-pressure review

Review date: 2026-11-23

## v81 facility dispatch check

- After a shield/rest/standby choice, remaining power is distributed to installed facilities in the saved priority order: CCTV 3, containment 2, infirmary 3, synthesis 2. A shed facility does not grant its associated night effect.
- `npm run test:v81` checks low-power dispatch, reordered infirmary priority, save/load, and migration from a save without dispatch fields. Production browser test `browser-v81` confirms reorder persistence and a changed night forecast.
- The existing deterministic idle pressure probe still reaches DAY 11 with power/facility at 0 and threat at 100. Four management-only strategy runs still reach DAY 13. Neither proves an expedition-inclusive natural campaign is balanced.
- A fresh save with installed facilities can lose more power overnight than prior builds because facility consumption is now charged intentionally. Players can prioritize critical systems, but natural-play fairness still needs a campaign playtest.

## Current implemented pressure

- A field sortie is one per day and costs AP 1. Starting it requires its selected gear. A flashlight route consumes portable charge and does not require facility power; EVE's scanner route does require facility power.
- Flashlight recharge costs AP 1, one electric cell, and 12 facility power for 38 charge. Field hand-search can recover cells as a chance-based resource.
- End-of-night settlement consumes the chosen defense cost plus 6 power. Low power forces standby. Standby raises threat by 19, event risk by 17 and infection by an extra 4; facility damage is also higher. Defense costs 22 power and lowers threat, while rest costs 5 power and restores manager morale.
- Living staff lose morale as days pass. Conversation builds trust only and costs AP 1 plus food 1; counseling costs AP 2 plus food 1 for morale +9 once per day; medical support costs AP 2 plus medicine 1 for morale +20 once per staff per day.
- Night circuit repair requires ordering four terminals by displayed voltage. An incorrect terminal costs power 4, facility stability 3 and threat +3, with a three-error lock. Correct completion grants power +4 and stability +6 at settlement.
- Field combat blocks movement while the threat acts, requires a tactical response and pays salvage once on victory. Retreat pays no salvage.
- Base upgrades use scrap and parts, persist to saves, have a level cap, and improve relay/battery/clinic effects.

## Balance status

Automated regression covers input costs, zero-resource refusal, save migration, repeated-day blockers, event outcomes, night settlement, field action and seeded hunting. The full browser suite validates the live UI at desktop and 390px widths.

The master prompt's no-action DAY 10 pressure target has a deterministic idle probe, but is **not fully certified**. A manual fresh-save multi-day playthrough and a strategy-vs-idle comparison are still needed. The current systems apply escalating losses, but the actual campaign can still be too easy or too punishing depending on event rolls, upgrade timing and acquired staff.

### Deterministic idle pressure probe

`npm run balance:soak` starts a fresh Generator game with a fixed random seed, spends no AP on player operations, clears only forced incident/voice blockers with the first available response, and selects standby each night. After ten neglected day transitions (at DAY 11), the state remains in the operating phase with power 0, facility 0, threat 100, infection 74 and manager morale 80; the final day has an incident awaiting response. It asserts there is no hard-coded DAY 10 game-over. New incident choices change the prior baseline, so the run must be read as an idle-pressure guard, not as a player-facing balance verdict.

The registry now contains 40 incident IDs (13 original + 27 state-gated). Each new event has three responses, persisted resource/stat consequences and a distinct occurrence gate; event responses also expose scrap, cells and medicine changes in the UI preview. The full campaign still needs natural playtesting to judge whether event frequency and resource consequences feel fair.

### Deterministic management-policy probe

`npm run balance:strategy` runs 12 day transitions from fresh Generator saves for all four manager origins using fixed seeds. The policy resolves each event by the displayed effect deltas, buys repair parts only when needed, repairs power below 68, and selects defense/rest from threat, morale and available power. All four runs reached DAY 13 in the day phase without resource underflow. Their ending `(power, facility, threat, infection, morale, credits)` values were Medic `(55, 80, 4, 18, 100, 550)`, Engineer `(75, 64, 4, 18, 100, 675)`, Artist `(72, 86, 4, 10, 100, 425)`, and Warden `(48, 55, 0, 8, 100, 675)`.

This probes only day management, incident choice and night defense. It does not simulate expeditions, capture, animal care, staff arrival, upgrades or the full story, so it is not a fresh-campaign playtest or proof of overall balance.

### Expedition-inclusive seeded campaign probe

`npm run balance:campaign` runs the real state handlers for 12 day transitions for Medic, Engineer, Artist and Warden starts. Each run launches three planned garden sorties on DAY 4/8/12, spends actual flashlight/cage/AP, advances three field stages with seeded random outcomes, attempts capture, buys food/parts when affordable, performs care/decontamination/repairs when thresholds trigger, resolves daily blockers, and settles nights. It asserts DAY 13 remains playable, all three sorties resolve, at least one animal is secured, and power/facility remain above zero with infection below 80.

Seeded outcomes: Medic reaches DAY 13 with 1 capture `(power 40, facility 70, threat 18, infection 16, morale 100, food 3)`; Engineer reaches it with 2 `(30, 75, 21, 35, 89, 2)`; Artist with 1 `(63, 42, 30, 38, 100, 2)`; Warden with 2 `(55, 55, 31, 16, 100, 0)`. These are four scripted, seeded operations policies and do not represent novice or human play. The probe skips the tutorial and does not include HQ processing or staff recruitment; it does not certify campaign balance.

### Staff-loss morale consequence

When a staff mind signal is lost, each remaining employee above zero loses 30 mind once. The loss is logged per employee and may trigger the existing subsequent staff-risk queue if anyone reaches zero. `npm run test:v71` covers the penalty and idempotence. A full campaign that exercises multiple staff-loss chains still needs a fresh-save playthrough.

