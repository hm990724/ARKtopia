# ARKtopia / ORIGIN ZERO — 이어서 작업할 내용

기준일: 2026-11-23
프로젝트: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## 최신 이어받기 상태 (v77)

- 전체 작업을 완료했다고 간주하면 안 된다. 최신 `test:all`, 타입, 린트, 에셋 검사, 프로덕션 빌드, 프로덕션 브라우저 36/36은 통과했다. 빌드에는 기존 React Hook 의존성 경고가 있다.
- Endings now use 19 separate SVG compositions drawing only the canonical protagonist and EVE assets. This removes unrelated generated faces, animals, and mutants from ending screens. The cards are a cast-correct interim layout, not the requested bespoke painterly cinematic illustrations; expressions/poses remain portrait crops.
- The prior v76 generated raster ending files remain on disk and are inactive. Do not delete them. The image service previously returned `401 token_revoked`; after authentication recovers, create and visually review custom art against the canonical characters and each route's unlocked story facts.
- Active ending art source: `scripts/generate-ending-cards.cjs`; mapping: `src/lib/ending-art.ts`; audit and limitation: `docs/ENDING_ART_v76.md`.
- 이미지 교체 후 `npm run test:v75`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, `npm run build:qa`, `ARK_PRODUCTION_TEST=1 npm run test:browser`를 재실행한다. 브라우저 테스트는 Chrome 프로세스 실행 가능 여부를 먼저 확인한다.
- 엔딩 매핑과 남은 시네마틱 작업: `docs/ENDING_ART_v76.md`, `src/lib/ending-art.ts`.
- 출동, 추적/포획, 자원/기지, 전투, 종별 흔적, 저장 호환성은 `npm run test:all`에서 통과했다. 자연스러운 장기 플레이 밸런스와 초보자 플레이 테스트는 미완료다.

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

## 배포 파일

- 최신 실행 검증 소스 ZIP: ARKtopia_ORIGIN_ZERO_Enhanced_Full_Project_v74.5.zip
- SHA-256 체크섬: 같은 이름의 .sha256 파일
- 74.1~74.4 기존 산출물은 별도 이름으로 보존한다.

## 핵심 참고

- 원본 상위 명세: `00_CODEX_MASTER_PROMPT.txt`
- 스토리: `STORY_BIBLE.md`, `docs/STORY_BIBLE_WAR_ARKTOPIA_v69.md`
- 게임 규칙: `GAMEPLAY_SYSTEMS.md`, `UI_GAMEPLAY_SPEC.md`, `EVENT_MATRIX.md`
- 종료 조건: `ENDING_MATRIX.md`
- QA: `QA_ACCEPTANCE.md`, `QA_REPORT.md`
- 자산 감사: `ART_AUDIT.md`, `docs/generated-assets-v75.json`

## v74.6 ending and daily-event artwork — 2026-11-23

- Added 19 unique, story-specific ending illustrations and six illustrated daily-event scenes in the shared mauve survival-fantasy direction.
- Daily event artwork covers all 13 incident IDs; the ending record shows its route-specific scene.
- Source notes: `docs/ENDING_EVENT_ART_v75.md` and `docs/generated-assets-v75-endings-events.json`.
- Verification: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run build:qa`, and production Chrome browser tests (34/34) passed.
- This version's full source archive is `ARKtopia_ORIGIN_ZERO_Enhanced_Full_Project_v74.6.zip`; its SHA-256 is in the adjacent `.sha256` file. The archive was built from Git so it includes the pre-existing tracked source images that are currently deleted from the working directory, without restoring those files into the worktree.
- The existing caveat remains: the 8 ending conditions and UI are verified with deterministic save fixtures, but a complete natural multi-day campaign has not been run end to end.

## v74.7 M-00 false-origin reveal — 2026-11-23

- The player first sees the supplied mutant design as a dangerous CCTV silhouette and suspects it is M-00/the outbreak's origin. Three camera clues reveal that lighting and broken video stretched the same cat's shadow into the apparent monster; the biological marker confirms identity only.
- The scientist's disposal operation and containment collapse remain the outbreak cause. M-00 is a separate survivor and the origin of independent cognition, not the culprit.
- New playable CCTV artwork: `public/assets/events/m00_suspected_origin_v75.png`. Story notes: `docs/STORY_REVEAL_FALSE_ORIGIN_v76.md`.
- Verification: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run build:qa`, production Chrome browser suite 35/35.
- Full project package: `ARKtopia_ORIGIN_ZERO_Enhanced_Full_Project_v74.7.zip` with adjacent SHA-256 file. The source archive preserves tracked originals missing from the current worktree without restoring them there.
- A complete natural multi-day campaign remains untested end to end; story and ending fixtures plus browser routes pass.

## v78 current handoff — 2026-11-23

- Latest browser run: **37/37 production Chrome tests passed**. Two stale assumptions in the night-circuit and staff-dialogue browser checks were corrected; the game UI now follows the displayed voltage order and the accessible button label.
- Latest logic suite, TypeScript check, lint and local asset check all pass. Production `build:qa` passed; existing CSS compatibility and React Hook dependency warnings remain.
- The Ultimate Master prompt has now been read and cross-checked. Current code/docs keep the M-00 false lead, 13 species identities, one expedition per day/AP 1, lasting explored cells, current footprints/radius-one grass, staff care costs, power crisis, field salvage, and species-specific recall.
- Historical Axolotl/Lynx/Chimera/Moth/M-00/Wolf art variants were restored from the existing v74.7 archive and preserved alongside canonical files. Runtime animal paths continue to use original species names with state suffixes, not `_vNN` assets.
- See `STORY_AUDIT.md` for canon/cast/ending review, `BALANCE_REPORT.md` for tested resource pressures and unverified natural balancing, and the latest section of `ART_AUDIT.md` for canonical art paths.
- Still incomplete: 40 distinct dynamic incidents (current registry: 13 IDs plus other event types), state-aware cast selection and bespoke action art for endings, final high-detail ending/staff-event illustrations, and a natural full-campaign balance playthrough. The current 19 SVG ending cards are cast-safe portrait compositions, not final cinematic paintings.
- Image generation was not available in the current tool integration; no CLI/API fallback was invoked. Existing art is connected and historical finals preserved, but the missing bespoke scenes remain explicit work.
- No new full-project archive was generated in this continuation yet. Existing v74.7 archive is retained; package a new archive only after the final commit/source snapshot is selected.
