# ARKtopia / ORIGIN ZERO QA 보고

검증 기준: v74 통합 기능 및 최신 M-00 폐기 사고 인과 수정

## 실행 결과

- `npm run typecheck`: 통과
- `npm run lint`: 통과
- `npm run test:all`: 통과. 기존 스토리/세이브 회귀와 v69~v74 테스트 포함. v74에는 종별 3단계 ARK RECALL 중간 저장/재개와 8개 엔딩 fixture 회귀 포함.
- `npm run build:qa`: 통과. `/` 정적 사전 렌더 포함.
- `ARK_PRODUCTION_TEST=1 npm run test:browser`: 2026-11-23 최신 QA 빌드에서 32/32 Chrome 테스트 통과. ARK RECALL 저장/재개, 13종 상호작용과 모바일 폭, 정본 8개 엔딩 UI·이미지·사망 대사를 확인.
- v74 시뮬레이션 테스트: 780개 seeded 탐사, 6×6/이전 8×8 저장, 반경 1칸 풀 흔적, 이미 밝힌 칸의 실시간 발견, 전투 보상 중복 방지, 기지 업그레이드 저장을 확인.
- 스토리 추가 회귀: 강제 폐기 중 격리 붕괴가 유출 원인이고 M-00 탈출은 별도 사건이라는 Photo 기록을 검사.
- 2026-11-22 중계기 후속 변경 재검증: `npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa` 모두 통과. `ARK_PRODUCTION_TEST=1 npm run test:browser` 22/22 통과. 새 저장 필드 없이 기존 업그레이드 단계 데이터를 사용한다.
- 2026-11-22 ARK RECALL: 종별 프로토콜을 이용해 3단계 분석 문답과 종별 시각 계기판을 추가했다. 진행 중 세이브 필드는 선택적으로 보존되며, 구형 저장은 빈 세션을 기본값으로 보완한다. 타입검사·린트·전체 회귀·QA 빌드 및 브라우저 23/23 통과.
- 2026-11-22 엔딩 정합성: 본편 최종 목표·동물 보호/희생·직원 손실·본부 자료 송신 기록에 따라 8개 정본 엔딩을 모두 실제 출력한다. 각 결말에 관리자 사망이 들어가는 fixture를 추가했다. 변경 뒤 전체 회귀/최신 빌드/브라우저 테스트는 다시 실행해야 한다.
- 엔딩 변경 후 최종 재검증: `npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa` 통과. Chrome 브라우저 테스트 23/23 통과. 엔딩별 로직 fixture 8/8 통과.
- 2026-11-23 Recall 상호작용: 13종 프로필에 신호창 조정·표본 배치·기록 정렬·경로 선택·선율 입력·밸브 조정·채널 분리·신호 동기화·잔향 선택을 추가했다. 13종 전부 모바일 390px에서 입력 후 단계 저장까지 확인했고 브라우저 전체 32/32.
- 2026-11-23 Recall/엔딩 추가 후 재검증: 전체 브라우저 테스트 32/32, 전체 로직/회귀 `npm run test:all`, 타입검사, 린트 통과. QA 빌드 통과; 기존 CSS autoprefixer 및 Hook dependency 경고는 유지.

## 빌드 경고

프로덕션 빌드는 성공하지만 `FieldMission.tsx`와 `Game.tsx`의 기존 hook dependency 경고 6건을 출력한다. 이번 수정에서 새로 추가된 오류는 아니다.

## 미완료

- 실제 장시간 플레이에서 난이도/보상 균형은 플레이테스트가 필요하다.
- 13종별 Recall 입력이 달라졌지만 일부 종은 같은 물리 입력 계열을 공유한다. 모든 조작의 장시간 밸런스와 자연 캠페인 재수집은 추가 플레이테스트가 필요하다.
- 엔딩 UI 테스트는 최종 선택 화면에 상태 fixture를 주입해 8개 결과를 확인한다. 전체 캠페인을 처음부터 진행하는 자연 경로 playthrough는 아직 하지 않았다.
- 삭제된 예전 아트 11개는 이번 작업에서 복구하거나 커밋하지 않았다. v74 Git 커밋과 ZIP에는 Git 기준 원본이 보존돼 있다.

## Latest continuation status

### v79 incident registry expansion — 2026-11-23

