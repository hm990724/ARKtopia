# QA report

Updated 2026-11-25. This report records the completed implementation pass and the consolidated checks actually run. Browser integration remains incomplete, so this is not a full QA sign-off.

## Passed

- `npm run test:all`: PASS. Logic/save suites, v69-v76, v81-v83, ending matrix, roaming mutant, region care, and deterministic minigame checks passed.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run check:assets`: PASS. The checker reports informational legacy staff-arrival and first-meeting candidates; current fallback/story candidates are available.
- `npm run check:git-size`: PASS. No indexed, staged, or ordinary untracked source file is at or above 100 MiB. Keep generated ZIPs local; `public.zip` is ignored.
- `npm run build`: PASS. The production bundle compiled and prerendered `/` and `/_not-found`.

## Incomplete: browser regression

`npm run test:browser` was stopped after reaching 19 of 48 cases because the run was taking too long. It is not a pass. Observed failures:

- AP 0 night handling did not find the expected night-settlement control.
- Recovered-photo dialog and night-wiring panel tests waited for UI selectors that may no longer match current markup.
- Voice identity test did not open the expected event dialog.
- Hunt/pixel layout cases used stale toolbar/status selectors.
- First-expedition flow timed out.
- Ranger walk test did not observe the expected movement.

Before changing gameplay code, compare each failing test with the current component and distinguish stale selectors/fixtures from actual user-visible failures. Then rerun affected scenarios and complete the remaining browser suite.

## Focused MUTANT cinematic check

- `npm run test:browser -- tests/browser-v73.spec.cjs -g "first roaming MUTANT encounter"`: PASS. The real encounter dialog loaded `/assets/cinematics/field-threats/roaming-mutant/reveal.png` successfully.
- Final local checks after adding the new still and its scene hook: typecheck, lint, asset references, Git file-size guard, and production build all passed. Existing non-blocking build warnings remain.

## Non-blocking warnings and asset limits

- Build emitted CSS compatibility warnings for `end` alignment and React hook dependency warnings in `FieldMission.tsx`, `Game.tsx`, and `VoiceBreachPanel.tsx`.
- Existing images, ending art, cinematic stills, and files under `public/assets` were left unchanged. The separately requested new MUTANT encounter still is at `public/assets/cinematics/field-threats/roaming-mutant/reveal.png`.
- Browser QA can generate screenshots under `docs/qa-v71`; do not use or commit those generated screenshot changes as production art.

See [NEXT_STEPS_README.md](NEXT_STEPS_README.md) for implementation coverage and the next browser-QA steps.
