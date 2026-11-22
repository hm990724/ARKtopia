# ARKtopia ORIGIN ZERO — 다음 작업 안내

기준일: 2026-11-22
저장소: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## 현재 진행 상태

- v74 기능 커밋 `03e62c7` 이후 세계관 인과 수정과 README 갱신이 추가됐다. 최신 테스트/빌드/Hidden Photo 브라우저 재검사는 `QA_REPORT.md` 참조. 현재 수정분은 아직 별도 커밋/ZIP으로 묶이지 않았다.
- 실제 Chrome 기반 브라우저 테스트 22/22가 통과했다. 첫 브라우저 실행 중 발견한 테스트 플로우/selector 문제를 수정했다.
- 탐사·포획·전투·기지 업그레이드, 구형 저장 호환 코드가 구현돼 있다. 동작 규칙은 `GAMEPLAY_SYSTEMS.md` 참조.
- 새 이미지의 스타일은 사용자 승인 전까지 완료로 보지 않는다. 특히 아홀로틀/키메라/스라소니/나방 변이 4종을 사용자 토끼·여우 및 사슴 레퍼런스 수준에 맞춰 다시 제작해야 한다. 세부 파일/종별 프롬프트는 `docs/ART_REWORK_v75.md`.
- 작업 중 원래 파일이 삭제된 상태를 발견했다. 삭제된 파일을 복구하거나 덮어쓰지 않고, v74 신규 경로를 사용한다. 삭제 전 버전은 Git HEAD 및 v74 ZIP에 보존돼 있다.

## 다음 담당자가 할 일

1. 아트 생성 기능으로 아래 파일을 각각 제작: `axolotl_mutant_v75.png`, `chimera_mutant_v75.png`, `lynx_mutant_v75.png`, `moth_mutant_v75.png`.
2. 투명 배경, 정사각 비율, 안전 여백, 종 실루엣, 붉은 유기 변이와 인물별 설정 반영을 개별 확인한다. 토끼/여우/사슴 스타일과 게임 화면 내 표시를 나란히 비교한다.
3. 새 에셋의 경로를 `src/lib/animal-art.ts`에서 연결하고 에셋 테스트 및 브라우저 캡처를 다시 실행한다.
4. `npm run test:all`, `npm run build:qa`, `ARK_PRODUCTION_TEST=1 npm run test:browser`는 최신 스토리 인과 변경 후 통과했다. Windows 브라우저 검사는 Playwright 실행 권한이 허용된 셸이 필요할 수 있다.
5. 현재 미커밋 스토리 수정분을 별도 커밋한 뒤 v75 ZIP/SHA-256을 갱신한다. 그 다음 새 이미지 4종과 경로 변경은 또 다른 검증 커밋으로 묶는다.

## 주요 경로

- 첨부 개발 지시서 보관: `docs/REQUIREMENTS_ENHANCED_v74.txt`
- 세계관 정본: `docs/STORY_BIBLE_WAR_ARKTOPIA_v69.md`
- 게임 변경 사항: `CHANGELOG.md`
- 시스템 규칙: `GAMEPLAY_SYSTEMS.md`
- QA: `QA_REPORT_v74.md`
- 최신 QA: `QA_REPORT.md`
- 전체 그림 생성 명세와 출처: `docs/generated-assets-v74.json`
- 변이 4종 재작업 명세: `docs/ART_REWORK_v75.md`
