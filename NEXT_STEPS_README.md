# ARKtopia / ORIGIN ZERO — 이어서 작업할 내용

기준일: 2026-11-23
프로젝트: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## 이번 작업에서 확인된 구현

- 전쟁 후 폐기 명령과 격리 붕괴가 유출 원인이고, M-00 탈출은 별개의 사건으로 처리한다.
- 1일 1회 출동/AP 1 제한, 장비가 부족하면 출동 불가, 열린 위치의 실시간 목격, 발자국 추적, 반경 1칸 풀 흔적, 손전등 시야를 보존한다.
- 탐사 중 이동/경계/반격/후퇴, 전리품, 동료 지원을 연결했다.
- CCTV 증거 대조와 순찰, 야간 사건/방어 선택, 부품·전력·식량을 쓰는 기지 업그레이드는 실제 상태와 비용에 반영한다.
- ARK RECALL은 개체별 저장/이어하기와 13종 전용 조작 장치를 갖춘다.
- EVE 초반 무표정, 직원별 정신 상태 초상, 주인공 규격 초상, M-00 도트 개체 및 8개 결말이 적용되어 있다.
- 탐사 지도 셀의 테두리를 없애고 연속된 어두운 지형과 손전등 조명으로 표현했다.
- Axolotl/Lynx/Moth/Chimera 신규 Mutant는 각각 종 특성을 반영해 생성하고 게임의 활성 경로를 v75로 바꿨다. 1254x1254 투명 PNG이며 이전 최종본은 덮어쓰지 않았다.

## 검증 결과

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test:all`: 통과 (저장/구버전/종별 연구/탐사·전투·기지/8개 결말 포함)
- `npm run build:qa`: 통과
- `ARK_PRODUCTION_TEST=1 npm run test:browser`: v75 활성 경로 변경 후 최종 재실행 완료: 32/32 통과. 상세는 `QA_REPORT.md`에 기록한다.
- 빌드는 기존 CSS autoprefixer 경고와 React Hook dependency 경고를 출력하지만 성공한다.

## 남은 일

1. 브라우저 회귀와 QA 캡처 정리가 끝났다. 사용자 삭제 이미지 11개는 복구하지 않았다.
2. 파일별 새 이미지 내역은 `docs/generated-assets-v75.json`, 세부 디자인 명세는 `docs/ART_REWORK_v75.md`다. 새 그림은 실제 연결·형식 검증을 마쳤지만 사용자의 최종 미술 승인은 아직 받지 못했다.
3. QA 문서와 README는 이번 작업 결과로 갱신했다.
4. 기능별로 선택 파일만 커밋한다. 사용자 삭제 파일은 stage/commit 대상에 포함하지 않는다.
5. 최신 소스 커밋 후 새 버전 ZIP과 SHA-256을 별도 이름으로 만들고 압축 전체 파일을 검사한다. 기존 v74~v74.3 ZIP은 보존한다.
6. 장기 자연 플레이는 아직 전체 캠페인 며칠 분량을 자동 진행해 확인하지 않았다. 8개 결말은 저장 조건을 주입한 UI 회귀에서 개별 확인했다.

## 핵심 참고

- 원본 상위 명세: `00_CODEX_MASTER_PROMPT.txt`
- 스토리: `STORY_BIBLE.md`, `docs/STORY_BIBLE_WAR_ARKTOPIA_v69.md`
- 게임 규칙: `GAMEPLAY_SYSTEMS.md`, `UI_GAMEPLAY_SPEC.md`, `EVENT_MATRIX.md`
- 종료 조건: `ENDING_MATRIX.md`
- QA: `QA_ACCEPTANCE.md`, `QA_REPORT.md`
- 자산 감사: `ART_AUDIT.md`, `docs/generated-assets-v75.json`
