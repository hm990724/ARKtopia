# ARKtopia / ORIGIN ZERO QA 보고

검증 기준: v74 통합 기능 및 최신 M-00 폐기 사고 인과 수정

## 실행 결과

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test:all`: 통과. 기존 스토리/세이브 회귀와 v69~v74 테스트 포함.
- `npm run build:qa`: 통과. `/` 정적 사전 렌더 포함.
- `ARK_PRODUCTION_TEST=1 npm run test:browser`: 전체 22/22 Chrome 테스트 통과. 이후 Hidden Photo 변경 케이스 1건을 production UI에서 재확인해 통과.
- v74 시뮬레이션 테스트: 780개 seeded 탐사, 6×6/이전 8×8 저장, 반경 1칸 풀 흔적, 이미 밝힌 칸의 실시간 발견, 전투 보상 중복 방지, 기지 업그레이드 저장을 확인.
- 스토리 추가 회귀: 강제 폐기 중 격리 붕괴가 유출 원인이고 M-00 탈출은 별도 사건이라는 Photo 기록을 검사.

## 빌드 경고

프로덕션 빌드는 성공하지만 `FieldMission.tsx`와 `Game.tsx`의 기존 hook dependency 경고 6건을 출력한다. 이번 수정에서 새로 추가된 오류는 아니다.

## 미완료

- 아홀로틀·키메라·스라소니·나방 Mutant 그림을 토끼/여우 사용 예시와 같은 유기적 기괴함 및 종별 정체성으로 재제작하지 못했다. 이미지 생성 도구가 이 세션에 연결되어 있지 않아 파일별 명세만 마련했다: `docs/ART_REWORK_v75.md`.
- 실제 장시간 플레이에서 난이도/보상 균형은 플레이테스트가 필요하다.
- 삭제된 예전 아트 11개는 이번 작업에서 복구하거나 커밋하지 않았다. v74 Git 커밋과 ZIP에는 Git 기준 원본이 보존돼 있다.
