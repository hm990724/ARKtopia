# ARKtopia / ORIGIN ZERO QA 보고

검증 기준: v74 통합 기능 및 최신 M-00 폐기 사고 인과 수정

## 실행 결과

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test:all`: 통과. 기존 스토리/세이브 회귀와 v69~v74 테스트 포함. v74에는 종별 3단계 ARK RECALL 중간 저장/재개와 8개 엔딩 fixture 회귀 포함.
- `npm run build:qa`: 통과. `/` 정적 사전 렌더 포함.
- `ARK_PRODUCTION_TEST=1 npm run test:browser`: 2026-11-23 최신 QA 빌드에서 32/32 Chrome 테스트 통과. ARK RECALL 저장/재개, 13종 상호작용과 모바일 폭, 정본 8개 엔딩 UI·이미지·사망 대사를 확인.
- v74 시뮬레이션 테스트: 780개 seeded 탐사, 6×6/이전 8×8 저장, 반경 1칸 풀 흔적, 이미 밝힌 칸의 실시간 발견, 전투 보상 중복 방지, 기지 업그레이드 저장을 확인.
- 스토리 추가 회귀: 강제 폐기 중 격리 붕괴가 유출 원인이고 M-00 탈출은 별도 사건이라는 Photo 기록을 검사.
- 2026-11-22 중계기 후속 변경 재검증: `npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa` 모두 통과. `ARK_PRODUCTION_TEST=1 npm run test:browser` 22/22 통과. 새 저장 필드 없이 기존 업그레이드 단계 데이터를 사용한다.
- 2026-11-22 ARK RECALL: 종별 프로토콜을 이용해 3단계 분석 문답과 종별 시각 계기판을 추가했다. 진행 중 세이브 필드는 선택적으로 보존되며, 구형 저장은 빈 세션을 기본값으로 보완한다. 타입검사·린트·전체 회귀·QA 빌드 및 브라우저 23/23 통과.
- 2026-11-22 엔딩 정합성: 본편 최종 목표·동물 보호/희생·직원 손실·본부 자료 송신 기록에 따라 8개 정본 엔딩을 모두 실제 출력한다. 각 결말에 관리자 사망이 들어가는 fixture를 추가했다. 변경 뒤 전체 회귀/최신 빌드/브라우저 테스트는 다시 실행해야 한다.
- 엔딩 변경 후 최종 재검증: `npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa` 통과. Chrome 브라우저 테스트 23/23 통과. 엔딩별 로직 fixture 8/8 통과.
- 2026-11-23 Recall 상호작용: 13종 프로필에 신호창 조정·표본 배치·기록 정렬·경로 선택·선율 입력·밸브 조정·채널 분리·신호 동기화·잔향 선택을 추가했다. 13종 전부 모바일 390px에서 입력 후 단계 저장까지 확인했고 브라우저 전체 32/32.
- 2026-11-23 Recall/엔딩 추가 후 재검증: 전체 브라우저 테스트 32/32, 전체 로직/회귀 `npm run test:all`, 타입검사, 린트 통과. QA 빌드 통과; 기존 CSS autoprefixer 및 Hook dependency 경고는 유지.

## 빌드 경고

프로덕션 빌드는 성공하지만 `FieldMission.tsx`와 `Game.tsx`의 기존 hook dependency 경고 6건을 출력한다. 이번 수정에서 새로 추가된 오류는 아니다.

## 미완료

- 아홀로틀·키메라·스라소니·나방 Mutant 그림을 토끼/여우 예시 스타일로 생성/검수/게임 연결하는 작업은 진행 중이다. 파일별 명세: `docs/ART_REWORK_v75.md`.
- 실제 장시간 플레이에서 난이도/보상 균형은 플레이테스트가 필요하다.
- 13종별 Recall 입력이 달라졌지만 일부 종은 같은 물리 입력 계열을 공유한다. 모든 조작의 장시간 밸런스와 자연 캠페인 재수집은 추가 플레이테스트가 필요하다.
- 엔딩 UI 테스트는 최종 선택 화면에 상태 fixture를 주입해 8개 결과를 확인한다. 전체 캠페인을 처음부터 진행하는 자연 경로 playthrough는 아직 하지 않았다.
- 삭제된 예전 아트 11개는 이번 작업에서 복구하거나 커밋하지 않았다. v74 Git 커밋과 ZIP에는 Git 기준 원본이 보존돼 있다.

## Latest continuation status

- Four new species-specific mutant sprites are connected through `src/lib/animal-art.ts`; 26 active variants and their transparent square PNG format are checked in `npm run test:v73`.
- The field map now suppresses visible cell seams, uses persistent clearings and evidence, and places a moving flashlight pool on the last inspected location.
- ARK RECALL presents 13 species-specific input instruments and is covered by a 390px interaction test.
- Full logic regression, typecheck, lint, QA production build, and 32 browser tests passed before the final sprite route update. Rerun all checks after the latest art integration.
- New art generation inputs and per-file notes: `docs/generated-assets-v75.json` and `docs/ART_REWORK_v75.md`.

## Final verification — 2026-11-23

`npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa`, and the production Chrome browser suite all passed after the v75 animal art was connected. Browser suite: 32/32. The actual roster loaded `axolotl_mutant_v75.png`; every v75 animal route is checked for square RGBA PNG format. Existing build warnings are the six pre-existing Hook dependency warnings and CSS autoprefixer compatibility warnings.

## v75 ending and incident art (2026-11-23)

- Generated and connected 19 unique 1536×1024 ending illustrations and six incident scenes. Every one of the 13 registered incident types resolves to an illustrated scene.
- The ending record screen animates the selected illustration; daily incident dialogs show their contextual scene above the description and response options.
- New sources and per-file design notes: `docs/generated-assets-v75-endings-events.json`; the visual map is `docs/ENDING_EVENT_ART_v75.md`.
- `npm run test:v75`: passed (19 unique ending files and 13 event mappings). `npm run test:all`, `npm run typecheck`, `npm run lint`, and `npm run build:qa`: passed.
- Production Chrome run: 34/34 passed after correcting two test fixtures whose onboarding briefings intercepted their intended controls. The 19-ending asset test and mobile incident-art test both passed.

## v76 false-lead reveal

- Updated the M-00 trace: the player first sees a dangerous mutant silhouette suspected as the origin, then follows contradictory footprints and discovers the normal black cat.
- The CCTV scene uses the attached creature reference; capture and marker text distinguish M-00's identity from the cause of the pathogen leak.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, and `npm run build:qa`: pass.
- Production Chrome browser suite: 35/35 pass, including the complete three-camera false lead and reveal.
