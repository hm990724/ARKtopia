# Gameplay systems

This file summarizes the current gameplay loop. It is intentionally version-free; implementation status lives in `NEXT_STEPS_README.md` and final verification results live in `QA_REPORT.md`.

## Exploration and capture

- Launch preparation checks AP, region unlocks, supplies, and a maximum two-person recruited crew. Staff on a sortie cannot also perform same-day base support.
- The player moves through a persistent field map with flashlight visibility, remembered cells, footprints, nearby grass response, directional audio, salvage, hazards, and a return route.
- An independent expedition clock advances enemy patrols even while the player is still. Noise, light, concealment, line of sight, and the last known player location drive investigation, pursuit, and combat. A pursuit can interrupt a creature hunt; saved hunt progress resumes after combat.
- Capture uses species habits, search evidence, four-sector acoustic readings, mouse net aim/drag, traps, calm approaches, resistance, and resource consequences. Exact hidden positions remain hidden until found.
- Combat presents the enemy intent and offers attack, guard, cover, heal, EVE pulse, staff support, and retreat. Staff roles change outcomes; settlement rewards are one-time.

## Survival and growth

- Night settlement accounts for power, fuel, filters, animal care, infection, staff morale, external pressure, and facility condition. A 100% pressure reading is a severe threat state with escalating consequences, not a forced ejection.
- Recovered food, scrap, parts, cells, medicine, filters, and credits feed purchases, facility construction, equipment, research, CCTV, and field upgrades.
- Four facility priorities allocate available night power; offline facilities stop their linked benefits. Circuit repair and facility assembly have player actions and saved outcomes.
- Leaving the blackout power-saving response can take installed CCTV offline through its follow-up. Live scan/watch/camera tracking are blocked during the outage, animal escape risk grows, and manual trace tracking plus incident repair choices remain available.

## People, incidents, research

- Four crew roles provide distinct field and base support. Bond, memory, fatigue, mental stability, death, memorial, vacancies, and EVE responses are stateful.
- Forty-one conditional incidents change resources, facilities, staff, specimens, CCTV, and threat. Selected high-risk choices schedule a related incident 1–3 days later; the saved follow-up only appears while its state conditions remain valid and expires after its window.
- Resonance, diagnosis, treatment, containment work, Hidden Photo records, animal observation, and M-00 investigation have dedicated routes. ARK RECALL persists by individual specimen and uses species-specific interactions.

## Saves and assets

- New fields use defaults during legacy save loading. Existing ending routes and asset references remain unchanged by gameplay work.
- Artwork generation and ending/cinematic/epilogue artwork are explicitly out of scope. No new archive bundle should be added to Git; use `npm run check:git-size` before committing.
