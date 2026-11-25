# NEXT STEPS — ARKtopia gameplay improvement

Updated 2026-11-25. This is the active handoff. Implementation is still in progress; the integrated verification pass is intentionally deferred until the implementation pass is complete. Do not treat existing code paths or the checklist below as proof of working behavior until that pass finishes.

## Implemented in this pass, pending integrated verification

- Added four-second autonomous expedition ticks that continue during creature tracking. The roaming threat can patrol, investigate sound/light, pursue a visible player, search the last-seen location, interrupt a hunt, and resume the saved hunt after combat or retreat.
- Preserved concealment/noise/flashlight influence and clarified that 100% tracking pressure is dangerous but does not eject the player.
- Added a four-sector moving acoustic readout and pointer-based net aiming whose release tile and pointer precision affect the throw.
- Split manual interactions into distinct search/recovery, generator pressure/heat, power allocation, waveform reconstruction, rotary repair, channel tuning, facility assembly, and terminal-sequence commissioning. Save/resume state is kept for operation puzzles; commission sequences reject invalid order and cannot be completed through the generic verify action.
- Prevented duplicate ARK RECALL answer submission. Updated opening-screen copy and expedition layout for desktop tools in one view, with responsive reflow on smaller screens.
- Compressed desktop supply/power/upgrade and research rosters so their primary controls and status fit together at large viewports; smaller screens retain responsive reflow.
- Connected selected risky event choices to durable follow-up incidents due in 1-3 days. The queue survives save/load, prioritizes an eligible due incident, expires when its window passes, and is surfaced on the base dashboard.
- Ignored local archives and added a Git file-size check covering indexed blobs, staged working files, and ordinary untracked source. `public.zip` is absent from the repository and ignored.
- Added deferred logic checks for idle AI, active-hunt interruption/resumption, 100% pressure, two-person companion persistence, and minigame state/solve paths. None of the integrated checks have been run in this pass yet.

## Existing systems to preserve and audit in context

- Thirteen distinct specimen routines, field exploration and capture, combat, role-specific two-person companion support, and map/track/evidence systems.
- Day upkeep, fuel/filter/power use, resource acquisition, construction, upgrades, night dispatch, wiring, and repair loops.
- Four staff roles, bonding and mental state, death consequences, sortie/base-work conflict, 41 gated incidents, and delayed choice follow-ups.
- Research, diagnosis, treatment, observation, archive unlocks, Hidden Photo records, M-00 investigation, and ARK RECALL.
- Ending conditions and existing asset references. The user owns ending/epilogue/cinematic artwork; do not edit or generate image files.

## Remaining implementation work

1. Continue auditing the five gameplay areas against reachable UI flows and state effects. Improve any feature that is only a presentation shell, has no meaningful cost/result, or cannot be reached naturally.
2. Review economy progression, crew relationship/death edge cases, 41-event consequence chains, research/minigame routes, and common-screen layout without repeating full checks after each small edit.
3. Inspect app navigation, modal sizing, save migration, and compact-screen behavior; keep desktop tool groups visible together where practical and preserve accessible small-screen reflow.
4. After the implementation pass, run the consolidated typecheck, lint/build, asset-reference check, logic/save suites, and browser regression. Fix failures in that same final pass and record actual results in `QA_REPORT.md`.

## Repository and asset state

- `main` is the only local/remote branch; `origin/HEAD` points to `origin/main`. The old backup and feature branches were removed after confirming their source changes were present in the worktree.
- Obsolete version-specific QA, requirements, art, and handoff documents were removed. Current gameplay requirements, system summary, UI specification, story canon, incident matrix, acceptance criteria, QA report, and this handoff remain.
- Do not modify files under `public/assets` or generate images. Untracked epilogue PNGs from the separate art workflow are present; leave them untouched.
- Keep project ZIPs local. Never add `public.zip` or another generated archive to Git.
