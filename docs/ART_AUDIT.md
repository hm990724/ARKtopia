# ARKtopia asset audit

검수일: 2026-11-23
검수 범위: `public/assets`의 PNG/JPEG/WebP/GIF 및 `src`·`public` 정적 코드 참조

## 생성 도구 확인

- `imagegen` 스킬 파일: 존재 (`C:\Users\lookm\.codex\skills\.system\imagegen\SKILL.md`). 스킬은 사용 지침이며 생성 엔진 연결 여부와 별개입니다.
- 이 세션의 호출 가능한 도구 목록: native `image_gen` 없음.
- Codex feature flag 목록의 `image_generation stable true`: 기능 플래그만 표시하며 이 세션에서 이미지 생성을 보장하지 않습니다.
- 로그인 세션을 이용한 실제 CLI 생성 시험: “Image generation is unavailable in this session. I created no substitute and did not modify any files.” 결과. 테스트 PNG는 생성되지 않았습니다.
- 별도 API 키/유료 API 호출은 하지 않았습니다. Pillow/SVG/Canvas로 캐릭터를 대체 제작하지 않았습니다.

## 산출물

- 전체 비교 HTML: [`art-review/asset-review.html`](art-review/asset-review.html)
- 필터/정렬 가능한 스프레드시트 CSV: [`art-review/asset-review.csv`](art-review/asset-review.csv)
- 기계 판독 보고서: [`art-review/asset-review.json`](art-review/asset-review.json)
- 동물 13종 Uncanny/Mutant 접촉 시트: [`art-review/animal-canonical-contact.png`](art-review/animal-canonical-contact.png)
- 엔딩 SVG 내부 래스터 접촉 시트: [`art-review/ending-v77-embedded-contact.png`](art-review/ending-v77-embedded-contact.png)
- 감사 생성기: [`../scripts/audit-art-master.py`](../scripts/audit-art-master.py)

접촉 시트는 시각 비교 자료이며 게임에서 쓰는 이미지가 아닙니다. 각 썸네일을 누르면 원본 파일로 이동합니다.

## 결과 요약

`public/assets`에서 별도 래스터 이미지 206개를 읽었습니다. 기존 코드·스타일의 정확한 파일명 참조와 가능한 동적 경로 이름을 검색했고, 파일의 SHA-256, 픽셀 크기, 컬러 모드, 알파 범위와 dHash를 기록했습니다. 추가로 19개 v77 엔딩 SVG 안에 base64로 들어 있는 이미지 참조 26개를 풀어서 대조했으며, 단 두 가지 초상 이미지가 반복 사용되는 것을 확인했습니다.

| 분류 | 개수 | 의미 |
|---|---:|---|
| A | 40 | 소스에서 파일명을 직접 참조하는 에셋 |
| B | 29 | 11개 SHA-256 동일 그룹에 속한 파일; 통합 검토 후보 |
| C | 31 | dHash distance ≤ 4의 유사 후보 중 직접 참조가 없는 파일 |
| D | 4 | 시각 검토에서 역할/픽셀 스타일 교체 검토로 지정한 후보 |
| E | 87 | 소스에서 직접 참조나 동적 이름 단서를 찾지 못한 파일 |
| F | 15 | 직접 파일명은 없지만 런타임 경로 조립 가능성이 있는 파일 |

분류는 우선순위형입니다. D는 현재 사용 중인 파일도 포함할 수 있고, B는 같은 바이트라는 사실만 확정합니다. E/F는 정적 검색 결과일 뿐 실제 런타임에서 미사용임을 뜻하지 않습니다. dHash가 비슷하다는 이유만으로 중복·삭제 대상으로 확정하지 않았습니다. 품질·역할 평가는 자동화하지 않았으며 4개 D 후보만 접촉 시트에서 사람이 검토했습니다.

### 엔딩 SVG 내부 그림 중복

- 19개 v77 SVG에는 총 26개의 내부 래스터 참조가 있습니다.
- SHA-256은 두 종류뿐입니다. 관리자 초상 13회와 EVE 초상 13회로, 모두 같은 원본 이미지를 반복합니다.
- SVG별 테두리, 배경 장식, 번호와 문구는 달라도 내부 그림은 엔딩 상황에 맞는 독립 장면이 아닙니다.
- 이 중복은 SVG 파일이 서로 다른 경로라는 사실과 별개로 실제 시네마틱 그림의 재사용입니다. 상태에 따라 필요한 직원/동물/관리자 장면으로 바뀌지 않으며 고퀄 엔딩 시네마틱 요구는 미완료입니다.

### 바이트 동일 그룹