- Expanded the actual incident registry from 13 to 40 (27 new state-gated events); all new incidents have three concrete responses and apply their stated costs/effects to persisted state.
- Added automated checks for 27 eligibility gates, all 81 response paths, event-history recording, and missing-pending-event immutability. Existing six event illustrations are reused by category; bespoke art for each event is still outstanding.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, and `npm run build:qa` pass after the expansion. Production Chrome browser suite: 37/37 passed.
- Natural new-save playtesting of event frequencies and resource balance remains outstanding.
- `npm run balance:strategy`: four fixed-seed origin starts completed 12 day transitions without resource underflow or a transition lock. The policy is management-only; the new-game expedition-to-ending path is not simulated by this probe.
- M-00: generated a transparent RGBA 1254×1254 pixel-art sprite using the in-session image generator; compared it visually to existing animal art. It uses canonical `m00_normal.png`; the replaced image was preserved at `assets/archive/m00_normal_pre_pixel.png`. `test:v75` checks PNG header, dimensions, alpha and runtime resolution.
- `test:v71` now checks a one-time −30 mental-state shock to surviving staff on termination. The zero-mind follow-on termination is queued by the existing crew-risk flow.
- The earlier code-drawn M-00 experiment was visually rejected and removed; it is not used or counted as a deliverable.
- The first full browser run had one transient 404 while the production server was starting. The opening test passed alone, then the complete production suite passed **37/37** after a clean build.
- A bespoke 1672×941 Seed of the Ark ending image is active; `test:v75` checks its PNG signature and cinematic dimensions while the remaining ending assets retain their SVG-specific checks.
- `docs/asset-audit-v80.json`: 206 raster files, 47 animal files, 11 exact duplicate groups, 117 dHash review pairs. No assets were deleted based on this heuristic report.

- Four new species-specific mutant sprites are connected through `src/lib/animal-art.ts`; 26 active variants and their transparent square PNG format are checked in `npm run test:v73`.
- The field map now suppresses visible cell seams, uses persistent clearings and evidence, and places a moving flashlight pool on the last inspected location.
- ARK RECALL presents 13 species-specific input instruments and is covered by a 390px interaction test.
- Full logic regression, typecheck, lint, QA production build, and browser suite passed after the sprite route update (see final verification below).
- New art generation inputs and per-file notes: `docs/generated-assets-v75.json` and `docs/ART_REWORK_v75.md`.

## Final verification — 2026-11-23

`npm run typecheck`, `npm run lint`, `npm run test:all`, `npm run build:qa`, and the production Chrome browser suite all passed after the v75 animal art was connected. Browser suite: 32/32. The actual roster loaded `axolotl_mutant_v75.png`; every v75 animal route is checked for square RGBA PNG format. Existing build warnings are the six pre-existing Hook dependency warnings and CSS autoprefixer compatibility warnings.

## v75 ending and incident art (2026-11-23)

- Generated and connected 19 unique 1536×1024 ending illustrations and six incident scenes. Every one of the 13 registered incident types resolves to an illustrated scene.
- The ending record screen animates the selected illustration; daily incident dialogs show their contextual scene above the description and response options.
- New sources and per-file design notes: `docs/generated-assets-v75-endings-events.json`; the visual map is `docs/ENDING_EVENT_ART_v75.md`.
- `npm run test:v75`: passed (19 unique ending files and 13 event mappings). `npm run test:all`, `npm run typecheck`, `npm run lint`, and `npm run build:qa`: passed.
- Production Chrome run: 34/34 passed after correcting two test fixtures whose onboarding briefings intercepted their intended controls. The 19-ending asset test and mobile incident-art test both passed.

## v74.8 local type and portrait frame

