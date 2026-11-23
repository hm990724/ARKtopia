# 변경 기록

## 2026-11-23 — 야간 시설 전력 우선순위

- CCTV·격리 보강·진료실·공명 연구실의 배전 우선순위를 작업대에서 바꾸고 세이브에 저장한다. 야간 정산 뒤 남은 전력을 순서대로 배분하며 부족한 설비는 실제로 차단된다.
- 정전된 CCTV의 자동 탐지, 진료실 회복, 격리 안정 보너스, 연구실 지식 보너스가 중단된다. 야간 결산 전 예상 가동/차단 목록을 보여준다.
- 야간 회로 미리보기에서 정비 전력 +4%가 실제 정산보다 한 번 더 표시되던 계산 오류도 수정했다.
- 검증: 전체 로직 회귀, 프로덕션 브라우저 41/41, 타입 검사, 린트, 에셋 검사, QA 빌드 통과.

## 2026-11-22 — 개체별 ARK RECALL 퍼즐

- 13종 프로토콜을 이용하는 3단계 개체 분석 UI를 추가했다. 종별 질문·시각 계기판·단서를 구분한다.
- 중간 진행을 저장하고 재접속 뒤 이어서 풀 수 있으며, 선택 정확도에 따라 개체별 분석 품질을 기록한다.
- 로직 회귀와 실제 브라우저 저장/새로고침/재개 테스트를 통과했다.

## 2026-11-22 — 8개 정본 엔딩 연결

- 최종 목표와 동물 희생, 직원 손실, 본부 자료 송신 상태로 정본 8개 엔딩이 갈린다.
- 관리자 사망 서사, 엔딩 삽화 선택 및 기존 ORIGIN ZERO 저장 호환을 유지한다.
- 모든 엔딩을 개별 fixture로 검증한다.

## 2026-11-22 — 현장 중계기 CCTV 신호

- 중계기 설명이 실제 효과를 반영하도록 보완했다. 1단계부터 어두운 미니맵에 귀환 출구가 표시되고, 2단계부터는 개체의 현재 칸을 공개하지 않고 대략적인 방향과 거리 신호를 제공한다.
- 기존 단계별 추적망 압력 감소는 유지했다. 저장 구조 변경은 없다.

## 2026-11-22 — v74 ORIGIN ZERO

- 1일 1회/AP1 원정 제한, 필수 장비 점검 및 기존 저장의 일자 호환을 추가했다.
- 6×6 실시간 탐사에서 발견 칸 유지, 이동 발자국, 반경 1칸 풀 흔적, 포획 수 표시와 8×8 예전 저장 읽기를 보강했다.
- 탐사 전투와 회수 보상, 기지 설비 업그레이드, 연구 반응 연출을 추가했다.
- Specter 종과 버전형 에셋 경로를 연결하고 EVE 초반 중립 표정을 고정했다.
- Pretendard 본문과 각진 제목 체계를 적용해 기존 둥근 픽셀 제목체가 UI를 덮지 않게 했다.
- 스토리/세이브/게임 로직 테스트와 프로덕션 빌드를 통과했다. 브라우저 테스트는 Windows sandbox `spawn EPERM` 때문에 미실행이다.
- 아홀로틀/키메라/스라소니/나방 변이 아트 사용자 검수는 미완료이며 재작업 명세를 `docs/ART_REWORK_v75.md`에 작성했다.

## 2026-11-22 — 정본 인과 수정

- 종전 후 연구 책임자가 실험체 폐기를 강행하다 격리·전력 체계가 붕괴하고 감염 인자가 유출된 것으로 스토리 정본을 바로잡았다. M-00은 그 혼란 속에서 별도로 탈출하며 유출 원인이 아니다.
- Hidden Photo 04~06 기록과 테스트에 같은 인과를 반영했다.
- README를 현재 v74 프로젝트 실행/검증 안내로 교체하고, QA 결과를 `QA_REPORT.md`에도 기록했다.

## 2026-11-23 — v78 회귀 검증 및 파일 보존

- 야간 회로 브라우저 회귀를 실제 단자 전압 순서·4단자 완료 규칙에 맞췄고, 위기 의무관 대화 테스트의 접근성 이름 선택자를 수정했다. 전체 프로덕션 브라우저 테스트 37/37 통과.
- 아홀로틀·키메라·스라소니·나방·M-00·Wolf의 역사적 버전 파일 6개를 기존 v74.7 전체 프로젝트 ZIP에서 복구해 canonical 이미지 옆에 보존했다. 게임은 버전 없는 종/상태 이미지 경로를 계속 사용한다.
- 최신 스토리·아트·밸런스 감사를 `STORY_AUDIT.md`, `ART_AUDIT.md`, `BALANCE_REPORT.md`에 반영했다. 40개 사건 목표, 자연 캠페인 밸런스, 엔딩별 고유 시네마틱 아트는 완료로 표시하지 않았다.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, 프로덕션 빌드 통과.


## 2026-11-23 ? v80 field and ending follow-up

- Added a linked field outing from preflight through roaming-threat combat, tracked animal rescue, salvage, extraction, and salvage-funded CCTV repair.
- Added action-specific ranger, enemy, defense, EVE, and companion combat feedback; verified all four crew support effects.
- Facility repair now animates assembly, wiring, and power-on completion with an ONLINE state and reduced-motion support.
- Ending records now show active recruited staff portraits from the save and keep retired staff in the loss record without presenting them as alive.
- Verification: logic regression suite passed; production browser suite passed 40/40; typecheck, lint, asset check, and production QA build passed. Known build warnings and remaining art/campaign-balance work are recorded in `NEXT_STEPS_README.md` and `QA_REPORT.md`.

## 2026-11-23 v82 ending continuity

- Preserved all previous ending images after the user clarified that old routes must remain; restored 58 files that had been removed during a mistaken cleanup pass.
- Mapped 19 distinct ending titles to 19 distinct existing scene compositions and retained saved-title aliases. Preserved the original eight handoff WebPs.
- Added an ending/story-cinematic audit that marks the requested bespoke reference-style paintings as missing rather than presenting the portrait SVGs as finished art.
- Validation passed: full logic suite, 19-scene asset check, production build, and production browser suite 41/41. Build reports six existing React Hook dependency warnings and no Autoprefixer warnings.
