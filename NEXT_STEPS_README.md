# ARKtopia / ORIGIN ZERO — 이어서 작업할 내용

기준일: 2026-11-23
프로젝트: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## v81 야간 시설 전력 우선순위 — 2026-11-23

- 시설 작업대에서 CCTV 감시망, 격리 보강, 진료·검시실, 공명 연구실의 야간 배전 우선순위를 바꿀 수 있다. 시설별 전력 사용량은 각각 3/2/3/2%다.
- 야간 방어·회복 등 기존 정산을 마친 전력으로 우선순위 순서대로 시설을 켠다. 부족분은 차단되며 해당 밤의 진료/격리/연구 효과와 CCTV 자동 감지가 실제로 중단된다. 야간 선택 미리보기에 다음 배전 결과가 표시된다.
- 설정과 정산 결과는 저장된다. 구형 저장에 배전 기록이 없으면 기존 설비 가동을 우선 보존하고, 첫 야간 결산부터 새 규칙을 적용한다.
- 회귀 근거: `scripts/test-v81.cjs`, `tests/browser-v81.spec.cjs`. `npm run test:all`, 프로덕션 브라우저 41/41, 타입 검사, 린트, 에셋 검사, `npm run build:qa` 통과. 빌드에는 기존 React Hook 및 Autoprefixer 경고가 남아 있다.
- **추가 미완료:** 새 저장으로 여러 날을 이어가는 자연 캠페인 밸런스와 초보자 플레이테스트, 최종 고품질 엔딩/사건 시네마틱 아트, 전체 아트 나란히 검수, 실제 호스팅 배포.

## v80 gameplay rebuild continuation — 2026-11-23

- 선택 구역을 누르면 출동 전에 장비·동행 직원·AP와 소모 자원을 한 화면에서 확인하는 편성 모달이 열린다. 기존 일일 출동 1회, AP 1, 광원/재고 차단, 튜토리얼 `data-tour=launch` 연결은 유지했다.
- DAY 3부터 현장 위험도에 맞춰 오염 추적체가 별도 위치와 경계도를 가진 채 필드 세이브에 생성된다. 빠른/보통 이동은 추적체를 끌어오고 조용한 이동은 늦춘다. 발견 범위 안에 들어온 추적체는 지도에서 이동하고 인접하면 이동이 잠긴 중앙 대응 화면으로 이어진다.
- 기존 타일 포자 사고와 동물 포획은 별도 시스템으로 남겼다. 전투는 방어/반격, EVE 전력 펄스, 동행자별 지원, 전리품, 후퇴를 제공한다. 후퇴는 추적체를 밀어내며, 승리할 때만 한 번 전리품을 지급한다. 게임 저장/불러오기를 통해 전투 의도와 추적체 좌표를 유지한다.
- 회귀 근거: `scripts/test-v76.cjs`, `tests/browser-v80.spec.cjs`, 기존 첫 토끼 구조 브라우저 테스트. 새 브라우저 수용 케이스는 준비 모달/비용 변경 및 실제 추적체 전투/후퇴를 확인한다.
- Earlier v80 baseline verification passed at 39/39. The final production Chrome suite is 40/40 after adding the complete outing and roster-aware ending checks below. Build emits six existing React Hook dependency warnings and existing Autoprefixer compatibility warnings.
- Follow-up combat presentation: the selected companion now appears with that staff member's real portrait and role label. Combat actions persist the latest action and animate the ranger, enemy impact, guard arc, EVE pulse, or companion support. An integrated browser scenario covers loadout → roaming threat fight → rabbit tracking/rescue → cache salvage → safe extraction → CCTV restoration paid from recovered resources. Final production Chrome suite passed 40/40.
- Added role-specific combat assertions: rabbit support restores manager morale, fox support recovers scrap, deer support reduces infection, and wolf support can finish an exposed enemy. Existing field outing E2E continues to verify the real Wolf portrait and action animation.
- CCTV facility repair now plays a short assembly → wiring → power-on sequence with a visible ONLINE confirmation; the animation respects reduced-motion settings. The integrated sortie test verifies it appears after paying the restoration cost from recovered salvage.
- Ending records now add portraits only for staff who actually joined and remain alive in that save; retired personnel stay in the loss record and are not shown as living cast. A browser fixture with two living and two retired staff verifies the split.
- Latest verification after this change: `npm run test:all` passed (including v76 role support checks), `npm run check:assets` passed, and production Chrome `npm run test:browser` passed 40/40. Typecheck, lint, and `npm run build:qa` also pass; the build retains existing React Hook and Autoprefixer warnings.
- **미완료:** 정상적인 신규 저장을 시작해 여러 날 동안 탐사·포획·기지 강화·직원 관리까지 이어가는 자연 캠페인 밸런스 검증, 직접 플레이 접근성 검토, 18개 임시 엔딩 카드를 고유 고품질 시네마틱으로 교체, 13종의 최종 그림을 기존 픽셀 아트와 전부 나란히 미술 검수, 실제 호스팅 배포.
- 이 기능은 배포를 완료한 것이 아니다. 실제 배포처/배포 절차가 프로젝트에 지정되어 있지 않으므로 GitHub push와 호스팅 배포를 구분한다.

## v79 continuation — 2026-11-23

