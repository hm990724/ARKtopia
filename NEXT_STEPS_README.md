# ARKtopia ORIGIN ZERO — 다음 작업 안내

기준일: 2026-11-22
저장소: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## 현재 진행 상태

- 2026-11-22: ARK RECALL을 개체 ID 단위 3단계 퍼즐로 확장했다. 진행 상태는 저장/재개되고, 13종 각각의 질문과 계기판을 사용한다. 최신 타입검사·린트·회귀·QA 빌드·브라우저 검증 결과는 `QA_REPORT.md`에 기록했다. 브라우저 23/23 통과.
- 2026-11-22: 최종 선택에 정본 8개 엔딩을 연결했다. 8개 fixture에서 고유 제목과 관리자 사망 기록을 확인하고 최신 빌드 및 브라우저 23/23을 통과했다.

- 2026-11-22 후속 변경: 중계기 1단계는 미확인 출구를 미니맵에 표시하고, 2단계 이상은 개체의 정확한 위치 대신 대략적인 방향·거리 신호를 제공한다. 회귀와 빌드 결과는 `QA_REPORT.md` 최신 기록을 확인한다.

- 최신 구현은 ARK RECALL 및 8개 엔딩 분기다. 양쪽 기능의 개별 회귀와 구형 저장 호환을 확인했다. 재작업 Mutant 아트 4종은 아직 생성되지 않았다.
- 기존 `v74.2.zip`은 이번 Recall/엔딩 변경이 들어가기 전의 패키지다. 최신 파일을 묶으려면 새 버전 이름으로 별도 제작하고 이전 ZIP은 덮어쓰지 않는다.
- 실제 Chrome 기반 브라우저 테스트 23/23가 최신 코드에서 통과했다. 새 ARK RECALL의 저장/새로고침/재개와 엔딩 로직 8/8 fixture를 검사했다.
- 탐사·포획·전투·기지 업그레이드, 구형 저장 호환 코드가 구현돼 있다. 동작 규칙은 `GAMEPLAY_SYSTEMS.md` 참조.
- ARK RECALL은 세 단계 공통 선택지 방식이다. 종별 단서와 시각 계기판은 있지만 13종별 독립 조작형 미니게임은 미완료다. 엔딩 UI를 통한 8개 결말 각각의 전체 플레이 E2E도 아직 없다.
- 새 이미지의 스타일은 사용자 승인 전까지 완료로 보지 않는다. 특히 아홀로틀/키메라/스라소니/나방 변이 4종을 사용자 토끼·여우 및 사슴 레퍼런스 수준에 맞춰 다시 제작해야 한다. 세부 파일/종별 프롬프트는 `docs/ART_REWORK_v75.md`.
- 작업 중 원래 파일이 삭제된 상태를 발견했다. 삭제된 파일을 복구하거나 덮어쓰지 않고, v74 신규 경로를 사용한다. 삭제 전 버전은 Git HEAD 및 v74 ZIP에 보존돼 있다.

## 다음 담당자가 할 일

1. 아트 생성 기능으로 아래 파일을 각각 제작: `axolotl_mutant_v75.png`, `chimera_mutant_v75.png`, `lynx_mutant_v75.png`, `moth_mutant_v75.png`.
2. 투명 배경, 정사각 비율, 안전 여백, 종 실루엣, 붉은 유기 변이와 인물별 설정 반영을 개별 확인한다. 토끼/여우/사슴 스타일과 게임 화면 내 표시를 나란히 비교한다.
3. 새 에셋의 경로를 `src/lib/animal-art.ts`에서 연결하고 에셋 테스트 및 브라우저 캡처를 다시 실행한다.
4. `npm run test:all`, `npm run build:qa`, `ARK_PRODUCTION_TEST=1 npm run test:browser`는 Recall/엔딩 변경 후 통과했다. 빌드에는 기존 hook dependency 경고가 6건 남아 있다.
5. 새 수정은 기능별로 커밋한다. 최신 핸드오프 ZIP이 필요하면 `v74.3` 이름으로 만들고 SHA-256/압축 해제 검사를 수행한다.
6. 남은 큰 구현: 13종별 독립 조작, 4종 Mutant 아트 재제작, 엔딩 UI 전체 경로 테스트/사후 연출, 장시간 난이도·실사용자 튜토리얼 검증.

## 주요 경로

- 첨부 개발 지시서 보관: `docs/REQUIREMENTS_ENHANCED_v74.txt`
- 세계관 정본: `STORY_BIBLE.md` → `docs/STORY_BIBLE_WAR_ARKTOPIA_v69.md`
- 게임 플레이 기준: `UI_GAMEPLAY_SPEC.md`, `GAMEPLAY_SYSTEMS.md`, `EVENT_MATRIX.md`
- 엔딩 조건: `ENDING_MATRIX.md`
- 요구사항별 판정: `QA_ACCEPTANCE.md`
- 게임 변경 사항: `CHANGELOG.md`
- 시스템 규칙: `GAMEPLAY_SYSTEMS.md`
- QA: `QA_REPORT_v74.md`
- 최신 QA: `QA_REPORT.md`
- 전체 그림 생성 명세와 출처: `docs/generated-assets-v74.json`
- 변이 4종 재작업 명세: `docs/ART_REWORK_v75.md`
