# NEXT STEPS — ARKtopia gameplay improvement

Updated 2026-11-25. This is the active handoff. The implementation pass and non-browser consolidated checks are complete. Browser regression is incomplete and has unresolved failures; do not treat it as passed.

## Implemented and verified outside the browser suite

- Added four-second autonomous expedition ticks that continue during creature tracking. The roaming threat can patrol, investigate sound/light, pursue a visible player, search the last-seen location, interrupt a hunt, and resume the saved hunt after combat or retreat.
- Preserved concealment/noise/flashlight influence and clarified that 100% tracking pressure is dangerous but does not eject the player.
- Added a four-sector moving acoustic readout and pointer-based net aiming whose release tile and pointer precision affect the throw.
- Split manual interactions into distinct search/recovery, generator pressure/heat, power allocation, waveform reconstruction, rotary repair, channel tuning, facility assembly, and terminal-sequence commissioning. Save/resume state is kept for operation puzzles; commission sequences reject invalid order and cannot be completed through the generic verify action.
- Prevented duplicate ARK RECALL answer submission. Updated opening-screen copy and expedition layout for desktop tools in one view, with responsive reflow on smaller screens.
- Compressed desktop supply/power/upgrade and research rosters so their primary controls and status fit together at large viewports; smaller screens retain responsive reflow.
- Added an in-game resource ledger to the status drawer with live stock, acquisition sources, uses, night-feeding/maintenance shortfalls, and the material gap for the next unbuilt facility. Disabled sortie gear now shows the specific missing resource and a resupply path; the upcoming-incident forecast has readable labels.
- Compressed the supply shop and four maintenance actions into a compact desktop grid so the workshop, construction, and routine resupply can be handled together on common desktop sizes.
- Connected selected risky event choices to durable follow-up incidents due in 1-3 days. The queue survives save/load, prioritizes an eligible due incident, expires when its window passes, and is surfaced on the base dashboard.
- Connected the blackout → CCTV loop → blindspot chain to a real, optional `cctvOfflineUntilDay` save field. CCTV scan/watch/track stop while the installed network is offline, animal escape risk and undetected incident growth rise, manual field-trace tracking remains available, and recovery choices restore the network. Added deferred regression coverage for the chain and save migration.
- Ignored local archives and added a Git file-size check covering indexed blobs, staged working files, and ordinary untracked source. `public.zip` is absent from the repository and ignored.
- Added logic checks for idle AI, active-hunt interruption/resumption, 100% pressure, two-person companion persistence, capture evidence, flashlight battery use, relay detection range, and minigame state/solve paths.
- Added a new, 2.9 MB roaming MUTANT reveal still in `public/assets/cinematics/field-threats/roaming-mutant/reveal.png`; the first mobile encounter shows it before combat, with the existing SCN_08 still retained as a load fallback.

## Existing systems to preserve and audit in context

- Thirteen distinct specimen routines, field exploration and capture, combat, role-specific two-person companion support, and map/track/evidence systems.
- Day upkeep, fuel/filter/power use, resource acquisition, construction, upgrades, night dispatch, wiring, and repair loops.
- Four staff roles, bonding and mental state, death consequences, sortie/base-work conflict, 41 gated incidents, and delayed choice follow-ups.
- Research, diagnosis, treatment, observation, archive unlocks, Hidden Photo records, M-00 investigation, and ARK RECALL.
- Ending conditions and existing asset references. Existing ending/epilogue/cinematic art remains user-owned and untouched. The only newly authorized art in the current turn is the MUTANT reveal still at `public/assets/cinematics/field-threats/roaming-mutant/reveal.png`.

## Remaining work

1. Resolve the remaining browser regression. The full run stopped after 19 of 48 cases because it was slow; observed failures include AP-zero night settlement, recovered-photo dialog, wiring panel access, voice-breach scheduling, hunt/pixel-test selectors, first-expedition flow, and ranger movement animation. The newly added MUTANT reveal has a passing focused browser check; the full browser suite still has not passed.
2. Rerun the affected browser scenarios after updating stale tests or fixing genuine UI behavior, then complete the browser suite once.
3. Keep `QA_REPORT.md` aligned with verified results. Do not mark the browser regression complete until all required cases pass.

## Consolidated verification already completed

- `npm run test:all`: PASS, including logic/save, v69-v76, v81-v83, ending matrix, roaming mutant, region care, and deterministic minigame suites.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run check:assets`: PASS; reports informational legacy portrait candidates with fallback assets available.
- `npm run check:git-size`: PASS; no indexed or working source file reaches GitHub's 100 MiB limit.
- `npm run build`: PASS; non-blocking CSS compatibility and React hook dependency warnings remain.
- Focused browser check for the first roaming MUTANT cinematic: PASS; the encounter dialog displayed and loaded the new still.
- `npm run test:browser`: INCOMPLETE; 19/48 cases reached, with the failures listed above. This is the only outstanding verification category currently known.

## Repository and asset state

- `main` is the only local/remote branch; `origin/HEAD` points to `origin/main`. The old backup and feature branches were removed after confirming their source changes were present in the worktree.
- Obsolete version-specific QA, requirements, art, and handoff documents were removed. Current gameplay requirements, system summary, UI specification, story canon, incident matrix, acceptance criteria, QA report, and this handoff remain.
- Do not replace or edit existing art files. The new MUTANT reveal still is the sole exception explicitly requested by the user; leave untracked epilogue PNGs and all other image assets untouched.
- Keep project ZIPs local. Never add `public.zip` or another generated archive to Git.