- 기존 사건 13종에 상태 기반 사건 27종을 추가해 총 40종을 실제 일일 사건 선택과 비용/효과 처리에 연결했다. 근거: CCTV, 전력·배관, 동물 돌봄, 직원 개인 기억, 본부 명령, 탐사 전리품, 감염, M-00 단서. 개별 사건은 3개의 선택지를 갖고, 비용 부족 시 저장 상태를 바꾸지 않는다.
- `scripts/test-v75.cjs`는 신규 사건 27종의 상태 진입 조건, 81개 선택 결과, 기록 저장, 아트 경로 해석을 검사한다.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets` 통과.
- 신규 사건 삽화는 6개 기존 장면을 범주에 맞춰 재사용한다. 사건 40종 각각의 전용 시네마틱은 미완료다.
- `npm run build:qa` 통과, 프로덕션 Chrome 브라우저 37/37 통과. 현재 빌드의 기존 Hook 의존성 경고 6건은 남아 있다.
- 남은 일: 자연 새 저장으로 40종 사건의 발생 빈도/자원 경제를 플레이 검증, bespoke 엔딩·사건 그림 및 상태 연동 캐스팅 검토. 현 활성 19 엔딩 SVG는 정본 인물만 보여주는 임시 구성이다.
- 이번 실행 검증 커밋: `dff514b` (`Add 27 stateful daily incidents`). 전체 프로젝트 ZIP은 `ARKtopia_ORIGIN_ZERO_ULTIMATE_FULL_PROJECT_v79.zip`이며 인접 SHA-256 파일을 확인한다.

## v80 deterministic management probe — 2026-11-23

- Added `npm run balance:strategy`: four fresh Generator starts (Medic/Engineer/Artist/Warden), twelve deterministic day transitions each, event response selection from visible effects, low-power repair and threat-based night defense. All four reach DAY 13 with nonnegative resources and no collapse.
- Outcomes and the exact policy are recorded in `BALANCE_REPORT.md`. This intentionally excludes expeditions, captures, animal care, staff and upgrades; natural full-campaign balance is still not certified.
- At the time of the initial v80 probe, no `image_gen` tool was connected. The connection became available later in this session; see the v80 art correction below. No API/CLI fallback was used.

## v80 art and crew-loss correction — 2026-11-23

- Rechecked `public/assets/animals`, `cinematics/staff-arrivals`, `cinematics/staff-terminations`, and staff portrait states against the actual files. Canonical animal lookups use the original species/state names; historical `_v##` files remain archival and are not runtime lookups.
- Image generation became available in this session. Generated and visually reviewed the canonical `public/assets/animals/m00_normal.png` against the M-00 identity and existing rabbit pixel-art quality references. It is transparent RGBA 1254×1254. The replaced M-00 art was copied to `public/assets/archive/m00_normal_pre_pixel.png` before replacement.
- A low-detail hand-drawn test sprite was discarded and is not referenced by the game. It was never committed and the source art was not modified.
- `scripts/test-v75.cjs` now validates the generated canonical M-00 PNG header, dimensions, alpha channel, runtime path, and preservation archive.
- One custom Seed of the Ark ending scene (`ending_seed_ark.png`) now replaces its interim card. Remaining: replace 18 interim ending cards, review/generate species art that fails the canonical design audit, and verify all ending casts against live/retired staff state. Do not call the full art work complete based on these two assets alone. Full audit: `docs/ART_AUDIT_v80.md`.
- `ending_seed_ark.png` shows EVE alone beside the empty chair after the manager's final report. `test:v75` checks the PNG signature and dimensions; the ending-route browser test validates loading.
- Staff termination now lowers each surviving employee's mind by 30 once when a staff member is lost. Regression test `npm run test:v71` covers the one-time penalty and the follow-on zero-mind queue.

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
- Fixed-seed no-operation probe (`npm run balance:soak`) completes ten neglected transitions: DAY 11 remains playable at power/facility 0, threat 100, infection 74 and morale 80. It guards against a forced DAY 10 game over. A strategic comparison and natural campaign playthrough are still needed.
- The Ultimate Master prompt has now been read and cross-checked. Current code/docs keep the M-00 false lead, 13 species identities, one expedition per day/AP 1, lasting explored cells, current footprints/radius-one grass, staff care costs, power crisis, field salvage, and species-specific recall.
- Historical Axolotl/Lynx/Chimera/Moth/M-00/Wolf art variants were restored from the existing v74.7 archive and preserved alongside canonical files. Runtime animal paths continue to use original species names with state suffixes, not `_vNN` assets.
- See `STORY_AUDIT.md` for canon/cast/ending review, `BALANCE_REPORT.md` for tested resource pressures and unverified natural balancing, and the latest section of `ART_AUDIT.md` for canonical art paths.
- Still incomplete: 40 distinct dynamic incidents (current registry: 13 IDs plus other event types), state-aware cast selection and bespoke action art for endings, final high-detail ending/staff-event illustrations, and a natural full-campaign balance playthrough. The current 19 SVG ending cards are cast-safe portrait compositions, not final cinematic paintings.
- Image generation was not available in the current tool integration; no CLI/API fallback was invoked. Existing art is connected and historical finals preserved, but the missing bespoke scenes remain explicit work.
- Full-project ZIP generated from the verified commit snapshot: `ARKtopia_ORIGIN_ZERO_ULTIMATE_FULL_PROJECT.zip`; SHA-256 is in the adjacent `.sha256` file. The existing v74.x archives were preserved.
- Latest gameplay/source commit: `cfbb1f7` (`Add deterministic ten-day neglect result`). The continuation integration commit is `f647c89`; package documentation was recorded in `d00c216`.
