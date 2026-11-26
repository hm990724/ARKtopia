# ARKtopia implementation handoff

Updated 2026-11-26. This handoff reflects the current worktree and the checks that actually ran.

## Implemented gameplay scope

- Field exploration uses persistent discovered areas, movement and noise/light signals, acoustic tracking, footprints/grass traces, pursuit and last-seen searches. Active tracking can be interrupted by a roaming MUTANT and resume after retreat or combat.
- Twenty MUTANT variants have dedicated combat sprites, behavior/archetype data, and variant-specific encounter stills. Legacy `mutant_mutant`, `enemy_echo`, and `enemy_smile` routes are intentionally removed.
- Capture supports species-specific protocols, observation and evidence gates, pointer-based net throws, struggle/failure states, companion support, and save-resume.
- Combat supports up to two selected companions with role-specific support, enemy intent, guard/counter, equipment and retreat, plus single reward settlement.
- Base/day loops cover power dispatch and priority, outage and CCTV consequences, fuel/filter/maintenance costs, resource acquisition, construction/upgrades, night repair, and sortie/base-work opportunity cost.
- Crew systems cover four distinct staff roles, dialogue moods, bond/memory, mental state, one-time bereavement effects, termination consequences, and empty-crew survival. Event choices can create durable follow-up incidents.
- Story/research coverage includes gated evidence, Hidden Photos, animal observation and dossiers, M-00 choices, ARK RECALL, and ending branches. Late revelations remain evidence-gated. User-owned ending epilogue art was left out of this art work.
- Manual minigame paths include distinct search/recovery, wiring, waveform, repair, tuning, assembly, and terminal-order interactions with persisted progress and costs.
- Desktop exploration/management controls use fixed one-screen tool groups where practical and responsive reflow on smaller screens.

## Character and image connections

- Canonical character, EVE, Sirius-era scientist, Deer arrival, crew mood, combat-sprite, capture, cinematic, and ending routes are checked by the asset audit.
- Rabbit's neutral/smile/crying/angry/unstable/critical portraits and arrival, event, and farewell art remain in the user-provided `public/assets/staff/rabbit` and cinematic locations and are connected to dialogue/story routes.
- Wolf's guarded farewell dialogue and last-stand/collapse art are on separate routes. Fox's possession/critical mood and Deer archive reveal routes are represented in the authored character/story data.
- Only missing or explicitly replaced assets from the requested art pass were changed; obsolete/unused files were removed after route checks. Existing epilogues remain outside scope.
- Do not add generated ZIPs or build artifacts to Git. `.gitignore` and `clean:generated` handle local generated output; the source-size check found no working-tree file over GitHub's 100 MiB per-file limit.

## Verification completed 2026-11-26

- `npm run test:all`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run check:assets`: PASS, 264 references and 0 required/format issues.
- `npm run check:git-size`: PASS for 483 working-tree files; Git index/history scan is blocked by child-process restrictions.
- Browser spec syntax checks and `git diff --check`: PASS.

## Remaining verification

Full visual/browser regression is not complete. `npm run test:browser` exits before Playwright launches with `Error: spawn EPERM`; native browser automation is also unavailable in this environment. Run the 48-case Playwright suite on a machine that allows Chromium child processes, then fix any actual UI failures (rather than reviving old image paths or selectors). Re-run `npm run build` there as well; the earlier handoff recorded a successful build, but this sandbox cannot verify a fresh one because child-process launch is blocked.

See [QA_REPORT.md](QA_REPORT.md) for the current run details. No gameplay implementation gap was identified by the current non-browser suite; browser presentation is the outstanding verification category.
