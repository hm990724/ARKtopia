# ORIGIN ZERO — Economy and day-pressure review

Review date: 2026-11-23

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

