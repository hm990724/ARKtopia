# ASSET_AUDIT_AND_IMAGE_REQUESTS — 기존 이미지 검토와 추가 요청

## 이번 답변의 실제 검증 범위 / 주의
1. 현재 대화 작업 공간 `/mnt/data`에 있는 PNG 45개를 파일 단위로 열람하고 크기·알파·SHA-256을 검사, 미리보기 시트로 시각 확인했다(새로 만든 문서/시트는 제외한 시점 기준). 이것은 현재 사용자의 ARKtopia 저장소 전체가 아니다.
2. 이전 v67 개발 문서에는 그때의 `public/assets` 총 50개(동물 12, 직원 초상 12, 직원 합류 컷신 4, 직원 퇴장 컷신 4, 인물 2, EVE 첫 만남 1, 배경 7, 엔딩 8)가 확보됐다고 기술돼 있다. 그 자료는 과거 조사 기록이지 현재 저장소의 실측치가 아니다.
3. '까마귀 2장 완료'는 사용자 진술이지만 현재 전달 가능한 PNG 세트에 적합한 까마귀 최종본은 확인되지 않았다. Codex는 로컬 저장소에서 직접 체크하고 재생성 필요 여부를 판정한다.
4. 현 사용자 요청은 텍스트 개발 지시서와 이미지 감사/정리 목록이다. 그래픽을 만들 수 없는 Codex 환경에서는 실제 새 이미지를 생성했다고 주장하면 안 된다.

## 13종×2 + M-00 = 동물 목표 27장
정본 목록 (현 저장소 species ID 반드시 검증):
- `rabbit_uncanny.png` + `rabbit_mutant.png`: 기억의 잔재: 소아과 의무관/보호 충동. Uncanny=거의 자연스러운 토끼, 붉은 눈, 장비 없음. Mutant=치유와 보호가 일그러진 의료 생체 변이; 토끼 특유 긴 귀/도약 체형 유지.
- `fox_uncanny.png` + `fox_mutant.png`: 기억의 잔재: 보급관. Uncanny=여우 특유 긴 주둥이/풍성한 꼬리, 장비 없음. Mutant=모자/CCTV 없이 보급 물자를 등에 지는 가벼운 체형; 늑대 경비와 구분.
- `deer_uncanny.png` + `deer_mutant.png`: 기억의 잔재: 기록관/기억 보존. Uncanny=자연스러운 사슴, 패턴만 이상. Mutant=식물·아카이브/우리 구조와 융합, 뿔과 다리 실루엣 유지.
- `owl_uncanny.png` + `owl_mutant.png`: 기억의 잔재: 60대 수학자. Uncanny=기하학적 깃털 무늬, 장비 없음. Mutant=수열·기하학적 공명 구조, 찢어진 날개, 관측 장치가 생체와 융합.
- `wolf_uncanny.png` + `wolf_mutant.png`: 기억의 잔재: 20대 후반 경비대원. Uncanny=자연스러운 경계 자세, 장비 없음. Mutant=보호 본능의 과잉 및 경비 관련 잔재, 여우의 보급 물품과 구별.
- `crow_uncanny.png` + `crow_mutant.png`: 기억의 잔재: 20대 작곡가. Uncanny=은빛 까마귀, 장비 없음. Mutant=깃털/기관이 현, 공명, 악보 패턴처럼 변형. 가방·우편물·보급품 금지.
- `otter_uncanny.png` + `otter_mutant.png`: 기억의 잔재: 기계공학자. Uncanny=낮은 몸통, 짧은 귀, 수염, 물갈퀴와 긴 꼬리, 장비 없음. Mutant=펌프·배관·톱니가 직접 몸에 융합; 커다란 가방 금지.
- `lynx_uncanny.png` + `lynx_mutant.png`: 코드의 정본 설정 확인 후 개체화. Uncanny=스라소니의 귀술/짧은 꼬리. Mutant=기존 7종과 전혀 다른 직업 흔적과 변이 메커니즘.
- `axolotl_uncanny.png` + `axolotl_mutant.png`: 코드 정본 확인. Uncanny=외부 아가미와 수생 형태가 유지된 아홀로틀. Mutant=재생·기억의 이중성에 관련된 독창적 구조.
- `moth_uncanny.png` + `moth_mutant.png`: 코드 정본 확인. Uncanny=날개·더듬이·곤충 다리 유지. Mutant=빛·어둠·기억에 연결된 종별 독창적 공포 구조.
- `mutant_uncanny.png` + `mutant_mutant.png`: 코드의 특수 개체 ID인지 실제 종 개체인지 반드시 확인. 다른 개체의 합성·복사로 만들지 말 것.
- `chimera_uncanny.png` + `chimera_mutant.png`: 코드 정본 확인. 다른 종의 이미지를 붙인 콜라주가 아닌 단일 존재의 독립 실루엣.
- `specter_uncanny.png` + `specter_mutant.png`: 백색 잔향. 코드 정본 확인. 흰색 잔향·기억/정체성의 공백과 연결된 시각적 특성, 단일 개체.
- `m00_normal.png`: **제14번째 별도 고양이 1개**, 검은 고양이, 오른쪽 귀 끝 작은 흠집 + 가슴의 흰 털 한 가닥. 강제 정상 외형, 붉은 눈·돌연변이·환각 장치 금지.

