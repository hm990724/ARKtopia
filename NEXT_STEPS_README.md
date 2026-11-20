# ARKtopia v70 — 치명적인 진행 불가 버그 수정 인수인계

기준일: 2026-11-20 · 입력: 사용자 제공 `ARKtopia(2).zip` (ARKtopia v69) · 저장 키: **`last-enclosure-ark-v10` 유지**

## 작업 범위 / 보존 원칙

기존 프로젝트의 탐지, 청음, 8×8 흔적 추적, 근접 신호, 그물 마우스·터치 드래그, CCTV, 현장 이동·격리, 야간 퓨즈 수리, 직원, ORIGIN ZERO, Hidden Photo 12건, ARK RECALL과 엔딩 로직을 **제거하거나 초기화하지 않았습니다.** 기존 `src/lib/origin-zero.ts`, 스토리·엔딩 관련 파일과 `public/assets`는 유지했습니다. 전반적인 디자인 개편은 하지 않고 하루 종료 안내를 기존 HUD에 추가했습니다.

원본 v69에 포함된 화면/스토리가 모두 최종 완성되었다고 **판정하지 않습니다**. 초기 ZIP에서 이미 미확보로 기록된 개별 이미지 및 서사 콘텐츠는 본 작업에서 생성한 것으로 주장하지 않습니다.

## 실제 수정/추가 파일

| 파일 | 변경 내용 |
|---|---|
| `src/lib/game-v10.ts` | 모든 날짜 종료 차단 사유를 반환하는 `getDayEndBlocker`, 실제 야간 비용/퓨즈 보너스 미리보기 `previewNight`, 날짜 증가로 성공 판정하는 `resolveNightTransition` 추가. `finishDay`가 동일한 차단 판정을 사용하도록 연결. 기존 AP 4/5 규칙 유지 |
| `src/lib/navigation.ts` **신규** | 탭 잠금 이유를 한 곳에서 계산. 보급 탭은 AP 0 및 튜토리얼 단계와 무관하게 접근. 대기 중인 사건의 해당 화면 잠금 예외 포함 |
| `src/components/Game.tsx` | `applyNight` 참조 비교 제거, 공유 결산 함수 호출, 날짜 기준 성공/실패 처리, `nightCommitRef`로 중복 클릭 방지, 날짜+AP를 같은 스냅샷으로 저장, 수리 포함 야간 예상 전력 표시, 차단 이유+직접 이동 버튼, 추천 행동 버튼에 `enterTab` 연결, 보급 안내 개선 |
| `src/lib/hidden-hunt.ts` | 기존부터 누락되어 타입 오류를 일으킨 최초 `HuntState.lastEvent` 기본값 추가. 관측·청음·그물 판정 로직은 변경 없음 |
| `src/app/globals.css` | HUD 차단 안내 및 작은 화면에서의 야간 모달 스크롤 스타일 추가. 기존 스타일 유지 |
| `scripts/test-v70.cjs` **신규** | v70 핵심 로직 회귀 테스트 14개 |
| `scripts/check-v70-assets.cjs` **신규** | 실제 사용 필수 이미지 53건 경로/헤더 검증 |
| `scripts/generate-v70-fixtures.cjs`, `tests/fixtures/day003-ap0.json` **신규** | 브라우저 테스트용 안전한 가상 저장 상태 생성 |
| `tests/browser-v70.spec.cjs`, `playwright.config.cjs` **신규** | 실브라우저 보급, 야간 전환, 재로드, 4가지 화면 크기 검증 스펙 (현재 환경에서는 **미실행**) |
| `package.json`, `package-lock.json` | 버전 표기 70.0.0 정렬, 테스트·리소스 검사 스크립트 연결. 의존성 목록 자체 변경 없음 |
| `QA_REPORT_v70.md`, 이 파일 | 검증 결과·미해결 사항 및 재현 방법 기록 |
| `docs/NEXT_STEPS_v69_ARCHIVE.md` **신규** | 기존 v69 인수인계 원본 보존 |

## 버그 원인 → 해결

### A. 보급 버튼이 엉뚱한 화면을 가리키거나 이동 불가

