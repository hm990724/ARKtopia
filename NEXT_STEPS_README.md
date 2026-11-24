# ARKtopia / ORIGIN ZERO — 이어서 작업할 내용

## 2026-11-23 이미지 생성 및 늑대 변이 장면

- 이 세션에서 Codex 내장 `image_gen`이 실제 호출 가능함을 확인했다. 별도 API 키/CLI를 사용하지 않았다.
- 늑대 보안관의 정신 붕괴·인간에서 늑대 변이로 이어지는 16:9 시네마틱을 실제 생성하고 `public/assets/cinematics/staff-terminations/wolf/wolf_identity_collapse.png`에 저장했다. `CrewCollapseScene`는 늑대의 신경 신호 소실 분기에서만 이 그림을 표시한다. 이전 늑대 도착/퇴장 그림은 보존했다.
- 늑대의 마지막 음성은 사람 말과 늑대 울음이 섞이는 내용으로 조정해 장면과 맞췄다.
- 방주의 씨앗 엔딩의 주인공/EVE 작별 시네마틱을 기존 초상·배경을 참조해 제작했다. `ending_seed_ark_finale.png`로 별도 보존하고 해당 엔딩 경로에 연결했다. 엔딩 대사 영역의 중복 주인공 초상을 제거했다. 주인공은 젊은 외형, EVE는 은백색 머리와 청색 홀로그램 외형을 유지한다.
- 제000번 우리 결말에도 같은 젊은 관리자와 EVE가 나오는 정체성 선택 컷 `ending_subject_000_choice.png`를 별도로 추가·연결했다. 기존 무인 배경 원화는 보존했다.
- 마지막 신호 엔딩은 폭풍 속 송신 장면 `ending_last_signal_finale.png`를 별도 생성해 연결했다. 주인공과 EVE는 기준 초상과 대조했고, 응답자·구조 인물처럼 설정에 없는 캐릭터는 넣지 않았다. 이전 장소 배경 `ending_last_signal_cinematic.png`는 다른 참조용으로 보존했다.
- 이미지 우선 배치로 `ending_eternal_experiment_finale.png`, `ending_eden_finale.png`, `ending_last_zoo_finale.png`, `ending_silent_automation_finale.png`, `ending_scattered_names_finale.png`를 만들거나 연결했다. 모두 기준 캐릭터 외형을 맞췄고, 미확인 인물이나 저장 상태가 불명확한 생존 동물을 고정 장면에 넣지 않았다. 기존 배경 원화는 보존했다.
- 직원 로스터와 상세 정보는 기존 기본 초상으로 고정하고, 대화 중에만 각 직원에게 이미 존재하는 `unstable`·`critical` 초상을 사용한다. 의무관·보급관·보안관·서기관 모두 기존 표정 자산을 재사용하며 새 중복 초상은 만들지 않았다.
- 늑대 장면은 실제 게임 모달에 새 경로가 표시되는지 브라우저로 검증했다. `npm run test:all`, `typecheck`, `lint`, `check:assets`, `npm run build`, `npm run build:qa`가 통과했다. `.next-qa` 최신 빌드 기준 프로덕션 브라우저 회귀는 43/43 통과했다.
- 메인 ORIGIN ZERO 엔딩 8종은 각각 고유한 인물 시네마틱 CG 파일로 연결했다. E4는 세이브에 실제로 살아 있고 보호 경로인 동물/M-00만 장면의 서식지 영역에 개별 오버레이하도록 연결했다. E7의 직원 생존·사망 상태별 기록 연출은 추가 구현이 필요하다.
- **미완료:** 11개 파생 엔딩/후일담 경로와 스토리 CG에 인물 연기를 반영하는 작업, 전체 13종 동물의 그림체·설정 대조 및 41개 사건별 작화 점검은 계속 필요하다. 조건별 캐스트 연출 완료로 간주하지 않는다.
- 이후 이미지 정리 기준: `staff-terminations`는 그대로 보존한다. 그 밖의 엔딩·이벤트·스토리 시네마틱은 새 CG로 연결해 화면에서 확인한 뒤 미사용 구버전을 정리한다. 승인 원본과 고유한 증거 이미지는 참조 관계를 확인하기 전 삭제하지 않는다.

## 2026-11-23 메인·파생 엔딩 작화 제작