## 현재 제공 파일에서 재사용 후보로 선별해 복사한 12장
`curated_animals/` 폴더에 원본을 복사해 명확한 파일명으로 통일했다. 원래 파일은 삭제하거나 수정하지 않았다. 실제 프로젝트에 넣기 전에 종 식별/여백/가장자리/투명도 확인 필요.
- `rabbit_uncanny.png` ← `rabbit_uncanny(2).png` [이미지 경계에 닿음: 여백 검토]
- `rabbit_mutant.png` ← `rabbit_mutant(3).png` [이미지 경계에 닿음: 여백 검토]
- `fox_uncanny.png` ← `fox_uncanny(3).png` [이미지 경계에 닿음: 여백 검토]
- `fox_mutant.png` ← `a_detailed_pixel_art_creature_illustration_on_a_tr.png`
- `deer_uncanny.png` ← `deer_uncanny(2).png`
- `deer_mutant.png` ← `deer_mutant(2).png`
- `owl_uncanny.png` ← `기하학적_깃털의_오싹한_부엉이.png` [이미지 경계에 닿음: 여백 검토]
- `owl_mutant.png` ← `기하학적_올빼미_돌연변이.png` [이미지 경계에 닿음: 여백 검토]
- `wolf_uncanny.png` ← `wolf_uncanny.png`
- `wolf_mutant.png` ← `wolf_mutant.png` [이미지 경계에 닿음: 여백 검토]
- `otter_uncanny.png` ← `otter_uncanny.png` [합본에서 분리된 과거 이미지: 고품질 독립 재생성 권장]
- `otter_mutant.png` ← `otter_mutant_grotesque.png` [합본에서 분리된 과거 이미지: 고품질 독립 재생성 권장]

## 현재 실제 파일 중 명백한 중복 SHA-256
- 정확히 동일한 파일 내용: `imagegen.png` == `기하학적_깃털의_오싹한_부엉이.png`
- 정확히 동일한 파일 내용: `fox_mutant(4).png` == `fox_mutant(3).png`

## 현재 PNG 중 불투명 배경(RGB 등) 후보 — 투명 스프라이트로 바로 사용하지 말 것
- `a_detailed_pixel_art_sprite_of_a_single_unsettling.png`
- `a_single_image_scene_on_a_transparent_checkerboard.png`
- `a_high_detail_pixel_art_sprite_on_a_transparent_ba.png`

## 실제 코드 참조 전에 제외할 유형
- 2~3개 동물이 한 화면에 들어간 가로 합본/시트(단일 동물 파일로 오인 금지).
- 이전 모델이 실수로 생성한 까마귀 보급관(가방·짐·의료 키트)은 **작곡가 까마귀 정본 아님**.
- 보급관 여우에 CCTV·경비 모자·군용 배지가 있는 구버전은 늑대와 차별성이 없으므로 교체 후보. 현 curated `fox_mutant.png`는 모자·CCTV 없는 짐 운반형을 우선.
- 잘못된 프롬프트로 나온 올빼미 합본/미완성 스케치와 동일 사본.
- 구버전 수달 Mutant보다 `otter_mutant_grotesque.png`를 현재 우선 후보로 선정하되, 실제 게임은 수달처럼 보이는지 확인 후 결정.
- 사용자 최종본이 이미 존재한다면 **해당 최종본 > 이번 후보**. 어떤 버전도 자동 삭제 금지; 먼저 참조 검색 후 `archive/deprecated/`로 이동 또는 명시적 승인 후 삭제.

