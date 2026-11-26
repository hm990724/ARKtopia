# ARKtopia QA report

Updated 2026-11-26. Gameplay and asset checks pass; full browser verification remains blocked in this sandbox.

## Passed in this run

- `npm run test:all`: PASS, including logic/save migration, v69-v76, v81-v83, ending matrix, roaming MUTANT AI/capture, region care, and deterministic minigame suites.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run check:assets`: PASS. 264 asset references checked; no missing required assets, format mismatches, or obsolete `mutant_mutant` / `enemy_echo` / `enemy_smile` files.
- `npm run check:git-size`: PASS for 483 working-tree files; none reach GitHub's 100 MiB single-file limit. The index/history scan is unavailable because this sandbox blocks Node child processes.
- `node --check` on browser specs v71-v75: PASS.
- `git diff --check`: PASS; Git reports only configured LF-to-CRLF notices.

## Browser verification still needed

`npm run test:browser -- --reporter=line` currently exits before Playwright starts with `Error: spawn EPERM`. Browser UI automation also cannot attach to a native browser in this environment. This is an environment launch restriction, not a passed browser run. Several browser expectations were aligned with the current canonical character portrait, cinematic, and incident artwork routes; the MUTANT encounter case now checks its actual variant-specific dialog and reveal path. The UI still needs an end-to-end browser regression run on a machine where Playwright can launch Chromium.

## Build status

The previous 2026-11-25 handoff recorded a successful production build. A fresh build could not be confirmed in this sandbox because Next.js child-process startup is blocked with `spawn EPERM`; do not treat the old build result as a current-run verification.

## Current coverage checked

The current suites cover 20 distinct MUTANT sprites and encounter stills, 13 animal capture protocols, real-time field threat behavior, staff role support, save/load, base upkeep, conditional incidents, story/ending routes, mood portraits, and manual minigame paths. The asset checker confirms the canonical image routes exist. Visual presentation and responsive layout remain unverified until the browser suite can run.
