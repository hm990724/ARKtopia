# ANOMALY ZOO / ARKtopia v69 — 이어받기 / 실제 작업 상태

## 출처 및 주의
- 실제 수정 기준: 사용자가 이번 대화에 제공한 `ARKtopia_v67_직원모달_격리실버그_병리검시_전체프로젝트.zip`.
- `NEXT_STEPS_README.md`는 그 ZIP에 없어서 **이번에 새로 작성**했다. 사용자에게 언급된 별도 Codex 최근 변경(Chrome 6해상도 검증, WASD 검사, 최신 야간 수리 구현)은 **이 ZIP에 없어서 병합한 사실이 없다**. 실제 다음 Codex 버전과 병합하려면 해당 ZIP 또는 Git 이력이 추가로 필요하다.
- 사용자가 요구한 전체 프로젝트 ZIP이며, 패치 전용 ZIP이 아니다. 원본의 `.git`/환경변수/브라우저 저장 데이터는 포함되지 않는다.

## 구현한 변경(v69)
1. `src/lib/hidden-hunt.ts`, `src/components/FieldMission.tsx`: 탐지의 단서(발자국·관찰·저주파 청음 4×4 영역), 정보가 있을 때 직접 던지는 **마우스/터치 드래그 그물**, 지도 터치 대체 조작, 행동 소모/실패 대가, 20회 추적 시 중간 단서.
2. `src/lib/security.ts`, `src/components/Game.tsx`: CCTV 영상의 2×2 영역을 직접 클릭해 이상 행동을 판별. 오탐과 실제 발견 결과가 다르고, 탈출 개체는 수동 판독 성공 시 추적 상태가 되어 재격리에 연결. 기존 유료 스캔 버튼은 접근성 대안으로 유지.
3. `src/components/Game.tsx`: 야간 경비 전 선택형 3단계 퓨즈 연결 퍼즐. 완료 시 시설+6/전력+4, 실수 시 리셋, 생략해도 다음 날 진행. 기존 방어·휴식·경비중단 선택 유지.
4. `src/components/CrewSystem.tsx`, `src/lib/crew.ts`: 모바일 직원 패널 접이식, 실제 HQ 이송 동물의 고유 보존 번호를 도착 직원에 연결, 신체 안정도·동물 신체 반향 지표 추가. 정보는 PHOTO 07 전에는 화면에 노출하지 않는다.
5. `src/lib/origin-zero.ts`, `src/components/OriginZeroPanel.tsx`, `src/lib/narrative.ts`: 전쟁 병기 연구 → 종전 폐기 → M-00 탈출 → 인류 붕괴 → ARKTOPIA 살아있는 동물 숙주 보존 → 복제 직원의 불안정한 복원, PHOTO 11 관리자의 동물 숙주 이력. Hidden Photo는 네 묶음의 작은 기록 퍼즐 뒤에 복원.
6. `public/assets/animals`: 이전에 선별한 새 12장(토끼, 여우, 사슴, 올빼미, 늑대, 수달 각각 2형태), 기존의 까마귀 2장 유지. 없는 종의 이미지를 다른 동물로 대체하지 않고 `unavailable-specimen.svg` 표시.
7. 기존 전체 프로젝트 소스, 스토리·이미지·테스트 참고 문서, 저장 키 `last-enclosure-ark-v10` 유지.

## 실제 테스트 결과
- `NODE_PATH=<typescript 설치 경로> node scripts/test-logic.cjs`: v67 호환 **14/14** 통과.
- `NODE_PATH=<typescript 설치 경로> node scripts/test-v69.cjs`: 새 CCTV/직접 그물/청음/이전 저장 **6/6** 통과.
- `node scripts/check-assets.cjs`: 핵심 직원 컷신/프로필/EVE 그림 존재 검사 수행.
- TypeScript 소스 문법 트랜스파일 검증은 별도 `QA_REPORT_v69.md` 참고.
- **브라우저 실플레이·6개 화면 크기·Next.js 전체 production build는 이 환경에서 검증하지 못했다.** 의존성 설치가 실패해 typecheck에서 `@types/react`, `@types/node`를 불러올 수 없는 상태였다. 이를 코드 오류가 0개라는 증거로 쓰지 말 것.

## 다음 작업 순서
1. 새 브랜치 또는 백업을 만든 뒤 Windows에서 `npm ci && npm run typecheck && npm run build && npm run dev`.
2. Chrome에서 새 게임과 옛 세이브 각각 복구 후 탐사 WASD, CCTV 수동 4구역 판독, 4×4 청음, 직접 그물 드래그/모바일 탭, 밤 3→1→2 퓨즈를 실제 조작 테스트.
3. 보존 번호·인간 직원 직업 복선이 PHOTO 07 전에 표시되지 않는지, PHOTO 11에서 관리자의 동물 숙주 이력이 등장하는지 검증.
4. 1366×768, 1600×900, 1920×1080, 390×844, 375×667, 768×1024에서 UI 잘림과 실제 클릭 가능 여부를 확인. 모바일 직원 메뉴가 지도를 밀지 않는지 검증.
5. `docs/REQUIREMENTS_IMAGES.md`와 `ART_AUDIT.md` 비교: M-00 정상 고양이, 독립 Hidden Photo 12장, 신규 컷신/인물/배경은 **미확보**. 실제 없는 파일의 이름만 등록해 완성으로 처리하지 말 것.
6. 미완성 독자적인 동물 6종×2종 이미지, 전용 ARK RECALL 종별 조작, 8엔딩의 전용 대사/이미지 실제 매핑, 게임 전체 엔드투엔드 경로 구현 및 테스트.
7. Codex 최신 버전이 별도로 존재한다면 Git diff로 이번 v69와 최신판을 직접 병합하되, 새 세계관과 다른 최신 UI/스토리를 임의로 덮어쓰지 말 것.

## 실행 방법
```powershell
cd C:\Users\lookm\Documents\GitHub\ARKtopia
npm ci
npm run check:assets
npm run typecheck
npm run test:logic
npm run test:v69
npm run dev
```

> 브라우저의 기존 localStorage 데이터는 패치 후에도 사용되지만, 중요한 세이브는 백업하고 새 프로필에서 먼저 테스트한다.