- 현재 연결된 내장 `image_gen`으로 ORIGIN ZERO 메인 엔딩 8개와 기존 파생 엔딩 11개에 고유한 고해상도 배경 PNG를 각각 제작했다. 새 아트 경로는 `ending_*_cinematic.png`이며, 기존 SVG, WEBP와 버전 파일은 삭제하거나 덮어쓰지 않았다.
- 엔딩 배경은 인물 없는 장소/소품 장면으로 구성했다. 세이브별 생존 직원·동물 명단은 게임 UI에서 실제 상태로 표시되어 정적 그림에 죽거나 미합류한 인물을 넣지 않는다. 주인공/EVE를 포함한 인물 시네마틱은 별도 작업으로 남아 있다.
- `src/lib/ending-art.ts`와 `docs/ENDING_MATRIX.md`의 19개 라우트 연결을 새 배경으로 갱신했다. `scripts/test-ending-matrix.cjs`와 `scripts/test-v75.cjs`는 PNG signature, 해상도, 라우트 고유성을 검사한다.
- 이미지 자체는 1536×1024 이상 PNG로 생성됐으며, 사용자 제공 늑대/토끼 퇴장 장면의 적색·장미색 조명과 짙은 자주색 그림자를 스타일 참조로 사용했다. 기존 개체/직원 고해상도 원화는 보존했다.
- 이 작업 뒤 전체 이미지 19개 엔딩 시각 검수, 스토리 씬의 인물 컷, 동물 고유 Mutant 교체 여부를 계속 진행한다.

기준일: 2026-11-23
프로젝트: `C:\Users\lookm\Documents\GitHub\ARKtopia`

## 최신 세션 업데이트 — 2026-11-23

- 사용자가 제공한 `ARKtopia_ORIGIN_ZERO_모든프롬프트_최종통합_2026-11-23.txt`를 읽고, 이 문서의 지시대로 안전한 이미지 감사와 엔딩 경로 검증을 진행했다.
- 엔딩 조건/활성 파일/허용 인물의 코드 대조표는 [`docs/ENDING_MATRIX.md`](docs/ENDING_MATRIX.md)에 작성했다. 이 표는 자연 새 저장으로 각 분기를 직접 플레이한 검증을 대체하지 않는다.
- 전체 에셋 비교 자료는 [`docs/ART_AUDIT.md`](docs/ART_AUDIT.md) 및 `docs/art-review/`에 있다. 206개 래스터 파일에서 정확 중복 11그룹, 유사 후보 117쌍을 기록했다. 엔딩 SVG 19개에 들어 있는 그림 26개는 SHA-256상 관리자 초상/EVE 초상 두 종류만 반복한다.
- 초안의 “19개 독립 장면”은 파일 경로가 서로 다르다는 뜻일 뿐, 고유 엔딩 그림이라는 뜻은 아니다. 실제로 엔딩별 고퀄 장면·상태별 캐스트 그림은 미완료다.
- 현재 세션에서 `image_gen` 호출 도구는 없었고 승인된 Codex CLI 시험도 “Image generation is unavailable in this session”으로 종료됐다. 테스트 PNG는 만들어지지 않았으며, 임시 그림을 최종물로 대체하지 않았다.
- 실행 검증: `npm run test:v75`, `npm run test:v81`, `npm run check:assets`, `npm run build`, `npm run test:browser` 통과. 브라우저 41/41. 프로덕션 빌드는 기존 Hook dependency 경고를 출력했고 Autoprefixer 경고는 없었다.
- Git 커밋: `d2ab8f1` (`Audit ending routes and artwork duplicates`). 이 파일의 이번 업데이트는 다음 검증 커밋에서 기록한다.

## v82 ending continuity and art audit — 2026-11-23

