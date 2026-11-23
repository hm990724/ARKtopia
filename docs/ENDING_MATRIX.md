# Ending and cast matrix

검수 기준일: 2026-11-23
정본 코드: `src/lib/sim.ts`, `src/lib/origin-zero.ts`, `src/lib/specimen-archive.ts`, `src/lib/ending-art.ts`

## 실제 엔딩 조건

ORIGIN ZERO 엔딩 분기는 finale 진입 시 `finishWithArchive()`가 실행되며, `originReadyForFinale()`가 참일 때 8개 메인 에필로그로 바꿉니다. 준비 조건은 route 선택, crisis 완료, 사진 12장, 후보 개체 전원의 회상 기록, 3종 이상의 완료 회상, 면역도 75 이상입니다.

| ID | 표시 제목 | 코드상 조건 | 활성 장면 파일 | 장면에 허용되는 인물 |
|---|---|---|---|---|
| E1 | 영원한 실험 | finale 준비 완료 + 목표 `rebuild` + 면역도 < 100 | `ending_eternal_experiment_v77.svg` | 관리자, EVE만. 직원·동물 실루엣은 포함하지 않음 |
| E2 | 에덴 | finale 준비 완료 + 목표 `rebuild` + 면역도 ≥ 100 | `ending_eden_v77.svg` | 관리자, EVE만. 이름·외형이 정해지지 않은 인물이나 군중은 추가하지 않음 |
| E3 | 방주의 씨앗 | 목표 `freedom` + 면역도 ≥ 85 + 사진 12장 + 강제 회수 < 2 | `ending_seed_ark_v77.svg` | 관리자, EVE만 |
| E4 | 마지막 동물원 | 목표 `freedom`이며 E3·E7 조건에 해당하지 않음 | `ending_last_zoo_v77.svg` | 관리자, EVE 및 살아남은 동물만. 현 SVG는 동물 roster에 따라 바뀌지 않음 |
| E5 | 제000번 우리 | 목표 `preserve`의 기본 분기 (사망 직원 < 2, 마지막 신호 조건 미충족) | `ending_subject_000_v77.svg` | 관리자, EVE만 |
| E6 | 침묵의 자동화 | 목표 `preserve` + 사망 직원 ≥ 2 | `ending_silent_automation_v77.svg` | 관리자/EVE의 부재 또는 기존 EVE 인터페이스만. 사망·미합류 직원을 생존 인물처럼 보여주면 안 됨 |
| E7 | 흩어진 이름들 | 목표 `freedom` + (강제 회수 ≥ 2 또는 생존 동물 ≤ 1), 단 E3가 우선 | `ending_scattered_names_v77.svg` | 관리자, EVE, 생존 roster만. 떠난 개체나 사망 직원을 살아 있는 장면 인물로 재현하지 않음 |
| E8 | 마지막 신호 | 목표 `preserve` + 사망 직원 < 2 + HQ 정보 ≥ 65 + 본부 송신 ≥ 1 | `ending_last_signal_v77.svg` | 관리자, EVE만 |

`originEndEpilogue()`는 `rebuild`와 `freedom`을 먼저 처리한 뒤 `preserve`에 대해 E6/E8/E5를 평가합니다. 따라서 E6·E8·E5는 `preserve` 선택에서만 도달합니다. E3 조건은 E7보다 먼저 적용됩니다.

## 메인 외 실제 도달 가능한 제목과 경로

| 소스 제목/변형 | 발생 조건 | 활성 장면 파일 |
|---|---|---|
| 본부의 계승자 | archive finale 미준비, `rebuild`, 이송+송신 ≥ 3, 강제 회수 > 0 | `ending_successor_v77.svg` |
| 상처 없는 복원 | archive finale 미준비, `rebuild`, 이송 0, 강제 회수 0, 지식 ≥ 120 | `ending_humane_restoration_v77.svg` |
| 기록 밖의 봄 | archive finale 미준비, `freedom`, 이송 0, 강제 회수 0 | `ending_spring_outside_records_v77.svg` |
| 뒤늦은 철문 | archive finale 미준비, `freedom`, 강제 회수 ≥ 2 | `ending_late_gate_v77.svg` |
| 비어 있는 교대실 | archive finale 미준비, `preserve`, 퇴직 직원 ≥ 2 | `ending_empty_shiftroom_v77.svg` |
| 인간 이후의 첫 문장 | 기본 `finish()`의 `rebuild`, mirror 참·지식 ≥ 155·생존 동물 ≥ 4 | `ending_first_sentence_v77.svg` |
| 미완의 부활 | 기본 `finish()`의 `rebuild`, 지식 ≥ 100이나 첫 문장 조건 미충족 | `ending_incomplete_revival_v77.svg` |
| 제000번 우리 | 기본 `finish()`의 `rebuild` 기본 결과; 정신력 사망도 이 제목을 씀 | `ending_subject_000_v77.svg` |
| 우리 밖의 봄 | 기본 `finish()`의 `freedom`, 신뢰 ≥ 63·생존 동물 ≥ 3 | `ending_spring_beyond_cage_v77.svg` |
| 흩어진 이름들 | 기본 `finish()`의 `freedom` 기본 결과 | `ending_scattered_names_v77.svg` |
| 마지막 두 관리자 | 기본 `finish()`의 `preserve`, EVE ≥ 45 | `ending_two_caretakers_v77.svg` |
| 고요한 자동화 | 기본 `finish()`의 `preserve` 기본 결과 | `ending_quiet_automation_v77.svg` |
| 마지막 통신 / 마지막 신호 | EVE 신호 고갈 시나리오 또는 archive의 마지막 신호 결과 | `ending_final_transmission_v77.svg` 또는 `ending_last_signal_v77.svg` (title prefix에 따라 결정) |

