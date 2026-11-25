# Acceptance checklist

Source of scope: [gameplay requirements](docs/REQUIREMENTS_GAMEPLAY.md). Current work status is [NEXT_STEPS_README.md](NEXT_STEPS_README.md). This checklist is for connected gameplay, not asset counts.

| Area | Acceptance condition | Final evidence |
|---|---|---|
| Idle enemy AI | With no player movement, a pursuer changes patrol/search position on the expedition clock; visible noise/light can lead to pursuit and combat. | Final logic + browser regression |
| Hide and escape | Breaking line of sight moves the enemy to the last seen position; cover/concealment, retreat, and extraction remain usable. | Final logic + browser regression |
| Hunt under pressure | An active animal hunt is saved when combat starts and restored after the encounter. | Final logic + browser regression |
| Capture | Aim/drag changes impact cell and net precision; bad throws raise fear/misses; species strategies, bait, trap, and calm have distinct outcomes. | Final logic + browser regression |
| Crew | Zero to two valid staff can deploy; abilities apply in exploration/combat; deployed staff cannot also work at base that day; old one-person saves load. | Save migration + browser regression |
| Survival | Day settlement uses food, fuel, filters, power, facilities, staff, and animals. 100% pressure is dangerous but does not expel the player. | Logic regression + day-transition browser flow |
| Growth | Salvage is spendable on construction, research, equipment, and higher-risk expeditions; shortages are shown before commit. | Logic regression + browser regression |
| Events | Registry has 41 unique state-conditioned incidents with durable choices and 1–3 day follow-up effects. | Registry/choice regression + browser flow |
| Research/minigames | Resonance, diagnosis, treatment, repair, photo recovery, observation, M-00, and ARK RECALL all require input and settle quality once. | Logic regression + browser regression |
| UI | Common desktop gameplay tools fit together without routine vertical scrolling; mobile reflows without clipping. | Final viewport browser checks |
| Save compatibility | Existing fields/routes survive loading; new autonomous/hunt/crew fields get safe defaults and persist. | Legacy-save fixtures + browser round trip |
| Git size | Local ZIP bundles are ignored; staged files at GitHub's 100 MiB single-file limit are reported. | `npm run check:git-size` |

Ending art, cinematic art, epilogues, and image generation are outside the current task and must not be modified.