- The game keeps eight main ORIGIN ZERO endings plus older state-specific endings. Nineteen ending titles now point to nineteen distinct existing route compositions; prior saved-title aliases remain mapped. The eight original handoff WebPs and every earlier ending asset were restored and preserved after the user clarified not to remove the older set.
- `npm run test:v75` checks all 19 unique active route compositions and the eight preserved original WebPs. The old `_v75.png` and `_v76.png` sets remain archive-only because their content does not satisfy the ending cast/scene rules.
- **Still incomplete:** all 19 endings need bespoke red/pink painterly scenes in the user's reference style, and those scenes need cast checks against each save's living/recruited roster. Current all 19 active endings now use distinct cinematic background art; save-specific living cast portraits are drawn separately in the ending UI. No native image generation tool is connected; Codex CLI confirmed it cannot generate in this session.
- The ending record UI now lists portraits for living recruited staff and living in-facility animals only. Protected M-00 uses the existing pixel-art cat file; sent-away M-00 is not listed as sheltered. Browser fixture coverage checks the living-animal count and protected-cat art path.
- `scripts/test-ending-matrix.cjs` exercises 8 ORIGIN ZERO outcomes plus 11 legacy/state-specific outcomes against actual route logic and distinct existing scene files. It is wired into `npm run test:all`; `npm run test:all`, typecheck, lint, asset check, targeted ending browser tests, and production build passed. The latest build still emits six existing React Hook dependency warnings; no Autoprefixer warning.
- `npm run balance:campaign` now runs three seeded sorties, capture attempts, care, decontamination, supply purchases and night settlements across all four origins. All reach DAY 13 with at least one animal and without total facility/power collapse; this skips tutorial/HQ/staff progression and is not a human or novice campaign playtest. Metrics are in [`BALANCE_REPORT.md`](BALANCE_REPORT.md).
- **Still incomplete:** bespoke ending/story cinematic images, natural fresh-save campaign and novice playtesting, and deployment. The image generator is unavailable in this session; no substitute art was promoted.
- Commits: `e7d5498` (ending route matrix), `405398a` (survivor cast UI and browser coverage).

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
- **미완료:** 정상적인 신규 저장을 시작해 여러 날 동안 탐사·포획·기지 강화·직원 관리까지 이어가는 자연 캠페인 밸런스 검증, 직접 플레이 접근성 검토, 19개 임시 엔딩 구도를 고유 고품질 시네마틱으로 교체, 13종의 최종 그림을 기존 픽셀 아트와 전부 나란히 미술 검수, 실제 호스팅 배포.
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

## 2026-11-23 ??? ??? ??

- 39? ?? ??? ??? ?? ??? ?? ????? ??? ?? ??? ??? ????. ?? ??, ???, ??/?? ?????, ?? ??? ??? ????.
- ?? 19?? ?? ??? `ending_*_cinematic.png`? ????. ?? ??? ?? WebP 8?? ????, ???? ?? v75/v76 PNG? v77 SVG ???? ????.
- ?? ??? ??? `rabbit_uncanny.png`, `lynx_mutant.png`?? ???? ???? ????. ??? ???? ???? ?? 5? ? ???? ?? ??? ??? 22?? ????. ? ??? ?? ?? ??? ????.
- ?? ?? ??? ??? ?? ??? `public/assets/archive/` ?? ????, ?? ?? ?? ?? ???? ????.
- ?? ??: `docs/ASSET_CLEANUP_2026-11-23.md`, ?? ?: `docs/ENDING_MATRIX.md`.

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
74.1~
74.4 기존 산출물은 별도 이름으로 보존한다.

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
- Historical v78 note: Still incomplete at that point were 40 distinct dynamic incidents (current registry then 13 IDs plus other event types), state-aware cast selection and bespoke action art for endings, final high-detail ending/staff-event illustrations, and a natural full-campaign balance playthrough. The current 19 SVG ending cards are cast-safe portrait compositions, not final cinematic paintings.
- Image generation was not available in the current tool integration; no CLI/API fallback was invoked. Existing art is connected and historical finals preserved, but the missing bespoke scenes remain explicit work.
- Full-project ZIP generated from the verified commit snapshot: `ARKtopia_ORIGIN_ZERO_ULTIMATE_FULL_PROJECT.zip`; SHA-256 is in the adjacent `.sha256` file. The existing v74.x archives were preserved.
- Latest gameplay/source commit: `cfbb1f7` (`Add deterministic ten-day neglect result`). The continuation integration commit is `f647c89`; package documentation was recorded in `d00c216`.

## 2026-11-23 Codex follow-up · active gameplay pass