실제 19개 장면 파일은 `ENDING_ART`에 있고 각 경로는 서로 다릅니다. `LEGACY_ENDING_ART`는 이전 저장 제목을 기존 구성에 연결합니다. `findEndingArt()`는 등록되지 않은 제목에 대해 `ending_subject_000_v77.svg`를 폴백으로 사용합니다. 이 폴백은 크래시 방지이며, 새로운 서사 결과가 추가될 때 자동으로 맞는 장면이 된다는 뜻은 아닙니다.

## 인물·이미지 검수 결과

- v77 SVG 19개는 각기 다른 프레임/문구를 가지지만 내부 래스터 26개는 SHA-256상 단 두 그림만 반복합니다. 하나는 보라색 머리의 젊은 관리자 초상, 다른 하나는 은발·청록색 EVE 초상입니다. 따라서 엔딩별 고유 시네마틱 일러스트가 아닙니다. 인물 정체성은 이 초상만으로 완전히 검증할 수 없습니다.
- 엔딩 이미지 자체에는 현재 생존 직원이나 동물이 없습니다. 따라서 미합류/사망 직원을 잘못 등장시키지는 않지만, 생존 roster에 따라 장면이 달라지는 기능도 없습니다.
- E2 에덴, E4 마지막 동물원 등 각 엔딩을 설명할 구체 장면(복제 사회, 안전한 동물원, 마지막 보고, 직원별 기억/생존 상태)은 아직 제작되지 않았습니다. 알 수 없는 신규 인물이나 미정 외형을 추가하지 않고 기존 정의 인물만 써야 합니다.
- 미제작 고퀄 이미지: 19개 엔딩 경로별 전용 시네마틱, 생존 상태별 캐릭터 구도, 추가 주요 사건 시네마틱. 파일 존재를 품질 완성으로 간주하지 않습니다.
- 내부 래스터 중복 접촉 시트: `art-review/ending-v77-embedded-contact.png`. 분석 자료이며 게임 경로에는 연결하지 않았습니다.
- 미제작 고퀄 이미지: 19개 엔딩 경로별 고유 일러스트와 상태별 생존 roster 변형, 그리고 추가 주요 사건 시네마틱. 파일 존재 여부만으로 품질 완성을 주장하지 않습니다.

## 보존된 이전 엔딩 파일

기존 8개 handoff WebP, v75/v76 PNG, v77 SVG는 모두 유지합니다. 이전 파일명과 새 제목의 대응은 의미상 완전한 1:1 관계가 아니므로, 사용처와 장면 내용을 확인하지 않은 채 덮어쓰거나 제거하지 않습니다.

| 기존 handoff 파일 | 보존 상태 | 참고 대응 |
|---|---|---|
| `ending_new_consciousness.webp` | 보존 | 에덴/인간 이후의 첫 문장과 주제상 인접하나 동일 장면으로 단정하지 않음 |
| `ending_incomplete_revival.webp` | 보존 | 미완의 부활 |
| `ending_subject_000.webp` | 보존 | 제000번 우리 |
| `ending_open_spring.webp` | 보존 | 우리 밖의 봄/마지막 동물원과 주제상 인접 |
| `ending_scattered_names.webp` | 보존 | 흩어진 이름들 |
| `ending_two_caretakers.webp` | 보존 | 마지막 두 관리자 |
| `ending_silent_automation.webp` | 보존 | 고요한 자동화/침묵의 자동화와 주제상 인접 |
| `ending_last_signal.webp` | 보존 | 마지막 신호/마지막 통신 |