- **원인(코드 확인)**: `tabUnlocked('supplies')`가 튜토리얼의 단계/탐사 횟수에 의존했습니다. 추천 행동 버튼은 공통 접근 검증을 거치지 않고 `setTab(...)`을 직접 사용했습니다. 이 방식으로는 보급 탭의 잠금 사유와 실제 동작을 일치시킬 수 없었습니다. 보급 버튼 자체가 `setNightView(true)`를 호출하는 코드는 원본에서 발견되지 않았으므로, 실제 브라우저에서 화면이 야간으로 잘못 클릭되었던 세부 원인은 **미재현**입니다.
- **해결**: `tabLockReason`의 보급 반환값은 언제나 `null`, 실제 보급 메뉴 이동은 `enterTab`, 클릭만으로 AP 차감/하루 종료 없음. 구매·발전기의 원래 자원/AP 조건은 유지했습니다.

### B. AP 0 상태에서 하루 종료 불가능

- **원인(코드 확인)**: `finishDay`는 AP 0을 직접 차단하지 않지만 여러 대기 상태를 무음 차단하며, 하단 버튼도 `run`, `pending`, `pendingIncident` 조건으로 비활성화했습니다. 정작 이유와 복구 경로가 보이지 않았습니다.
- **해결**: `getDayEndBlocker`는 탐사/구조, 사건, 직원 종료/야간 투표, 정문 음성, 본부 지령, 병리 후속, 본부 기록, 기밀 기록 상태를 구체적으로 안내합니다. 해당 화면으로 이동하는 버튼을 배치했습니다. AP·전력 0은 차단하지 않으며 기존 **경비 중단(standby)과 실제 위협/시설 손실**을 통해 날짜를 진행할 수 있습니다.

### C. 퓨즈 수리 후 AP 초기화되지 않음

- **원인(확인)**: 수리 시 `maintainedNight`가 새 객체이므로 `finishDay()`가 같은 *수리된 입력 객체*를 반환했어도 `n === nightStart`는 false가 될 수 있습니다. 그 결과, 종료 실패를 성공으로 처리하고 나머지 UI 상태를 닫거나 잘못된 상태를 저장할 위험이 있었습니다. 그리고 수리 보너스가 적용되기 **전**의 `applied` 값을 알림에 사용했습니다.
- **해결**: `resolveNightTransition()`이 차단 상태를 먼저 검증, 수리 완료 시 전력 +4·시설 +6을 적용한 뒤 실제 야간 방식 선택, `finishDay` 후 `next.day === previous.day + 1` 조건으로만 성공 판정합니다. 성공에만 `onboardingSeen`과 저장을 반영합니다. 참고: 보너스는 **전력 비용보다 먼저 적용**되며 전력은 0~100으로 상한 처리됩니다.

### D. 날짜만 넘어가고 AP 재차감/저장 불일치

- **확인**: 원본 `finishDay()`는 날짜를 증가시킨 뒤 시작 특성에 따라 AP를 4 또는 초반 `station`의 5로 설정합니다. 현재 자동 저장 효과나 튜토리얼 안내 효과에서 AP를 다시 감소시키는 코드는 확인되지 않았습니다. 직접 문제 재현이 가능한 브라우저 로그는 사용자 제공 ZIP에 없었습니다.
- **해결**: 밤 성공 상태를 **하나의 React `setS(next)`**로 반영하고, 동일한 `next`를 즉시 localStorage에 직렬화합니다. 날짜가 바뀌지 않은 경우는 원본 상태를 유지합니다. 렌더마다 AP를 강제로 바꾸지 않습니다. 브라우저에서 직접 확인은 후속 작업으로 남았습니다.

### E. 탐지/포획 회귀

- 기존 `String(hunt.lastEvent ?? "").includes("근접 신호")`, `String(hunt.lastEvent ?? "").includes("청음 결과")`, `is-near`, `is-listen`, `<Radio />`, 포인터 기반 그물 드래그 로직을 유지했습니다. 초기 `lastEvent` 값 누락만 바로잡았습니다.

