# Gameplay-only audit — 2026-11-24
Scope: three supplied master directives, gameplay requirements and current source. Latest request excludes any further image editing or path changes. Existing image files are untouched by this commit.
## Code-confirmed before changes
- Daily AP and sortie limit, gear cost, two recruited companions and mutual base support/sortie restriction.
- Seeded tactical fields, WASD, cover, sight, retained fog discovery, 13 species hunt tactics and capture board, net interaction.
- Fuel and filter upkeep, food and facility decay, four-facility priority allocation, upgrades, nightly circuit and security, stock purchases.
- 41 distinct incident IDs and weighted state predicates, staff recruitment/relations/conflicts/morale/retirement, 30-point grief and permanent role penalty.
- Hidden photo puzzles, M-00 origin check and transfer/protection branches, per-specimen recall records and eight main endings; legacy endings remain.
## Fixed in this commit
- Shared roaming AI for movement and timed ticks; bounded sound range, LOS, patrol, last seen, two-step close warning, retreat cooldown. Coordinate-derived direction and signal strength during exploration/hunt. No art changes.
- Capture interruption preserves and restores saved capture state after ordinary retreat/victory. Explicit field departure cannot bypass combat. Hunting noise is a game-state effect, listening quiets noise; cover available while hunting.
- Incident emergency response only when every ordinary choice is invalid, with actual cost; correct AP charge and power/food gating, unlimited knowledge/clue totals, target role-specific morale, queue deaths immediately, conceal M-00 signature event until scan, follow-up weights respect actual eligibility.
- Seed ending additionally requires EVE trust and live protection; automation also reflects critical EVE/trust.
- Updated regression fixtures to account for first-encounter scene and harder Mutant.
## Not verified / remaining
No execution environment with repository checkout or npm dependencies was available; GitHub connector permits source edits but not local npm/Playwright execution. Do not mark tests passed. Natural campaign pacing, all UI resolutions, each event's followup chain, actual 41 unique authored scenes, exact 19 CG visual cast, free-form flashlight aim, mouse trajectory timing, detailed individual treatment/power mini-game variety, full balance and all routes still require gameplay QA. Images were excluded by request. Existing prototype mechanics are not equivalent to final commercial quality. This commit focuses on confirmed defects, not replacing functioning gameplay with an untested rewrite.
