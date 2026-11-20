# v69 자산 변경 기록

- 실제 로컬 확인 후 재사용·선별한 PNG: `public/assets/animals/`에 토끼/여우/사슴/올빼미/늑대/수달 6종×2형태=12장. 이전까지의 게임 프로젝트에 포함돼 있던 까마귀 2장은 유지. **현재 개별 동물 스프라이트 14장**.
- 현재 아트 파일은 투명 RGBA PNG이며 ‘Uncanny 장비 금지’ 및 종별 Mutant 독자성 기준에 따라 선별된 후보. 잘림/경계 여백 등은 실화면 검증 필요.
- `unavailable-specimen.svg`는 누락 자산을 다른 동물로 잘못 보여주지 않기 위한 명시적인 플레이스홀더이며 신규 스프라이트 완성본이 아님.
- 본부 직원 초상 12장 / 합류 4장 / 퇴장 4장 / 캐릭터 2장 / EVE 첫 만남 1장 / 배경 7장 / 엔딩 8장 등 기존 비동물 파일은 손대지 않았다.
- 현재 **누락**: 나머지 동물 6종 × 2형태(실제 코드 ID가 무엇인지 추가 재검증), M-00 검은 고양이 실물 1장, Hidden Photo 원본 12장, 스토리 컷신 7장, 캐릭터 초상 7장, 신규 배경 3장. 기존 엔딩 8장도 실제 엔딩 분기 일치 검수 필요.
- **중복/폐기**: 원본 중복작업 PNG·이전 그리드 합본·보급품을 장착한 작곡가 까마귀 등은 프로젝트에 새로 넣지 않았다. 원본 사용자의 바깥 파일을 삭제하지 않았다.
- `docs/REQUIREMENTS_IMAGES.md`에 이미지별 정확한 파일명·제작 조건. 파일이 없으면 완성했다고 보고하지 말 것.

---

# ARKtopia v67 이미지 실사 현황

실제 `public/assets` 폴더를 열어 확인한 결과입니다. 이미지를 새로 만든 것으로 표시하지 않으며, **원본 아트가 없는 곳은 기존 이미지를 임시 UI 시각화로 재사용**합니다.

## 기존 이미지 — 총 50파일

| 구분 | 확보 | 실제 경로 / 비고 |
|---|---:|---|
| 동물 형태 | 12장 | `assets/animals` — 이 작업에서는 **동물 이미지 수정/제작 제외** |
| 직원 초상화 | 12장 | `assets/staff/{rabbit,fox,wolf,deer}/portrait*.webp` — 기본/불안정/위험 각 1장 |
| 직원 합류 컷신 | 4장 | `assets/cinematics/staff-arrivals/*/scene.webp` |
| 직원 퇴장 컷신 | 4장 | `assets/cinematics/staff-terminations/*/scene.webp` |
| 주요 인물 | 2장 | `assets/characters/eve_hologram.webp`, `protagonist_neutral.webp` |
| 이브 첫 만남 컷신 | 1장 | `assets/cinematics/eve-first-meeting/scene.webp` |
| 배경 | 7장 | `assets/backgrounds/{gate,hero-gate,sanctuary,wasteland,laboratory,dawn,hidden-photo}.webp` |
| 엔딩 | 8장 | `assets/endings/*.webp` — 기존 8개, 새 세계관과 연출 호환 재검토 권장 |
| **총계** | **50장** | 기존 파일은 모두 보존 |

> 직원 아트 목표 16장은 **기존 초상 12장+합류 컷신 4장으로 이미 충족**합니다. 퇴장 컷신 4장은 별도 추가 자산입니다.

## 새로 그려야 하는 독립 장면 — 원본 파일 미제작

- **주요 인물 7장**: EVE 오류/진실, 주인공 쇠퇴/최후, 과학자 연구/집착, 어린 딸 생전
- **Hidden Photo 12장**: `public/assets/hidden-photos/photo_01.png` ~ `photo_12.png` (M-00 원본과 가족사진의 외형 일치 중요)
- **스토리 컷신 7장**: `scene_origin_escape.png`, `scene_collapse.png`, `scene_m00_positive.png`, `scene_m00_transfer.png`, `scene_m00_protect.png`, `scene_ark_recall.png`, `scene_farewell.png`
- **고유 배경 3장**: `bg_containment.png`, `bg_headquarters.png`, `bg_origin_lab.png` (기존 정문/보호시설/외곽/일반 연구실은 사용 가능)
- **M-00 동물 단독 스프라이트 1장**: 이번 작업에서 **제외** (사용자 지시에 따라 동물 일러스트 제작하지 않음)

신규 이미지 원본 총 **29장**이 남아 있습니다(동물 스프라이트 제외). 기존 이미지 중 인물이 다른 장면에 나오는 그림은 *재사용*할 수 있지만, 새 사진이라고 착각하게 만들어서는 안 됩니다.

## 현재 UI 처리

- `OriginZeroPanel.tsx`는 12개 사진의 기록 카드에 **기존 배경·인물 이미지를 보조 시각화로 표시**합니다. 원본 사진의 재현이 아닙니다.
- 검사 결과 `ORIGIN SIGNATURE POSITIVE`는 코드 텍스트 UI로 표시됩니다.
- M-00 실물 도트 이미지가 없어 포획 전후 화면은 기존의 고양이 기호 UI를 사용합니다.
- 직원 기본/불안정/위험 프로필은 이미 전부 연결되어 있고, v67에서 모달로 표시합니다.

신규 미술 제작 후에는 UI 경로를 실제 파일 경로로 교체해야 합니다.
