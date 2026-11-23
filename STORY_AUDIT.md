# ARKtopia / ORIGIN ZERO — Story and cast audit

Audit date: 2026-11-23

## Canon checked in source

- `STORY_BIBLE.md` and `docs/STORY_BIBLE_WAR_ARKTOPIA_v69.md` identify the scientist's forced postwar disposal operation and containment/power failure as the pathogen-release cause. M-00 escapes separately and is not blamed for the collapse.
- M-00 is an ordinary pixel-art black cat with no human brain transfer, independent cognition, a small right-ear nick, and one white chest hair. The false CCTV monster is a stretched shadow; the three-camera trace identifies the cat.
- `SPECIES_MEMORY` contains the 13 animal roles and their memory fragments. Lynx, Axolotl, Moth, special Mutant, Chimera, and Specter use the user's final roles and behavioral/art direction. ARK RECALL reveals a specimen's own memory record; tests cover all 13 interaction profiles.
- The early-EVE art gate is neutral until human-truth evidence or the late photo threshold. The photo reveal states that EVE is an independent AI rather than the scientist's daughter.
- Tutorial transfer marks its rabbit non-living/transferred and clears the active selection. The specific tutorial/capture journey is browser-tested.
- Eight canonical ending outcomes remain distinct and maintain the manager-death canon. Tests verify all eight outcome records; browser routes open each ending UI.

## Cast and ending art review

- The active ending art map currently contains 19 route prefixes. Active images are SVG portrait compositions and reference only the project's canonical protagonist and EVE portraits, so they contain no unrelated mutant or invented faces.
- The SVG art is an interim cast-safe composition, not bespoke scene art. It does not dynamically select staff based on recruitment/death state, and does not yet provide each route's requested character-specific pose, dialogue, and cinematic tableau. Do not mark full ending-scene art as complete.
- Each route's narrative record is resolved from game state, but a natural full campaign through all eight outcomes has not been played from a fresh save. Existing tests inject deterministic state fixtures.
- Staff arrival/termination scenes use existing canonical staff IDs. Wolf's current termination file shows the female black-haired guard. Current UI gates the termination scene on actual termination; verify all future narrative additions against `crew.members` and `crew.retired` state.

## Remaining narrative QA

1. Run fresh-save, natural multi-day playthroughs and verify the EVE reveal timing, all staff arrival gates, 12 hidden photos, M-00 decision, ARK RECALL, and eight ending conditions.
2. Add state-aware character selection to ending scenes; show only alive/recruited people and EVE when the route includes them.
3. Commission or generate bespoke ending and staff-event cinematic artwork that matches the current canonical character designs. Current portrait SVGs are not the final requested art.
4. Check late-game dialogue for dead/unrecruited staff and unsaved-specimen memory claims with scenario-based browser tests.

