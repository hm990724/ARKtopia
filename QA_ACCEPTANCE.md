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
| 종별 Mutant 아트와 정식 경로 | 통과 | Axolotl/Lynx/Moth/Mutant/Chimera/Specter 역할 반영 스프라이트와 M-00 도트 고양이를 canonical `<species>_<state>.png` 경로로 연결, 버전 접미사 참조 없음 |
| 나머지 6종 인간 정체·추적 기믹 | 통과 | 감시 분석관 Lynx, 재생의학 Axolotl, 야간 설비 Moth, 동기화 책임자 Mutant, 다중 기억 Chimera, 기억 삭제 담당 Specter의 기록·프로토콜·흔적 차이를 로직 회귀에서 확인 |
| Wolf 여성 직원 마지막 장면 | 통과 | 검은 머리 여성 경비관의 신규 cinematic을 staff-terminations/wolf/scene.webp에 연결하고 화면 경로를 canonical하게 통일 |
| 상업 이용 가능한 로컬 폰트·오프라인 로드 | 통과 | Pretendard 및 NeoDunggeunmo OFL 파일 사용, 외부 폰트 요청 제거 및 브라우저 로드 검사 |
| 대화 초상화 원본 비율 보존 | 통과 | 세로 프레임 전체 표시 규칙 적용, 얼굴/머리 크롭 방지 브라우저 검사 |
| 실행/타입/린트/전체 테스트/빌드 | 통과 | 최신 기록은 [QA_REPORT.md](QA_REPORT.md). 32/32 브라우저 검사 포함 |

## 2026-11-23 Ultimate Master follow-up

| 영역 | 판정 | 근거/남은 작업 |
|---|---|---|
| 프로덕션 브라우저 회귀 | 통과 | 야간 회로 및 직원 대화 selector 보정 후 37/37 통과 |
| 야간 회로 비용/저장 | 통과 | 잘못된 입력 비용, 4단자 실제 전압 순서, 일일 잠금과 정산 보상 검증 |
| 역사적 동물/Wolf 아트 보존 | 통과 | 6개 이전 이미지가 v74.7 전체 소스 패키지에서 복구되어 프로젝트 폴더에 보존됨 |
| 40종의 실질적 사건 목표 | 미완료 | 실제 사건 ID는 13개이며 별도 일일/야간/현장 선택이 추가됨. 40개 고유 사건 목표와 연쇄 분기 미구현 |
| 매 엔딩별 고유 고품질 시네마틱 | 미완료 | 19개 경로는 캐릭터 소스가 제한된 SVG 초상 구성. 등장인물 상태에 따른 동적 선택과 고유 연출 이미지 부족 |
| DAY 10 자연 캠페인 난이도 | 미검증 | 일일 소모·위협 악화 로직 테스트는 통과했으나 새 게임부터의 장기 생존 비교 미실행 |
| 신규 사용자 접근성/자연 플레이 | 부분 통과 | 튜토리얼 구조 E2E 및 반응형 검증 통과. 사람 대상 장기 플레이테스트 미실행 |

위 표가 앞쪽의 과거 v75/v77 기록보다 최신이다. 전체 인수인계와 정확한 잔여 범위는 `NEXT_STEPS_README.md`, `STORY_AUDIT.md`, `BALANCE_REPORT.md`, `ART_AUDIT.md`를 참조한다.

2026-11-23 continuation update: The six remaining mutant sprites now match the current species roles and use canonical species/state paths; M-00 remains a pixel-art black cat. All 26 active animal variants passed the square transparent PNG route check. Wolf staff-loss art uses the same red-lit cinematic family with a black-haired female guard. Natural multi-day campaign balance has not been fully automated.

## v77 cast-correct ending cards and v75 event art

| Area | Status | Evidence |
|---|---|---|
| All 19 ending records use only canonical protagonist/EVE portrait assets | Pass | `npm run test:v75` checks each SVG source; production browser render unavailable under current `spawn EPERM` |
| 19 bespoke painterly cinematic scenes with ending-specific poses | Incomplete | Separate SVG layouts use canonical portrait crops; custom character acting and painted scenes remain. Image generation previously returned `401 token_revoked`; details in [ENDING_ART_v76.md](docs/ENDING_ART_v76.md) |
| 13 daily incident IDs receive an illustrated scene | Pass | Six scenes cover all incident mappings; mobile blackout dialog tested |
| Typecheck, lint, logic suite, production build | Pass | v77 cast-correct ending cards; build emits six existing React Hook dependency warnings |
| Full production browser suite | Pass | 36/36 passed; includes all ending routes, event art, M-00 reveal, mobile, and local fonts |
| M-00 origin false lead and ordinary-cat reveal | Pass | Three camera traces, reference CCTV art and marker wording |

The images are integrated in `Game.tsx`; provenance is recorded in `docs/generated-assets-v75-endings-events.json`.
