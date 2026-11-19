# ECHO WARD v40 — UI / NIGHT / CAPTURE REVEAL

This is a source-only incremental release for the **existing** ECHO WARD project. Do **not** replace or delete your finalized `public/assets` directory. Existing `src` asset URLs continue to work.

## Highlights
- **Capture feedback before dialogue:** successful target selection shows an animated, large in-game species sprite in a dedicated centered reveal view, with the actually selected grid coordinate (e.g. `D4`). Only after the player presses *개체 모습 확인 · 대사 이어보기* does the NPC conversation open; the transfer decision comes after the dialogue. Applies to hidden-hunt catches and previous tactical captures. A saved game that was already pending transfer loads the ordinary transport dialog.
- **Dialogue controls:** explicit `이전` / `다음` / `스킵`. Next advances a line without forcing an extra click to reveal the whole line. Replay of previous lines shows full text.
- **Tutorial decluttering:** removed `노란 UI 안내 다시 보기` button; the contextual onboarding is otherwise preserved.
- **Night incidents:** 10 event types rather than 6; separate roll for occurrence vs. incident selection, repetition penalty; unsafe/night-failed responses can inflict substantial HP, EVE core, facility and contamination damage.
- **Before/after stats:** pre-choice incident outcome estimates and post-choice actual delta report in a dedicated modal rather than a permanent banner.
- **Gear:** compact equipment selection showing item name + cost, no default cage chip; HQ special cage reward grants +3 hunting actions (does not alter normal transport mechanics).
- **Interface:** dark ARK-console styling for both sidebars, color-coded (green / amber / red) operator, EVE, animal vitals; improved text wrapping and compact layouts using commercially usable Noto Sans KR / Noto Serif KR font families with system fallback, without distributing font files.

## Installation
1. Extract the patch into the existing **v37 or later source root**, preserving your existing `public/assets` and user saves.
2. In PowerShell: `npm install`, `npm run test:v39`, `npm run test:v40`, `npx tsc --noEmit`, `npm run build`, `npm run dev`.
3. Test a new game's first rabbit and a subsequent species: successful target click should immediately show species art and a grid coordinate, THEN show dialogue on confirmation, THEN reveal the rescue choices.

## Verification and limits
- Existing game-engine regression scripts for v23, v24, v30–v37 and v39 passed. New v40 reveal-flow source-contract test passed.
- Engine + TSX checked with strict TypeScript using temporary **non-distributed** type declarations; this is not the same as an actual Next.js build.
- Dedicated v40 discovery screen visually checked at desktop 1440px and mobile 390px / 320px. This was an isolated CSS/layout preview, not full end-to-end game browser testing.
- Complete Next.js build and end-to-end interaction with installed dependencies **not verified in this environment**.
