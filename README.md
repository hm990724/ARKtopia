# ARKtopia / ANOMALY ZOO: ORIGIN ZERO

A Korean narrative survival-management game built with Next.js, React, and TypeScript. Maintain the last animal sanctuary, investigate moving threats, follow evidence in the field, rescue individual animals, and uncover the ARKTOPIA memory-preservation program.

## Run locally

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verify

```powershell
npm run check:git-size
npm run typecheck
npm run lint
npm run test:all
npm run build:qa
$env:ARK_PRODUCTION_TEST='1'
npm run test:browser
```

`build:qa` creates an isolated `.next-qa` production build. Browser tests use Chromium when installed. Run the full set after the implementation pass; focused checks may be run earlier only when a blocking error or save risk needs immediate diagnosis.

## Gameplay scope

See [the current gameplay requirements](docs/REQUIREMENTS_GAMEPLAY.md), [gameplay systems](GAMEPLAY_SYSTEMS.md), [UI and play flow](UI_GAMEPLAY_SPEC.md), [incident registry](EVENT_MATRIX.md), and [acceptance criteria](QA_ACCEPTANCE.md). Current progress and unfinished work are kept in [NEXT_STEPS_README.md](NEXT_STEPS_README.md); results from the final consolidated verification belong in [QA_REPORT.md](QA_REPORT.md).

## GitHub file-size handling

Do not commit `public.zip` or another packaged project archive. Archive formats are ignored; source, package manifests, and GitHub Actions carry the project. `npm run check:git-size` checks staged/indexed and non-ignored untracked files for GitHub's 100 MiB per-file limit. If an archive was already staged, remove it from the index with `git rm --cached -- public.zip` and then run the size check.

The canonical story is in [STORY_BIBLE.md](STORY_BIBLE.md). Ending/cinematic artwork is maintained separately and is outside the current gameplay task.

All pathogens and neural-preservation technology are fictional. The canonical cause of the historical outbreak is the research lead's forced disposal order collapsing containment and releasing the fictional agent; M-00 escapes separately and did not cause the leak.