- Scope follows the latest user request: finish real-time field threat and two-person crew first, then continue the remaining gameplay systems in the integrated requirements. Do not modify image files, image generation, ending artwork, or cinematic artwork.
- Implemented in source (not yet final-regression-verified): field threat advances on a 1.4s persisted state tick while the expedition map is open; loud field state raises alert faster; close/high-alert threat starts the existing combat flow. A full pressure meter no longer ejects the player: from 75% it causes danger-scaled morale loss and raises base threat while leaving concealment, combat, or retreat available.
- Outing loadout now supports up to two recruited staff; `Run.companions` is persisted, old saves migrate their single `companion` into the list, combat shows both portraits, and support applies each present role's effect. The legacy primary companion field remains for older mechanics/save compatibility.
- Intermediate TypeScript check passed before the most recent changes. One old v76 source assertion failed because it expects the former single-companion portrait expression; that script is stale relative to the new list rendering. A named v80-core script was not present. Do not claim field AI/stealth or the full campaign has passed until the final consolidated verification is completed.
- Still required: finish direct stealth/last-seen search and threat interaction during sound tracking; correct companion role effects and base-duty opportunity cost across all paths; inspect capture species differentiation, survival economy, incidents, research/ARK RECALL and UX against active code; then run one consolidated typecheck/build/logic/browser regression and repair failures. Preserve all pre-existing user edits and image assets.
- Follow-up: field alert reaching 100 no longer triggers automatic extraction. At exposure pressure 75+, the player takes a region-scaled morale hit and the base threat rises, while the sortie remains active so the player can hide, fight, or retreat. The HUD label now describes exposure risk instead of forced encirclement.
- Staff support orders are blocked while a sortie is active, so an away crew member cannot also perform their once-per-day base support duty.
- Latest continuation: the threat simulation now keeps running through the animal hunt, so a noisy sound/search/net action can draw a separate roaming enemy into the capture scene. If it reaches the player, the capture attempt is interrupted and the central combat starts; its state stays in the existing save object.
- Threat visibility now requires line of sight in addition to a revealed tile. The AI follows a visible player or audible noise, then searches its remembered position and returns toward its patrol origin after losing contact. Fast movement and an active expedition flashlight add more field noise; quiet movement reduces it.
- Combat adds functional cover and one-use medkit actions alongside attack, guard, EVE pulse, team support and retreat. Cover reduces the next hit; medkit consumes the already reserved sortie kit and restores suit integrity.
- The repository ignores root `public.zip` so a local project bundle cannot be staged into Git and trigger the GitHub 100 MB push block. The existing archive is preserved locally.
- Still in progress: broader implementation passes for crew interaction/death continuity, incident follow-ups, economy/build progression, research/ARK Recall and gameplay guidance. Consolidated verification remains intentionally deferred until implementation is complete.

## 2026-11-23 consolidated check after gameplay continuation

- `npm run typecheck`, `npm run lint`, `npm run check:assets`, `npm run test:all`, `npm run build:qa`, and `npm run build` passed after the field/crew changes. `test:all` covers logic, v69-v76, v81 and the ending matrix; v76 now exercises saved two-person roster and combined medic/quartermaster combat support. v71's memory dialogue assertion was updated to match the current user's hesitant disclosure and mood expression.
- Production browser suite could not be observed: both full `ARK_PRODUCTION_TEST=1 npm run test:browser` and targeted `browser-v80.spec.cjs` emitted only the Playwright webserver `NO_COLOR` warning, produced no test output for over a minute, and were interrupted. This is unresolved environment/test-runner behavior; do not count browser integration as passed.
- The AI/crew core changes are in source, but not every requested gameplay gap has been completed. Remaining work includes a direct browser scenario for idle threat motion and hiding, broader daytime economy/building/equipment progression review, staff relationship and incident follow-up checks, and UI/tutorial/mobile pass. Preserve the current user's edits and all art files while continuing.
- Resumed after the user clarified that all five gameplay areas remain in scope. Extracted roaming-threat advancement into `advanceFieldThreat` so patrol/search steps can be exercised as actual serializable game state; pathfinding now routes around blocking walls instead of getting stuck at a local Manhattan minimum. Added a regression that advances without player input, follows sound around an obstacle, then loses sight and searches the saved last-seen location.
- Extended incidents now increase a related incident's weight for three days after selected consequential options: a risky specimen sample can trigger a filter-clog follow-up, preserving repeated CCTV footage can lead to a blindspot event, deleting records can cause research corruption, and stronger patrol orders can lead to a later return-track event.