## 이전 v67 개발 문서의 게임 레포 내 확보 목록(현재 존재 재검증 필요)
- 동물 당시 12: rabbit, fox, deer, owl, wolf, crow 2종씩(이후 수달 이미지 2종 제작함).
- 직원 초상 12: `public/assets/staff/{rabbit,fox,wolf,deer}/{portrait,portrait_unstable,portrait_critical}.webp`.
- 직원 합류 컷신 4: `public/assets/cinematics/staff-arrivals/{rabbit,fox,wolf,deer}/scene.webp`.
- 직원 퇴장 컷신 4: `public/assets/cinematics/staff-terminations/{rabbit,fox,wolf,deer}/scene.webp`.
- 인물 2: `public/assets/characters/eve_hologram.webp`, `protagonist_neutral.webp`.
- EVE 첫 만남 1: `public/assets/cinematics/eve-first-meeting/scene.webp`.
- 배경 7: `public/assets/backgrounds/{gate,hero-gate,sanctuary,wasteland,laboratory,dawn,hidden-photo}.webp`.
- 엔딩 8: `public/assets/endings/{ending_scattered_names,ending_silent_automation,ending_subject_000,ending_last_signal,ending_new_consciousness,ending_open_spring,ending_two_caretakers,ending_incomplete_revival}.webp`.
- **위의 총합은 12+12+4+4+2+1+7+8=50.** 이 50은 과거 목록 기준이며 현재 저장소에 남아 있는지 검사해야 함.
- 엔딩은 새 8장 그려서 중복 만들지 말고 기존 이미지가 결말과 맞는지 우선 검사. EVE/주인공 첫 만남도 기존 컷신 재사용.

## 과거 명세 대비 추가 제작 우선순위(현재 존재 여부 확인 후 생성)
A. Hidden Photo 12개 — 실제 증거 핵심, 비고어. 이미지 자체에 긴 텍스트 굽지 말고 코드로 자막/문서 내용을 올리기.
- `public/assets/hidden-photos/photo_01.png` [1024x768]: 과거 실험실의 첫 쥐 신경 인지 연구 기록 사진. 낡은 연구대, 비고어, 수기 도표, 작은 케이지. 정답을 직접 텍스트로 노출하지 않음
- `public/assets/hidden-photos/photo_02.png` [1024x768]: 인간의 뇌 이식 없이도 고등 인지를 보이는 동물과 관찰 장비. 인간처럼 사물을 배열한 흔적, 오래된 CCTV 스틸 감성
- `public/assets/hidden-photos/photo_03.png` [1024x768]: 완전히 정상적인 검은 고양이 M-00의 최초 기록. 반드시 오른쪽 귀 끝의 아주 작은 흠집 + 가슴의 흰 털 한 가닥, 뿔/발광/추가 눈 금지
- `public/assets/hidden-photos/photo_04.png` [1024x768]: 최초 과학자가 M-00 폐기를 승인한 결재 문서가 놓인 책상, 서명과 봉인 흔적. 판독 가능한 문자는 UI 레이어에서 처리
- `public/assets/hidden-photos/photo_05.png` [1024x768]: 실험체 탈출 당일 훼손된 보안 사진. 열린 격리문, 붉은 비상등, 비어 있는 운반 상자, 고양이 실루엣 암시
- `public/assets/hidden-photos/photo_06.png` [1024x768]: 오염 확산 이후 폐허 도시, 지도와 현장 기록의 오래된 이중노출 사진. 직접적인 잔혹 묘사 없이 문명 붕괴
- `public/assets/hidden-photos/photo_07.png` [1024x768]: 인간의 의식/뇌가 동물 신경계에 보존되었다는 사실을 보여주는 비고어 의료·연구 기록. 사람과 동물 실루엣, 단면도/스캔
- `public/assets/hidden-photos/photo_08.png` [1024x768]: 최초 과학자, 어린 딸, 평범한 검은 고양이 M-00이 함께 있는 오래된 가족사진. 고양이 귀 흠집·가슴 흰 털 일치
- `public/assets/hidden-photos/photo_09.png` [1024x768]: 딸이 사망한 뒤 기록/목소리/일기로 EVE AI를 복원하는 연구실의 따뜻하면서 슬픈 아카이브 스틸, 비고어
- `public/assets/hidden-photos/photo_10.png` [1024x768]: 동물에게 보존된 인간 기억을 복제인간 신체로 옮기는 계획의 미래형 복제시설 사진. 비고어, 빈 복제 캡슐
- `public/assets/hidden-photos/photo_11.png` [1024x768]: 제1호 관리자와 최초 과학자의 뇌 기록을 연결하는 기밀 파일, 동일 뇌 식별 지표. 반전은 이 사진 해금 전 비노출
- `public/assets/hidden-photos/photo_12.png` [1024x768]: M-00의 생존 특성이 면역 연구의 열쇠였다는 마지막 연구 기록. 평범한 고양이와 면역 패턴 스캔, 미완성 연구 파일