- `animals/axolotl_uncanny.png` = `animals/axolotl_uncanny_v74.png`
- `animals/chimera_uncanny.png` = `animals/chimera_uncanny_v74.png`
- `animals/lynx_uncanny.png` = `animals/lynx_uncanny_v74.png`
- `animals/m00_normal_v74.png` = `archive/m00_normal_pre_pixel.png` (보존 백업일 수 있음)
- `animals/specter_uncanny.png` = `animals/specter_uncanny_v74.png`
- `endings/ending_eden_v76.png`, `ending_scattered_names_v76.png`, `ending_spring_beyond_cage_v76.png`, `ending_spring_outside_records_v76.png` (한 그룹)
- `endings/ending_empty_shiftroom_v76.png`, `ending_final_transmission_v76.png`, `ending_seed_ark_v76.png`, `ending_two_caretakers_v76.png` (한 그룹)
- `endings/ending_eternal_experiment_v76.png`, `ending_incomplete_revival_v76.png`, `ending_subject_000_v76.png` (한 그룹)
- `endings/ending_first_sentence_v76.png`, `ending_humane_restoration_v76.png`
- `endings/ending_last_signal_v76.png`, `ending_quiet_automation_v76.png`, `ending_silent_automation_v76.png`, `ending_successor_v76.png`
- `endings/ending_last_zoo_v76.png`, `ending_late_gate_v76.png`

엔딩 SVG 내부 2개 이미지 반복 그룹과 모든 참조 경로는 JSON 보고서의 `endingSvgEmbeddedImages` 및 `endingSvgEmbeddedExactDuplicates`에 따로 기록됩니다.

특히 v76 엔딩 이미지 그룹은 여러 엔딩 이름에 동일한 바이트를 씁니다. 현재 활성 경로는 v77 SVG들이므로 v76 파일은 역사/백업 자산으로 보존합니다. 관련 코드, 예전 세이브, 재현 절차를 확인하기 전에는 archive 이동/삭제를 하지 않습니다.

### 접촉 시트의 역할 검토 메모

- M-00 정상 고양이는 현행 sprite가 상세한 보라색 명암과 투명 배경을 가진 고양이로 확인됩니다. 종족 스프라이트보다 음영이 부드럽고 회화적으로 보여 픽셀 밀도 통일을 재검토할 후보입니다. 오른쪽 귀 흠집은 접촉 시트만으로 식별이 확정되지 않아 원본 확대 검수가 필요합니다.
- 여우 Mutant는 현재 보이는 십자 표식/토끼 표식이 보급관 설정과 충돌할 수 있어 교체 검토 대상으로 표시했습니다.
- 스라소니 Mutant의 감각 기관/생체 레이더 특성이 작은 미리보기에서는 분명하지 않습니다.
- 까마귀 Mutant의 네 음 선율/공명 구조는 접촉 시트에서 핵심 콘셉트로 바로 읽히지 않습니다.
- 늑대 Mutant는 장비와 방어 역할이 드러나는 형태입니다. 늑대 인간 직원은 별도의 사망 시네마틱 자산으로 관리되므로 동물 mutant sprite와 혼동하지 않았습니다.
- 토끼·사슴·올빼미·수달·아홀로틀·나방·특수 변이체·키메라·스펙터는 접촉 시트에서 대략 각자의 의료/아카이브/수열/기계/재생/광반응/동기화 실패/비대칭 기억/백색 잔향 모티프를 식별할 수 있습니다. 세부 품질 판정은 원본 크기에서 진행해야 합니다.

## 변경 및 안전 상태

- 모든 기존 이미지 경로와 원본 파일을 그대로 두었습니다.
- 삭제·덮어쓰기·강제 코드 참조 변경 없음.
- 확인된 완전 중복은 모두 리뷰 대상으로만 기록했습니다.
- 고퀄 신규 엔딩·사건 일러스트와 M-00/동물의 교체 에셋은 생성 도구가 비활성이라 미제작입니다. 현재 활성 이미지를 새로 제작한 것처럼 표현하지 않습니다.

## 실행

```powershell
python scripts/audit-art-master.py
```

실행은 `docs/art-review/`의 JSON/CSV/HTML만 다시 씁니다. 프로젝트 에셋에는 쓰지 않습니다.

## 검증

- `python scripts/audit-art-master.py`: 206 래스터 파일, SVG 내 이미지 26개, 내장 이미지 해시 2종 기록.
- `npm run test:v75`: 통과 — 19개 엔딩 경로와 M-00 공개 장면.
- `npm run test:v81`: 통과 — 야간 전력 우선순위.
- `npm run check:assets`: 통과 — 의무관/보급관/보안관/서기관 초상 및 도착 장면, EVE 첫 만남.
- `npm run build`: 통과. Autoprefixer 경고는 보이지 않았고, `FieldMission.tsx`와 `Game.tsx`에 기존 React Hook 의존성 경고가 남았습니다.
- `npm run test:browser`: 41/41 통과 (데스크톱/모바일, 탐사·포획·CCTV·야간·이벤트·8개 메인 엔딩·19개 엔딩 경로).

브라우저 테스트가 `docs/qa-v71`의 과거 캡처를 다시 기록해 Git의 HEAD 바이트로 되돌렸습니다. 코드/게임 에셋은 변경하지 않았습니다.
