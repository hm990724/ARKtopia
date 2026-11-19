# ECHO WARD v40 — v37 이상 적용 패치

ZIP의 `src/`, `scripts/`, `package.json` 등을 **기존 프로젝트 최상단**에 덮어쓰세요. 이미지와 폰트 바이너리는 들어있지 않습니다. 기존 `public/assets/`는 유지하세요.

* 코드 기준: v37 → v40 누적 변경 (v38 대화, v39 사건·UI·장비, v40 포획 발견 연출)
* 기존 세이브 키·이미지 경로는 수정하지 않았습니다.
* `npm install` → `npm run test:v39` → `npm run test:v40` → `npx tsc --noEmit` → `npm run build`
* 빌드 전반은 실제 프로젝트에서 반드시 확인하세요. 정적 타입 검사와 CSS 시각 검증은 통과했지만 실제 Next.js 빌드 통과는 확인되지 않았습니다.
