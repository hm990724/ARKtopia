# ARKtopia gameplay scope

Current player-facing implementation scope, excluding new artwork. Existing image paths and assets must remain intact. Ending illustrations, cinematic art, epilogues, and image generation are owned separately and are not part of this work.

## 1. Exploration, capture, and combat

- Enemies advance on the expedition clock while the player is stationary. Patrol, noise/light investigation, last-seen search, pursuit, concealment, and combat interruption must form one saved state flow.
- Walking, fast movement, light, and tracking actions create different noise and detection pressure. Sight is blocked by terrain; concealment breaks sight and sends a pursuer to the last seen location.
- Field movement is continuous in time with WASD/arrow controls, persistent discovered cells, flashlight vision, nearby grass movement, footprints, sound direction/strength, and visible movement in cleared areas.
- Detection must work through directional sound/sector signals and evidence as well as map tiles; never expose hidden creature coordinates before an earned observation.
- Up to two recruited staff can join a sortie. Their roles affect tracking, combat, treatment, load, and the same-day availability of base work. Old saves with one companion remain valid.
- Capture combines search, live evidence, mouse aim/drag, net trajectory, resistance, failure, bait, species habits, cages, and nonlethal calming. All 13 species need meaningfully different behavior and tactical tradeoffs.
- Combat has telegraphed attacks, strike, guard, cover, healing, retreat, EVE pulse, and role-specific staff support. Victory, retreat, and resuming an interrupted capture settle exactly once.
- CCTV and tracking network observe real creatures with blind spots. Tracking upgrades have five meaningful levels. Tracking pressure at 100% raises danger and consequences; it never forcibly ejects the player.

## 2. Survival, economy, and growth

- Day transitions charge food, fuel, power, filters, facility wear, staff fatigue, and animal care. Neglect should become a serious but recoverable crisis around Day 10.
- Exploration rewards have real sinks: facilities, wiring, upgrades, supplies, research, and safer access to higher-risk regions. Inventory feedback tells players where resources come from, what spends them, and the shortfall before actions.
- Base construction follows resource cost, assembly, wiring, and power state. Four facility priorities produce real power-on/off effects and clear forecasts; night repairs are interactive.
- Equipment upgrades change field performance. Staff away on a sortie cannot also perform same-day base work.

## 3. Staff, relationships, and incidents

- Four staff have distinct roles, skills, availability, bond, memories, fatigue, and mental stability. Portrait mood follows stable/unstable/critical state without changing existing art assets.
- Staff death applies the group morale penalty once, then leaves a memorial, unique dialogue, work vacancy, and EVE response. Zero staff remains a playable solo-management state.
- Forty-one conditional incidents require real state gates and consequential choices. Choices can schedule or bias related events over the next one to three days; dependencies such as blackout → CCTV blind spot → escape risk must resolve through state.

## 4. Research and story play

- Resonance, diagnosis, treatment, containment repair, and Hidden Photo restoration use distinct player actions whose quality changes the outcome.
- Animal observation and the archive unlock habits, tracks, sounds, memories, and origins from actual play.
- M-00 follows discovery → special examination → transfer or protection. ARK RECALL revisits previously secured individuals with resumable, specimen-specific interactions.
- Ending logic may continue to use research, staff survival, EVE trust, and M-00 choices. Do not edit ending/cinematic art or reveal late story facts early.

## 5. UI and play flow

- Keep day/AP, power, shortfalls, staff state, and immediate goal visible together. Prefer a single-screen dashboard with adjacent tools; avoid unnecessary page scrolling on common desktop resolutions while retaining mobile reflow.
- Explain why unavailable equipment cannot be used and how to obtain it. Dialogue is paced deliberately, with skip and transcript review for important scenes.
- Modals fit short and wide viewports. Exploration, combat, capture, maintenance, and research preserve progress through save/load.
- The opening makes the core loop and first action clear. Minigames use distinct decision rules, clear feedback, and an outcome that affects the linked system.

## Delivery and repository size

- Implement first; consolidate type/build/logic/browser regression after the implementation pass. Run a focused check earlier only for a blocking failure or risk to saved data.
- `npm run check:git-size` checks indexed, staged, and ordinary untracked files against GitHub's 100 MiB single-file limit. ZIP and archive bundles stay local and are ignored; commit source files instead of `public.zip`.
- Maintain `NEXT_STEPS_README.md` as the one current implementation handoff. Do not add more version-numbered handoff or QA reports.
