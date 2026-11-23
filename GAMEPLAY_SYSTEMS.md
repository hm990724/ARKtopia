# ORIGIN ZERO 플레이 시스템

이 문서는 v81까지 구현되어 현재 활성화된 동작을 기준으로 한다. 아래의 버전별 메모는 각 변경 시점의 역사 기록이다.

## v81 야간 시설 전력 배분

- CCTV 감시망 3%, 격리 보강 2%, 진료·검시실 3%, 공명 연구실 2%를 야간 잔여 전력에서 순서대로 사용한다. 설치되지 않은 시설은 전력을 쓰지 않는다.
- 보급 작업대에서 네 설비의 우선순위를 바꿀 수 있고, 일일 결산 전에 현재 방어 선택·정비·배터리 출력을 반영한 가동/차단 예상을 본다.
- 정산 시 선택 순서에 따라 전력이 부족해진 설비는 차단된다. 가동한 설비만 진료 회복, 격리 안정, 연구 지식, CCTV 자동 관측을 제공한다. 수동 손전등 출동은 시설 전력과 무관하고, EVE 스캐너는 기존처럼 시설 전력이 필요하다.
- 구형 저장은 새 배전 상태가 없으면 기존 설치 시설 행동을 유지하며, 첫 새 결산부터 배전 기록을 만든다.
- 회귀: `scripts/test-v81.cjs`, `tests/browser-v81.spec.cjs`, 야간 결산을 비교하는 `tests/browser-v71.spec.cjs`.

## 출동과 탐사

- 탐사는 하루 1회, AP 1을 쓴다. 손전등/바이오필터 등 선택한 필수 장비가 부족하면 출동 버튼을 막고 누락품을 보여준다. 실패한 출동 시도는 일일 횟수를 소비하지 않는다.
- 현장 지도는 6×6이며 구형 8×8 저장 데이터를 계속 읽는다. 직접 이동해 주변을 밝히고, 이미 확인한 칸은 계속 공개된다. 개체 위치는 확인된 칸에서 실시간으로 드러나며, 이동한 곳의 발자국과 개체 반경 1칸의 풀 흔적이 남는다.
- 행동 횟수와 발자국으로 위치를 좁힌 다음 직접 그물 포획을 시도한다. 확인 없이 하는 맹목 포획은 금지한다.

## 오염체 조우와 시설 성장

- 탐사 중 특정 위험 타일이 전투 조우로 이어진다. 적의 다음 행동을 확인하고 방어·공격·EVE 지원 중 선택한다. 행동 중 이동은 잠기며 보상은 승리당 한 번만 지급된다. 후퇴는 보상을 주지 않는다.
- 회수 부품을 relay/battery/clinic에 소모해 상한 3단계까지 올린다. 레벨은 저장 데이터에 기록된다.
- 현장 중계기는 단계마다 추적망 압력을 낮춘다. 1단계는 발견 전에도 미니맵에 귀환 출구를 표시하고, 2단계부터는 개체의 정확한 칸을 노출하지 않는 대략적 방향·거리 신호를 표시한다.
- 연구에는 반응 무대 연출이 붙는다. 이 시각 연출은 연구 결과를 바꾸지 않는다.
- ARK RECALL은 동물 개체별 세 단계 분석으로 진행된다. 13종별 프로토콜 질문·대화 단서·계기판에 더해 조작도 신호창 조정, 표본 배치, 기록 정렬, 경로 추적, 음형 입력, 밸브 조정, 채널 분리 등으로 나뉜다. 단계마다 저장되며 중간에 닫거나 새로고침해도 이어서 진행할 수 있다. 완료 결과는 해당 개체 ID에만 기록되고, 분석 품질은 반응 기록에 따라 달라진다.

## 회귀/호환

- 기존 DAY, AP, 동물 개체, 직원 기억, 밤 선택, 엔딩 데이터를 유지하는 회귀 테스트가 포함된다.
- 개별 동물 재수집/회상은 종 전체 완료와 분리된 ID 단위 상태다.
- 세부 밸런스, 모든 8개 엔딩 실기 검수 및 터치 조작은 전체 브라우저 테스트 전까지 완료로 간주하지 않는다.
- ARK RECALL은 종별 입력 위젯을 제공하지만 일부 종은 같은 물리 입력 계열을 공유한다. 13종 전부 모바일 브라우저에서 위젯 조작 후 단계 저장까지 확인했다. 세부 판정/난이도 균형과 자연 플레이를 통한 재수집 장기 검수는 남아 있다.

## v78 추가 검증 사항

- Portable flashlight sorties spend the flashlight charge and one AP, not facility power. EVE's scanner route requires facility power. Charging the flashlight consumes one cell, 12 facility power and one AP, then restores 38 flashlight charge.
- The optional night fuse board persists sequence/faults for the current day. A wrong terminal costs 4 power, 3 facility stability and adds 3 threat; after three faults it locks. A correct four-terminal connection adds 4 power and 6 facility stability during settlement.
- Trust conversation costs AP 1 and food 1 but does not restore morale. Counseling costs AP 2 and food 1, restores 9 morale once per day; medical support costs AP 2 and one medicine, restores 20 once per staff per day. Staff morale deteriorates with elapsed days.
- The event system currently has 13 registered incident IDs plus daily peaceful decisions and state-based night/field events. The master prompt's 40 materially distinct incident scenarios are not implemented yet; do not describe that target as complete.
- Natural multi-day survival balance and expert play remain unverified. Deterministic checks cover costs, blockers, state changes, legacy saves and the day transition, not a full player campaign.


## v80 gameplay rebuild ? 2026-11-23

- The expedition loop now includes a preflight loadout, a saved roaming contaminant, a blocking tactical encounter, action-specific support from the selected employee, one-time salvage on victory, retreat without salvage, and safe extraction. One sortie per day and AP 1 remain the launch rule.
- A complete production-browser outing links loadout, moving-threat combat, rabbit trail tracking/rescue, cache salvage, extraction, and rebuilding CCTV from recovered scrap, parts, and power. CCTV repair shows an assembly/wiring/power-on sequence and ONLINE status.
- The live ending record displays portraits only for employees present in the save's active crew; retired staff are reported as losses and are not presented as living cast. This is a roster-aware UI layer, not bespoke ending scene art.
- The current incident registry is 40 distinct IDs: 13 original and 27 state-gated additions. This supersedes the historical v78 note above, which described the registry before those additions. Six existing incident illustrations are reused; forty unique cinematic illustrations are not present.
- Verification after these changes: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, `npm run build:qa`, and the production browser suite (40/40) pass. Existing React Hook and Autoprefixer warnings remain.
- Still not certified: natural multi-day campaign difficulty and novice accessibility through a human playthrough, per-facility power priority controls, custom high-quality artwork for all 13 species and 18 interim ending routes, and an actual hosting deployment.
