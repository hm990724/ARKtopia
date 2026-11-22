# ORIGIN ZERO v74 QA 현황

작성일: 2026-11-22

## 통과

- `npm run typecheck`
- `npm run lint`
- `npm run test:all` — 기존 스토리/저장 호환 및 v69~v74 테스트 전체 통과.
- `npm run build:qa` — Next 프로덕션 빌드 성공. `/` 정적 사전 렌더 포함.
- v74: 장비 미보유 출동 차단, 일일 1회/AP1, 실패 출동 미소모, 6×6/구형 8×8 탐사 세이브, 780개 seed 탐사 시나리오, 발자국/공개 셀 실시간 표시, 전투 보상 중복 차단, 업그레이드 상한/저장, 벽 가림/탐사 기억 확인.
- v69~v73 회귀: 기존 엔딩, 직원 사건, 야간 선택, CCTV, 동물 관리, 초상화, 걷기 atlas 등 통과.

## 브라우저 및 남은 검증

- `ARK_PRODUCTION_TEST=1 npm run test:browser` — 실제 Chrome 22/22 통과. 첫 실행에서 발견한 튜토리얼 확인 단계 생략 및 걷기 캐릭터 selector 모호성을 테스트에 반영한 뒤 전부 성공.
- 실제 플레이 수치 밸런스와 각 장면의 가독성은 사람 플레이테스트가 더 필요함.
- 빌드는 기존 `FieldMission.tsx`/`Game.tsx` hook dependency 경고 6건을 출력했다. 빌드 실패는 아니며 별도 정리 대상이다.

## 아트 상태

- M-00 픽셀풍, 주인공 표정 4종, 스펙터/나방/까마귀 등 v74 이미지가 생성되어 게임 경로에 연결됨.
- 아홀로틀/키메라/스라소니/나방의 현재 변이 이미지는 사슴 기준의 색감은 따르지만, 토끼·여우의 유기물 융합 수위 및 캐릭터별 설정 반영이 사용자 기준에 충분한지 미승인. 임의로 승인/완료 처리하지 않음.
- 기존 이미지 삭제 감지: `axolotl_mutant_v73.png`, `axolotl_uncanny.png`, `chimera_mutant.png`, `chimera_mutant_v73.png`, `chimera_uncanny.png`, `lynx_mutant.png`, `lynx_mutant_v73.png`, `lynx_uncanny.png`, `moth_mutant.png`, `moth_mutant_v73.png`, `staff-terminations/wolf/scene.webp`. 기존 최종본은 자동 복구하지 않았고 v74 경로를 사용함.
- 이미지 생성 도구가 이번 실행 도구 목록에 없어 변이 이미지 재생성은 미완료. 파일별 재작업 명세는 `docs/ART_REWORK_v75.md`.

## 남은 완료 조건

1. 이미지 생성 도구로 네 종 변이 아트를 재작업하고 개별 PNG 및 게임 화면에서 시각 검수.
2. 실제 플레이 밸런스와 개체별 후반 재수집 흐름을 플레이테스트.
3. 코드 변경을 커밋하고 확인 범위를 명시한 프로젝트 ZIP과 해시를 생성.
