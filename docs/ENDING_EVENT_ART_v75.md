# v75 Ending and Incident Artwork

The ending screen now uses one separate 1536×1024 illustration for each of its 19 registered outcome titles. Daily event dialogs use six illustrated scenes selected by incident type, covering all 13 incident IDs. The shared visual direction is dark, mauve-and-rose survival fantasy with readable silhouettes, pixel-textured finish, and story-specific props.

## Ending images

| Ending | Asset | Visual beat |
|---|---|---|
| 방주의 씨앗 | `ending_seed_ark_v75.png` | EVE prepares the preservation facility for the next day |
| 에덴 | `ending_eden_v75.png` | Animals choose a new refuge and future |
| 영원한 실험 | `ending_eternal_experiment_v75.png` | An experiment continues inside the sealed facility |
| 마지막 동물원 | `ending_last_zoo_v75.png` | Animals choose where to remain beyond an open door |
| 본부의 계승자 | `ending_successor_v75.png` | A solitary caretaker inherits headquarters control |
| 상처 없는 복원 | `ending_humane_restoration_v75.png` | Researchers preserve memories while reducing sacrifice |
| 기록 밖의 봄 | `ending_spring_outside_records_v75.png` | A garden opens beyond headquarters records |
| 뒤늦은 철문 | `ending_late_gate_v75.png` | A containment gate opens after the loss |
| 비어 있는 교대실 | `ending_empty_shiftroom_v75.png` | The shift room remains empty after the staff are gone |
| 침묵의 자동화 | `ending_silent_automation_v75.png` | Preservation routines repeat without people |
| 마지막 신호 | `ending_last_signal_v75.png` | A rooftop antenna sends a final rescue signal |
| 인간 이후의 첫 문장 | `ending_first_sentence_v75.png` | A new consciousness begins its own record |
| 미완의 부활 | `ending_incomplete_revival_v75.png` | Incomplete bodies and unfinished research remain |
| 제000번 우리 | `ending_subject_000_v75.png` | The manager is recorded as enclosure subject 000 |
| 우리 밖의 봄 | `ending_spring_beyond_cage_v75.png` | Animals walk through a containment gate into spring |
| 흩어진 이름들 | `ending_scattered_names_v75.png` | Survivors reclaim their names and separate paths |
| 마지막 두 관리자 | `ending_two_caretakers_v75.png` | EVE and the manager share the final watch |
| 고요한 자동화 | `ending_quiet_automation_v75.png` | The facility keeps running with only its records |
| 마지막 통신 | `ending_final_transmission_v75.png` | The last transmission leaves a silent control room |

## Incident images

| Incidents | Asset |
|---|---|
| breach, predator | `event_containment_v75.png` |
| blackout | `event_blackout_v75.png` |
| spores | `event_spores_v75.png` |
| signal, visitor, intrusion | `event_signal_v75.png` |
| coolant | `event_coolant_v75.png` |
| echo, rations, garden, keepsake, quiet | `event_garden_v75.png` |

The artwork is wired into the ending record screen and the daily incident modal. Asset provenance and content notes are in `generated-assets-v75-endings-events.json`. The new browser coverage checks every ending URL plus a mobile blackout event dialog; `test:v75` checks all 19 ending matches and all 13 incident mappings against the actual PNG files.
