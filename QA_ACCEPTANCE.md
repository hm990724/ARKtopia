# QA Acceptance 현황

기준 문서는 [통합 개선 지시서](docs/REQUIREMENTS_ENHANCED_v74.txt), [UI/Gameplay 요구](docs/REQUIREMENTS_UI_GAMEPLAY.md), [게임 QA 보고](QA_REPORT.md)다.

| 영역 | 판정 | 근거/남은 작업 |
|---|---|---|
| 기존 코드 분석 후 실제 구현 | 통과 | Next.js/TypeScript 게임 로직과 저장 구조 수정 |
| 저장·기존 엔딩 호환 | 부분 통과 | 구형 저장 회귀 통과. 8개 신규 엔딩 분기 fixture 통과. 모든 과거 save fixture 전수 확보는 별도 |
| 일일 탐사·장비 제한·포획 | 통과 | `test-v74`, `test-v70`, 브라우저 현장 튜토리얼 |
| CCTV 정보·현장 추적·조명 지속 | 통과 | 회귀 및 브라우저 탐사 흐름 |
| 야간 운영·사건·시설 수리 | 통과 | 기존 낮/밤·차단 사유 회귀 |
| 개체 ID별 재수집 | 통과 | ARK RECALL 3단계 저장/재개 및 개체별 기록 |
| 13종 재수집 상호작용 | 부분 통과 | 13종 위젯이 모바일 390px에서도 렌더·조작·저장됨을 확인. 일부 종끼리 입력 계열을 공유하고 장기 밸런스는 미확인 |
| 전체 8개 엔딩의 로직 | 통과 | 별도 fixture 8개에서 제목·관리자 사망 검증 |
| 전체 8개 엔딩 연출·브라우저 검사 | 부분 통과 | 8개 최종 선택을 실제 UI로 실행하고 제목·사망 대사·이미지 로드를 확인. 처음부터 진행하는 자연 경로는 미실행 |
| UI 반응형·초보자 시작/탐사 튜토리얼 | 부분 통과 | 390px 포함 반응형 E2E 통과. 전체 접근성/신규 사용자 플레이테스트 미완료 |
| Mutant 4종 레퍼런스 맞춤 아트 | 미완료 | [파일별 명세](docs/ART_REWORK_v75.md), 생성 도구 부재 |
| 실행/타입/린트/전체 테스트/빌드 | 통과 | 최신 기록은 [QA_REPORT.md](QA_REPORT.md). 32/32 브라우저 검사 포함 |

2026-11-23 continuation update: Axolotl, Lynx, Moth and Chimera mutant v75 art is connected in the game and checked for 1254x1254 RGBA format. Production build and 32/32 browser regressions passed after the route update. Visual direction remains subject to the user's art review; natural multi-day campaign play has not been fully automated.

## v75 ending and event art

| Area | Status | Evidence |
|---|---|---|
| 19 ending records each use a distinct contextual image | Pass | `npm run test:v75`; images load in browser |
| 13 daily incident IDs receive an illustrated scene | Pass | Six scenes cover all incident mappings; mobile blackout dialog tested |
| Typecheck, lint, logic suite, production build | Pass | Current v75 source |
| Full production browser suite | Pass | 35/35 passed after correcting onboarding-state fixtures; includes ending/event art and the M-00 reveal |
| M-00 origin false lead and ordinary-cat reveal | Pass | Three camera traces, reference CCTV art and marker wording |

The images are integrated in `Game.tsx`; provenance is recorded in `docs/generated-assets-v75-endings-events.json`.
