# ARKtopia / ANOMALY ZOO: ORIGIN ZERO

ARKtopia is a Korean narrative survival-management game built with Next.js, React, and TypeScript. Maintain the last animal sanctuary, investigate CCTV anomalies, follow tracks in dark field maps, rescue individual animals, and uncover the ARKTOPIA memory-preservation program.

## Run locally

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verify

```powershell
npm run typecheck
npm run lint
npm run test:all
npm run build:qa
$env:ARK_PRODUCTION_TEST='1'
npm run test:browser
```

`build:qa` creates the isolated `.next-qa` production build. Browser tests use Chrome when installed; Playwright may require a shell allowed to spawn the browser.

## Current feature set

- Daily sortie limit, AP and equipment checks with clear launch blockers.
- Dark, persistent field map; live sightings on already discovered cells; footprints, grass movement, direct capture, and old-save migration.
- Short contamination encounters, salvage rewards, and saved base upgrades.
- CCTV/night-response, staff, animal-care, memory research, Hidden Photo, ARK RECALL, and legacy ending flow.
- Animal-by-animal rescanning and recovery history.

## Project status

The current integrated implementation and verification summary is in [NEXT_STEPS_README.md](NEXT_STEPS_README.md) and [QA_REPORT.md](QA_REPORT.md). Gameplay rules are in [GAMEPLAY_SYSTEMS.md](GAMEPLAY_SYSTEMS.md); art status and unresolved creature variants are in [ART_AUDIT.md](ART_AUDIT.md) and [docs/ART_REWORK_v75.md](docs/ART_REWORK_v75.md).

All pathogens and neural-preservation technology in this project are fictional. The canonical cause of the historical outbreak is the research lead's forced disposal order collapsing containment and releasing the fictional agent; M-00 escapes separately during the resulting chaos and did not cause the leak.