- Removed the remote Google Fonts import. All screens now use the bundled OFL-licensed Pretendard body font and NeoDunggeunmo terminal display font, so typography works offline and keeps the squared dystopian interface style.
- Story portrait images use `object-fit: contain` to preserve the full head/face frame instead of cropping at the dialogue card edges.
- Added a production browser regression asserting both local fonts load, no Google font request is made, the protagonist image loads, and dialogue portraits preserve their frame.
- Final verification: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run build:qa`, and full production browser suite 36/36 pass. Existing Autoprefixer and React Hook dependency warnings remain.
- Fresh natural multi-day campaign balance is still not verified end to end. Tutorial-to-first-rescue, field combat, 13 Recall interactions, and all eight ending UI records are covered by automated scenarios.

## 2026-11-23 species canon and art continuation

- Synced the final six species identities across the roster, three-stage ARK RECALL prompts, tracking hints, and field behavior. Lynx benefits from quiet sonar approaches; Axolotl leaves regeneration evidence and reacts to water settings; Moth reacts differently to dim and bright light; Mutant produces false contamination traces; Chimera cycles between memory-driven responses; Specter separates the CCTV afterimage from the live acoustic zone.
- Added explicit field controls and evidence labels for water quality/temperature, moth light strength, regeneration traces, contamination decoys, and Specter camera echoes. Existing save fields are optional; old saved hunts keep their previous state.
- Replaced the canonical mutant sprites for Lynx, Moth, Special Mutant and Specter, and kept the prior versioned/source images on disk. Updated canonical `animalSprite()` resolution never requests `_vNN` filenames.
- Created a new Wolf staff-termination cinematic matching the Rabbit/Fox/Deer set: black-haired woman, exhausted security guard, transformed arm holding the failing door, and an injured rabbit protected in a carrier. The staff UI now resolves the common `scene.webp` path.
- Verification: `npm run test:all` passed including 780 seeded hunts and new six-species evidence/identity tests; `npm run typecheck`, `npm run lint`, and `npm run check:assets` passed. QA production build succeeded after the sandbox initially rejected process spawning (`spawn EPERM`) and was rerun with elevated process permission. Browser suite remains to be rerun after the final Wolf art update. Natural full-campaign balance remains unverified.

## v76 false-lead reveal

- Updated the M-00 trace: the player first sees a dangerous mutant silhouette suspected as the origin, then follows contradictory footprints and discovers the normal black cat.
- The CCTV scene uses the attached creature reference; capture and marker text distinguish M-00's identity from the cause of the pathogen leak.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, and `npm run build:qa`: pass.
- Production Chrome browser suite: 35/35 pass, including the complete three-camera false lead and reveal.

## v76 ending cast correction

- All 19 ending routes now resolve to human-only v76 scenes showing staff and/or EVE; the prior v75 ending files were preserved.
- Six unique generated scenes are available, and the 19 route-specific filenames currently reuse those six scenes. The other 13 unique ending illustrations are unfinished.
- Additional image generation failed with `401 token_revoked`; do not treat all 19 unique ending scenes as complete. See [ENDING_ART_v76.md](docs/ENDING_ART_v76.md).
- Updated the automated checks to validate all 19 v76 routes and browser loads. Final checks are pending for this update.

## v77 ending character audit

- Replaced the active ending image map with 19 individual SVG compositions that reference only the canonical protagonist/EVE portraits. This prevents unrelated generated faces, animals, or mutants from appearing in ending frames.
- These are distinct portrait compositions with route palettes and archive geometry, not bespoke high quality painted scenes. Their poses remain the portraits' existing neutral poses; the requested per-ending acting and cinematic story art remain incomplete.
- Added `scripts/generate-ending-cards.cjs` and changed `test:v75` to check all 19 SVG routes and allowed portrait sources. The automated route tests also pass.
- Follow-up production verification succeeded after subprocess execution was approved: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, `npm run build:qa`, and `ARK_PRODUCTION_TEST=1 npm run test:browser` passed; browser suite 36/36. Build retains six existing React Hook dependency warnings.

## v78 continuation verification — 2026-11-23

- Read the newly supplied Ultimate Master prompt as a development specification. Its character, story, gameplay, save-compatibility and cast constraints are documented in `STORY_AUDIT.md`, `BALANCE_REPORT.md`, and `ART_AUDIT.md`.
- Preserved the six historical v73/v74 animal/Wolf files in the project from the existing v74.7 full-source archive. The active animal resolver continues to use canonical species/state filenames.
- Corrected two stale Playwright assumptions: the night circuit test now derives terminal order from the displayed current-day voltages and checks all four terminals; the staff conversation test matches its accessible name including the cost description.
- `npm run test:all`: pass, including saved progression, combat, 780 seeded hunts, 13 recall protocols and eight ending outcomes.
- `npm run typecheck`, `npm run lint`, `npm run check:assets`: pass.
- `npm run build:qa`: production build passed after process-spawn approval earlier in this continuation; it still emits the existing Autoprefixer compatibility and six React Hook dependency warnings.
- Production Chrome browser suite: **37/37 passed** after fixes. Covers tutorial rescue, capture budget, persistent field discovery, night low-power warning, staff portrait dialogue, mobile/desktop layout, ARK RECALL, eight ending UI outcomes, all 19 ending asset routes, M-00 reveal and local fonts.
- The ending assets remain portrait-based SVG compositions, not the requested bespoke per-ending cinematic scenes. Natural fresh-save campaign balance, the 40-event target and complete narrative state/cast playthrough remain unverified. See `STORY_AUDIT.md`, `BALANCE_REPORT.md`, and `ART_AUDIT.md`.
- A separate fixed-seed no-operation probe (`npm run balance:soak`) completes ten neglected day transitions and reaches DAY 11 still playable with power/facility 0, threat 100, infection 98 and morale 35. It asserts no hard-coded DAY 10 game-over; strategic-vs-idle natural play remains untested.