B. 스토리 컷신 7개 — EVE 첫 만남은 기존 이미지 재사용.
- `public/assets/cinematics/origin-zero/scene_origin_escape.png` [1280x720]: 폐기 대상으로 지정된 평범한 검은 고양이 M-00이 연구시설의 열린 비상문 사이로 빠져나가는 밤. 비극적 전조, 고양이 외형 정상
- `public/assets/cinematics/origin-zero/scene_collapse.png` [1280x720]: 인류 멸망 후 버려진 도시와 식물에 잠식된 동물원으로 넘어가는 장면. 절제된 붉은 경보와 황량한 분위기
- `public/assets/cinematics/origin-zero/scene_m00_positive.png` [1280x720]: 가장 정상적인 검은 고양이를 검사하는 순간 관리자와 EVE의 감정이 달라지는 장면. 화면 수치는 코드 UI 오버레이
- `public/assets/cinematics/origin-zero/scene_m00_transfer.png` [1280x720]: 본부 명령에 따라 검은 고양이 운반 캡슐이 새벽에 반출되는 순간. 믿음과 배신의 모순된 분위기
- `public/assets/cinematics/origin-zero/scene_m00_protect.png` [1280x720]: 관리자가 비밀 격리실에서 정상 검은 고양이를 보호하기로 결정하는 순간, EVE의 불안한 홀로그램
- `public/assets/cinematics/origin-zero/scene_ark_recall.png` [1280x720]: 한때 보호했던 여러 동물의 기억이 다시 호출되어 병렬 기록 화면으로 나타나는 장면. 시네마틱 단일 장면
- `public/assets/cinematics/origin-zero/scene_farewell.png` [1280x720]: 쇠퇴한 관리자가 EVE와 마지막으로 대화하는 장면. 인간의 유한성과 AI의 남겨짐, 잔혹함보다 애틋함

C. 캐릭터 감정 초상 7개 — 기존 얼굴/복장 유지, 일관된 캐릭터.
- `public/assets/characters/eve_glitch.png` [768x1024]: 기존 EVE 홀로그램 얼굴/의상 그대로 유지. 데이터 일부가 끊기지만 인간미와 친절함이 남아 있는 표정
- `public/assets/characters/eve_revelation.png` [768x1024]: 자신이 딸과 동일 인격이 아님을 이해한 EVE. 기존 캐릭터 형태 유지, 슬픔과 독립적 결단
- `public/assets/characters/protagonist_decline.png` [768x1024]: 기존 관리자 외모를 유지하며 복제 신체의 쇠퇴를 암시. 피로, 희미한 상처, 시야 왜곡. 고어 금지
- `public/assets/characters/protagonist_final.png` [768x1024]: 마지막 선택 직전 관리자, 쇠약하지만 결연한 표정. 기존 머리/의복/체형 유지
- `public/assets/characters/scientist_archive.png` [768x1024]: 최초 과학자의 오래된 연구 기록 초상. 냉정하고 독선적이며 합리화하는 눈빛
- `public/assets/characters/scientist_obsession.png` [768x1024]: 최초 과학자의 집착과 실험 강행을 보여주는 다른 감정의 초상. 악역 과장보다 실패 부정
- `public/assets/characters/daughter_portrait.png` [768x1024]: 어린 딸의 생전 모습. 따뜻한 가족사진 감성, 기존 EVE 얼굴과 느슨한 연관성만 주고 동일 인물로 오인시키지 않음

