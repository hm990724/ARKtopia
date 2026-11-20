# ECHO WARD v61 — Guided UI / HQ / Live Map

## What's changed

- Removed the optional **잠긴 기억 파편** selector from the new-game screen. Internally, the legacy artist origin remains the default for game-state compatibility.
- Added a guided tutorial spotlight: a gently animated dark backdrop, a highlighted **real clickable button**, EVE avatar and short in-place subtitle. The focus can be dismissed, and it respects reduced-motion preferences.
- Replaced the operator's duplicated lower readout with slim **정신력 / 오염도** bars underneath the existing AP meter.
- Restructured the three dispatch cost doughnuts into a compact cost panel above the expedition button. They continue to show before -> after values.
- Removed the repeated operator illustration from the expedition's left sidebar. Kept the sector background illustration and placed a same-width **LIVE MAP** directly below the sector name. It shows explored tiles, operator location and known return point.
- The first tutorial rabbit can **only be transferred alive** from HQ; the game engine rejects attempts to refuse or send only data during this one-time tutorial.
- Later HQ transmissions offer three choices: **생체 이송 / 데이터만 전송 / 인계 거부**. Data-only costs 8% power and preserves the living animal; it never awards a premium specimen bonus.
- Employees no longer arrive as the benefit of handing over matching animals. The HQ roster is automatically scheduled: DAY 1 의무관 (after guided onboarding), DAY 2 보급관, DAY 3 보안관, DAY 4 서기관. The arrival cutscene still uses the existing staff-arrivals assets. A retired employee is never recruited again.
- Existing v60 games and image paths remain supported; no asset files are included.

## Files in the patch

- `src/components/Game.tsx`
- `src/components/FieldMission.tsx`
- `src/lib/game-v10.ts`
- `src/app/globals.css`

## Apply

Unzip into the project root to overwrite the 4 files above. **Do not delete `public/assets`, `.git`, `package-lock.json`, or your local environment file**. To deploy to Vercel, commit and push the changed files.

```powershell
npm run typecheck
npm run build
git add src/components/Game.tsx src/components/FieldMission.tsx src/lib/game-v10.ts src/app/globals.css
git commit -m "feat: v61 guided UI and scheduled staff"
git push origin main
```

## Checks

- TSX parse checks: `Game.tsx`, `FieldMission.tsx` passed
- CSS parsing: passed
- TypeScript strict compile of `src/lib/*.ts`: passed
- State-driven tests: DAY 1–4 scheduled staff, first rabbit's one-way HQ choice, non-lethal data transmission, save migration, no duplicate or retired staff: passed
- Next.js production build: **not verified** because `registry.npmjs.org` was unreachable (`EAI_AGAIN`) in this working environment. Run the two commands above locally before pushing.
