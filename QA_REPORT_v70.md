# ARKtopia v70 QA 결과 요약

- 입력 기준: `ARKtopia(2).zip` (v69), 새 패키지: v70.
- 테스트 환경: Linux x64, Node v22.16.0, TypeScript/Next.js v69 의존성의 로컬 ZIP 복원.
- 코드 수정: `src/lib/game-v10.ts`, `src/lib/navigation.ts`, `src/components/Game.tsx`, `src/lib/hidden-hunt.ts`, `src/app/globals.css`.
- **`npm run typecheck`: PASS**.
- **기존 로직 14 + v69 탐지 6 + 신규 v70 14 = 34/34 PASS**.
- **필수 리소스: 53/53 경로·헤더 유효**.
- `npm run build`: BLOCKED (`@next/swc-linux-x64-gnu` 미설치 + `registry.npmjs.org EAI_AGAIN`). 실패를 성공이라 주장하지 않음.
- `npm run lint`: BLOCKED (ESLint 설정/의존성 부재, 같은 SWC 문제). ESLint 검사 성공 주장 불가.
- Chrome/Playwright 실행 및 4해상도 실화면 검사: NOT RUN. 별도 선택적 Playwright 스펙 제공.
- v70 로직 테스트 14개에는 차단 상태, AP 0 야간 진행, 보급 잠금, 퓨즈 전력, AP 저장 복구, 기존 필드 마커 정적 확인이 포함됨. `test-v70` 단독으로 실제 마우스/터치 동작까지 검증한 것은 아님.
- 기존 시나리오/ORIGIN ZERO/Hidden Photo/엔딩 파일은 삭제하지 않음. 8개 엔딩 전체 플레이 완료 여부는 미확인.
- 최종 ZIP의 CRC 확인은 패키징 단계에서 수행.

자세한 근본 원인, 수정 파일 및 남은 작업은 `NEXT_STEPS_README.md`를 참고.
