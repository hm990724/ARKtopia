# Ending and cast matrix

검수 기준일: 2026-11-23
정본 코드: `src/lib/sim.ts`, `src/lib/origin-zero.ts`, `src/lib/specimen-archive.ts`, `src/lib/ending-art.ts`

## 실제 엔딩 조건

ORIGIN ZERO 엔딩 분기는 finale 진입 시 `finishWithArchive()`가 실행되며, `originReadyForFinale()`가 참일 때 8개 메인 에필로그로 바꿉니다. 준비 조건은 route 선택, crisis 완료, 사진 12장, 후보 개체 전원의 회상 기록, 3종 이상의 완료 회상, 면역도 75 이상입니다.

| ID | 표시 제목 | 코드상 조건 | 활성 장면 파일 | 장면에 허용되는 인물 |
|---|---|---|---|---|
| E1 | 영원한 실험 | finale 준비 완료 + 목표 `rebuild` + 면역도 < 100 | `ending_eternal_experiment_cinematic.png` | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| E2 | 에덴 | finale 준비 완료 + 목표 `rebuild` + 면역도 ≥ 100 | `ending_eden_cinematic.png` | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| E3 | 방주의 씨앗 | 목표 `freedom` + 면역도 ≥ 85 + 사진 12장 + 강제 회수 < 2 | `ending_seed_ark_finale.png` | 젊은 관리자와 EVE의 마지막 보고 컷. 저장된 생존 직원·동물은 별도 UI에 실제 상태대로 표시합니다. |
| E4 | 마지막 동물원 | 목표 `freedom`이며 E3·E7 조건에 해당하지 않음 | `ending_last_zoo_cinematic.png` | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| E5 | 제000번 우리 | 목표 `preserve`의 기본 분기 (사망 직원 < 2, 마지막 신호 조건 미충족) | `ending_subject_000_choice.png` | 젊은 관리자와 EVE의 정체성 선택 장면. 직원·동물 생존자는 저장 상태대로 별도 표시합니다. |
| E6 | 침묵의 자동화 | 목표 `preserve` + 사망 직원 ≥ 2 | `ending_silent_automation_cinematic.png` | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| E7 | 흩어진 이름들 | 목표 `freedom` + (강제 회수 ≥ 2 또는 생존 동물 ≤ 1), 단 E3가 우선 | `ending_scattered_names_cinematic.png` | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| E8 | 마지막 신호 | 목표 `preserve` + 사망 직원 < 2 + HQ 정보 ≥ 65 + 본부 송신 ≥ 1 | `ending_last_signal_finale.png` | 젊은 관리자와 홀로그램 EVE가 폭풍 속 송신을 마친다. 수신자나 구조 인물은 그리지 않으며 엔딩 UI는 저장 상태의 생존 직원·동물을 별도 표시합니다. |

`originEndEpilogue()`는 `rebuild`와 `freedom`을 먼저 처리한 뒤 `preserve`에 대해 E6/E8/E5를 평가합니다. 따라서 E6·E8·E5는 `preserve` 선택에서만 도달합니다. E3 조건은 E7보다 먼저 적용됩니다.

## 메인 외 실제 도달 가능한 제목과 경로

| 소스 제목/변형 | 발생 조건 | 활성 장면 파일 |
|---|---|---|
| 본부의 계승자 | archive finale 미준비, `rebuild`, 이송+송신 ≥ 3, 강제 회수 > 0 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 상처 없는 복원 | archive finale 미준비, `rebuild`, 이송 0, 강제 회수 0, 지식 ≥ 120 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 기록 밖의 봄 | archive finale 미준비, `freedom`, 이송 0, 강제 회수 0 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 뒤늦은 철문 | archive finale 미준비, `freedom`, 강제 회수 ≥ 2 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 비어 있는 교대실 | archive finale 미준비, `preserve`, 퇴직 직원 ≥ 2 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 인간 이후의 첫 문장 | 기본 `finish()`의 `rebuild`, mirror 참·지식 ≥ 155·생존 동물 ≥ 4 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 미완의 부활 | 기본 `finish()`의 `rebuild`, 지식 ≥ 100이나 첫 문장 조건 미충족 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 제000번 우리 | 기본 `finish()`의 `rebuild` 기본 결과; 정신력 사망도 이 제목을 씀 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 우리 밖의 봄 | 기본 `finish()`의 `freedom`, 신뢰 ≥ 63·생존 동물 ≥ 3 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 흩어진 이름들 | 기본 `finish()`의 `freedom` 기본 결과 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 마지막 두 관리자 | 기본 `finish()`의 `preserve`, EVE ≥ 45 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 고요한 자동화 | 기본 `finish()`의 `preserve` 기본 결과 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |
| 마지막 통신 / 마지막 신호 | EVE 신호 고갈 시나리오 또는 archive의 마지막 신호 결과 | 배경 원화는 무인 장소이며, 엔딩 UI가 실제 저장 상태의 생존 직원·동물을 별도 표시합니다. |

실제 19개 장면 파일은 `ENDING_ART`에 있고 각 경로는 서로 다릅니다. `LEGACY_ENDING_ART`는 이전 저장 제목을 기존 구성에 연결합니다. `findEndingArt()`는 등록되지 않은 제목에 대해 `ending_subject_000_choice.png`를 폴백으로 사용합니다. 이 폴백은 크래시 방지이며, 새로운 서사 결과가 추가될 때 자동으로 맞는 장면이 된다는 뜻은 아닙니다.

## ?????? ?? ??

- 19? ?? PNG? ??? ??? ?? ??, ??? ??? ??/?? ???? ?? ???. ?? ??? ?? ??? ?? ????? roster? ??? ????, M-00? ?? ??? ?? ????.
- ???/EVE/??? ?? ?? ?? ??? ??? ????. ?? ?? ?? ??? ?? ??? ???? ?? ?? ??? ???.
- ?? ??? 8? handoff WEBP? ????. ???? ?? v75/v76 PNG? v77 SVG ?? ???? ?? 19? `*_cinematic.png`? ??? ? ????.
- ? ?? PNG? route mapping ????? ??, PNG ??, ?? ???, ?? ??? ????. ???? ???? ???? ????? ?? ??? ?? ???? ????? ??? ???.
- ?? ??? ?? ?? ?? `art-review/ending-v77-embedded-contact.png`? ?? ?? ???? ?? ??? ???? ???.

## ??? ?? ?? ??

?? 8? handoff WebP? ?? ??? ????. ??? ?? ? ?? ?? ??? ???? ???, ??? ????? ?? ???? ???? ???.


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
