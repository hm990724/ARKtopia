# v57 변경 파일 안내

기준: ECHO WARD v56 (assets 미포함)

- `src/lib/tactical-field.ts`: 지역 크기, 매번 새 지도, 귀환 경로 보장, 지도 상태 타입
- `src/lib/game-v10.ts`: 조사 선택·지역별 노출·자동 회수/피해·귀환 30%·직원 동행 효과
- `src/components/FieldMission.tsx`: WASD 이동, 지도 중심 화면, 미니맵, 손전등 시야, 수풀 힌트, 3선택 사건, 도넛 HUD
- `src/components/Game.tsx`: 장비 보유 검증과 비활성화, 동행 편성, 조사 선택 연결, AP·전력 튜토리얼
- `src/app/globals.css`: v57 동작 연출·사이즈·조사 스캔·도넛 UI

주의: 실제 `public/assets`는 포함되지 않습니다. 기초 기능과 저장 데이터는 보존했지만, 새로운 탐사 화면은 소스 변경 범위가 넓으므로 실기기 브라우저 테스트가 권장됩니다.
