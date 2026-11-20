# ARKtopia v70 — 진행 불가 버그 수정 전체 프로젝트

이 압축은 **ARKtopia v69 전체 프로젝트에 보급 접근·하루 종료·AP 복구·퓨즈 처리 회귀 수정**을 적용한 v70 전체 소스입니다. 기존 동물 이미지, 직원, ORIGIN ZERO, 12개 Hidden Photo 기록, 엔딩 분기는 그대로 유지합니다.

**먼저 읽기:** `NEXT_STEPS_README.md`(실제 변경 파일/근본 원인/테스트 및 미해결 사항) · `QA_REPORT_v70.md`(검증 사실).

```powershell
npm ci
npm run typecheck
npm run test:all
npm run check:assets:v70
npm run build
npm run dev
```

> 현 작업 컨테이너에서 TypeScript + 34개 테스트는 통과했으나 Linux용 SWC가 없고 npm registry 연결이 실패하여 Next.js 빌드/브라우저는 **미검증**입니다. 아래는 기존 v69/v67 문서 아카이브입니다.

---

# ARKtopia v69 · 전체 프로젝트 (탐지/포획 복구 및 세계관 통합)

**중요:** 압축 안의 `NEXT_STEPS_README.md`와 `QA_REPORT_v69.md`를 먼저 읽으세요. 이 파일은 제공된 v67 소스에 v69 개선 사항을 직접 적용한 결과물이며, 별도 Codex의 더 최신 저장소 내용은 포함됐다고 주장하지 않습니다.

## v69 변경 핵심
- 직접 그물 드래그 포획 · 청음 구역 가시화 · 단서 기반 추적
- CCTV의 직접 4구역 클릭 판독 · 정밀 스캔 대체 수단 보존
- 야간 선택형 퓨즈 수리, 모바일 직원 영역 접기
- 직원의 이송 개체 보존 번호 · 신체 안정도/동물 기억 충돌
- 군사 연구와 M-00 종전 후 탈출, ARKTOPIA 살아 있는 동물 숙주 보존, PHOTO11 관리자 이력
- 기존 직원 4종 아트/컷신·엔딩·저장·기능 유지. 14개 동물 이미지(7종×2) 반영.

## Windows 실행
```powershell
cd C:\Users\lookm\Documents\GitHub\ARKtopia
npm ci
npm run check:assets
npm run typecheck
npm run test:logic
npm run test:v69
npm run dev
```
브라우저: http://localhost:3000

---

## 이전 버전 안내
# ANOMALY ZOO / ARKtopia v67 · 병리실 & UI 패치

v66 **ORIGIN ZERO**를 유지하면서 **직원 상세 모달 + 토끼 이송 후 격리실 튜토리얼 버그 수정 + 생체 합성 제거 및 병리·검시 시스템**을 추가한 전체 소스 폴더입니다.

## Windows에 설치

1. 기존 `C:\Users\lookm\Documents\GitHub\ARKtopia` 폴더를 삭제하기 전에 **다른 이름으로 백업**하세요. 기존 `.git`, `.env`는 이 ZIP에 없습니다.
2. 새 ZIP을 풀면 최상위에 `ARKtopia` 폴더가 나옵니다. `C:\Users\lookm\Documents\GitHub\`에 놓으세요.
3. PowerShell에서 실행:

```powershell
cd C:\Users\lookm\Documents\GitHub\ARKtopia
npm ci
npm run check:assets
npm run typecheck
npm run dev
```

브라우저: http://localhost:3000

## 주요 변경

- **직원 UI**: 왼쪽 목록에서 직원 선택하면 화면 중앙 모달이 뜹니다. 긴 규칙 설명과 세부 감소 수치 안내를 제거하고 정신 안정도·성격·대화·지원·회복만 남겼습니다. 바깥 클릭/Esc로 닫습니다.
- **튜토리얼 저장 복구**: 첫 토끼가 본부 이송된 뒤에는 `tutorialStep` 4/5로 되돌아가지 않습니다. 옛 세이브도 로딩 시 6 이상으로 보정, 이송 전용 안내 플래그 초기화. 다음 임무는 야간 → CCTV → 병리실 복구입니다.
- **합성 시설 대체**: 기존 세이브와 호환하기 위해 내부 시설 키 `synthesis`는 유지하지만 게임 화면에는 **병리·검시실**로 표시됩니다. 두 동물의 결합/키메라 생산 기능은 제거했습니다. 2종 확보 조건도 없습니다.
- **병리·검시 행동**: 생존 개체의 비침습 검체/정밀 검사, 사망 개체의 사후 검시. 확률은 건강·스트레스·시설 상태로 달라집니다. 결과 성공/실패, 다음 선택(내부 기록 보관/본부 보고)에 따라 지식·신뢰·크레딧·위협이 바뀝니다. 하루 중복 검사·사후 중복 검사 제한 및 저장 데이터 호환을 추가했습니다.
- **Hidden Photo**: 기존 12개 기록 카드에 실제 포함된 기존 그림을 "ARCHIVE VISUALIZATION"로 붙여 기록을 읽기 쉽게 했습니다. 신규 원본 12장이라고 표시하지 않습니다.

## 이미지와 미완성 상태

현재 포함된 이미지 **50장 전부 기존 이미지**입니다. 새로운 이미지 생성 시도가 동물 스프라이트로 잘못 나와 **프로젝트에 넣지 않았습니다**. 요청한 신규 비동물 원본 이미지 약 29장은 **미완성**이며 정확한 내역은 `ART_AUDIT.md` 및 `ASSET_WORKLIST.md`를 참고하세요. 엔딩 기존 그림과 새 세계관의 정확한 일치도는 재검토가 필요합니다.

## 실제 검증

- TypeScript `tsc --noEmit`: **통과**
- 기존 ORIGIN ZERO 로직 7개 시나리오: **통과**
- 토끼 이송/옛 저장 복구/병리 성공·실패/반복검사 제한 등 신규 테스트 7개: **통과**
- `npm run check:assets`: **통과** (기존 핵심 에셋 점검)
- Next.js 전체 빌드: **미완료**. 이 Linux 실행 환경에 Windows SWC 바이너리만 있고 네트워크가 막혀 Linux용 바이너리를 받지 못했습니다.
- 브라우저 실플레이·시각적 모달 렌더링: **미검증**

## 주의

- **저장 데이터**: 브라우저의 `last-enclosure-ark-v10` 키는 그대로 사용합니다. 중요 저장은 백업하거나 별도 브라우저 프로필로 테스트하세요.
- `.git`/`node_modules`/`.next`는 ZIP에 포함되지 않습니다. Git 기록과 로컬 환경 설정은 꼭 따로 보존하세요.
- 법적으로 필요한 타사 라이선스 안내를 의도적으로 제거하지 않았습니다. 기존 소스에 별도 프로젝트 LICENSE는 없었습니다.