D. 게임 배경 신규 3개 — 기존 정문/실험실 등 7개 재사용.
- `public/assets/backgrounds/bg_containment.png` [1280x720]: 격리시설 내부. 우리와 전력·정화·안정 장치가 눈에 보이며 UI HUD를 배치할 빈 공간 확보
- `public/assets/backgrounds/bg_headquarters.png` [1280x720]: 본부 연구/통제 구역. 차가운 자동화, 높은 통제감, 인간이 없는 복도. EVE와 본부 AI는 서로 다른 시스템
- `public/assets/backgrounds/bg_origin_lab.png` [1280x720]: ORIGIN ZERO 첫 연구소. 오래된 온실·실험기구·격리시설이 함께 남은 폐허, 식물 침식

E. 동물 이미지(저장소에 없을 때만): 13종×2 / M-00 1개. 이번 번들 후보로 6종×2 = 12. 사용자 로컬에 까마귀 2종 있음(직접 확인 필요). 로컬에서도 확인된다면 나머지 6종×2=12개 + M-00 1개가 우선 후보. 누락 12종은 lynx, axolotl, moth, mutant, chimera, specter 각각 uncanny+mutant. 이미지는 종별 독립 전신 PNG, 한 파일 한 마리, 실제 투명 알파, 잘림 없는 여백. **`mutant`가 특수 타입인 경우 개체명을 재확인**, 무조건 동물 종처럼 생성하지 말 것.

F. 엔딩: 기존 8개의 의미와 코드 분기가 현재 스토리와 불일치할 때에만 해당 경로에 맞춰 교체. 텍스트 엔딩 폴백 유지.

## 누락 이미지 생성 공통 프롬프트
'ANOMALY ZOO original pixel-art horror game asset. Single image, one scene or one full-body subject only, no collage, no split screen, no contact sheet, no embedded labels/logos/UI/text. Muted pale pink, ivory, mauve, lavender and deep plum shadows; restrained red accents, subtle biological/sci-fi horror, detailed crisp hand-pixelated shading; commercial-quality silhouette and safe margins. Match current in-game existing assets. Sprite = true transparent background PNG. Portrait = 768x1024. Cinematic/background = 1280x720. Hidden archive photo = 1024x768, aged analog medical-research archive texture, reveal content without gore. For repeated human/cat characters preserve identity with the existing reference art.'

## 아트 구별 규칙
- Uncanny: 자연스러운 동물 비율 80~90%, 장비/도구/옷/안경/가방/목걸이/태그 없음. 눈/움직임/무늬에만 10~20% 이질감.
- Mutant: 해당 종의 인간 시절 기억/직업에서 진화한 고유 생체 변이. 종마다 반복적인 여러 눈·카메라·가방을 장착하지 않음.
- fox mutant는 보급관이므로 무거운 물자를 등에 운반할 수 있으나 **모자·CCTV·경비 장비 금지**.
- crow는 작곡가, otter는 기계공학자. 이전 여우 보급품 콘셉트를 절대 복사하지 말 것.
- M-00은 어떤 경우에도 초자연적 돌연변이 모습으로 바꾸지 않음.
- 생성기가 독립 이미지 요청에 합본을 반환한 경우 '완성' 처리하지 말 것. 재생성 또는 QA 통과 수준의 재가공 여부를 명시하고 게임 사용자는 진짜 단일 객체 파일만 사용.

## 최종 자산 감사 자동화 지시
1) 코드 `src`, `public`, `assets`, 이미지 레지스트리의 실제 참조 경로를 전부 수집.
2) 해시 기반 완전 중복 + perceptual hash 기반 시각 중복을 별도로 보고(유사도만으로 자동 삭제 금지).
3) 이미지 규격/알파/bbox/여백/해상도/투명도/저작권 출처 검증.
4) 실제 사용/교체/미사용/누락/추가 생성/안전한 폴백 6가지 상태 분류.
5) 모든 파일을 일률적으로 압축해 도트가 뭉개지게 하지 말 것. WebP 재인코딩 필요 시 lossless과 실제 UI 품질 비교.
6) `ART_AUDIT.md`, `IMAGE_PROMPTS.md`, machine-readable asset registry 생성. 파일 경로 참조 수정/테스트 후에만 중복 자료를 archive로 옮길 것.
