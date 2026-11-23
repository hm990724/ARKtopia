# 자산 감사

## 현재 세션 이미지 도구 확인 — 2026-11-23

- `imagegen` 스킬 파일은 `C:\Users\lookm\.codex\skills\.system\imagegen\SKILL.md`에서 확인했다.
- 이번 실행의 실제 도구 목록에는 호출 가능한 `image_gen` 도구가 없다. 스킬 설치와 생성 도구 연결은 별개이므로 신규 원화는 생성하지 않았다.
- 기존 M-00, Mutant, staff-loss 및 ending 에셋을 임시 도형·SVG·코드 그림으로 덮어쓰지 않는다. 최종 고품질 삽화가 더 필요한 항목은 계속 미완료로 남긴다.

파일별 생성프롬프트/원본: docs/generated-assets-v71.json 및 IMAGE_PROMPTS.md.
전체96장 크기/알파/SHA256/dHash: docs/asset-audit-v71.json. 완전중복0으로 임의삭제하지 않음.
추가/복구44PNG: 동물10+M00복구, 사진11+08복구, 필드3, 초상7, 컷신7, 배경3+연구소수정1.
43개연결, bg_origin_lab.png 첫후보는 불필요한 인물로 미사용보존. bg_origin_lab_v2.png가 실제배경.
기존8엔딩/직원/배경/7종동물 원본 보존. 컷신6개는 복원기록 영상이며 자동전체화면 애니는 아님. 작별은 방주의씨앗전용.
출력은 실제생성해상도 보존. 명세크기와 항상같지 않으며 일괄손실압축하지 않음.
specter_uncanny.png, specter_mutant.png는 실제종정의가 없어 미생성. 종정의후 제작할 것.
2026-11-22 추가요청에 따라 v72 원본색감/걷기/표정/현재시점컷신 수정중. v71이미지가 새기준까지 모두통과한 뜻은 아님.

## v73 원본 보존·보정
주인공4장과 변이체5장은 내장 imagegen으로 실제 제작. 주인공 게임 출력본4장은768×1024이며 생성 고해상도4장도 보존. 모든 경로와 프롬프트는 docs/generated-assets-v73.json.
현재 전체130래스터/동물30장 모두alpha/완전중복0. 유사도87쌍은 같은 캐릭터 표정·이전본·규격 출력본을 포함하므로 삭제하지 않음. docs/asset-audit-v73.json.
현재 원본삭제0, v73신규13파일 중9실사용/4고해상도보존. 아직 없는 specter2장은 구현 종 정의가 없으므로 누락 유지.

## v74 활성 경로 및 보존 상태

- `src/lib/animal-art.ts`가 현재 활성 이미지 26개를 버전 독립 경로로 해석한다. `npm run test:v73`은 26개 PNG 경로를 전부 검사한다.
- M-00은 `m00_normal_v74.png`를 사용한다. v74/기존 동물·캐릭터 아트는 기존 파일을 덮어쓰지 않고 버전 파일로 추가했다. 생성 입력·프롬프트 기록은 `docs/generated-assets-v74.json`.
- 이번 작업 중 작업 디렉터리에서 기존 아홀로틀/키메라/스라소니/나방 파일과 늑대 컷신의 삭제 상태가 발견됐다. 작업 디렉터리 상태를 무단 복원하지 않았다. 기본 Git HEAD에는 종전 파일이 남아 있어 archive/clone으로 복구 가능하다.
- 새 아홀로틀/키메라/스라소니/나방 변이 그림은 현재 v74 경로 연결까지 됐지만 사용자 기준의 토끼·여우처럼 역할이 담긴 기괴한 유기 변이인지 승인을 받지 못했다. 재작업해야 할 파일은 `docs/ART_REWORK_v75.md`에 개별 지정했다.
- 두 기준은 다르다: 파일 존재/경로/PNG 형식은 QA 통과, 네 변이의 디자인 승인과 개체 서사 적합성은 미완료다.

## v75 mutant sprite audit (2026-11-23)

Generated and integrated four role-driven pixel-art mutant states: axolotl (regeneration/memory), lynx (tufts, bobtail, fractured shadow), moth (wing pattern/afterimage), and chimera (one asymmetric feather-scaled body). Files are new `*_mutant_v75.png` assets; square 1254px RGBA. Active routes point to v75. Generation sources and design summaries: `docs/generated-assets-v75.json`. No deleted user assets were restored or overwritten. Visual approval remains separate from format and route QA.

## v75 ending and event art

- Every registered ending has a unique rose-and-mauve cinematic illustration. Daily event dialogs display contextual artwork for the 13 incident types.
- Image mapping and per-file source records: `docs/ENDING_EVENT_ART_v75.md` and `docs/generated-assets-v75-endings-events.json`.
- Local asset checks, all logic tests, typecheck, lint, production build, and all 34 production browser tests pass. Two test fixtures were corrected to mark unrelated onboarding briefings as seen.

## v76 M-00 false origin reveal (2026-11-23)

- The user's supplied grotesque mutant reference now appears as a distant CCTV silhouette in `public/assets/events/m00_suspected_origin_v75.png`; the reveal identifies it as the same cat's shadow stretched by emergency light and broken video, not a separate specimen.
- Three evidence choices undermine the dangerous silhouette theory; a low camera reveals the normal black cat as M-00. The code explicitly says its biological marker is identity evidence and does not make the cat responsible for the leak.
- `npm run test:all`, `npm run typecheck`, `npm run lint`, `npm run build:qa`, and the full 35/35 Chrome browser suite pass. See `docs/STORY_REVEAL_FALSE_ORIGIN_v76.md`.

## v78 canonical art routes and preserved source versions (2026-11-23)

- Animal rendering resolves canonical species/state files such as `rabbit_uncanny.png`, `lynx_mutant.png`, and `m00_normal.png`. No animal runtime route depends on a `_vNN` filename; historical versions remain available as source/reference files.
- The current canonical M-00 sprite is pixel art with the right-ear nick and single white chest marking. The newly connected Axolotl, Lynx, Moth, Mutant, Chimera, and Specter sprites have their corresponding species-specific routes. Their paths and transparent PNG shape are covered by `npm run test:all`.
- Restored six historical v73/v74 sprite/cinematic files from the existing full-project archive so the working tree no longer drops those art files. They are preserved, inactive references; canonical paths remain the runtime source.
- The current Wolf termination scene is `public/assets/cinematics/staff-terminations/wolf/scene.webp`; the restored `scene_v74.png` remains a historical copy. A visual check confirms a black-haired female guard protecting an injured rabbit in the red emergency-lit scene.
- Ending route map currently serves 19 distinct human-only SVG compositions based on the canonical protagonist/EVE portrait assets. They prevent unrelated creature art from appearing, but are portrait-based layouts rather than bespoke, high-detail per-ending cinematic illustrations. Route-specific acting and ending paintings remain missing.
- The built-in image-generation integration was not available during this pass. No missing cinematic is represented as a newly generated high-detail raster asset.