## 2026-11-23 account handoff · gameplay pass paused at user request

- The user explicitly asked to stop this account's work and continue under another account. Do not resume unless asked in that account.
- Additional implementation in this pass: added the 41st state-gated incident for tracking pressure >=95; its three choices materially alter threat, facility, clues, and knowledge. Reused the existing containment incident illustration; no image or cinematic asset was edited.
- Tracking network relay now has levels 1–5; levels 4–5 reduce roaming enemy alert gain and level 5 reduces its detection radius. Battery and clinic remain capped at level 3. Progress UI and a regression cover the level cap/effect.
- Removed stale field UI claims that 100% tracking automatically extracts the player. At 75% it damages morale; 100% remains playable and dangerous. Regression verifies the run persists at maximum pressure.
- Two-person sortie persistence/migration, combined role support, idle roaming enemy movement, sound pursuit around walls, last-seen search, and event follow-ups have focused logic regressions. Typecheck, v75 and v76 scripts passed before the last unintegrated concealment helper was started.
- Concealment was completed after resuming: the player can hide beside an obstacle, zero movement noise, and let the live AI search the last seen position. It is wired to the expedition UI and covered by the focused v76 logic regression.
- **Not completed:** full audit/fixes across all five gameplay areas, integrated browser validation, complete final consolidated verification, and a final distinction of implemented/verified/incomplete features.
- The root `public.zip` is 336,839,539 bytes and is ignored by `/public.zip` in `.gitignore`; it remains local and is not tracked. Keep it out of Git commits; `public.zip` alone is above GitHub's per-file limit.
- Resumed continuation: obstacle-hide action is now wired from the expedition UI through `concealInField`; movement sets concealment, noise is cleared, the live AI still ticks and searches last seen. Tracking network is five levels in both UI and simulation. Added regression coverage for hide/reveal, adjacent cover, live AI, critical tracking incident, and all five upgrade purchases.
- Consolidated verification after these changes: `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run check:assets`, `npm run build:qa`, and four seeded DAY 13 campaign simulations pass. Production browser regression ran 45 tests: 44 passed, 1 failed due to an outdated test expectation in pre-existing `tests/browser-v74.spec.cjs` (it selects the “ARK SEED” branch but expects the “Last Zoo” ending artwork). Runtime currently correctly selects the branch-dependent `ending_spring_outside_records_cinematic.png`. Do not alter ending art or route to satisfy that stale fixture; update the fixture only in a future authorized test-maintenance pass.
- Browser v80/v81 outing, combat, extraction, night dispatch, ARK RECALL species controls, responsive sizes, and all other browser cases passed. Natural long-term player balance and human novice testing are not certified.
- Follow-up browser verification caught the hide button placed in the animal-hunt panel, where it was suppressed. Moved it to the normal field-survey controls; rebuilt QA and the focused production browser scenario now passes: hide button visible beside cover, threat keeps moving/searching while hidden, no combat interception.
- Additional progression pass: the saved facility upgrade tree now includes three-level capture-net tensioner, protective suit reinforcement and EVE scanner lens. Each sortie snapshots these levels; net adds hunt actions, suit reduces incoming combat damage, scanner lens extends scanner-equipped sight. Battery, clinic and five-level tracking remain separate. A focused logic regression covers purchase caps, sortie snapshots and suit combat effect; final suite is deferred until this implementation pass ends.
- Enemy detection now also accounts for an active, charged expedition flashlight: its beam increases line-of-sight detection distance and alert gain. The real-time tick passes actual sortie light/battery state into the AI; light-free or depleted-lamp runs do not apply that visibility penalty.

## Resource upkeep continuation · 2026-11-23

- Generator fuel and purifier filters are now explicit night costs. Each settlement spends one of each when available; fuel shortage drains additional power, damages facility stability and raises external threat, while filter shortage accelerates infection and incident risk.
- The forecast applies the same fuel/filter availability rules as the committed night transition and shows stock before and after settlement. Fuel can be restocked in the supply room; older saves receive a small migrated reserve.
- Root `public.zip` remains a local, ignored bundle, not a tracked source artifact. `npm run check:git-size` flags tracked files at GitHub's 100 MiB per-file limit.
- Implementation is in progress; focused regressions and final integrated checks are pending until the remaining implementation pass is done.
