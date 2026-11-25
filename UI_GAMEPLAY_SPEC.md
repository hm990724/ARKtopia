# UI and gameplay flow

This is the current interface target for the system requirements in [REQUIREMENTS_GAMEPLAY.md](docs/REQUIREMENTS_GAMEPLAY.md). The screen should present status, decision tools, and consequences together so the player can act without hunting through long panels.

## First session

1. The opening screen explains the loop: explore and rescue, care and research, survive and choose. The start choices show their gameplay benefit.
2. A first-day objective stays visible. Launch preparation lists missing equipment, cost, recruited companions, AP, and region risk before the player commits.
3. Tutorial gates teach field movement, clues, capture, care, and research in sequence without exposing late-story information early.

## In the field

- Keep the day/AP, power, health, noise/pressure, current objective, and escape route within one view on common desktop resolutions.
- Place the specimen readout, map/aim surface, live acoustic bearing, capture methods, combat tools, and retreat controls next to one another. Avoid a tall scroll column for routine actions.
- Use moving sector/audio indicators and evidence age alongside the map. Never show an exact hidden animal or enemy location without a valid reveal.
- When an enemy interrupts tracking, explain that capture progress is preserved and return to that hunt after combat.

## Base and story systems

- Day-end forecasts show power after maintenance and batteries, fuel/filter availability, facilities that will go offline, and animal/staff risks.
- Inventory actions show current quantity, source, use, and the precise shortage before they are selected.
- Modal operations fit the viewport; on short or narrow screens they reflow and allow focused interaction rather than clipping.
- Dialogue uses deliberate pacing, a transcript for important scenes, and explicit skip controls where appropriate.

## Input and persistence

- Mouse and touch controls expose the same action and outcome; the capture grid supports pointer aiming/dragging, while keyboard activation stays available.
- Save/load preserves expedition position, creature trail, companion assignment, interrupted hunt, minigame progress, day costs, and unique specimen records.
- Reduced-motion settings suppress decorative movement without removing critical state feedback.
