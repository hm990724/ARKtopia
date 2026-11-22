# v75 변이체 이미지 재작업 명세

## 공통 제작 규칙

- 기준: `public/assets/animals/rabbit_mutant.png`, `fox_mutant.png`, `deer_mutant.png`와 사용자가 준 사슴 변이 이미지. 사슴과 같은 회백색·먼지 낀 분홍·자주색 음영, 검은 외곽선, 조밀한 픽셀 클러스터, 투명 배경, 1:1 캔버스, 전신 및 안전 여백을 유지한다.
- 변이는 즉시 알아볼 수 있게 불편하고 살벌해야 한다. 붉은 노출 조직, 찢긴 피부 가장자리, 봉합 자국, 비정상적인 뼈/기관 융합을 종의 특징과 함께 넣는다. 피와 상처는 분명히 보이되 과도한 내장 묘사, 화면을 채우는 액체, 무관한 촉수 장식은 금지한다.
- 귀여운 마스코트, 일반 털짐승, 갑옷/가방을 덧씌운 모습, 단순한 눈 발광으로 변이를 대신하지 않는다. 1마리만 그리며 머리·다리·꼬리를 캔버스 밖으로 자르지 않는다.
- 현재 `_v74.png`는 기존 경로를 유지해 비교용으로 남기고, 검수 완료 후 새 `_v75.png` 파일을 추가해 resolver만 전환한다. 기존 최종본을 덮어쓰거나 삭제하지 않는다.

## 파일별 목표

| 파일 | 읽혀야 하는 종/기억 | 변이 실루엣과 유기 공포 |
|---|---|---|
| `axolotl_mutant_v75.png` | 아홀로틀의 외부 아가미와 재생/기억의 이중성 | 양쪽 아가미가 갈라진 붉은 재생 조직과 검은 봉합선으로 자라며, 한쪽 앞발은 재생된 작은 발가락이 겹쳐짐. 반투명한 꼬리 지느러미 아래 희미한 척추 기억 흔적. 얼굴·넓은 머리·네 다리·꼬리로 아홀로틀 즉시 식별. |
| `chimera_mutant_v75.png` | 여러 생명의 경계가 흐려진 독립 개체 | 토끼/여우/늑대 그림의 복사본이나 고양이+뿔이 되지 않도록 한다. 낮고 비대칭인 몸통, 갈비뼈를 닮은 외부 골격, 서로 다른 질감의 앞뒤 사지와 한 개의 불완전한 중심 얼굴이 하나의 개체로 이어진 고유 실루엣. 접합부는 분홍 조직과 제한된 봉합 자국으로 읽히게 한다. |
| `lynx_mutant_v75.png` | 스라소니의 귀술과 짧은 꼬리. 인간 시절 직업은 코드 정본 확정 전 창작하지 않음 | 검은 귀술·짧은 꼬리·반점과 넓은 발을 보존. 길게 늘어진 발가락과 반복된 발바닥 뼈, 갈라진 한쪽 어깨 피부 아래 드러난 근육, 귀 뿌리의 봉합 흔적으로 위협적 실루엣을 만든다. 일반 장모 고양이처럼 보이지 않게 한다. |
| `moth_mutant_v75.png` | 나방의 날개와 빛·어둠·기억 | 나방의 넓은 비늘 날개·깃털형 더듬이·가루 비늘을 보존. 한쪽 날개만 찢겨 혈관 같은 분홍 맥이 노출되고, 흉부에서 길게 드러난 기억 기관이 날개맥에 붙는다. 빛을 향해 기울어진 비대칭 자세와 빈 눈무늬로 기괴함을 표현한다. 사람 얼굴은 넣지 않는다. |

## 현재 상태

v74 이미지는 경로에 연결돼 있지만, 위 네 파일은 아직 생성되지 않았다. 이번 실행에 로컬 이미지 생성 도구가 노출되지 않아 제작을 완료했다고 주장하지 않는다. 명세는 이미지 생성 도구에 네 파일을 각각 독립 작업으로 넘기기 위한 입력이다.

## v75 delivery status (2026-11-23)

Four redesigned mutant sprites were generated and integrated as separate versioned files. The species resolver now uses these v75 files for their live mutant states; v74 and original files remain untouched.

- `axolotl_mutant_v75.png`: external gills, regeneration tissue, asymmetric regrown limbs and scars.
- `lynx_mutant_v75.png`: lynx ear tufts and short bobtail remain identifiable; the split-shadow body suggests identity instability.
- `moth_mutant_v75.png`: patterned wings and antennae with multiple afterimage-like eyes.
- `chimera_mutant_v75.png`: one original feather-scaled silhouette, rather than a collage of existing animal sprites.

All four are 1254x1254 RGBA PNGs. `npm run test:v73` checks that each active route resolves, uses alpha, and remains square. Existing art files marked deleted in the worktree were not restored or overwritten. Design is connected and technically validated; the game author has not yet approved the final visual direction.