## 실제 검사 결과 (2026-11-20)

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | **통과**, 오류 0건 (로컬에 재구성한 v69 의존성과 TypeScript 이용) |
| `npm run test:logic` | **14/14 통과** |
| `npm run test:v69` | **6/6 통과** |
| `npm run test:v70` | **14/14 통과** |
| `npm run test:all` | **34/34 통과** |
| `npm run check:assets` | 기본 스태프 컷신/초상 확인 (통과) |
| `npm run check:assets:v70` | **필수 이미지 53/53 경로·형식 헤더 확인** |
| `npm run build` | **실패/미검증**: Linux용 Next.js SWC 없음, npm registry DNS `EAI_AGAIN`으로 다운로드 실패. 소스 빌드 실패라고 단정할 수 없음 |
| `npm run lint` (Next.js ESLint) | **미완료**: 현재 환경에 ESLint 구성 및 Linux SWC 바이너리가 없음. 대체 검사를 ESLint 성공으로 표기하지 않음 |
| 실제 Playwright 브라우저 UI 테스트 | **미실행**: Next 개발 서버가 SWC 바이너리 없이 시작 불가. 테스트 파일은 작성됨 |
| `1366×768`, `1600×900`, `1920×1080`, 모바일 | **실화면 검증 미완료**: 반응형 CSS는 유지/보강했으나 스크린샷·실클릭 확인 필요 |
| ZIP 무결성 | 최종 패키징 후 파일 목록 및 CRC 검증. 배포 결과 메시지에 표시 |

### 테스트 주의

v70의 1~14번은 **로직 테스트와 주요 UI 연결점의 정적 확인**을 포함합니다. `test-v70`이 브라우저에서 실제 클릭을 실행했다는 뜻은 아닙니다. 실브라우저용 `tests/browser-v70.spec.cjs`에는 DAY 003/AP 0 보급 클릭, 야간 결산·새로고침, 4가지 뷰포트 검사가 있으나 이 컨테이너에서 실행하지 못했습니다.

## Windows 실행/검증 순서

```powershell
# ZIP을 압축 해제한 프로젝트 최상위 폴더
npm ci
npm run typecheck
npm run test:all
npm run check:assets:v70
npm run build
npm run dev
```

Chrome에서 기존 세이브 백업 후 DAY 003/AP 0 저장 상태를 열어 **보급 이동 → 야간 대응 → 다음 날 AP 4 → 새로고침** 순서로 확인하세요. 순차적으로 본부 지령, 외곽 사건, 퓨즈 수리, 탐사·청음·포획, 모바일 직원 패널도 확인하십시오.

Playwright UI 검증은 개발 서버/의존성 설치가 가능한 환경에서 추가로 다음과 같이 실행할 수 있습니다:

```powershell
npm install -D @playwright/test
npx playwright install chromium
npm run test:browser
```

ESLint를 실행하려면 ESLint와 Next ESLint 설정 패키지/설정이 별도로 필요할 수 있습니다. `npm run lint` 결과를 반드시 확인하세요.

## 미해결 · 다음 작업 우선순위

1. **P0** Windows/Linux 개발 환경에서 `npm ci`와 `npm run build` 실제 성공 확인. `eslint`, `eslint-config-next` 설정 후 ESLint 검사 실행.
2. **P0** Playwright 실클릭 테스트 실행 및 성공/실패 증거 기록. 특히 입력된 DAY 003/AP 0 저장과 기존 세이브에서 보급 버튼과 야간 처리 반복 클릭.
3. **P1** 1366×768, 1600×900, 1920×1080, 390×844 해상도에서 HUD, 야간 모달, 접이식 직원 패널, 보급 잠금 문구 확인.
4. **P1** 오래된 특이 세이브(이전 버전에서 이미 대기 이벤트가 꼬인 상태)의 미처리 사건/직원 상태를 여러 경우로 재현해 추가 마이그레이션 필요성 판단. 현재 정상적인 이벤트를 자동 삭제하지 않음.
5. **P2** 원본 v69 문서에서 미완성으로 분류된 고유 동물/스토리 이미지, 8엔딩의 전 경로 및 독립컷 장기 QA는 별도 콘텐츠 작업으로 진행. **이번 버그픽스의 완료로 표시하지 않음.**

## 배포 구성

`ARKtopia_v70_bugfix_full_project.zip`에 프로젝트의 `src`, `public/assets`, `docs`, `scripts`, `tests`, 설정/잠금 파일, README와 QA 보고서를 포함합니다. 실제 게임 데이터 에셋은 복사했으며, `node_modules`, `.next`, `.git`, `tmp`의 이전 버전 작업 캐시, `tsconfig.tsbuildinfo`, 오래된 중복 ZIP은 제외했습니다. Windows에서 `npm ci`로 의존성을 설치해야 실행할 수 있습니다.
